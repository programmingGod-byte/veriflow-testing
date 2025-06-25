"use client";

import { useRef, useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import * as Chart from 'chart.js';
import { MyContext } from '../providers';

interface VelocityData {
  section: number;
  velocity: number;
  timestamp: string;
}

interface TimeSeriesData {
  timestamp: string;
  date: string;
  time: string;
  meanVelocity: number;
  maxVelocity: number;
}

interface VelocityChartProps {
  flowDirection?: number;
  setMeanVelocity?: any;
  setMaxVelocity?: any;
  data?: any;
}

const VelocityChart = ({ flowDirection: propFlowDirection, setMeanVelocity, setMaxVelocity }: VelocityChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart.Chart | null>(null);
  const { value, setValue } = useContext(MyContext);
  const [data, setData] = useState<VelocityData[]>([]);
  const [filteredData, setFilteredData] = useState<VelocityData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [filteredTimeSeriesData, setFilteredTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<string>('1day');

  // Time period options
  const timePeriodOptions = [
    { value: '1day', label: '1 Day' },
    { value: '2day', label: '2 Days' },
    { value: '3day', label: '3 Days' },
    { value: '1week', label: '1 Week' },
    { value: '2week', label: '2 Weeks' },
    { value: '1month', label: '1 Month' },
    { value: 'all', label: 'All Data' }
  ];

  // Function to calculate time series data
  const calculateTimeSeriesData = (rawData: VelocityData[]) => {
    const timestampGroups = rawData.reduce((acc, curr) => {
      if (!acc[curr.timestamp]) {
        acc[curr.timestamp] = [];
      }
      acc[curr.timestamp].push(curr.velocity);
      return acc;
    }, {} as Record<string, number[]>);

    const timeSeriesResult: TimeSeriesData[] = [];
    
    Object.entries(timestampGroups).forEach(([timestamp, velocities]) => {
      const meanVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
      const maxVelocity = Math.max(...velocities);
      const [date, time] = timestamp.split(' ');
      
      timeSeriesResult.push({
        timestamp,
        date,
        time,
        meanVelocity,
        maxVelocity
      });
    });

    return timeSeriesResult.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Function to filter time series data based on selected period
  const filterTimeSeriesData = (data: TimeSeriesData[], period: string) => {
    if (period === 'all') return data;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (period) {
      case '1day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '2day':
        cutoffDate.setDate(now.getDate() - 2);
        break;
      case '3day':
        cutoffDate.setDate(now.getDate() - 3);
        break;
      case '1week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '2week':
        cutoffDate.setDate(now.getDate() - 14);
        break;
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoffDate);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("VALUE")
        console.log(value)
        if (!value.ip) {
          return
        }
        setLoading(true);
        console.log(value)
        const response = await fetch(`/api/csv?ip=${value.ip}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        console.log(csvText);

        console.log(csvText)
        const lines = csvText.trim().split('\n');
        // console.log("Lines:", lines);
        let maxVelocity = 0;
        let meanVelocity = 0;
        const lastVal = lines[lines.length - 1].trim().split(",").splice(1).map(item => {
          let num = parseFloat(item.trim());
          maxVelocity = Math.max(maxVelocity, num);
          meanVelocity += num;
        })
        meanVelocity /= 10; // Assuming 10 sections
        setMaxVelocity(maxVelocity);
        setMeanVelocity(meanVelocity);
        console.log("Last Line:", lastVal);
        const parsedData: VelocityData[] = [];

        lines.forEach(line => {
          const parts = line.trim().split(',').map(part => part.trim());
          // console.log("Parts:", parts);

          if (parts.length >= 11) { // timestamp + 10 velocity values
            const timestamp = parts[0];

            // Create one data point for each section (1-10)
            for (let section = 1; section <= 10; section++) {
              const velocityIndex = section; // sections 1-10 correspond to indices 1-10
              const velocity = parseFloat(parts[velocityIndex]);

              if (!isNaN(velocity)) {
                parsedData.push({
                  section: section,
                  velocity: velocity,
                  timestamp: timestamp
                });
              }
            }
          }
        });

        console.log("Parsed data:", parsedData);
        setData(parsedData);

        // Calculate time series data
        const timeSeries = calculateTimeSeriesData(parsedData);
        setTimeSeriesData(timeSeries);

        // Extract unique dates and times
        const timestamps = [...new Set(parsedData.map(d => d.timestamp))];
        const dates = [...new Set(timestamps.map(ts => ts.split(' ')[0]))].sort();
        setAvailableDates(dates);

        // Set initial date
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
          const timesForDate = timestamps
            .filter(ts => ts.startsWith(dates[0]))
            .map(ts => ts.split(' ')[1])
            .sort();
          setAvailableTimes(timesForDate);
          if (timesForDate.length > 0) {
            setSelectedTime(timesForDate[0]);
          }
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [value]);

  // Update available times when date changes
  useEffect(() => {
    if (selectedDate && data.length > 0) {
      const timestamps = [...new Set(data.map(d => d.timestamp))];
      const timesForDate = timestamps
        .filter(ts => ts.startsWith(selectedDate))
        .map(ts => ts.split(' ')[1])
        .sort();
      setAvailableTimes(timesForDate);
      if (timesForDate.length > 0 && !timesForDate.includes(selectedTime)) {
        setSelectedTime(timesForDate[0]);
      }
    }
  }, [selectedDate, data]);

  // Filter data based on selected date and time
  useEffect(() => {
    if (selectedDate && selectedTime && data.length > 0) {
      const targetTimestamp = `${selectedDate} ${selectedTime}`;
      const filtered = data
        .filter(d => d.timestamp === targetTimestamp)
        .sort((a, b) => a.section - b.section);
      console.log("Filtered data:", filtered);
      setFilteredData(filtered);
    }
  }, [selectedDate, selectedTime, data]);

  // Filter time series data based on selected time period
  useEffect(() => {
    if (timeSeriesData.length > 0) {
      const filtered = filterTimeSeriesData(timeSeriesData, timePeriod);
      setFilteredTimeSeriesData(filtered);
    }
  }, [timeSeriesData, timePeriod]);

  // Canvas drawing logic - now using Chart.js
  useEffect(() => {
    if (filteredData.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Register Chart.js components
    Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.BarElement,
  Chart.BarController,  // Add this line
  Chart.LineElement,
  Chart.LineController, // Add this line too for the line chart
  Chart.PointElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend
);

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prepare data for Chart.js
    const chartData = {
      labels: filteredData.map(d => `Section ${d.section}`),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Velocity (m/s)',
          data: filteredData.map(d => d.velocity),
          backgroundColor: 'rgba(147, 197, 253, 0.8)',
          borderColor: 'rgba(96, 165, 250, 1)',
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          type: 'line' as const,
          label: 'Velocity Trend',
          data: filteredData.map(d => d.velocity),
          borderColor: 'rgba(248, 113, 113, 0.8)',
          backgroundColor: 'rgba(248, 113, 113, 0.2)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(248, 113, 113, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: false,
          tension: 0.4,
        }
      ]
    };

    // Create Chart.js chart
    chartRef.current = new Chart.Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index' as const,
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'River Velocity Profile by Section',
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#60a5fa',
            padding: {
              top: 10,
              bottom: 5
            }
          },
          subtitle: {
            display: true,
            text: `Timestamp: ${selectedDate} ${selectedTime}`,
            font: {
              size: 13
            },
            color: '#64748b',
            padding: {
              bottom: 20
            }
          },
          legend: {
            display: true,
            position: 'top' as const,
            labels: {
              usePointStyle: true,
              color: '#64748b',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#374151',
            borderColor: 'rgba(209, 213, 219, 0.8)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value.toFixed(4)} m/s`;
              },
              afterLabel: function(context) {
                return `Section: ${context.label}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Section Number (Bank to Bank)',
              color: '#64748b',
              font: {
                size: 13
              }
            },
            grid: {
              display: true,
              color: 'rgba(209, 213, 219, 0.3)'
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 11
              }
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Velocity (m/s)',
              color: '#64748b',
              font: {
                size: 13
              }
            },
            grid: {
              display: true,
              color: 'rgba(209, 213, 219, 0.3)'
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 11
              },
              callback: function(value) {
                return typeof value === 'number' ? value.toFixed(2) : value;
              }
            },
            beginAtZero: true
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        hover: {
          animationDuration: 200
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };

  }, [filteredData, propFlowDirection, selectedDate, selectedTime]);

  // Custom tooltip component for time series chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-slate-700 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'meanVelocity' ? 'Mean' : 'Max'} Velocity: ${entry.value.toFixed(4)} m/s`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-slate-600">Loading velocity data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-slate-100">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading data:</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Velocity Profile Chart */}
      <motion.div
        className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableTimes.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 mb-1">Selected Timestamp</span>
              <span className="px-3 py-2 bg-blue-50 text-blue-800 rounded-md text-sm font-mono">
                {selectedDate} {selectedTime}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 mb-1">Data Points</span>
              <span className="px-3 py-2 bg-green-50 text-green-800 rounded-md text-sm">
                {filteredData.length} sections
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 md:h-96">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>
      </motion.div>

      {/* Time Series Chart */}
      <motion.div
        className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Time Series Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Time Period</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timePeriodOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 mb-1">Data Points</span>
              <span className="px-3 py-2 bg-purple-50 text-purple-800 rounded-md text-sm">
                {filteredTimeSeriesData.length} timestamps
              </span>
            </div>

            {filteredTimeSeriesData.length > 0 && (
              <>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 mb-1">Date Range</span>
                  <span className="px-3 py-2 bg-indigo-50 text-indigo-800 rounded-md text-sm font-mono">
                    {filteredTimeSeriesData[0]?.date} - {filteredTimeSeriesData[filteredTimeSeriesData.length - 1]?.date}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
            Velocity Variation Over Time ({timePeriodOptions.find(opt => opt.value === timePeriod)?.label})
          </h3>
          
          {filteredTimeSeriesData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(value) => value.substring(0, 5)}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={11}
                    label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="meanVelocity" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    name="Mean Velocity"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxVelocity" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                    name="Max Velocity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              <p>No data available for the selected time period</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VelocityChart;