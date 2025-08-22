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
// UPDATE: Import the new RainfallBarChart component
import RainfallBarChart from './RainfallHistogram';

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

/**
 * A simple 1D Kalman Filter.
 * @param {object} options - The options for the filter.
 * @param {number} [options.R=1] - Process noise covariance.
 * @param {number} [options.Q=1] - Measurement noise covariance.
 */
class KalmanFilter {
  constructor({ R = 1, Q = 1, A = 1, C = 1 } = {}) {
    this.R = R; // Process noise
    this.Q = Q; // Measurement noise
    this.A = A; // State transition
    this.C = C; // Measurement relationship
    this.x = null; // State (the filtered value)
    this.P = null; // Covariance of the state
  }

  filter(z) {
    if (this.x === null) {
      // Initialize state on the first measurement
      this.x = (1 / this.C) * z;
      this.P = (1 / (this.C * this.C)) * this.Q;
    } else {
      // Prediction step
      const predX = this.A * this.x;
      const predP = this.A * this.P * this.A + this.R;

      // Update (correction) step
      const K = predP * this.C * (1 / (this.C * predP * this.C + this.Q)); // Kalman Gain
      this.x = predX + K * (z - this.C * predX);
      this.P = predP - K * this.C * predP;
    }
    return this.x;
  }
}


// Parse timestamp function for water level data
const parseTimestamp = (timestamp: string) => {
  const [datePart, timePart] = timestamp.split(' ');
  const [month, day, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');
  const fullYear = parseInt(year) + 2000;
  return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
};

// New function to parse timestamp from rainfall.csv
const parseRainfallTimestamp = (dateStr: string, timeStr: string) => {
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
// /home/shivam/Desktop/VisiFlow-main/public/rainfall.csv
// New function to fetch and parse rainfall data from CSV
const fetchAndParseRainfallData = async () => {
  try {
    const response = await fetch('/rainfall.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch rainfall.csv: ${response.statusText}`);
    }
    const csvText = await response.text();
    console.log(csvText);
    const lines = csvText.split('\n');
    const parsedData = lines
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        const [datePart, timePart, rainfallStr] = line.split(',');
        if (!datePart || !timePart || rainfallStr === undefined) return null;
        const rainfall = parseFloat(rainfallStr);
        if (isNaN(rainfall)) return null;
        return {
          parsedDate: parseRainfallTimestamp(datePart, timePart),
          rainfall: rainfall,
          timestamp: `${datePart} ${timePart}`
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    return parsedData;
  } catch (error) {
    console.error("Error fetching or parsing rainfall data:", error);
    return [];
  }
};

// Filter rainfall data based on date range
const filterRainfallByDateRange = (rainfallData, startDate, endDate) => {
  return rainfallData.filter(item => 
    item.parsedDate >= startDate && item.parsedDate <= endDate
  );
};

// CSV export function
const exportToCSV = (waterData, rainfallData, filename) => {
  const csvHeaders = ['Type', 'Timestamp', 'Date', 'Time', 'Water Depth (m)', 'Rainfall (mm)', 'Status'];
  const csvData = [];
  
  waterData.forEach(item => {
    const date = item.parsedDate;
    let status = 'Normal';
    if (item.meanDepth >= 1.7) status = 'ALARM';
    else if (item.meanDepth >= 1.3) status = 'ALERT';
    csvData.push([
      'Water Level', item.timestamp, date.toLocaleDateString('en-US'), date.toLocaleTimeString('en-US'),
      item.meanDepth.toFixed(3), '', status
    ]);
  });
  
  rainfallData.forEach(item => {
    const date = item.parsedDate;
    csvData.push([
      'Rainfall', item.timestamp, date.toLocaleDateString('en-US'), date.toLocaleTimeString('en-US'),
      '', item.rainfall.toFixed(1), ''
    ]);
  });
  
  csvData.sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime());
  
  const csvContent = [csvHeaders, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
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

/**
 * Reduces the number of data points per day to a maximum of `maxPoints`.
 * This version correctly partitions the data to ensure the right number of points are generated.
 * @param {Array} sortedData - The input data, sorted by date.
 * @param {number} maxPoints - The maximum number of points to have per day.
 * @returns {Array} The downsampled data.
 */



/**
 * Reduces the number of data points to exactly 24 per day (one per hour)
 * by creating uniform one-hour buckets and selecting the peak value from each.
 * This ensures points are evenly spaced across the day.
 * @param {Array} sortedData - The input data, sorted by date.
 * @returns {Array} The downsampled data with uniform hourly spacing.
 */
const downsampleDataPerDay = (sortedData) => {
    if (!sortedData || sortedData.length === 0) return [];
    
    // The target number of points for a full day.
    const pointsPerDay = 20;

    // Group all data points by their calendar day.
    const groupedByDay = sortedData.reduce((acc, item) => {
        const day = item.parsedDate.toDateString();
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {});

    const finalData = [];
    const sortedDays = Object.keys(groupedByDay).sort((a, b) => new Date(a) - new Date(b));

    for (const day of sortedDays) {
        const dayPoints = groupedByDay[day];
        // If the day already has 24 or fewer points, just keep them all.
        if (dayPoints.length <= pointsPerDay) {
            finalData.push(...dayPoints);
            continue;
        }

        const pointsForThisDay = [];
        
        // Define the start of the day for bucket calculations.
        const dayStart = new Date(dayPoints[0].parsedDate);
        dayStart.setHours(0, 0, 0, 0);

        // Calculate the size of each time bucket (1 hour in milliseconds).
        const bucketSizeMs = (60 * 60 * 1000);

        // Iterate through each of the 24 hourly buckets for the day.
        for (let i = 0; i < pointsPerDay; i++) {
            const bucketStartTime = dayStart.getTime() + i * bucketSizeMs;
            const bucketEndTime = bucketStartTime + bucketSizeMs;

            // Find all the original data points that fall into the current bucket.
            const pointsInBucket = dayPoints.filter(p => {
                const pointTime = p.parsedDate.getTime();
                return pointTime >= bucketStartTime && pointTime < bucketEndTime;
            });

            // If the bucket has data, find the peak point and add it.
            if (pointsInBucket.length > 0) {
                // Find the point with the highest water depth in this bucket.
                const peakPoint = pointsInBucket.reduce((max, p) => 
                    p.meanDepth > max.meanDepth ? p : max, 
                    pointsInBucket[0]
                );
                pointsForThisDay.push(peakPoint);
            }
        }
        
        finalData.push(...pointsForThisDay);
    }
    return finalData;
};

const WaterLevelMonitor = ({setCurrentDepth}) => {
  // UPDATE: Adjusted Kalman filter parameters for less smoothing
const KALMAN_PROCESS_NOISE = 0.2; // Increased from 0.008
const KALMAN_MEASUREMENT_NOISE = 0.8;  // Decreased from 0.5
  const GAP_DETECTION_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
  const MAX_POINTS_PER_DAY_LARGE_RANGE = 10; 

  const [timeRange, setTimeRange] = useState('1h');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [data, setData] = useState([]);
  const [rawRainfallData, setRawRainfallData] = useState([]);
  const [filteredRainfallData, setFilteredRainfallData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiStatus, setApiStatus] = useState('connected');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const context = useContext(MyContext);
  
  const chartRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const ALERT_LEVEL = 3;
  const ALARM_LEVEL = 2;
  
  const timeRangeOptions = [
    { value: '1h', label: '1 Hour', hours: 1 }, { value: '2h', label: '2 Hours', hours: 2 },
    { value: '6h', label: '6 Hours', hours: 6 }, { value: '12h', label: '12 Hours', hours: 12 },
    { value: '1', label: '1 Day', days: 1 }, { value: '2', label: '2 Days', days: 2 },
    { value: '3', label: '3 Days', days: 3 }, { value: '7', label: '1 Week', days: 7 },
    { value: '14', label: '2 Weeks', days: 14 }, { value: '30', label: '1 Month', days: 30 },
    { value: 'custom', label: 'Custom Range', days: 0 }
  ];
  
  let API_BASE_URL = 'https://your-api-domain.com';
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAndParseRainfallData().then(setRawRainfallData);
  }, []);

  useEffect(() => {
    if (context.value == null) return;
    API_BASE_URL = context?.value.machineCode;
    handleRefresh();
  }, [context]);
  
  const updateFilteredRainfallData = (startDate, endDate) => {
    const filtered = filterRainfallByDateRange(rawRainfallData, startDate, endDate);
    setFilteredRainfallData(filtered);
  };
  
  const processAndSetData = (apiData, startDate, endDate, daysInRange) => {
    console.log(context.value.depth)
    const transformedData = apiData.map(item => ({
        timestamp: item.timestamp,
        meanDepth: parseFloat(context.value.depth)  -item.mean_depth,
        parsedDate: parseTimestamp(item.timestamp)
    }));
    
    const positiveData = transformedData.filter(item => item.meanDepth >= 0);
    let sortedData = positiveData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
    if (daysInRange >= 7) {
        sortedData = downsampleDataPerDay(sortedData, MAX_POINTS_PER_DAY_LARGE_RANGE);
    }
    
    let kf = new KalmanFilter({ R: KALMAN_PROCESS_NOISE, Q: KALMAN_MEASUREMENT_NOISE });
    const robustlyFilteredData = [];
    let lastTimestamp = null;

    sortedData.forEach(item => {
        const currentTimestamp = item.parsedDate.getTime();
        if (lastTimestamp && (currentTimestamp - lastTimestamp > GAP_DETECTION_THRESHOLD_MS)) {
            kf = new KalmanFilter({ R: KALMAN_PROCESS_NOISE, Q: KALMAN_MEASUREMENT_NOISE });
        }
        const smoothedDepth = kf.filter(item.meanDepth);
        robustlyFilteredData.push({ ...item, meanDepth: smoothedDepth });
        lastTimestamp = currentTimestamp;
    });
    
    updateFilteredRainfallData(startDate, endDate);
    setData(robustlyFilteredData);
    setLastUpdated(new Date());
    setApiStatus('connected');
  };

  const fetchDataByHours = async (hours) => {
    try {
      setLoading(true);
      setError('');
      setApiStatus('connecting');
      const now = new Date();
      const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
      const uri = `/api/newversion/depth/range?start=${encodeURIComponent(formatDateForAPI(startTime))}&end=${encodeURIComponent(formatDateForAPI(now))}&ip=${context?.value?.machineCode}`;
      const response = await fetch(uri);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const apiData = await response.json();
      processAndSetData(apiData, startTime, now, hours / 24);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDataByDays = async (days) => {
    try {
      setLoading(true);
      setError('');
      setApiStatus('connecting');
      const response = await fetch(`/api/newversion/depth/${days}?ip=${context.value.machineCode}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const apiData = await response.json();
      const now = new Date();
      const startTime = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      processAndSetData(apiData, startTime, now, days);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDataByDateRange = async (startDateTime, endDateTime) => {
    try {
      setLoading(true);
      setError('');
      setApiStatus('connecting');
      const uri = `/api/newversion/depth/range?start=${encodeURIComponent(formatDateForAPI(startDateTime))}&end=${encodeURIComponent(formatDateForAPI(endDateTime))}&ip=${context.value.machineCode}`;
      const response = await fetch(uri);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const apiData = await response.json();
      const daysInRange = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24);
      processAndSetData(apiData, startDateTime, endDateTime, daysInRange);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadCSV = async () => {
    if (data.length === 0 && filteredRainfallData.length === 0) {
      alert('No data available to download');
      return;
    }
    setIsDownloading(true);
    try {
      let filename = 'water_level_rainfall_data';
      const timestamp = new Date().toISOString().split('T')[0];
      if (useCustomRange && customStartDate && customEndDate) {
        filename = `data_${customStartDate}_to_${customEndDate}_${timestamp}.csv`;
      } else {
        const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
        if (selectedOption) filename = `data_${selectedOption.label.replace(' ', '_').toLowerCase()}_${timestamp}.csv`;
      }
      exportToCSV(data, filteredRainfallData, filename);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV file');
    } finally {
      setIsDownloading(false);
    }
  };
  
  useEffect(() => {
    if (rawRainfallData.length === 0) return;
    if (useCustomRange) {
        if (customStartDate && customEndDate) {
            const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
            const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
            if (startDateTime <= endDateTime) fetchDataByDateRange(startDateTime, endDateTime);
        }
    } else if (timeRange !== 'custom') {
        const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
        if (selectedOption?.hours) fetchDataByHours(selectedOption.hours);
        else if (selectedOption?.days) fetchDataByDays(selectedOption.days);
    }
  }, [timeRange, useCustomRange, customStartDate, customEndDate, customStartTime, customEndTime, rawRainfallData]);
  
  const getCurrentStatus = () => {
    if (data.length === 0) return { status: 'Unknown', color: 'gray' };
    const currentDepth = data[data.length - 1].meanDepth;
    if (currentDepth >= ALARM_LEVEL) return { status: 'ALARM', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
    if (currentDepth >= ALERT_LEVEL) return { status: 'ALERT', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' };
    return { status: 'NORMAL', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
  };
  
  const getStatistics = () => {
    if (data.length === 0) return null;
    const depths = data.map(d => d.meanDepth);
    const currentDepth = depths[depths.length - 1];
    if (setCurrentDepth) setCurrentDepth(currentDepth.toFixed(2));
    const rainfalls = filteredRainfallData.map(d => d.rainfall);
    return {
      current: currentDepth,
      max: Math.max(...depths),
      min: Math.min(...depths),
      average: depths.reduce((a, b) => a + b, 0) / depths.length,
      alertCount: depths.filter(d => d >= ALERT_LEVEL && d < ALARM_LEVEL).length,
      alarmCount: depths.filter(d => d >= ALARM_LEVEL).length,
      totalReadings: data.length,
      totalRainfall: rainfalls.reduce((a, b) => a + b, 0),
      maxRainfall: rainfalls.length > 0 ? Math.max(...rainfalls) : 0,
      rainfallReadings: filteredRainfallData.length
    };
  };

  const createCombinedTimeline = () => {
    if (data.length === 0) {
      return { labels: [], waterData: [], rainfallData: [], alertData: [], alarmData: [], combinedData: [] };
    }

    const rainfallMap = new Map();
    filteredRainfallData.forEach(item => {
      const key = new Date(item.parsedDate).setSeconds(0, 0);
      rainfallMap.set(key, item.rainfall);
    });

    const chartLabels = [];
    const chartWaterData = [];
    const chartRainfallData = [];
    const chartAlertData = [];
    const chartAlarmData = [];
    const combinedData = [];
    let lastDay = null;

    data.forEach(point => {
      const currentDay = point.parsedDate.toDateString();
      // if (lastDay !== null && currentDay !== lastDay) {
      //   chartLabels.push('');
      //   chartWaterData.push(null);
      //   chartRainfallData.push(null);
      //   chartAlertData.push(null);
      //   chartAlarmData.push(null);
      //   combinedData.push(null);
      // }

      const labelDate = point.parsedDate;
      const formattedLabel = `${String(labelDate.getMonth() + 1).padStart(2, '0')}/${String(labelDate.getDate()).padStart(2, '0')}/${labelDate.getFullYear()} ${String(labelDate.getHours()).padStart(2, '0')}:${String(labelDate.getMinutes()).padStart(2, '0')}`;
      chartLabels.push(formattedLabel);
      chartWaterData.push(point.meanDepth);
      chartAlertData.push(ALERT_LEVEL);
      chartAlarmData.push(ALARM_LEVEL);

      const key = new Date(point.parsedDate).setSeconds(0, 0);
      const rainfallValue = rainfallMap.get(key) || null;
      chartRainfallData.push(rainfallValue);
      
      combinedData.push({
          timestamp: point.parsedDate.getTime(),
          parsedDate: point.parsedDate,
          waterLevel: point.meanDepth,
          rainfall: rainfallValue
      });
      lastDay = currentDay;
    });

    return { 
        labels: chartLabels, 
        waterData: chartWaterData, 
        rainfallData: chartRainfallData, 
        alertData: chartAlertData, 
        alarmData: chartAlarmData, 
        combinedData: combinedData
    };
  };
  const chartTimelineData = createCombinedTimeline();

  const chartOptions: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 12, weight: 'bold' }}},
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', titleColor: '#1f2937', bodyColor: '#1f2937', borderColor: '#e5e7eb',
        borderWidth: 1, cornerRadius: 8, displayColors: true,
        callbacks: {
          title: (ctx) => {
            const dp = chartTimelineData.combinedData[ctx[0].dataIndex];
            return dp ? `${new Date(dp.timestamp).toLocaleDateString()} at ${new Date(dp.timestamp).toLocaleTimeString()}` : '';
          },
          label: (ctx) => {
            if (ctx.dataset.label === 'Water Level') {
              const depth = ctx.parsed.y;
              if (depth === null) return null;
              let status = 'Normal';
              if (depth >= ALARM_LEVEL) status = 'ALARM'; else if (depth >= ALERT_LEVEL) status = 'ALERT';
              return `Water Level: ${depth.toFixed(3)}m (${status})`;
            }
            
            return '';
          }
        }
      }
    },
    scales: {
      x: { 
  display: true, 
  title: { display: true, text: 'Date & Time', color: '#374151', font: { size: 14, weight: 'bold' }}, 
  ticks: { 
    color: '#6b7280', 
    maxTicksLimit: Math.min(20, Math.max(5, Math.floor(chartTimelineData.labels.length / 10))), // Dynamic limit
    maxRotation: 45,
    minRotation: 45,
    autoSkip: true, // Add this
    autoSkipPadding: 10, // Add this
    callback: function(value, index, ticks) {
      return this.getLabelForValue(value);
    }
  }, 
  grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }
},
      y: { type: 'linear', display: true, position: 'left', beginAtZero: true, title: { display: true, text: 'Water Level (m)', color: '#0b5ed7', font: { size: 14, weight: 'bold' }}, ticks: { color: '#0b5ed7', callback: (v) => v.toFixed(1) + 'm' }, grid: { color: 'rgba(0,0,0,0.1)' }},
      // y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, max: 10, title: { display: true, text: 'Rainfall (mm)', color: '#15a3c9', font: { size: 14, weight: 'bold' }}, ticks: { color: '#15a3c9', callback: (v) => v + 'mm' }, grid: { drawOnChartArea: false }}
    },
    elements: { line: { tension: 0.4 }, point: { radius: 0, hoverRadius: 5 }},
    interaction: { intersect: false, mode: 'index' }
  };

  const chartData: ChartData<'line'> = {
    labels: chartTimelineData.labels,
    datasets: [
      { type: 'line', label: 'Water Level', data: chartTimelineData.waterData, borderColor: '#0b5ed7', borderWidth: 3, pointRadius: 2, pointBackgroundColor: '#0b5ed7', fill: true, spanGaps: false,
        backgroundColor: (ctx) => {
          const { chart } = ctx; const { ctx: context, chartArea } = chart; if (!chartArea) return null;
          const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(11, 94, 215, 0.5)'); gradient.addColorStop(0.5, 'rgba(11, 94, 215, 0.1)'); gradient.addColorStop(1, 'rgba(11, 94, 215, 0)');
          return gradient;
        }, yAxisID: 'y' },
      { type: 'line', label: 'Alert Level', data: chartTimelineData.alertData, borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, fill: false, yAxisID: 'y' },
      { type: 'line', label: 'Alarm Level', data: chartTimelineData.alarmData, borderColor: '#dc2626', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, fill: false, yAxisID: 'y' },
    ]
  };
  
  const handleRefresh = async () => {
    if (useCustomRange && customStartDate && customEndDate) {
      const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
      const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
      await fetchDataByDateRange(startDateTime, endDateTime);
    } else {
      const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
      if (selectedOption?.hours) await fetchDataByHours(selectedOption.hours);
      else if (selectedOption?.days) await fetchDataByDays(selectedOption.days);
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
            <div ref={dropdownRef} className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-between w-48 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                <span>{useCustomRange ? 'Custom Range' : selectedOption?.label || 'Select Range'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
                  {timeRangeOptions.map(option => (
                    <button key={option.value} onClick={() => {
                        if (option.value === 'custom') setUseCustomRange(true);
                        else { setUseCustomRange(false); setTimeRange(option.value); }
                        setDropdownOpen(false);
                      }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {useCustomRange && (
              <div className="flex flex-col sm:flex-row gap-2 items-center p-2 bg-gray-50 rounded-lg border">
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-2 py-1 border rounded-md text-sm" />
                <input type="time" value={customStartTime} onChange={(e) => setCustomStartTime(e.target.value)} className="px-2 py-1 border rounded-md text-sm" />
                <span className="text-gray-500">-</span>
                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-2 py-1 border rounded-md text-sm" />
                <input type="time" value={customEndTime} onChange={(e) => setCustomEndTime(e.target.value)} className="px-2 py-1 border rounded-md text-sm" />
              </div>
            )}
          </div>
        </div>
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
      
      {/* UPDATE: Use the new RainfallBarChart component */}
      <RainfallBarChart rainfallData={filteredRainfallData} />

    </div>
  );
};

export default WaterLevelMonitor;