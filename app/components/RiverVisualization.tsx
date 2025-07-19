"use client";

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calendar, Clock, RefreshCw, AlertTriangle, Droplets, TrendingUp, Activity, Wifi, WifiOff, ChevronDown, Download } from 'lucide-react';
import { MyContext } from '../providers';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

// CSV export function
const exportToCSV = (data, filename) => {
  const csvHeaders = ['Timestamp', 'Date', 'Time', 'Water Depth (m)', 'Status'];
  
  const csvData = data.map(item => {
    const date = item.parsedDate;
    const dateStr = date.toLocaleDateString('en-US');
    const timeStr = date.toLocaleTimeString('en-US');
    
    let status = 'Normal';
    if (item.meanDepth >= 1.7) status = 'ALARM';
    else if (item.meanDepth >= 1.3) status = 'ALERT';
    
    return [
      item.timestamp,
      dateStr,
      timeStr,
      item.meanDepth.toFixed(3),
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
  
  // Time range options (updated with hour options)
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
  
  // API Base URL - Update this with your actual API base URL
  let API_BASE_URL = 'https://your-api-domain.com'; // Replace with your actual API URL
  
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
      
      // Calculate start and end times for hour ranges
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
      
      setData(sortedData);
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
      
      setData(sortedData);
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
      
      // URL encode the datetime parameters
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
      
      setData(sortedData);
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
      // Generate filename based on current selection
      let filename = 'water_level_data';
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (useCustomRange && customStartDate && customEndDate) {
        filename = `water_level_${customStartDate}_to_${customEndDate}_${timestamp}.csv`;
      } else {
        const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
        if (selectedOption) {
          filename = `water_level_${selectedOption.label.replace(' ', '_').toLowerCase()}_${timestamp}.csv`;
        }
      }
      
      exportToCSV(data, filename);
      
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV file');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Load initial data
  useEffect(() => {
    fetchDataByDays(1); // Load 1 day of data initially
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
    setCurrentDepth(currentDepth.toFixed(2));
    const alertCount = depths.filter(d => d >= ALERT_LEVEL && d < ALARM_LEVEL).length;
    const alarmCount = depths.filter(d => d >= ALARM_LEVEL).length;
    
    return {
      current: currentDepth,
      max: maxDepth,
      min: minDepth,
      average: avgDepth,
      alertCount,
      alarmCount,
      totalReadings: data.length
    };
  };
  
  // Create enhanced gradient for water effect (dark orange at bottom, light at top)
  const createWaterGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    
    // Enhanced orange gradient: dark at bottom, light at top
    gradient.addColorStop(0, 'rgba(194, 65, 12, 0.4)');    // Dark orange at bottom
    gradient.addColorStop(0.2, 'rgba(234, 88, 12, 0.3)');  // Medium-dark orange
    gradient.addColorStop(0.4, 'rgba(249, 115, 22, 0.2)'); // Medium orange
    gradient.addColorStop(0.6, 'rgba(251, 146, 60, 0.1)'); // Medium-light orange
    gradient.addColorStop(0.8, 'rgba(253, 186, 116, 0.1)'); // Light orange
    gradient.addColorStop(1, 'rgba(254, 215, 170, 0)');   // Very light orange at top
    
    return gradient;
  };
  
  // Chart configuration with diagonal timestamp labels
  // Updated chartOptions with tooltip filter
const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#1f2937',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      // Filter tooltip to only show the water depth data (first dataset)
      filter: function(tooltipItem) {
        return tooltipItem.datasetIndex === 0; // Only show tooltip for the first dataset (Water Depth)
      },
      callbacks: {
        title: (context) => {
          const dataPoint = data[context[0].dataIndex];
          return `${dataPoint.parsedDate.toLocaleDateString()} at ${dataPoint.parsedDate.toLocaleTimeString()}`;
        },
        label: (context) => {
          const depth = context.parsed.y;
          let status = 'Normal';
          if (depth >= ALARM_LEVEL) status = 'ALARM';
          else if (depth >= ALERT_LEVEL) status = 'ALERT';
          
          return [
            `Water Depth: ${depth.toFixed(3)}m`,
            `Alert Depth: ${ALERT_LEVEL.toFixed(1)}m`,
            `Alarm Depth: ${ALARM_LEVEL.toFixed(1)}m`,
            `Status: ${status}`
          ];
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
        color: '#6b7280',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      ticks: {
        color: '#6b7280',
        maxTicksLimit: 10,
        maxRotation: 45, // Diagonal labels
        minRotation: 45  // Ensure diagonal rotation
      },
      grid: {
        color: 'rgba(229, 231, 235, 0.5)'
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      title: {
        display: true,
        text: 'Water Depth (m)',
        color: '#6b7280',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      ticks: {
        color: '#6b7280',
        callback: function(value) {
          return value + 'm';
        }
      },
      grid: {
        color: 'rgba(229, 231, 235, 0.5)'
      }
    }
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 3
    },
    point: {
      radius: 2,
      hoverRadius: 4,
      borderWidth: 2,
      backgroundColor: '#ffffff'
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
};
  // Prepare chart data with enhanced timestamp formatting
  const chartData: ChartData<'line'> = {
    labels: data.map(d => {
      const date = d.parsedDate;
      // Always show both date and time for better visibility
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      return `${dateStr} ${timeStr}`;
    }),
    datasets: [
      {
        label: 'Water Depth',
        data: data.map(d => d.meanDepth),
        borderColor: '#ea580c', // Darker orange border
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(194, 65, 12, 0.4)';
          return createWaterGradient(ctx, chartArea);
        },
        fill: true,
        pointBackgroundColor: data.map(d => {
          if (d.meanDepth >= ALARM_LEVEL) return '#dc2626';
          if (d.meanDepth >= ALERT_LEVEL) return '#f59e0b';
          return '#10b981';
        }),
        pointBorderColor: data.map(d => {
          if (d.meanDepth >= ALARM_LEVEL) return '#dc2626';
          if (d.meanDepth >= ALERT_LEVEL) return '#f59e0b';
          return '#10b981';
        }),
        pointRadius: data.map(d => {
          if (d.meanDepth >= ALARM_LEVEL) return 3;
          if (d.meanDepth >= ALERT_LEVEL) return 2;
          return 2;
        })
      },
      // Alert threshold line
      {
        label: 'Alert Level',
        data: data.map(() => ALERT_LEVEL),
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false,
        tension: 0
      },
      // Alarm threshold line
      {
        label: 'Alarm Level',
        data: data.map(() => ALARM_LEVEL),
        borderColor: '#dc2626',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false,
        tension: 0
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
              <h1 className="text-2xl font-bold text-gray-900">Water Level Monitor</h1>
              <p className="text-sm text-gray-600">Real-time water depth monitoring system</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Download CSV Button */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-sm font-medium text-green-600">Average</p>
                  <p className="text-2xl font-bold text-green-900">{statistics.average.toFixed(3)}m</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Alert Events</p>
                  <p className="text-2xl font-bold text-orange-900">{statistics.alertCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Alarm Events</p>
                  <p className="text-2xl font-bold text-red-900">{statistics.alarmCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Range Selection</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Time Range */}
          <div>
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="radio"
                  checked={!useCustomRange}
                  onChange={() => setUseCustomRange(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                Quick Select
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="radio"
                  checked={useCustomRange}
                  onChange={() => setUseCustomRange(true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                Custom Range
              </label>
            </div>
            
            {!useCustomRange && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span>{selectedOption?.label || 'Select Time Range'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {timeRangeOptions.filter(opt => opt.value !== 'custom').map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTimeRange(option.value);
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Custom Date Range */}
          {useCustomRange && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Status and Last Updated */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${currentStatus.bgColor} ${currentStatus.borderColor} border`}>
              {apiStatus === 'connected' ? (
                <Wifi className={`w-4 h-4 ${currentStatus.textColor}`} />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${currentStatus.textColor}`}>
                Status: {currentStatus.status}
              </span>
            </div>
            
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {data.length > 0 && `${data.length} data points`}
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Connection Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {/* Chart */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Water Depth Trend</h2>
              <p className="text-sm text-gray-600">
                {useCustomRange && customStartDate && customEndDate
                  ? `Custom range: ${customStartDate} to ${customEndDate}`
                  : selectedOption?.label && `Last ${selectedOption.label.toLowerCase()}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600">Alert (≥1.3m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Alarm (≥1.7m)</span>
            </div>
          </div>
        </div>
        
        {data.length > 0 ? (
          <div style={{ height: '500px' }}>
            <Line ref={chartRef} data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            {loading ? (
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>Loading water level data...</span>
              </div>
            ) : (
              <div className="text-center">
                <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p>No data available for the selected time range</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterLevelMonitor;