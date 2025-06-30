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
  const { value, setValue } = useContext(MyContext);

  // Fetch temperature data
  const fetchTemperatureData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/temperature?ip=${value.ip}`);
      
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

  // Initial data fetch
  useEffect(() => {
    fetchTemperatureData();
  }, []);

  // Filter data when data or timeFilter changes
  useEffect(() => {
    filterData();
  }, [data, timeFilter]);

  // Chart configuration
  const chartData = {
    labels: filteredData.map(item => item.timestamp),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: filteredData.map(item => item.temperature),
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
            return new Date(context[0].label).toLocaleString();
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