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

// Time selection modes
type TimeSelectionMode = 'dropdown' | 'manual' | 'range';

const VelocityChart = ({ flowDirection: propFlowDirection, setMeanVelocity, setMaxVelocity }: VelocityChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart.Chart | null>(null);
  const { value, setValue } = useContext(MyContext);
  const [data, setData] = useState<VelocityData[]>([]);
  const [filteredData, setFilteredData] = useState<VelocityData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [filteredTimeSeriesData, setFilteredTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<string>('1day');
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  // New state for enhanced time selection
  const [timeSelectionMode, setTimeSelectionMode] = useState<TimeSelectionMode>('dropdown');
  const [manualDate, setManualDate] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [timeRangeStart, setTimeRangeStart] = useState<string>('');
  const [timeRangeEnd, setTimeRangeEnd] = useState<string>('');

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

  // Function to format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  // Function to format date from input (DD-MM-YYYY)
  const formatDateFromInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
    }
    return dateStr;
  };

  // Function to check if a timestamp falls within the selected range
  const isTimestampInRange = (timestamp: string) => {
    if (timeSelectionMode !== 'range') return true;
    
    if (!dateRangeStart || !dateRangeEnd) return true;
    
    const [date, time] = timestamp.split(' ');
    const timestampDate = new Date(formatDateForInput(date));
    const startDate = new Date(dateRangeStart);
    const endDate = new Date(dateRangeEnd);
    
    // Check date range
    if (timestampDate < startDate || timestampDate > endDate) {
      return false;
    }
    
    // If it's the same day as start or end, check time range
    if (timeRangeStart && timeRangeEnd) {
      const timestampTime = time;
      const isSameAsStart = timestampDate.toDateString() === startDate.toDateString();
      const isSameAsEnd = timestampDate.toDateString() === endDate.toDateString();
      
      if (isSameAsStart && timestampTime < timeRangeStart) {
        return false;
      }
      
      if (isSameAsEnd && timestampTime > timeRangeEnd) {
        return false;
      }
    }
    
    return true;
  };

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
  const fetchData = async (isRefresh = false) => {
    try {
      console.log("VALUE")
      console.log(value)
      if (!value.ip) {
        return
      }
      
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
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
        setManualDate(formatDateForInput(dates[0]));
        setDateRangeStart(formatDateForInput(dates[0]));
        setDateRangeEnd(formatDateForInput(dates[dates.length - 1]));
        
        const timesForDate = timestamps
          .filter(ts => ts.startsWith(dates[0]))
          .map(ts => ts.split(' ')[1])
          .sort();
        setAvailableTimes(timesForDate);
        if (timesForDate.length > 0) {
          setSelectedTime(timesForDate[0]);
          setManualTime(timesForDate[0]);
          setTimeRangeStart(timesForDate[0]);
          setTimeRangeEnd(timesForDate[timesForDate.length - 1]);
        }
      }

      setLastFetchTime(new Date());

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [value]);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchData(true);
  };

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

  // Apply manual date/time when mode changes
  useEffect(() => {
    if (timeSelectionMode === 'manual' && manualDate && manualTime) {
      const formattedDate = formatDateFromInput(manualDate);
      const targetTimestamp = `${formattedDate} ${manualTime}`;
      
      // Check if this timestamp exists in the data
      const timestampExists = data.some(d => d.timestamp === targetTimestamp);
      
      if (timestampExists) {
        setSelectedDate(formattedDate);
        setSelectedTime(manualTime);
      }
    }
  }, [timeSelectionMode, manualDate, manualTime, data]);

  // Filter data based on selected date and time or range
  useEffect(() => {
    if (timeSelectionMode === 'range') {
      // Filter data for range mode
      const rangeFiltered = data.filter(d => isTimestampInRange(d.timestamp));
      setFilteredData(rangeFiltered);
    } else if (selectedDate && selectedTime && data.length > 0) {
      // Filter data for specific timestamp
      const targetTimestamp = `${selectedDate} ${selectedTime}`;
      const filtered = data
        .filter(d => d.timestamp === targetTimestamp)
        .sort((a, b) => a.section - b.section);
      console.log("Filtered data:", filtered);
      setFilteredData(filtered);
    }
  }, [selectedDate, selectedTime, data, timeSelectionMode, dateRangeStart, dateRangeEnd, timeRangeStart, timeRangeEnd]);

  // Filter time series data based on selected time period and range
  useEffect(() => {
    if (timeSeriesData.length > 0) {
      let filtered = filterTimeSeriesData(timeSeriesData, timePeriod);
      
      // Apply range filter if in range mode
      if (timeSelectionMode === 'range') {
        filtered = filtered.filter(item => isTimestampInRange(item.timestamp));
      }
      
      setFilteredTimeSeriesData(filtered);
    }
  }, [timeSeriesData, timePeriod, timeSelectionMode, dateRangeStart, dateRangeEnd, timeRangeStart, timeRangeEnd]);

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
      Chart.BarController,
      Chart.LineElement,
      Chart.LineController,
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
            text: timeSelectionMode === 'range' ? 'River Velocity Profile (Range View)' : 'River Velocity Profile by Section',
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
            text: timeSelectionMode === 'range' 
              ? `Range: ${dateRangeStart} ${timeRangeStart} - ${dateRangeEnd} ${timeRangeEnd}`
              : `Timestamp: ${selectedDate} ${selectedTime}`,
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

  }, [filteredData, propFlowDirection, selectedDate, selectedTime, timeSelectionMode, dateRangeStart, dateRangeEnd, timeRangeStart, timeRangeEnd]);

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

  // Refresh icon SVG component
  const RefreshIcon = ({ className = "w-4 h-4", spinning = false }: { className?: string, spinning?: boolean }) => (
    <svg 
      className={`${className} ${spinning ? 'animate-spin' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
      />
    </svg>
  );

  // Time selection mode buttons
  const TimeSelectionModeButtons = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => setTimeSelectionMode('dropdown')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          timeSelectionMode === 'dropdown'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        Dropdown Selection
      </button>
      <button
        onClick={() => setTimeSelectionMode('manual')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          timeSelectionMode === 'manual'
            ? 'bg-green-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        Manual Input
      </button>
      <button
        onClick={() => setTimeSelectionMode('range')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          timeSelectionMode === 'range'
            ? 'bg-purple-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        Date Range
      </button>
    </div>
  );

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
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="font-semibold">Error loading data:</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshIcon className="w-4 h-4 mr-2" spinning={refreshing} />
            {refreshing ? 'Refreshing...' : 'Try Again'}
          </button>
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
          <TimeSelectionModeButtons />
          
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Dropdown Selection Mode */}
              {timeSelectionMode === 'dropdown' && (
                <>
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
                </>
              )}

              {/* Manual Input Mode */}
              {timeSelectionMode === 'manual' && (
                <>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">Time</label>
                    <input
                      type="time"
                      step="1"
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Range Selection Mode */}
              {timeSelectionMode === 'range' && (
                <>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      step="1"
                      value={timeRangeStart}
                      onChange={(e) => setTimeRangeStart(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      step="1"
                      value={timeRangeEnd}
                      onChange={(e) => setTimeRangeEnd(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshIcon className="w-4 h-4 mr-2" spinning={refreshing} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Status Info */}
          {lastFetchTime && (
            <div className="mt-3 text-xs text-slate-500">
              Last updated: {lastFetchTime.toLocaleString()}
              {timeSelectionMode === 'range' && filteredData.length > 0 && (
                <span className="ml-4">
                  Showing {filteredData.length / 10} timestamps in range
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chart Container */}
        <div className="p-4">
          <div className="relative" style={{ height: '400px' }}>
            <canvas ref={canvasRef} />
          </div>

          {filteredData.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-500">
              <p>No data available for the selected {timeSelectionMode === 'range' ? 'range' : 'timestamp'}</p>
              {timeSelectionMode !== 'dropdown' && (
                <p className="text-sm mt-1">Try adjusting your selection or use dropdown mode</p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Time Series Chart */}
      <motion.div
        className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Time Series Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Time Period</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timePeriodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-slate-600">
              {filteredTimeSeriesData.length > 0 && (
                <span>
                  Showing {filteredTimeSeriesData.length} data points
                  {timeSelectionMode === 'range' && ' (filtered by range)'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="p-4">
          <div style={{ width: '100%', height: '400px' }}>
            {filteredTimeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(value) => {
                      const [date, time] = value.split(' ');
                      return `${date}\n${time}`;
                    }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={11}
                    label={{ 
                      value: 'Velocity (m/s)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="meanVelocity" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Mean Velocity"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxVelocity" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Max Velocity"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <p>No time series data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VelocityChart;