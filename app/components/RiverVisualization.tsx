// "use client";

// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   BarController,
//   Legend,
//   Filler,
//   ChartOptions,
//   ChartData
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';
// import { Calendar, Clock, RefreshCw, AlertTriangle, Droplets, TrendingUp, Activity, Wifi, WifiOff, ChevronDown, Download, CloudRain } from 'lucide-react';
// import { MyContext } from '../providers';

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   BarController,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// // Parse timestamp function for water level data
// const parseTimestamp = (timestamp: string) => {
//   // Handle format: "7/16/25 15:42"
//   const [datePart, timePart] = timestamp.split(' ');
//   const [month, day, year] = datePart.split('/');
//   const [hour, minute] = timePart.split(':');
//   // Convert 2-digit year to 4-digit (assuming 20xx)
//   const fullYear = parseInt(year) + 2000;
  
//   return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
// };

// // New function to parse timestamp from rainfall.csv
// const parseRainfallTimestamp = (dateStr: string, timeStr: string) => {
//     // Handle date: "23/07/25" and time: "17:26:22"
//     const [day, month, year] = dateStr.split('/');
//     const [hour, minute, second] = timeStr.split(':');
//     const fullYear = parseInt(year) + 2000;
//     return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
// };

// // Format date for API request (YYYY-MM-DD HH:mm)
// const formatDateForAPI = (date: Date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
  
//   return `${year}-${month}-${day} ${hours}:${minutes}`;
// };

// // New function to fetch and parse rainfall data from CSV
// const fetchAndParseRainfallData = async () => {
//   try {
//     const response = await fetch('/rainfall.csv');
//     if (!response.ok) {
//       throw new Error(`Failed to fetch rainfall.csv: ${response.statusText}`);
//     }
//     const csvText = await response.text();
//     const lines = csvText.split('\n');
    
//     const parsedData = lines
//       .map(line => line.trim())
//       .filter(line => line) // Filter out empty lines
//       .map(line => {
//         const [datePart, timePart, rainfallStr] = line.split(',');
//         if (!datePart || !timePart || rainfallStr === undefined) {
//           return null; // Invalid line format
//         }
        
//         const rainfall = parseFloat(rainfallStr);
//         if (isNaN(rainfall)) {
//           return null;
//         }

//         return {
//           parsedDate: parseRainfallTimestamp(datePart, timePart),
//           rainfall: rainfall,
//           timestamp: `${datePart} ${timePart}`
//         };
//       })
//       .filter(item => item !== null) // Filter out nulls from invalid lines
//       .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime()); // Sort by date

//     return parsedData;
//   } catch (error) {
//     console.error("Error fetching or parsing rainfall data:", error);
//     return []; // Return empty array on error
//   }
// };

// // Filter rainfall data based on date range
// const filterRainfallByDateRange = (rainfallData, startDate, endDate) => {
//   return rainfallData.filter(item => 
//     item.parsedDate >= startDate && item.parsedDate <= endDate
//   );
// };

// // CSV export function
// const exportToCSV = (waterData, rainfallData, filename) => {
//   const csvHeaders = ['Type', 'Timestamp', 'Date', 'Time', 'Water Depth (m)', 'Rainfall (mm)', 'Status'];
  
//   const csvData = [];
  
//   // Add water level data
//   waterData.forEach(item => {
//     const date = item.parsedDate;
//     const dateStr = date.toLocaleDateString('en-US');
//     const timeStr = date.toLocaleTimeString('en-US');
    
//     let status = 'Normal';
//     if (item.meanDepth >= 1.7) status = 'ALARM';
//     else if (item.meanDepth >= 1.3) status = 'ALERT';
    
//     csvData.push([
//       'Water Level',
//       item.timestamp,
//       dateStr,
//       timeStr,
//       item.meanDepth.toFixed(3),
//       '',
//       status
//     ]);
//   });
  
//   // Add rainfall data
//   rainfallData.forEach(item => {
//     const date = item.parsedDate;
//     const dateStr = date.toLocaleDateString('en-US');
//     const timeStr = date.toLocaleTimeString('en-US');
    
//     csvData.push([
//       'Rainfall',
//       item.timestamp,
//       dateStr,
//       timeStr,
//       '',
//       item.rainfall.toFixed(1),
//       ''
//     ]);
//   });
  
//   // Sort by timestamp
//   csvData.sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime());
  
//   const csvContent = [csvHeaders, ...csvData]
//     .map(row => row.map(cell => `"${cell}"`).join(','))
//     .join('\n');
  
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const link = document.createElement('a');
  
//   if (link.download !== undefined) {
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', filename);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }
// };

// const WaterLevelMonitor = ({setCurrentDepth}) => {
//   // MODIFICATION: Default time range changed from '1' (1 Day) to '1h' (1 Hour)
//   const [timeRange, setTimeRange] = useState('1h');
//   const [customStartDate, setCustomStartDate] = useState('');
//   const [customEndDate, setCustomEndDate] = useState('');
//   const [customStartTime, setCustomStartTime] = useState('');
//   const [customEndTime, setCustomEndTime] = useState('');
//   const [useCustomRange, setUseCustomRange] = useState(false);
//   const [data, setData] = useState([]);
//   const [rawRainfallData, setRawRainfallData] = useState([]); // Store raw parsed CSV data
//   const [filteredRainfallData, setFilteredRainfallData] = useState([]); // Store filtered rainfall data for current time range
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [apiStatus, setApiStatus] = useState('connected');
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const context = useContext(MyContext);
  
//   const chartRef = useRef(null);
//   const dropdownRef = useRef(null);
  
//   // Water level thresholds
//   const ALERT_LEVEL = 1.3;
//   const ALARM_LEVEL = 1.7;
  
//   // Time range options
//   const timeRangeOptions = [
//     { value: '1h', label: '1 Hour', hours: 1 },
//     { value: '2h', label: '2 Hours', hours: 2 },
//     { value: '6h', label: '6 Hours', hours: 6 },
//     { value: '12h', label: '12 Hours', hours: 12 },
//     { value: '1', label: '1 Day', days: 1 },
//     { value: '2', label: '2 Days', days: 2 },
//     { value: '3', label: '3 Days', days: 3 },
//     { value: '7', label: '1 Week', days: 7 },
//     { value: '14', label: '2 Weeks', days: 14 },
//     { value: '30', label: '1 Month', days: 30 },
//     { value: 'custom', label: 'Custom Range', days: 0 }
//   ];
  
//   // API Base URL
//   let API_BASE_URL = 'https://your-api-domain.com';
  
//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Fetch rainfall data once on component mount
//   useEffect(() => {
//     const loadRainfall = async () => {
//         const rainfall = await fetchAndParseRainfallData();
//         setRawRainfallData(rainfall);
//     };
//     loadRainfall();
//   }, []);

//   useEffect(() => {
//     if (context.value == null) return;
//     API_BASE_URL = context?.value.machineCode
    
//     handleRefresh();
//   }, [context])
  
//   // Function to filter rainfall data based on current time range
//   const updateFilteredRainfallData = (startDate, endDate) => {
//     const filtered = filterRainfallByDateRange(rawRainfallData, startDate, endDate);
//     setFilteredRainfallData(filtered);
//   };
  
//   // Common data processing function
//   const processAndSetData = (apiData, startDate, endDate) => {
//     const transformedData = apiData.map(item => ({
//         timestamp: item.timestamp,
//         meanDepth: 10.18-item.mean_depth,
//         parsedDate: parseTimestamp(item.timestamp)
//     }));
    
//     const sortedData = transformedData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
//     // Filter rainfall data for the same time range
//     updateFilteredRainfallData(startDate, endDate);

//     setData(sortedData);
//     setLastUpdated(new Date());
//     setApiStatus('connected');
//   };

//   // Fetch data by hours
//   const fetchDataByHours = async (hours) => {
//     try {
//       setLoading(true);
//       setError('');
//       setApiStatus('connecting');
      
//       const now = new Date();
//       const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
      
//       const startFormatted = formatDateForAPI(startTime);
//       const endFormatted = formatDateForAPI(now);
      
//       const uri = `/api/newversion/depth/range?start=${encodeURIComponent(startFormatted)}&end=${encodeURIComponent(endFormatted)}&ip=${context?.value?.machineCode}`;
//       const response = await fetch(uri);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const apiData = await response.json();
//       processAndSetData(apiData, startTime, now);
      
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError(`Failed to fetch data: ${err.message}`);
//       setApiStatus('error');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Fetch data from API by days
//   const fetchDataByDays = async (days) => {
//     try {
//       setLoading(true);
//       setError('');
//       setApiStatus('connecting');
      
//       const response = await fetch(`/api/newversion/depth/${days}?ip=${context.value.machineCode}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const apiData = await response.json();
      
//       // Calculate date range for filtering rainfall data
//       const now = new Date();
//       const startTime = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
//       processAndSetData(apiData, startTime, now);
      
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError(`Failed to fetch data: ${err.message}`);
//       setApiStatus('error');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Fetch data from API by date range
//   const fetchDataByDateRange = async (startDateTime, endDateTime) => {
//     try {
//       setLoading(true);
//       setError('');
//       setApiStatus('connecting');
      
//       const startFormatted = formatDateForAPI(startDateTime);
//       const endFormatted = formatDateForAPI(endDateTime);
      
//       const uri = `/api/newversion/depth/range?start=${encodeURIComponent(startFormatted)}&end=${encodeURIComponent(endFormatted)}&ip=${context.value.machineCode}`;
//       const response = await fetch(uri);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const apiData = await response.json();
//       processAndSetData(apiData, startDateTime, endDateTime);
      
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError(`Failed to fetch data: ${err.message}`);
//       setApiStatus('error');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Handle CSV download
//   const handleDownloadCSV = async () => {
//     if (data.length === 0 && filteredRainfallData.length === 0) {
//       alert('No data available to download');
//       return;
//     }

//     setIsDownloading(true);
    
//     try {
//       let filename = 'water_level_rainfall_data';
//       const now = new Date();
//       const timestamp = now.toISOString().split('T')[0];
      
//       if (useCustomRange && customStartDate && customEndDate) {
//         filename = `water_level_rainfall_${customStartDate}_to_${customEndDate}_${timestamp}.csv`;
//       } else {
//         const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
//         if (selectedOption) {
//           filename = `water_level_rainfall_${selectedOption.label.replace(' ', '_').toLowerCase()}_${timestamp}.csv`;
//         }
//       }
      
//       exportToCSV(data, filteredRainfallData, filename);
      
//     } catch (error) {
//       console.error('Error downloading CSV:', error);
//       alert('Error downloading CSV file');
//     } finally {
//       setIsDownloading(false);
//     }
//   };
  
//   // MODIFICATION: Combined initial load and time range change effects into one.
//   // This ensures the initial fetch respects the default '1h' state.
//   useEffect(() => {
//     if (rawRainfallData.length === 0) return; // Don't fetch until rainfall data is ready

//     if (useCustomRange) {
//         if (customStartDate && customEndDate) {
//             const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
//             const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
//             if (startDateTime <= endDateTime) {
//                 fetchDataByDateRange(startDateTime, endDateTime);
//             }
//         }
//     } else if (timeRange !== 'custom') {
//         const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
//         if (selectedOption?.hours) {
//             fetchDataByHours(selectedOption.hours);
//         } else if (selectedOption?.days) {
//             fetchDataByDays(selectedOption.days);
//         }
//     }
//   }, [timeRange, useCustomRange, customStartDate, customEndDate, customStartTime, customEndTime, rawRainfallData]);
  
  
//   // Get current status based on latest water level
//   const getCurrentStatus = () => {
//     if (data.length === 0) return { status: 'Unknown', color: 'gray' };
    
//     const currentDepth = data[data.length - 1].meanDepth;
    
//     if (currentDepth >= ALARM_LEVEL) {
//       return { status: 'ALARM', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
//     } else if (currentDepth >= ALERT_LEVEL) {
//       return { status: 'ALERT', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' };
//     } else {
//       return { status: 'NORMAL', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
//     }
//   };
  
//   // Calculate statistics
//   const getStatistics = () => {
//     if (data.length === 0) return null;
    
//     const depths = data.map(d => d.meanDepth);
//     const maxDepth = Math.max(...depths);
//     const minDepth = Math.min(...depths);
//     const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
//     const currentDepth = depths[depths.length - 1];
//     if (setCurrentDepth) {
//         setCurrentDepth(currentDepth.toFixed(2));
//     }
//     const alertCount = depths.filter(d => d >= ALERT_LEVEL && d < ALARM_LEVEL).length;
//     const alarmCount = depths.filter(d => d >= ALARM_LEVEL).length;
    
//     // Rainfall statistics from the filtered data
//     const rainfalls = filteredRainfallData.map(d => d.rainfall);
//     const totalRainfall = rainfalls.reduce((a, b) => a + b, 0);
//     const maxRainfall = rainfalls.length > 0 ? Math.max(...rainfalls) : 0;
    
//     return {
//       current: currentDepth,
//       max: maxDepth,
//       min: minDepth,
//       average: avgDepth,
//       alertCount,
//       alarmCount,
//       totalReadings: data.length,
//       totalRainfall,
//       maxRainfall,
//       rainfallReadings: filteredRainfallData.length
//     };
//   };

//   const createCombinedTimeline = () => {
//     const allDataPoints = [];
    
//     // Add water level data points
//     data.forEach(item => {
//       allDataPoints.push({
//         timestamp: item.parsedDate.getTime(),
//         parsedDate: item.parsedDate,
//         waterLevel: item.meanDepth,
//         rainfall: null,
//       });
//     });
    
//     // Add rainfall data points
//     filteredRainfallData.forEach(item => {
//       allDataPoints.push({
//         timestamp: item.parsedDate.getTime(),
//         parsedDate: item.parsedDate,
//         waterLevel: null,
//         rainfall: item.rainfall,
//       });
//     });
    
//     // Sort by timestamp
//     allDataPoints.sort((a, b) => a.timestamp - b.timestamp);
    
//     // Create chart data arrays by iterating through the sorted points
//     const chartLabels = [];
//     const chartWaterData = [];
//     const chartRainfallData = [];
//     const chartAlertData = [];
//     const chartAlarmData = [];
    
//     allDataPoints.forEach(point => {
//       const timeLabel = point.parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
//       chartLabels.push(timeLabel);
//       chartWaterData.push(point.waterLevel);
//       chartRainfallData.push(point.rainfall);
//       chartAlertData.push(ALERT_LEVEL);
//       chartAlarmData.push(ALARM_LEVEL);
//     });
    
//     return {
//       labels: chartLabels,
//       waterData: chartWaterData,
//       rainfallData: chartRainfallData,
//       alertData: chartAlertData,
//       alarmData: chartAlarmData,
//       combinedData: allDataPoints // Return the crucial combined array
//     };
//   };
  
//   // **MODIFICATION START: The 'chartTimelineData' variable will hold the combined data used by the tooltip.**
//   const chartTimelineData = createCombinedTimeline();

//   // Chart configuration to match the reference image style
//   const chartOptions: ChartOptions<'line'> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top',
//         labels: {
//           usePointStyle: true,
//           pointStyle: 'circle',
//           padding: 20,
//           font: {
//             size: 12,
//             weight: 'bold'
//           }
//         }
//       },
//       tooltip: {
//         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//         titleColor: '#1f2937',
//         bodyColor: '#1f2937',
//         borderColor: '#e5e7eb',
//         borderWidth: 1,
//         cornerRadius: 8,
//         displayColors: true,
//         callbacks: {
//           // **MODIFICATION START: This function now uses the combined data array for lookups.**
//           title: (context) => {
//             const pointIndex = context[0].dataIndex;
//             // Use the combined data array which is guaranteed to have the correct index.
//             const dataPoint = chartTimelineData.combinedData[pointIndex];
//             if (dataPoint) {
//               const date = new Date(dataPoint.timestamp);
//               return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
//             }
//             return '';
//           },
//           // **MODIFICATION END**
//           label: (context) => {
//             if (context.dataset.label === 'Water Level') {
//               const depth = context.parsed.y;
//               if (depth === null) return null;
//               let status = 'Normal';
//               if (depth >= ALARM_LEVEL) status = 'ALARM';
//               else if (depth >= ALERT_LEVEL) status = 'ALERT';
//               return `Water Level: ${depth.toFixed(3)}m (${status})`;
//             } else if (context.dataset.label === 'Rainfall') {
//               const rain = context.parsed.y;
//               if (rain === null) return null;
//               return `Rainfall: ${rain.toFixed(1)}mm`;
//             }
//             return '';
//           }
//         }
//       }
//     },
//     scales: {
//       x: {
//         display: true,
//         title: {
//           display: true,
//           text: 'Time',
//           color: '#374151',
//           font: {
//             size: 14,
//             weight: 'bold'
//           }
//         },
//         ticks: {
//           color: '#6b7280',
//           maxTicksLimit: 12,
//           maxRotation: 0,
//           minRotation: 0
//         },
//         grid: {
//           color: 'rgba(0, 0, 0, 0.05)',
//           drawBorder: false,
//         }
//       },
//       y: {
//         type: 'linear',
//         display: true,
//         position: 'left',
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Water Level (m)',
//           color: '#0b5ed7',
//           font: {
//             size: 14,
//             weight: 'bold'
//           }
//         },
//         ticks: {
//           color: '#0b5ed7',
//           callback: function(value) {
//             return value.toFixed(1) + 'm';
//           }
//         },
//         grid: {
//           color: 'rgba(0, 0, 0, 0.1)',
//         }
//       },
//       y1: {
//         type: 'linear',
//         display: true,
//         position: 'right',
//         beginAtZero: true,
//         max: 10, // Adjust as needed for typical rainfall values
//         title: {
//           display: true,
//           text: 'Rainfall (mm)',
//           color: '#15a3c9',
//           font: {
//             size: 14,
//             weight: 'bold'
//           }
//         },
//         ticks: {
//           color: '#15a3c9',
//           callback: function(value) {
//             return value + 'mm';
//           }
//         },
//         grid: {
//           drawOnChartArea: false, // Prevents grid lines from this axis cluttering the chart
//         }
//       }
//     },
//     elements: {
//       line: {
//         tension: 0.4 // Smoother curve
//       },
//       point: {
//         radius: 0, // Hide points by default
//         hoverRadius: 5
//       }
//     },
//     interaction: {
//       intersect: false,
//       mode: 'index'
//     }
//   };

//   // **MODIFICATION START: This function now returns the combined data array as well.**
//   // Create combined timeline for chart display
  
//   // **MODIFICATION END**

//   // Prepare chart data with gradient
//   const chartData: ChartData<'line'> = {
//     labels: chartTimelineData.labels,
//     datasets: [
//       // Water Level Line
//       {
//         type: 'line' as const,
//         label: 'Water Level',
//         data: chartTimelineData.waterData,
//         borderColor: '#0b5ed7',
//         borderWidth: 3,
//         pointRadius: 2,
//         pointBackgroundColor: '#0b5ed7',
//         fill: true,
//         spanGaps: true, // Connect lines even if some data points are null
//         backgroundColor: (context) => {
//             const chart = context.chart;
//             const {ctx, chartArea} = chart;
//             if (!chartArea) {
//                 return null;
//             }
//             const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
//             gradient.addColorStop(0, 'rgba(11, 94, 215, 0.5)');
//             gradient.addColorStop(0.5, 'rgba(11, 94, 215, 0.1)');
//             gradient.addColorStop(1, 'rgba(11, 94, 215, 0)');
//             return gradient;
//         },
//         yAxisID: 'y'
//       },
//       // Alert Level Line
//       {
//         type: 'line' as const,
//         label: 'Alert Level',
//         data: chartTimelineData.alertData,
//         borderColor: '#f59e0b',
//         borderWidth: 2,
//         borderDash: [5, 5],
//         pointRadius: 0,
//         fill: false,
//         yAxisID: 'y'
//       },
//       // Alarm Level Line
//       {
//         type: 'line' as const,
//         label: 'Alarm Level',
//         data: chartTimelineData.alarmData,
//         borderColor: '#dc2626',
//         borderWidth: 2,
//         borderDash: [5, 5],
//         pointRadius: 0,
//         fill: false,
//         yAxisID: 'y'
//       },
//       // Rainfall Bars
//       {
//         type: 'bar' as const,
//         label: 'Rainfall',
//         data: chartTimelineData.rainfallData,
//         backgroundColor: 'rgba(21, 163, 201, 0.6)',
//         borderColor: 'rgba(21, 163, 201, 1)',
//         borderWidth: 1,
//         borderRadius: 2,
//         yAxisID: 'y1',
//         barThickness: 'flex',
//         maxBarThickness: 8,
//       }
//     ]
//   };
  
//   // Handle refresh
//   const handleRefresh = async () => {
//     if (useCustomRange && customStartDate && customEndDate) {
//       const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
//       const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
//       await fetchDataByDateRange(startDateTime, endDateTime);
//     } else {
//       const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
//       if (selectedOption?.hours) {
//         await fetchDataByHours(selectedOption.hours);
//       } else if (selectedOption?.days) {
//         await fetchDataByDays(selectedOption.days);
//       }
//     }
//   };
  
//   const currentStatus = getCurrentStatus();
//   const statistics = getStatistics();
//   const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
//   return (
//     <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
//       {/* Header */}
//       <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
//               <Droplets className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Water Level & Rainfall Monitor</h1>
//               <p className="text-sm text-gray-600">Real-time monitoring system with rainfall data</p>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handleDownloadCSV}
//               disabled={loading || data.length === 0 || isDownloading}
//               className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
//             >
//               <Download className={`w-4 h-4 ${isDownloading ? 'animate-pulse' : ''}`} />
//               {isDownloading ? 'Downloading...' : 'Download CSV'}
//             </button>
            
//             <button
//               onClick={handleRefresh}
//               disabled={loading}
//               className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
//             >
//               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//               {loading ? 'Refreshing...' : 'Refresh'}
//             </button>
//           </div>
//         </div>
        
//         {/* Statistics Cards */}
//         {statistics && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-blue-600">Current Level</p>
//                   <p className="text-2xl font-bold text-blue-900">{statistics.current.toFixed(3)}m</p>
//                 </div>
//                 <Activity className="w-8 h-8 text-blue-600" />
//               </div>
//             </div>
            
//             <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-green-600">Average Level</p>
//                   <p className="text-2xl font-bold text-green-900">{statistics.average.toFixed(3)}m</p>
//                 </div>
//                 <TrendingUp className="w-8 h-8 text-green-600" />
//               </div>
//             </div>
            
            
//             <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 border border-teal-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-teal-600">Max Rainfall (Event)</p>
//                   <p className="text-2xl font-bold text-teal-900">{statistics.maxRainfall.toFixed(1)}mm</p>
//                 </div>
//                 <CloudRain className="w-8 h-8 text-teal-600" />
//               </div>
//             </div>
            
//             <div className={`${currentStatus.bgColor} rounded-lg p-4 border ${currentStatus.borderColor} shadow-sm`}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className={`text-sm font-medium ${currentStatus.textColor}`}>Current Status</p>
//                   <p className={`text-2xl font-bold ${currentStatus.textColor}`}>{currentStatus.status}</p>
//                 </div>
//                 <AlertTriangle className={`w-8 h-8 ${currentStatus.textColor}`} />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Chart Section */}
//       <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200 p-6">
//         {/* Controls */}
//         <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             {apiStatus === 'connected' && <Wifi className="w-5 h-5 text-green-600" />}
//             {apiStatus === 'error' && <WifiOff className="w-5 h-5 text-red-600" />}
//             {apiStatus === 'connecting' && <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />}
//             <span>
//               {apiStatus === 'connected' ? `Connected. Last updated: ${lastUpdated?.toLocaleTimeString()}` : apiStatus === 'error' ? 'Connection Error' : 'Connecting...'}
//             </span>
//           </div>
          
//           <div className="flex flex-col md:flex-row items-center gap-4">
//             {/* Time Range Dropdown */}
//             <div ref={dropdownRef} className="relative">
//               <button 
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//                 className="flex items-center justify-between w-48 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
//               >
//                 <span>{useCustomRange ? 'Custom Range' : selectedOption?.label || 'Select Range'}</span>
//                 <ChevronDown className="w-4 h-4" />
//               </button>
//               {dropdownOpen && (
//                 <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border">
//                   {timeRangeOptions.map(option => (
//                     <button
//                       key={option.value}
//                       onClick={() => {
//                         if (option.value === 'custom') {
//                           setUseCustomRange(true);
//                         } else {
//                           setUseCustomRange(false);
//                           setTimeRange(option.value);
//                         }
//                         setDropdownOpen(false);
//                       }}
//                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       {option.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
            
//             {/* Custom Date Inputs */}
//             {useCustomRange && (
//               <div className="flex flex-col sm:flex-row gap-2 items-center p-2 bg-gray-50 rounded-lg border">
//                 <input
//                   type="date"
//                   value={customStartDate}
//                   onChange={(e) => setCustomStartDate(e.target.value)}
//                   className="px-2 py-1 border rounded-md text-sm"
//                 />
//                 <input
//                   type="time"
//                   value={customStartTime}
//                   onChange={(e) => setCustomStartTime(e.target.value)}
//                   className="px-2 py-1 border rounded-md text-sm"
//                 />
//                 <span className="text-gray-500">-</span>
//                 <input
//                   type="date"
//                   value={customEndDate}
//                   onChange={(e) => setCustomEndDate(e.target.value)}
//                   className="px-2 py-1 border rounded-md text-sm"
//                 />
//                 <input
//                   type="time"
//                   value={customEndTime}
//                   onChange={(e) => setCustomEndTime(e.target.value)}
//                   className="px-2 py-1 border rounded-md text-sm"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
        
//         {/* Chart Area */}
//         <div className="relative h-[500px] w-full bg-gray-50/50 p-4 rounded-lg border border-gray-200">
//           {loading ? (
//             <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
//               <div className="text-center">
//                 <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
//                 <p className="mt-2 text-lg font-semibold text-gray-700">Loading Data...</p>
//               </div>
//             </div>
//           ) : error ? (
//             <div className="absolute inset-0 flex items-center justify-center bg-red-50/50">
//               <div className="text-center">
//                 <AlertTriangle className="w-10 h-10 mx-auto text-red-600" />
//                 <p className="mt-2 text-lg font-semibold text-red-700">Error</p>
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             </div>
//           ) : data.length === 0 ? (
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="text-center">
//                 <Activity className="w-10 h-10 mx-auto text-gray-400" />
//                 <p className="mt-2 text-lg font-semibold text-gray-500">No data available for the selected range.</p>
//               </div>
//             </div>
//           ) : (
//             <Line ref={chartRef} options={chartOptions} data={chartData} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WaterLevelMonitor;




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

const WaterLevelMonitor = ({setCurrentDepth}) => {
  // **MODIFICATION**: Kalman filter parameters are now tunable constants.
  // R: Process Noise. Lower value = more smoothing, assumes level changes slowly.
  const KALMAN_PROCESS_NOISE = 0.008;
  // Q: Measurement Noise. Higher value = more smoothing, assumes sensor is noisy.
  const KALMAN_MEASUREMENT_NOISE = 0.5;
  // Threshold to detect a gap in data and reset the filter.
  const GAP_DETECTION_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

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
  
  const ALERT_LEVEL = 1.3;
  const ALARM_LEVEL = 1.7;
  
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
  
  // **MODIFICATION**: This function now detects gaps and resets the filter.
  const processAndSetData = (apiData, startDate, endDate) => {
    const transformedData = apiData.map(item => ({
        timestamp: item.timestamp,
        meanDepth: 10.18-item.mean_depth,
        parsedDate: parseTimestamp(item.timestamp)
    }));
    
    const sortedData = transformedData.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
    // Apply Kalman Filter with gap detection
    let kf = new KalmanFilter({ R: KALMAN_PROCESS_NOISE, Q: KALMAN_MEASUREMENT_NOISE });
    const robustlyFilteredData = [];
    let lastTimestamp = null;

    sortedData.forEach(item => {
        const currentTimestamp = item.parsedDate.getTime();

        // If there's a significant gap in data, reset the filter to start fresh
        if (lastTimestamp && (currentTimestamp - lastTimestamp > GAP_DETECTION_THRESHOLD_MS)) {
            kf = new KalmanFilter({ R: KALMAN_PROCESS_NOISE, Q: KALMAN_MEASUREMENT_NOISE });
        }

        const smoothedDepth = kf.filter(item.meanDepth);
        
        robustlyFilteredData.push({ ...item, meanDepth: smoothedDepth });
        lastTimestamp = currentTimestamp;
    });
    
    updateFilteredRainfallData(startDate, endDate);
    setData(robustlyFilteredData); // Use the robustly filtered data
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
      processAndSetData(apiData, startTime, now);
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
      processAndSetData(apiData, startTime, now);
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
      processAndSetData(apiData, startDateTime, endDateTime);
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
    const allDataPoints = [];
    data.forEach(item => allDataPoints.push({ timestamp: item.parsedDate.getTime(), parsedDate: item.parsedDate, waterLevel: item.meanDepth, rainfall: null }));
    filteredRainfallData.forEach(item => allDataPoints.push({ timestamp: item.parsedDate.getTime(), parsedDate: item.parsedDate, waterLevel: null, rainfall: item.rainfall }));
    allDataPoints.sort((a, b) => a.timestamp - b.timestamp);
    
    const chartLabels = [], chartWaterData = [], chartRainfallData = [], chartAlertData = [], chartAlarmData = [];
    allDataPoints.forEach(point => {
      chartLabels.push(point.parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      chartWaterData.push(point.waterLevel);
      chartRainfallData.push(point.rainfall);
      chartAlertData.push(ALERT_LEVEL);
      chartAlarmData.push(ALARM_LEVEL);
    });
    
    return { labels: chartLabels, waterData: chartWaterData, rainfallData: chartRainfallData, alertData: chartAlertData, alarmData: chartAlarmData, combinedData: allDataPoints };
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
            if (ctx.dataset.label === 'Rainfall') {
              const rain = ctx.parsed.y;
              return rain === null ? null : `Rainfall: ${rain.toFixed(1)}mm`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Time', color: '#374151', font: { size: 14, weight: 'bold' }}, ticks: { color: '#6b7280', maxTicksLimit: 12, maxRotation: 0, minRotation: 0 }, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }},
      y: { type: 'linear', display: true, position: 'left', beginAtZero: true, title: { display: true, text: 'Water Level (m)', color: '#0b5ed7', font: { size: 14, weight: 'bold' }}, ticks: { color: '#0b5ed7', callback: (v) => v.toFixed(1) + 'm' }, grid: { color: 'rgba(0,0,0,0.1)' }},
      y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, max: 10, title: { display: true, text: 'Rainfall (mm)', color: '#15a3c9', font: { size: 14, weight: 'bold' }}, ticks: { color: '#15a3c9', callback: (v) => v + 'mm' }, grid: { drawOnChartArea: false }}
    },
    elements: { line: { tension: 0.4 }, point: { radius: 0, hoverRadius: 5 }},
    interaction: { intersect: false, mode: 'index' }
  };

  const chartData: ChartData<'line'> = {
    labels: chartTimelineData.labels,
    datasets: [
      { type: 'line', label: 'Water Level', data: chartTimelineData.waterData, borderColor: '#0b5ed7', borderWidth: 3, pointRadius: 2, pointBackgroundColor: '#0b5ed7', fill: true, spanGaps: true,
        backgroundColor: (ctx) => {
          const { chart } = ctx; const { ctx: context, chartArea } = chart; if (!chartArea) return null;
          const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(11, 94, 215, 0.5)'); gradient.addColorStop(0.5, 'rgba(11, 94, 215, 0.1)'); gradient.addColorStop(1, 'rgba(11, 94, 215, 0)');
          return gradient;
        }, yAxisID: 'y' },
      { type: 'line', label: 'Alert Level', data: chartTimelineData.alertData, borderColor: '#f59e0b', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, fill: false, yAxisID: 'y' },
      { type: 'line', label: 'Alarm Level', data: chartTimelineData.alarmData, borderColor: '#dc2626', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, fill: false, yAxisID: 'y' },
      { type: 'bar', label: 'Rainfall', data: chartTimelineData.rainfallData, backgroundColor: 'rgba(21, 163, 201, 0.6)', borderColor: 'rgba(21, 163, 201, 1)', borderWidth: 1, borderRadius: 2, yAxisID: 'y1', barThickness: 'flex', maxBarThickness: 8 }
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

  // The rest of the JSX remains the same...
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
    </div>
  );
};

export default WaterLevelMonitor;
