'use client';
import { MyContext } from '../providers';

import { useState, useEffect, useRef,useContext } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const TemperatureChart = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('1day');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const { value, setValue,iseUserAdmin } = useContext(MyContext);

  // Temperature status function
  const getTemperatureStatus = (temp) => {
    if (temp < 0) return { status: 'Very Cold', color: 'text-blue-800', bgColor: 'bg-blue-100' };
    if (temp < 10) return { status: 'Cold', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (temp < 20) return { status: 'Cool', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (temp < 25) return { status: 'Comfortable', color: 'text-green-700', bgColor: 'bg-green-100' };
    if (temp < 30) return { status: 'Warm', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (temp < 35) return { status: 'Hot', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { status: 'Very Hot', color: 'text-red-700', bgColor: 'bg-red-100' };
  };

  // CSV Download function
  const downloadCSV = () => {
    if (filteredData.length === 0) {
      alert('No data available to download');
      return;
    }

    // Create CSV content
    const csvHeader = 'Timestamp,Temperature (°C)\n';
    const csvRows = filteredData.map(item => {
      const timestamp = item.timestamp.toISOString();
      return `${timestamp},${item.temperature}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Generate filename with date range
    const startDate = filteredData[0].timestamp.toISOString().split('T')[0];
    const endDate = filteredData[filteredData.length - 1].timestamp.toISOString().split('T')[0];
    const filename = `temperature_data_${startDate}_to_${endDate}.csv`;
    
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

  // Fetch temperature data
  const fetchTemperatureData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/temperature?ip=${value.machineCode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const textData = await response.text();
      
      // Parse CSV data
      const lines = textData.trim().split('\n');
      const parsedData = lines.slice(1).map(line => {
        const [timestamp, temperature] = line.split(',');
        return {
          timestamp: new Date(timestamp),
          temperature: parseFloat(temperature)
        };
      });
      
      setData(parsedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching temperature data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected time range
  const filterData = () => {
    if (data.length === 0) return;

    const now = new Date();
    let startDate;

    if (timeFilter === 'custom') {
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        
        const filtered = data.filter(item => 
          item.timestamp >= startDate && item.timestamp <= endDate
        );
        setFilteredData(filtered);
      }
      return;
    }

    switch (timeFilter) {
      case '1day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '2day':
        startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        break;
      case '1week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const filtered = data.filter(item => item.timestamp >= startDate);
    setFilteredData(filtered);
  };

  // Handle time filter change
  const handleTimeFilterChange = (e) => {
    const value = e.target.value;
    setTimeFilter(value);
    setShowCustomInputs(value === 'custom');
  };

  // Apply custom date filter
  const applyCustomFilter = () => {
    if (customStartDate && customEndDate) {
      filterData();
    }
  };

  // Initial data fetch - FIXED: Only fetch when value.machineCode is available
  useEffect(() => {
    if (value && value.machineCode) {
      fetchTemperatureData();
    }
  }, [value?.machineCode]);

  // Filter data when data or timeFilter changes
  useEffect(() => {
    filterData();
  }, [data, timeFilter]);

  // Get current temperature status
  const currentTemp = filteredData.length > 0 ? filteredData[filteredData.length - 1].temperature : null;
  const tempStatus = currentTemp !== null ? getTemperatureStatus(currentTemp) : null;

  // Chart configuration
  const chartData = {
    labels: filteredData.map(item => item.timestamp),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: filteredData.map(item => ({
          x: item.timestamp,
          y: item.temperature
        })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Temperature Over Time',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Temperature: ${context.parsed.y.toFixed(2)}°C`;
          },
          title: function(context) {
            // FIXED: Proper date handling in tooltip
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString();
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            hour: 'MMM dd HH:mm',
            day: 'MMM dd',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading temperature data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={fetchTemperatureData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        
        {/* Temperature Badges - NEW FEATURE */}
        <div className="mb-6 flex items-start justify-between">
          {/* Current Status and Temperature */}
          {tempStatus && (
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${tempStatus.bgColor} ${tempStatus.color}`}>
                <span>
                  {tempStatus.status === 'Very Hot' && '🔥'}
                  {tempStatus.status === 'Hot' && '🌡️'}
                  {tempStatus.status === 'Warm' && '☀️'}
                  {tempStatus.status === 'Comfortable' && '😊'}
                  {tempStatus.status === 'Cool' && '🌤️'}
                  {tempStatus.status === 'Cold' && '❄️'}
                  {tempStatus.status === 'Very Cold' && '🧊'}
                </span>
                {tempStatus.status}
              </div>
              
              {/* Current Temperature Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                🌡️ {currentTemp.toFixed(1)}°C
              </div>
            </div>
          )}
          
          {/* All Temperature Range Badges */}
          <div className="flex flex-wrap gap-2">
            {/* <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🧊 Very Cold (&lt;0°C)
            </div> */}
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
              ❄️ Cold (0-10°C)
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
              🌤️ Cool (10-20°C)
            </div>
            {/* <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              😊 Comfortable (20-25°C)
            </div> */}
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
              ☀️ Warm (25-30°C)
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600">
              🌡️ Hot (30-35°C)
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              🔥 Very Hot (&gt;35°C)
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="timeFilter" className="font-medium text-gray-700">
                Time Range:
              </label>
              <select
                id="timeFilter"
                value={timeFilter}
                onChange={handleTimeFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1day">Past 1 Day</option>
                <option value="2day">Past 2 Days</option>
                <option value="1week">Past 1 Week</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <button
              onClick={fetchTemperatureData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh Data
            </button>

            {/* NEW: CSV Download Button */}
            <button
  onClick={downloadCSV}
  disabled={filteredData.length === 0}
  className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
    ${
      filteredData.length === 0
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg'
    }`}
  title={filteredData.length === 0 ? "No data available to download" : "Download filtered data as CSV"}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm8 6v6m0 0l-3-3m3 3l3-3" />
  </svg>
  Download CSV
</button>

          </div>

          {/* Custom date inputs */}
          {showCustomInputs && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="font-medium text-gray-700">
                  Start Date:
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="font-medium text-gray-700">
                  End Date:
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={applyCustomFilter}
                disabled={!customStartDate || !customEndDate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Apply Filter
              </button>
            </div>
          )}
        </div>

        {/* Data Info */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredData.length} data points
          {filteredData.length > 0 && (
            <>
              {' '}from {filteredData[0].timestamp.toLocaleString()} to{' '}
              {filteredData[filteredData.length - 1].timestamp.toLocaleString()}
            </>
          )}
        </div>

        {/* Chart */}
        <div className="h-96">
          {filteredData.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available for the selected time range
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemperatureChart;