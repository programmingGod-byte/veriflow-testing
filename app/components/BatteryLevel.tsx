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

// Mock context
const MyContext = React.createContext({
    value: { machineCode: 'default-machine' },
    setValue: () => {},
    isUserAdmin: false,
});

const BatteryChart = ({setBatteryLevel}) => {
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { value } = useContext(MyContext);
  const [timeRange, setTimeRange] = useState('1h');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomRangePicker, setShowCustomRangePicker] = useState(false);
  const [currentBatteryLevel, setCurrentBatteryLevel] = useState(null);

  // Fetch and parse data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const generateMockCsv = () => {
            let csv = '';
            const now = new Date();
            for (let i = 0; i < 72 * 60; i++) {
                const timestamp = new Date(now.getTime() - i * 60 * 1000);
                let level = 80 + Math.sin(i / 180) * 15 + (Math.random() - 0.5) * 5;
                level = Math.max(10.8, level);
                csv += `${timestamp.toISOString()},${level.toFixed(4)}\n`;
            }
            return csv;
        };
        
        const csvText = generateMockCsv();
        const parsedData = csvText
          .trim()
          .split('\n')
          .map(row => {
            const [timestamp, level] = row.split(',');
            return {
              time: new Date(timestamp),
              level: parseFloat(level),
            };
          }).reverse();
        
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

  // Update current battery level
  useEffect(() => {
    if (filteredData.length > 0) {
        const latestLevel = filteredData[filteredData.length - 1].level;
        setCurrentBatteryLevel(latestLevel.toFixed(2));
        setBatteryLevel(latestLevel.toFixed(2));
    } else {
      setBatteryLevel(null);
        setCurrentBatteryLevel(null);
    }
  }, [filteredData]);

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

  // Get battery status color
  const getBatteryStatus = (level) => {
    if (level >= 75) return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (level >= 50) return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (level >= 25) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const status = currentBatteryLevel ? getBatteryStatus(parseFloat(currentBatteryLevel)) : null;

  // Professional chart data
  const chartData = {
    labels: filteredData.map(d => formatLabel(d.time)),
    datasets: [
      {
        label: 'Battery Level (%)',
        data: filteredData.map(d => d.level),
        borderColor: '#20b462ff',
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
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
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  // Professional chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(156, 163, 175, 0.3)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        titleFont: {
          size: 13,
          weight: '600'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const dataPoint = filteredData[index];
            if (!dataPoint) return '';
            return `Level: ${dataPoint.level.toFixed(2)}%`;
          },
          title: function(context) {
            const index = context[0].dataIndex;
            const dataPoint = filteredData[index];
            if (!dataPoint) return '';
            return dataPoint.time.toLocaleString();
          }
        }
      }
    },
    scales: {
        y: {
            min: 10.8,
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              drawBorder: false,
            },
            ticks: {
              color: 'rgb(75, 85, 99)',
              font: {
                size: 12,
                family: 'Inter, system-ui, sans-serif'
              },
              callback: function(value) {
                return value + '%';
              }
            },
            title: {
                display: true,
                text: 'Battery Level (%)',
                color: 'rgb(55, 65, 81)',
                font: {
                  size: 13,
                  weight: '600'
                }
            }
        },
        x: {
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              drawBorder: false,
            },
            ticks: {
                color: 'rgb(75, 85, 99)',
                font: {
                  size: 12,
                  family: 'Inter, system-ui, sans-serif'
                },
                maxRotation: (timeRange === '1h' || timeRange === '2h') ? 0 : 45,
                minRotation: (timeRange === '1h' || timeRange === '2h') ? 0 : 45,
                autoSkip: true,
                maxTicksLimit: 12,
            },
            title: {
                display: true,
                text: 'Time',
                color: 'rgb(55, 65, 81)',
                font: {
                  size: 13,
                  weight: '600'
                }
            }
        }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading battery monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full max-w-7xl mx-auto px-4 py-6">
        {/* Professional Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Battery Monitoring Dashboard</h1>
              {/* <p className="text-gray-600">Real-time battery level monitoring for device: <span className="font-semibold text-gray-900">{value.machineCode}</span></p> */}
            </div>
            
            {/* Current Battery Status */}
            {status && (
              <div className={`${status.bg} ${status.border} border rounded-lg p-6 min-w-72`}>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">Current Battery Level</p>
                  <p className={`text-3xl font-bold ${status.color}`}>
                    {currentBatteryLevel}%
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          parseFloat(currentBatteryLevel) >= 75 ? 'bg-emerald-500' :
                          parseFloat(currentBatteryLevel) >= 50 ? 'bg-amber-500' :
                          parseFloat(currentBatteryLevel) >= 25 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${currentBatteryLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select 
              value={timeRange} 
              onChange={handleTimeRangeChange}
              className="border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="1h">Past 1 Hour</option>
              <option value="2h">Past 2 Hours</option>
              <option value="1d">Past 1 Day</option>
              <option value="2d">Past 2 Days</option>
              <option value="custom">Custom Range</option>
            </select>

            {showCustomRangePicker && (
              <div className="flex flex-wrap items-center gap-3 ml-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input 
                  type="datetime-local" 
                  value={customStartDate} 
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input 
                  type="datetime-local" 
                  value={customEndDate} 
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Chart Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Battery Level Timeline</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📊 {filteredData.length > 0 ? `${filteredData.length} data points` : 'No data available'}</span>
              {filteredData.length > 0 && (
                <span>🕒 Last updated: {new Date(filteredData[filteredData.length - 1].time).toLocaleString()}</span>
              )}
            </div>
          </div>
          
          <div className="relative" style={{ height: 'calc(100vh - 400px)', minHeight: '450px' }}>
            {filteredData.length > 0 ? (
              <Line options={chartOptions} data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="text-6xl text-gray-300 mb-4">📈</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-600 mb-4">No battery data found for the selected time range.</p>
                  <p className="text-sm text-gray-500">Try selecting a different time range or check your data connection.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Battery monitoring system • Last refresh: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App component


export default BatteryChart;