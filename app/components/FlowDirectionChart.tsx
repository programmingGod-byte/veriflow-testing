import React, { useState, useMemo, useEffect, useRef,useContext } from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import * as Chart from 'chart.js';
import StatCard from '../components/StatCard';
import { MyContext } from '../providers';

// Register Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineElement,
  Chart.LineController,  // Add this line
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler
);

const FlowAngleDashboard = () => {
  // Sample data from the CSV
  
  const [timeRange, setTimeRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [rawData,setrawData] = useState([
    { timestamp: '2025-06-26 12:35:00', flowAngle: 62.0561292764499 },
    { timestamp: '2025-06-26 12:51:53', flowAngle: 60.7910865852823 },
    
  ])
   const { value, setValue ,user,setUser,setAllMachines} = useContext(MyContext);
    
  const chartRef = useRef(null);
  const chartInstance = useRef(null);


useEffect(()=>{
   async function fetchValue(){
     if(value.ip!=""){
        try {
             const response = await fetch(`http://${value.ip}:5000/api/flow-angles`);
            const data = await response.json();
            setrawData(data)
        } catch (error) {
            
        }
    }
   }
},[value])
  // Process and filter data based on selected time range
  const filteredData = useMemo(() => {
    const data = rawData.map(item => ({
      ...item,
      date: new Date(item.timestamp),
      formattedTime: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      formattedDate: new Date(item.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    switch (timeRange) {
      case '1day':
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return data.filter(item => item.date >= oneDayAgo);
      case '2days':
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        return data.filter(item => item.date >= twoDaysAgo);
      case '3days':
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        return data.filter(item => item.date >= threeDaysAgo);
      case '1week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return data.filter(item => item.date >= oneWeekAgo);
      case '2weeks':
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        return data.filter(item => item.date >= twoWeeksAgo);
      case '1month':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return data.filter(item => item.date >= oneMonthAgo);
      case 'today':
        return data.filter(item => item.date >= today);
      case 'yesterday':
        const yesterdayEnd = new Date(today.getTime() - 1);
        return data.filter(item => item.date >= yesterday && item.date < today);
      case 'custom':
        if (customStartDate && customEndDate) {
          const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
          const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);
          return data.filter(item => item.date >= startDateTime && item.date <= endDateTime);
        }
        return data;
      default:
        return data;
    }
  }, [timeRange, customStartDate, customEndDate, customStartTime, customEndTime]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
    
    const angles = filteredData.map(d => d.flowAngle);
    const min = Math.min(...angles);
    const max = Math.max(...angles);
    const avg = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
    
    return { min, max, avg, count: angles.length };
  }, [filteredData]);

  // Create or update chart
  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data for Chart.js
    const labels = filteredData.map(item => {
      if (timeRange === 'today' || timeRange === '1day') {
        return item.formattedTime;
      } else {
        return `${item.formattedDate} ${item.formattedTime}`;
      }
    });

    const data = filteredData.map(item => item.flowAngle);

    // Create gradient
    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

    // Chart configuration
    const config = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Flow Angle (°)',
          data: data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#374151',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(context) {
                const index = context[0].dataIndex;
                const item = filteredData[index];
                return `Time: ${new Date(item.timestamp).toLocaleString()}`;
              },
              label: function(context) {
                return `Flow Angle: ${context.parsed.y.toFixed(2)}°`;
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
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#374151'
            },
            ticks: {
              maxTicksLimit: 8,
              font: {
                size: 12
              },
              color: '#6b7280'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              drawBorder: false
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Flow Angle (°)',
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#374151'
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6b7280',
              callback: function(value) {
                return value.toFixed(1) + '°';
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              drawBorder: false
            }
          }
        },
        elements: {
          line: {
            borderJoinStyle: 'round'
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    };

    // Create new chart
    chartInstance.current = new Chart.Chart(chartRef.current, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [filteredData, timeRange]);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-blue-600" size={28} />
            <h1 className="text-3xl font-bold text-gray-800">Flow Angle Dashboard</h1>
          </div>

          {/* Time Range Controls */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Time Range Selection
            </h3>
            
            <div className="flex flex-wrap gap-4 mb-4 items-center">
              <div className="flex-1 min-w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Range
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                >
                  <option value="all">All Data</option>
                  <option value="1day">Past 1 Day</option>
                  <option value="2days">Past 2 Days</option>
                  <option value="3days">Past 3 Days</option>
                  <option value="1week">Past 1 Week</option>
                  <option value="2weeks">Past 2 Weeks</option>
                  <option value="1month">Past 1 Month</option>
                  <option value="today">Today Only</option>
                  <option value="yesterday">Yesterday Only</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range Inputs */}
            {timeRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="time"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="time"
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Data Points" 
              value={stats.count}
              
              color="blue"
              
              delay={0.2}
            />

            <StatCard 
              title="Average" 
              value={stats.avg.toFixed(1) + "°"}
              
              color="blue"
              
              delay={0.2}
            />
            <StatCard 
              title="Minimum" 
              value={stats.min.toFixed(1) + "°"}
              
              color="blue"
              
              delay={0.2}
            />
            <StatCard 
              title="Maximum" 
              value={stats.max.toFixed(1) + "°"}
              
              color="blue"
              
              delay={0.2}
            />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} />
              Flow Angle Over Time
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredData.length} data points)
              </span>
            </h3>
            
            {filteredData.length > 0 ? (
              <div className="h-96 relative">
                <canvas ref={chartRef} className="w-full h-full"></canvas>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No data available for the selected time range</p>
                  <p className="text-sm">Try selecting a different time period</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowAngleDashboard;