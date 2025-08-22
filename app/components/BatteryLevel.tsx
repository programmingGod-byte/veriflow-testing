import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Line } from 'react-chartjs-2';
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
} from 'chart.js';
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

const BatteryChart = ({ setBatteryLevel }) => {
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { value } = useContext(MyContext);
  const [timeRange, setTimeRange] = useState('1d'); // Default to 1 day
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomRangePicker, setShowCustomRangePicker] = useState(false);
  const [currentBatteryLevel, setCurrentBatteryLevel] = useState(null); // Will store voltage
  const [currentBatteryPercentage, setCurrentBatteryPercentage] = useState(null); // For UI status

  // Fetch and parse data from the API
  


  // Fetch and parse data from the API
  


  // Fetch and parse data from the API
  useEffect(() => {
    if (!value.machineCode) {
      setIsLoading(false);
      setRawData([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch data from the API endpoint using machineCode
        const response = await fetch(`/api/battery?ip=${value.machineCode}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();

        if (!csvText || csvText.trim() === '') {
            setRawData([]); // Handle empty response from API
            return;
        }

        const parsedData = csvText
          .trim()
          .split('\n')
          .map(row => {
            const [timestamp, level] = row.split(',');
            if (!timestamp || isNaN(parseFloat(level))) {
              return null; // Skip malformed rows
            }
            // --- FIX IS HERE ---
            // Append 'Z' to the timestamp string to ensure it's parsed as UTC.
            // This makes all timezone-related calculations accurate.
            return {
              time: new Date(timestamp.replace(' ', 'T') + 'Z'), 
              level: Math.min(parseFloat(level), 13.4),
            };
            // --- END OF FIX ---
          })
          .filter(Boolean) // Remove any null entries
          .sort((a, b) => a.time - b.time); // Ensure data is chronological
        
        setRawData(parsedData);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [value.machineCode]);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    
    if (timeRange === 'custom') {
      if (!customStartDate || !customEndDate) {
        return [];
      }
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return rawData.filter(d => d.time >= start && d.time <= end);
    }

    return rawData.filter(d => {
      const diffMillis = now.getTime() - d.time.getTime();
      const diffHours = diffMillis / (1000 * 60 * 60);

      if (timeRange === '1h') return diffHours <= 1;
      if (timeRange === '2h') return diffHours <= 2;
      if (timeRange === '1d') return diffHours <= 24;
      if (timeRange === '2d') return diffHours <= 48;
      return true;
    });
  }, [rawData, timeRange, customStartDate, customEndDate]);

  // --- Voltage to Percentage Conversion ---
  const convertVoltageToPercentage = (voltage) => {
    if (voltage === null) return null;
    // Using a typical state of charge range for a 12V battery system
    const MIN_VOLTAGE = 11.8; // Considered 0%
    const MAX_VOLTAGE = 12.7; // Considered 100%
    const percentage = ((voltage - MIN_VOLTAGE) / (MAX_VOLTAGE - MIN_VOLTAGE)) * 100;
    // Clamp the result between 0 and 100
    return Math.max(0, Math.min(100, percentage));
  };

  // Update current battery level and percentage
  useEffect(() => {
    if (filteredData.length > 0) {
        const latestLevel = filteredData[filteredData.length - 1].level;
        const percentage = convertVoltageToPercentage(latestLevel);
        
        setCurrentBatteryLevel(latestLevel.toFixed(3));
        setCurrentBatteryPercentage(percentage.toFixed(0));
        setBatteryLevel(percentage.toFixed(2));
    } else {
      setBatteryLevel(null);
      setCurrentBatteryLevel(null);
      setCurrentBatteryPercentage(null);
    }
  }, [filteredData, setBatteryLevel]);

  const handleTimeRangeChange = (e) => {
    const selectedRange = e.target.value;
    setTimeRange(selectedRange);
    setShowCustomRangePicker(selectedRange === 'custom');
  };
  
  const formatLabel = (date) => {
    const optionsTimeOnly = { hour: '2-digit', minute: '2-digit', hour12: false };
    const optionsDateAndTime = { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const optionsDateOnly = { year: '2-digit', month: 'numeric', day: 'numeric' };

    if (timeRange === '1h' || timeRange === '2h') {
        return date.toLocaleString([], optionsTimeOnly);
    }
    
    if (timeRange === '1d' || timeRange === '2d') {
        return date.toLocaleString([], optionsDateAndTime);
    }

    if (timeRange === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        if (diffHours <= 48) {
             return date.toLocaleString([], optionsDateAndTime);
        } else {
             return date.toLocaleString([], optionsDateOnly);
        }
    }
    
    return date.toLocaleString([], optionsDateAndTime);
  };

  // Get battery status color based on calculated percentage
  const getBatteryStatus = (percentage) => {
    if (percentage === null) return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    if (percentage >= 75) return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (percentage >= 50) return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (percentage >= 25) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const status = getBatteryStatus(currentBatteryPercentage);

  // Chart data configuration for voltage
  const chartData = {
    labels: filteredData.map(d => formatLabel(d.time)),
    datasets: [
      {
        label: 'Battery Voltage (V)',
        data: filteredData.map(d => d.level),
        borderColor: '#20b462ff',
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
          return gradient;
        },
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  // Chart options configuration for voltage
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'white', bodyColor: 'white',
        callbacks: {
          label: (context) => `Voltage: ${context.parsed.y.toFixed(3)} V`,
          title: (context) => {
            const index = context[0].dataIndex;
            return filteredData[index]?.time.toLocaleString() || '';
          }
        }
      }
    },
    scales: {
        y: {
            min: 10.8,
            max: 14.0, // Set max for a consistent scale
            grid: { color: 'rgba(156, 163, 175, 0.2)', drawBorder: false },
            ticks: {
              color: 'rgb(75, 85, 99)',
              callback: (value) => `${value.toFixed(1)} V`, // Append 'V' to ticks
            },
            title: {
                display: true,
                text: 'Battery Voltage (V)',
                color: 'rgb(55, 65, 81)',
                font: { size: 13, weight: '600' }
            }
        },
        x: {
            grid: { color: 'rgba(156, 163, 175, 0.2)', drawBorder: false },
            ticks: {
                color: 'rgb(75, 85, 99)',
                maxRotation: (timeRange === '1h' || timeRange === '2h') ? 0 : 45,
                minRotation: (timeRange === '1h' || timeRange === '2h') ? 0 : 45,
                autoSkip: true,
                maxTicksLimit: 12,
            },
            title: {
                display: true,
                text: 'Time',
                color: 'rgb(55, 65, 81)',
                font: { size: 13, weight: '600' }
            }
        }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading battery data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 h-full">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Battery Monitoring Dashboard</h1>
            
            {currentBatteryLevel !== null && (
              <div className={`${status.bg} ${status.border} border rounded-lg p-6 min-w-72`}>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Current Battery Level</p>
                  <p className={`text-3xl font-bold ${status.color}`}>
                    {currentBatteryLevel} V 
                    <span className="text-lg ml-2 font-medium text-gray-500">({currentBatteryPercentage}%)</span>
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-300 ${status.bg.replace('-50', '-500')}`}
                        style={{ width: `${currentBatteryPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart and Controls */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select 
                value={timeRange} 
                onChange={handleTimeRangeChange}
                className="border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">Past 1 Hour</option>
                <option value="2h">Past 2 Hours</option>
                <option value="1d">Past 1 Day</option>
                <option value="2d">Past 2 Days</option>
                <option value="custom">Custom Range</option>
              </select>

              {showCustomRangePicker && (
                <div className="flex flex-wrap items-center gap-3 ml-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <label>From:</label>
                  <input type="datetime-local" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="border-gray-300 rounded-md"/>
                  <label>To:</label>
                  <input type="datetime-local" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="border-gray-300 rounded-md"/>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="relative" style={{ height: '450px' }}>
              {filteredData.length > 0 ? (
                <Line options={chartOptions} data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <div className="text-6xl text-gray-300 mb-4">📈</div>
                    <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
                    <p className="text-gray-600">No battery data found for the selected device or time range.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryChart;