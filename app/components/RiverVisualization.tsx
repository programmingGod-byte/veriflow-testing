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
  BarController,
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
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Parse timestamp function for water level data
const parseTimestamp = (timestamp: string) => {
  // Handle format: "7/16/25 15:42"
  const [datePart, timePart] = timestamp.split(' ');
  const [month, day, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');
  // Convert 2-digit year to 4-digit (assuming 20xx)
  const fullYear = parseInt(year) + 2000;
  
  return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
};

// New function to parse timestamp from rainfall.csv
const parseRainfallTimestamp = (dateStr: string, timeStr: string) => {
    // Handle date: "23/07/25" and time: "17:26:22"
    const [day, month, year] = dateStr.split('/');
    const [hour, minute, second] = timeStr.split(':');
    const fullYear = parseInt(year) + 2000;
    return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
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

// New function to fetch and parse rainfall data from CSV
const fetchAndParseRainfallData = async () => {
  try {
    const response = await fetch('/rainfall.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch rainfall.csv: ${response.statusText}`);
    }
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    const parsedData = lines
      .map(line => line.trim())
      .filter(line => line) // Filter out empty lines
      .map(line => {
        const [datePart, timePart, rainfallStr] = line.split(',');
        if (!datePart || !timePart || rainfallStr === undefined) {
          return null; // Invalid line format
        }
        
        const rainfall = parseFloat(rainfallStr);
        if (isNaN(rainfall)) {
          return null;
        }

        return {
          parsedDate: parseRainfallTimestamp(datePart, timePart),
          rainfall: rainfall,
        };
      })
      .filter(item => item !== null) // Filter out nulls from invalid lines
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime()); // Sort by date

    return parsedData;
  } catch (error) {
    console.error("Error fetching or parsing rainfall data:", error);
    return []; // Return empty array on error
  }
};

// New function to synchronize rainfall data with water level data
const synchronizeRainfallData = (waterData, rawRainfallData) => {
    if (!waterData.length || !rawRainfallData.length) {
        // If no rainfall data, return an array of zeros with matching timestamps
        return waterData.map(wd => ({
            timestamp: wd.timestamp,
            parsedDate: wd.parsedDate,
            rainfall: 0,
        }));
    }

    let rainIndex = 0;
    return waterData.map(waterPoint => {
        // Find the most recent rainfall measurement that occurred before or at the same time as the water level measurement
        while (rainIndex < rawRainfallData.length - 1 && rawRainfallData[rainIndex + 1].parsedDate <= waterPoint.parsedDate) {
            rainIndex++;
        }

        let relevantRainfall = 0;
        // Check if the found rainfall data point is relevant (i.e., its timestamp is before or equal to the water point's timestamp)
        if (rawRainfallData[rainIndex].parsedDate <= waterPoint.parsedDate) {
            relevantRainfall = rawRainfallData[rainIndex].rainfall;
        }

        return {
            timestamp: waterPoint.timestamp,
            parsedDate: waterPoint.parsedDate,
            rainfall: relevantRainfall,
        };
    });
};


// CSV export function
const exportToCSV = (waterData, rainfallData, filename) => {
  const csvHeaders = ['Timestamp', 'Date', 'Time', 'Water Depth (m)', 'Rainfall (mm)', 'Status'];
  
  const csvData = waterData.map((item, index) => {
    const date = item.parsedDate;
    const dateStr = date.toLocaleDateString('en-US');
    const timeStr = date.toLocaleTimeString('en-US');
    
    // Since data is now synchronized, we can use the index directly
    const rainfall = rainfallData[index]?.rainfall || 0;
    
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
  // MODIFICATION: Default time range changed from '1' (1 Day) to '1h' (1 Hour)
  const [timeRange, setTimeRange] = useState('1h');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [data, setData] = useState([]);
  const [rawRainfallData, setRawRainfallData] = useState([]); // Store raw parsed CSV data
  const [rainfallData, setRainfallData] = useState([]); // Store synchronized rainfall data
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

  // Fetch rainfall data once on component mount
  useEffect(() => {
    const loadRainfall = async () => {
        const rainfall = await fetchAndParseRainfallData();
        setRawRainfallData(rainfall);
    };
    loadRainfall();
  }, []);

  useEffect(() => {
    if (context.value == null) return;
    API_BASE_URL = context?.value.machineCode
    
    handleRefresh();
  }, [context])
  
  // Common data processing function
  const processAndSetData = (apiData) => {
    const transformedData = apiData.map(item => ({
        timestamp: item.timestamp,
        meanDepth: 10.18-item.mean_depth,
        parsedDate: parseTimestamp(item.timestamp)
    }));
    
    const sortedData = transformedData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
    // Synchronize with rainfall data
    const syncedRainfall = synchronizeRainfallData(sortedData, rawRainfallData);

    setData(sortedData);
    setRainfallData(syncedRainfall);
    setLastUpdated(new Date());
    setApiStatus('connected');
  };

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
      
      const uri = `/api/newversion/depth/range?start=${encodeURIComponent(startFormatted)}&end=${encodeURIComponent(endFormatted)}&ip=${context?.value?.machineCode}`;
      const response = await fetch(uri);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      processAndSetData(apiData);
      
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
      processAndSetData(apiData);
      
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
      
      const uri = `/api/newversion/depth/range?start=${encodeURIComponent(startFormatted)}&end=${encodeURIComponent(endFormatted)}&ip=${context.value.machineCode}`;
      const response = await fetch(uri);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData = await response.json();
      processAndSetData(apiData);
      
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
  
  // MODIFICATION: Combined initial load and time range change effects into one.
  // This ensures the initial fetch respects the default '1h' state.
  useEffect(() => {
    if (rawRainfallData.length === 0) return; // Don't fetch until rainfall data is ready

    if (useCustomRange) {
        if (customStartDate && customEndDate) {
            const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
            const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
            if (startDateTime <= endDateTime) {
                fetchDataByDateRange(startDateTime, endDateTime);
            }
        }
    } else if (timeRange !== 'custom') {
        const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
        if (selectedOption?.hours) {
            fetchDataByHours(selectedOption.hours);
        } else if (selectedOption?.days) {
            fetchDataByDays(selectedOption.days);
        }
    }
  }, [timeRange, useCustomRange, customStartDate, customEndDate, customStartTime, customEndTime, rawRainfallData]);
  
  
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
    
    // Rainfall statistics from the synchronized data
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
            // Need to find the original data point from the 'data' state as chart data might contain nulls
            const label = context[0].label;
            if (!label) return ''; // Tooltip for a gap
            const originalDataPoint = data.find(d => d.parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) === label);
            if (originalDataPoint) {
              return `${originalDataPoint.parsedDate.toLocaleDateString()} at ${originalDataPoint.parsedDate.toLocaleTimeString()}`;
            }
            return label;
          },
          label: (context) => {
            if (context.dataset.label === 'Water Level') {
              const depth = context.parsed.y;
              if (depth === null) return null;
              let status = 'Normal';
              if (depth >= ALARM_LEVEL) status = 'ALARM';
              else if (depth >= ALERT_LEVEL) status = 'ALERT';
              return `Water Level: ${depth.toFixed(3)}m (${status})`;
            } else if (context.dataset.label === 'Rainfall') {
              const rain = context.parsed.y;
              if (rain === null) return null;
              return `Rainfall: ${rain.toFixed(1)}mm`;
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
        max: 10, // Adjust as needed for typical rainfall values
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

  // MODIFICATION: Logic to process data for chart, inserting nulls for time gaps > 20 mins.
  const TIME_GAP_THRESHOLD = 20 * 60 * 1000; // 20 minutes in milliseconds
  const chartLabels = [];
  const chartWaterData = [];
  const chartRainfallData = [];
  const chartAlertData = [];
  const chartAlarmData = [];

  if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
          // Add the current data point
          chartLabels.push(data[i].parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
          chartWaterData.push(data[i].meanDepth);
          chartRainfallData.push(rainfallData[i]?.rainfall ?? null);
          chartAlertData.push(ALERT_LEVEL);
          chartAlarmData.push(ALARM_LEVEL);

          // Check the gap to the *next* point
          if (i < data.length - 1) {
              const timeDiff = data[i + 1].parsedDate.getTime() - data[i].parsedDate.getTime();
              if (timeDiff > TIME_GAP_THRESHOLD) {
                  // Insert a null value to create a gap in the chart
                  chartLabels.push(''); // Add an empty label for the gap
                  chartWaterData.push(null);
                  chartRainfallData.push(null);
                  chartAlertData.push(null);
                  chartAlarmData.push(null);
              }
          }
      }
  }

  // Prepare chart data with gradient
  const chartData: ChartData<'line'> = {
    labels: chartLabels,
    datasets: [
      // Water Level Line
      {
        type: 'line' as const,
        label: 'Water Level',
        data: chartWaterData,
        borderColor: '#0b5ed7',
        borderWidth: 3,
        pointRadius: 2,
        pointBackgroundColor: '#0b5ed7',
        fill: true,
        spanGaps: false, // Explicitly prevent line from connecting across nulls
        backgroundColor: (context) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) {
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
        data: chartAlertData,
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
        data: chartAlarmData,
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
        data: chartRainfallData,
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
                  <p className="text-sm font-medium text-green-600">Average Level</p>
                  <p className="text-2xl font-bold text-green-900">{statistics.average.toFixed(3)}m</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600">Max Rainfall (Event)</p>
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