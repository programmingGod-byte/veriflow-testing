'use client';
import { MyContext } from '../providers'; // Assuming this path is correct for your project

import { useState, useEffect, useContext } from 'react';
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
  // Assuming MyContext provides these values. Using a fallback for standalone functionality.
  const { value, setValue, iseUserAdmin } = useContext(MyContext) || { value: { machineCode: 'default-ip' } };

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
      // Using a more user-friendly notification than alert()
      console.warn('No data available to download');
      return;
    }

    const csvHeader = 'Timestamp,Temperature (°C)\n';
    const csvRows = filteredData.map(item => {
      const timestamp = item.timestamp.toISOString();
      return `${timestamp},${item.temperature}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
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
      // Using a mock fetch for demonstration as the API route is not available.
      // In a real scenario, this would be:
      // const response = await fetch(`/api/temperature?ip=${value.machineCode}`);
      // if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      // const textData = await response.text();

      // Mock data generation for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      let mockData = "Timestamp,Temperature\n";
      let currentTime = new Date();
      for (let i = 100; i > 0; i--) {
          // Create a gap larger than 20 minutes around i=50
          if (i > 48 && i < 52) {
              currentTime.setMinutes(currentTime.getMinutes() - 15);
          } else {
              currentTime.setMinutes(currentTime.getMinutes() - 5);
          }
          const temp = 20 + Math.sin(i / 10) * 10 + Math.random() * 2;
          mockData += `${currentTime.toISOString()},${temp.toFixed(2)}\n`;
      }
      const textData = mockData;

      const lines = textData.trim().split('\n');
      const parsedData = lines.slice(1).map(line => {
        const [timestamp, temperature] = line.split(',');
        return {
          timestamp: new Date(timestamp),
          temperature: parseFloat(temperature)
        };
      }).sort((a, b) => a.timestamp - b.timestamp); // Ensure data is sorted by time
      
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
        endDate.setHours(23, 59, 59, 999);
        
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

  const handleTimeFilterChange = (e) => {
    const value = e.target.value;
    setTimeFilter(value);
    setShowCustomInputs(value === 'custom');
  };

  const applyCustomFilter = () => {
    if (customStartDate && customEndDate) {
      filterData();
    }
  };

  useEffect(() => {
    if (value && value.machineCode) {
      fetchTemperatureData();
    }
  }, [value?.machineCode]);

  useEffect(() => {
    filterData();
  }, [data, timeFilter]);

  const currentTemp = filteredData.length > 0 ? filteredData[filteredData.length - 1].temperature : null;
  const tempStatus = currentTemp !== null ? getTemperatureStatus(currentTemp) : null;

  // #region --- MODIFICATION FOR DISCONTINUOUS LINE ---

  // Process data to insert nulls for time gaps > 20 minutes.
  // This creates breaks in the line chart.
  const chartPoints = filteredData.reduce((points, currentItem, index, arr) => {
    const twentyMinutesInMillis = 20 * 60 * 1000;
    
    // If it's not the first point, check the time difference from the previous one
    if (index > 0) {
      const previousItem = arr[index - 1];
      const timeDiff = currentItem.timestamp.getTime() - previousItem.timestamp.getTime();

      // If the gap is larger than 20 minutes, insert a null to create a break
      if (timeDiff > twentyMinutesInMillis) {
        points.push(null);
      }
    }
    
    // Add the actual data point in the {x, y} object format required by Chart.js
    points.push({
      x: currentItem.timestamp,
      y: currentItem.temperature,
    });

    return points;
  }, []);

  const chartData = {
    // Labels are not strictly needed when providing x/y data objects.
    // The x-values from the `chartPoints` array will be used for the x-axis.
    datasets: [
      {
        label: 'Temperature (°C)',
        // Use the newly processed data with potential nulls
        data: chartPoints,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5,
        // This property tells Chart.js NOT to draw a line over the null gaps.
        spanGaps: false,
      },
    ],
  };

  // #endregion --- END OF MODIFICATION ---

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
          size: 18,
          weight: 'bold',
        },
        padding: {
            top: 10,
            bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            if (context.parsed.y === null) return null;
            return `Temperature: ${context.parsed.y.toFixed(2)}°C`;
          },
          title: function(context) {
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
          unit: 'hour',
          tooltipFormat: 'MMM dd, yyyy HH:mm',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM dd',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
        grid: {
            display: false
        }
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
        <div className="text-lg font-medium text-gray-600">Loading temperature data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={fetchTemperatureData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        
        {/* Header with status and legend */}
        <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
          {tempStatus && (
            <div className="flex items-center gap-3">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                🌡️ {currentTemp.toFixed(1)}°C
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">❄️ Cold (0-10°C)</div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">🌤️ Cool (10-20°C)</div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">☀️ Warm (25-30°C)</div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600">🌡️ Hot (30-35°C)</div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">🔥 Very Hot (&gt;35°C)</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="timeFilter" className="font-medium text-gray-700 text-sm">Time Range:</label>
              <select id="timeFilter" value={timeFilter} onChange={handleTimeFilterChange} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="1day">Past 24 Hours</option>
                <option value="2day">Past 2 Days</option>
                <option value="1week">Past Week</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <button onClick={fetchTemperatureData} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium">Refresh Data</button>
            <button onClick={downloadCSV} disabled={filteredData.length === 0} className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed" title={filteredData.length === 0 ? "No data to download" : "Download data as CSV"}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              Download CSV
            </button>
          </div>

          {showCustomInputs && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="font-medium text-gray-700 text-sm">Start Date:</label>
                <input type="date" id="startDate" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"/>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="font-medium text-gray-700 text-sm">End Date:</label>
                <input type="date" id="endDate" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"/>
              </div>
              <button onClick={applyCustomFilter} disabled={!customStartDate || !customEndDate} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium">Apply Filter</button>
            </div>
          )}
        </div>

        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredData.length} data points
          {filteredData.length > 0 && (
            <>
              {' from '}<strong>{filteredData[0].timestamp.toLocaleString()}</strong>{' to '}<strong>{filteredData[filteredData.length - 1].timestamp.toLocaleString()}</strong>
            </>
          )}
        </div>

        <div className="relative h-96">
          {filteredData.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50 rounded-md">
              No data available for the selected time range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemperatureChart;
