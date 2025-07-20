"use client";

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calendar, Clock, RefreshCw, AlertTriangle, Droplets, TrendingUp, Activity, Wifi, WifiOff, ChevronDown, Download, CloudRain } from 'lucide-react';
import { MyContext } from '../providers';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Parse timestamp function
const parseTimestamp = (timestamp: string) => {
  // Handle format: "7/16/25 15:42"
  const [datePart, timePart] = timestamp.split(' ');
  const [month, day, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');
  // Convert 2-digit year to 4-digit (assuming 20xx)
  const fullYear = parseInt(year) + 2000;
  
  return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
};

// Format date for API request (YYYY-MM-DD HH:mm)
const formatDateForAPI = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Generate mock rainfall data
const generateMockRainfallData = (startDate, endDate, interval = 30) => {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Ensure we start from 00:00
  start.setHours(0, 0, 0, 0);
  
  let current = new Date(start);
  
  while (current <= end) {
    // Generate realistic rainfall patterns
    let rainfall = 0;
    const hour = current.getHours();
    const random = Math.random();
    
    // Higher probability of rain in early morning and evening
    if (hour >= 2 && hour <= 6) {
      rainfall = random < 0.3 ? Math.random() * 15 + 5 : 0; // 30% chance, 5-20mm
    } else if (hour >= 16 && hour <= 20) {
      rainfall = random < 0.4 ? Math.random() * 25 + 3 : 0; // 40% chance, 3-28mm
    } else {
      rainfall = random < 0.15 ? Math.random() * 10 + 1 : 0; // 15% chance, 1-11mm
    }
    
    // Occasionally have heavy rain periods
    if (random < 0.05) {
      rainfall = Math.random() * 40 + 20; // 5% chance of heavy rain (20-60mm)
    }
    
    data.push({
      timestamp: current.toLocaleString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false 
      }).replace(',', ''),
      rainfall: parseFloat(rainfall.toFixed(1)),
      parsedDate: new Date(current)
    });
    
    // Increment by interval minutes
    current = new Date(current.getTime() + interval * 60 * 1000);
  }
  
  return data;
};

// CSV export function
const exportToCSV = (waterData, rainfallData, filename) => {
  const csvHeaders = ['Timestamp', 'Date', 'Time', 'Water Depth (m)', 'Rainfall (mm)', 'Status'];
  
  // Create a map for quick rainfall lookup
  const rainfallMap = new Map();
  rainfallData.forEach(item => {
    const timeKey = item.parsedDate.getTime();
    rainfallMap.set(timeKey, item.rainfall);
  });
  
  const csvData = waterData.map(item => {
    const date = item.parsedDate;
    const dateStr = date.toLocaleDateString('en-US');
    const timeStr = date.toLocaleTimeString('en-US');
    
    // Find closest rainfall data
    const rainfall = rainfallMap.get(date.getTime()) || 0;
    
    let status = 'Normal';
    if (item.meanDepth >= 1.7) status = 'ALARM';
    else if (item.meanDepth >= 1.3) status = 'ALERT';
    
    return [
      item.timestamp,
      dateStr,
      timeStr,
      item.meanDepth.toFixed(3),
      rainfall.toFixed(1),
      status
    ];
  });
  
  const csvContent = [csvHeaders, ...csvData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const WaterLevelMonitor = ({setCurrentDepth}) => {
  const [timeRange, setTimeRange] = useState('1');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [data, setData] = useState([]);
  const [rainfallData, setRainfallData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiStatus, setApiStatus] = useState('connected');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const context = useContext(MyContext);
  
  const chartRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Water level thresholds
  const ALERT_LEVEL = 1.3;
  const ALARM_LEVEL = 1.7;
  
  // Time range options
  const timeRangeOptions = [
    { value: '1h', label: '1 Hour', hours: 1 },
    { value: '2h', label: '2 Hours', hours: 2 },
    { value: '6h', label: '6 Hours', hours: 6 },
    { value: '12h', label: '12 Hours', hours: 12 },
    { value: '1', label: '1 Day', days: 1 },
    { value: '2', label: '2 Days', days: 2 },
    { value: '3', label: '3 Days', days: 3 },
    { value: '7', label: '1 Week', days: 7 },
    { value: '14', label: '2 Weeks', days: 14 },
    { value: '30', label: '1 Month', days: 30 },
    { value: 'custom', label: 'Custom Range', days: 0 }
  ];
  
  // API Base URL
  let API_BASE_URL = 'https://your-api-domain.com';
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (context.value == null) return;
    API_BASE_URL = context?.value.machineCode
    
    handleRefresh();
  }, [context])
  
  // Fetch data by hours
  const fetchDataByHours = async (hours) => {
    try {
      setLoading(true);
      setError('');
      setApiStatus('connecting');
      
      const now = new Date();
      const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
      
      const startFormatted = formatDateForAPI(startTime);
      const endFormatted = formatDateForAPI(now);
      
      const encodedStart = encodeURIComponent(startFormatted);
      const encodedEnd = encodeURIComponent(endFormatted);
      let uri = `/api/newversion/depth/range?start=${encodedStart}&end=${encodedEnd}&ip=${context?.value?.machineCode}`
      console.log(uri)
      
      const response = await fetch(uri);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      
      // Transform API data
      const transformedData = apiData.map(item => ({
        timestamp: item.timestamp,
        meanDepth: 10.18-item.mean_depth,
        parsedDate: parseTimestamp(item.timestamp)
      }));
      
      // Sort by date
      const sortedData = transformedData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
      
      // Generate mock rainfall data for the same period
      const mockRainfall = generateMockRainfallData(startTime, now);
      
      setData(sortedData);
      setRainfallData(mockRainfall);
      setLastUpdated(new Date());
      setApiStatus('connected');
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data from API by days
  const fetchDataByDays = async (days) => {
    try {
      setLoading(true);
      setError('');
      setApiStatus('connecting');
      
      const response = await fetch(`/api/newversion/depth/${days}?ip=${context.value.machineCode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      
      // Transform API data
      const transformedData = apiData.map(item => ({
        timestamp: item.timestamp,
        meanDepth: 10.18-item.mean_depth,
        parsedDate: parseTimestamp(item.timestamp)
      }));
      
      // Sort by date
      const sortedData = transformedData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
      
      // Generate mock rainfall data for the same period
      const now = new Date();
      const startTime = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      const mockRainfall = generateMockRainfallData(startTime, now);
      
      setData(sortedData);
      setRainfallData(mockRainfall);
      setLastUpdated(new Date());
      setApiStatus('connected');
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data from API by date range
  const fetchDataByDateRange = async (startDateTime, endDateTime) => {
    try {
      setLoading(true);
      setError('');
      setApiStatus('connecting');
      
      const startFormatted = formatDateForAPI(startDateTime);
      const endFormatted = formatDateForAPI(endDateTime);
      
      const encodedStart = encodeURIComponent(startFormatted);
      const encodedEnd = encodeURIComponent(endFormatted);
      let uri = `/api/newversion/depth/range?start=${encodeURIComponent(startFormatted)}&end=${encodeURIComponent(endFormatted)}&ip=${context.value.machineCode}`
      console.log(uri)
      const response = await fetch(uri);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      
      // Transform API data
      const transformedData = apiData.map(item => ({
        timestamp: item.timestamp,
        meanDepth: 10.18-item.mean_depth,
        parsedDate: parseTimestamp(item.timestamp)
      }));
      
      // Sort by date
      const sortedData = transformedData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
      
      // Generate mock rainfall data for the same period
      const mockRainfall = generateMockRainfallData(startDateTime, endDateTime);
      
      setData(sortedData);
      setRainfallData(mockRainfall);
      setLastUpdated(new Date());
      setApiStatus('connected');
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle CSV download
  const handleDownloadCSV = async () => {
    if (data.length === 0) {
      alert('No data available to download');
      return;
    }

    setIsDownloading(true);
    
    try {
      let filename = 'water_level_rainfall_data';
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0];
      
      if (useCustomRange && customStartDate && customEndDate) {
        filename = `water_level_rainfall_${customStartDate}_to_${customEndDate}_${timestamp}.csv`;
      } else {
        const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
        if (selectedOption) {
          filename = `water_level_rainfall_${selectedOption.label.replace(' ', '_').toLowerCase()}_${timestamp}.csv`;
        }
      }
      
      exportToCSV(data, rainfallData, filename);
      
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV file');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchDataByDays(1);
  }, []);
  
  // Update data when time range changes
  useEffect(() => {
    if (!useCustomRange && timeRange !== 'custom') {
      const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
      if (selectedOption?.hours) {
        fetchDataByHours(selectedOption.hours);
      } else if (selectedOption?.days) {
        fetchDataByDays(selectedOption.days);
      }
    }
  }, [timeRange, useCustomRange]);
  
  // Handle custom date range
  useEffect(() => {
    if (useCustomRange && customStartDate && customEndDate) {
      const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
      const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
      
      if (startDateTime <= endDateTime) {
        fetchDataByDateRange(startDateTime, endDateTime);
      }
    }
  }, [customStartDate, customEndDate, customStartTime, customEndTime, useCustomRange]);
  
  // Get current status based on latest water level
  const getCurrentStatus = () => {
    if (data.length === 0) return { status: 'Unknown', color: 'gray' };
    
    const currentDepth = data[data.length - 1].meanDepth;
    
    if (currentDepth >= ALARM_LEVEL) {
      return { status: 'ALARM', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
    } else if (currentDepth >= ALERT_LEVEL) {
      return { status: 'ALERT', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' };
    } else {
      return { status: 'NORMAL', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
    }
  };
  
  // Calculate statistics
  const getStatistics = () => {
    if (data.length === 0) return null;
    
    const depths = data.map(d => d.meanDepth);
    const maxDepth = Math.max(...depths);
    const minDepth = Math.min(...depths);
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
    const currentDepth = depths[depths.length - 1];
    if (setCurrentDepth) {
        setCurrentDepth(currentDepth.toFixed(2));
    }
    const alertCount = depths.filter(d => d >= ALERT_LEVEL && d < ALARM_LEVEL).length;
    const alarmCount = depths.filter(d => d >= ALARM_LEVEL).length;
    
    // Rainfall statistics
    const rainfalls = rainfallData.map(d => d.rainfall);
    const totalRainfall = rainfalls.reduce((a, b) => a + b, 0);
    const maxRainfall = rainfalls.length > 0 ? Math.max(...rainfalls) : 0;
    
    return {
      current: currentDepth,
      max: maxDepth,
      min: minDepth,
      average: avgDepth,
      alertCount,
      alarmCount,
      totalReadings: data.length,
      totalRainfall,
      maxRainfall
    };
  };
  
  // Chart configuration to match the reference image style
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => {
            const dataPoint = data[context[0].dataIndex];
            if (dataPoint) {
              return `${dataPoint.parsedDate.toLocaleDateString()} at ${dataPoint.parsedDate.toLocaleTimeString()}`;
            }
            return '';
          },
          label: (context) => {
            if (context.dataset.label === 'Water Level') {
              const depth = context.parsed.y;
              let status = 'Normal';
              if (depth >= ALARM_LEVEL) status = 'ALARM';
              else if (depth >= ALERT_LEVEL) status = 'ALERT';
              return `Water Level: ${depth.toFixed(3)}m (${status})`;
            } else if (context.dataset.label === 'Rainfall') {
              return `Rainfall: ${context.parsed.y.toFixed(1)}mm`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          color: '#374151',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 12,
          maxRotation: 0,
          minRotation: 0
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Water Level (m)',
          color: '#0b5ed7',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#0b5ed7',
          callback: function(value) {
            return value.toFixed(1) + 'm';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: 60, // Adjust as needed for typical rainfall values
        title: {
          display: true,
          text: 'Rainfall (mm)',
          color: '#15a3c9',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#15a3c9',
          callback: function(value) {
            return value + 'mm';
          }
        },
        grid: {
          drawOnChartArea: false, // Prevents grid lines from this axis cluttering the chart
        }
      }
    },
    elements: {
      line: {
        tension: 0.4 // Smoother curve
      },
      point: {
        radius: 0, // Hide points by default
        hoverRadius: 5
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Prepare chart data with gradient
  const chartData: ChartData<'line'> = {
    labels: data.map(d => {
      const date = d.parsedDate;
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    }),
    datasets: [
      // Water Level Line
      {
        type: 'line' as const,
        label: 'Water Level',
        data: data.map(d => d.meanDepth),
        borderColor: '#0b5ed7',
        borderWidth: 3,
        pointRadius: 2,
        pointBackgroundColor: '#0b5ed7',
        fill: true,
        backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) {
                // This case happens on initial render or resizing
                return null;
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(11, 94, 215, 0.5)');
            gradient.addColorStop(0.5, 'rgba(11, 94, 215, 0.1)');
            gradient.addColorStop(1, 'rgba(11, 94, 215, 0)');
            return gradient;
        },
        yAxisID: 'y'
      },
      // Alert Level Line
      {
        type: 'line' as const,
        label: 'Alert Level',
        data: data.map(() => ALERT_LEVEL),
        borderColor: '#f59e0b',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        yAxisID: 'y'
      },
      // Alarm Level Line
      {
        type: 'line' as const,
        label: 'Alarm Level',
        data: data.map(() => ALARM_LEVEL),
        borderColor: '#dc2626',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        yAxisID: 'y'
      },
      // Rainfall Bars
      {
        type: 'bar' as const,
        label: 'Rainfall',
        data: rainfallData.map(d => d.rainfall),
        backgroundColor: 'rgba(21, 163, 201, 0.6)',
        borderColor: 'rgba(21, 163, 201, 1)',
        borderWidth: 1,
        borderRadius: 2,
        yAxisID: 'y1',
        barThickness: 'flex',
        maxBarThickness: 8,
      }
    ]
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    if (useCustomRange && customStartDate && customEndDate) {
      const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
      const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
      await fetchDataByDateRange(startDateTime, endDateTime);
    } else {
      const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
      if (selectedOption?.hours) {
        await fetchDataByHours(selectedOption.hours);
      } else if (selectedOption?.days) {
        await fetchDataByDays(selectedOption.days);
      }
    }
  };
  
  const currentStatus = getCurrentStatus();
  const statistics = getStatistics();
  const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
  
  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Water Level & Rainfall Monitor</h1>
              <p className="text-sm text-gray-600">Real-time monitoring system with rainfall data</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadCSV}
              disabled={loading || data.length === 0 || isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
              {isDownloading ? 'Downloading...' : 'Download CSV'}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Current Level</p>
                  <p className="text-2xl font-bold text-blue-900">{statistics.current.toFixed(3)}m</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Average Level</p>
                  <p className="text-2xl font-bold text-green-900">{statistics.average.toFixed(3)}m</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Total Rainfall</p>
                  <p className="text-2xl font-bold text-emerald-900">{statistics.totalRainfall.toFixed(1)}mm</p>
                </div>
                <CloudRain className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600">Max Rainfall (30min)</p>
                  <p className="text-2xl font-bold text-teal-900">{statistics.maxRainfall.toFixed(1)}mm</p>
                </div>
                <CloudRain className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            
            <div className={`${currentStatus.bgColor} rounded-lg p-4 border ${currentStatus.borderColor} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${currentStatus.textColor}`}>Current Status</p>
                  <p className={`text-2xl font-bold ${currentStatus.textColor}`}>{currentStatus.status}</p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${currentStatus.textColor}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200 p-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {apiStatus === 'connected' && <Wifi className="w-5 h-5 text-green-600" />}
            {apiStatus === 'error' && <WifiOff className="w-5 h-5 text-red-600" />}
            {apiStatus === 'connecting' && <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />}
            <span>
              {apiStatus === 'connected' ? `Connected. Last updated: ${lastUpdated?.toLocaleTimeString()}` : apiStatus === 'error' ? 'Connection Error' : 'Connecting...'}
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Time Range Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between w-48 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                <span>{useCustomRange ? 'Custom Range' : selectedOption?.label || 'Select Range'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
                  {timeRangeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        if (option.value === 'custom') {
                          setUseCustomRange(true);
                        } else {
                          setUseCustomRange(false);
                          setTimeRange(option.value);
                        }
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Custom Date Inputs */}
            {useCustomRange && (
              <div className="flex flex-col sm:flex-row gap-2 items-center p-2 bg-gray-50 rounded-lg border">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 border rounded-md text-sm"
                />
                <input
                  type="time"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="px-2 py-1 border rounded-md text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 border rounded-md text-sm"
                />
                <input
                  type="time"
                  value={customEndTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  className="px-2 py-1 border rounded-md text-sm"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Chart Area */}
        <div className="relative h-[500px] w-full bg-gray-50/50 p-4 rounded-lg border border-gray-200">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
                <p className="mt-2 text-lg font-semibold text-gray-700">Loading Data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50/50">
              <div className="text-center">
                <AlertTriangle className="w-10 h-10 mx-auto text-red-600" />
                <p className="mt-2 text-lg font-semibold text-red-700">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-10 h-10 mx-auto text-gray-400" />
                <p className="mt-2 text-lg font-semibold text-gray-500">No data available for the selected range.</p>
              </div>
            </div>
          ) : (
            <Line ref={chartRef} options={chartOptions} data={chartData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterLevelMonitor;