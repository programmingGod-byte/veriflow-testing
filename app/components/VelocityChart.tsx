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
  setMeanVelocityIncrease?: any;
  setMaxVelocityIncrease?: any;
  data?: any;
}

type TimeSelectionMode = 'dropdown' | 'manual' | 'range';

const VelocityChart = ({ flowDirection: propFlowDirection, setMeanVelocity, setMaxVelocity, setMeanVelocityIncrease, setMaxVelocityIncrease }: VelocityChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart.Chart | null>(null);
  const { value, setValue, iseUserAdmin } = useContext(MyContext);
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

  const [timeSelectionMode, setTimeSelectionMode] = useState<TimeSelectionMode>('dropdown');
  const [manualDate, setManualDate] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [timeRangeStart, setTimeRangeStart] = useState<string>('');
  const [timeRangeEnd, setTimeRangeEnd] = useState<string>('');

  const timePeriodOptions = [
    { value: '1day', label: '1 Day' },
    { value: '2day', label: '2 Days' },
    { value: '3day', label: '3 Days' },
    { value: '1week', label: '1 Week' },
    { value: '2week', label: '2 Weeks' },
    { value: '1month', label: '1 Month' },
    { value: 'all', label: 'All Data' }
  ];

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  const downloadCSV = () => {
    if (filteredTimeSeriesData.length === 0) {
      alert('No data available to download');
      return;
    }

    const csvHeaders = 'timestamp,velocity\n';
    const csvContent = filteredTimeSeriesData
      .map(item => `${item.timestamp},${item.meanVelocity}`)
      .join('\n');
    const fullCSV = csvHeaders + csvContent;

    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `velocity_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateFromInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
    }
    return dateStr;
  };

  const isTimestampInRange = (timestamp: string) => {
    if (timeSelectionMode !== 'range') return true;
    if (!dateRangeStart || !dateRangeEnd) return true;

    const [date, time] = timestamp.split(' ');
    const timestampDate = new Date(formatDateForInput(date));
    const startDate = new Date(dateRangeStart);
    const endDate = new Date(dateRangeEnd);

    if (timestampDate < startDate || timestampDate > endDate) {
      return false;
    }

    if (timeRangeStart && timeRangeEnd) {
      const timestampTime = time;
      const isSameAsStart = timestampDate.toDateString() === startDate.toDateString();
      const isSameAsEnd = timestampDate.toDateString() === endDate.toDateString();

      if (isSameAsStart && timestampTime < timeRangeStart) return false;
      if (isSameAsEnd && timestampTime > timeRangeEnd) return false;
    }
    return true;
  };

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
      timeSeriesResult.push({ timestamp, date, time, meanVelocity, maxVelocity });
    });

    return timeSeriesResult.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const filterTimeSeriesData = (data: TimeSeriesData[], period: string) => {
    if (period === 'all') return data;
    const now = new Date();
    let cutoffDate = new Date();

    switch (period) {
      case '1day': cutoffDate.setDate(now.getDate() - 1); break;
      case '2day': cutoffDate.setDate(now.getDate() - 2); break;
      case '3day': cutoffDate.setDate(now.getDate() - 3); break;
      case '1week': cutoffDate.setDate(now.getDate() - 7); break;
      case '2week': cutoffDate.setDate(now.getDate() - 14); break;
      case '1month': cutoffDate.setMonth(now.getMonth() - 1); break;
      default: return data;
    }

    return data.filter(item => new Date(item.timestamp) >= cutoffDate);
  };

  useEffect(() => {
    fetchData();
  }, [value]);

  const handleRefresh = () => {
    fetchData(true);
  };

  useEffect(() => {
    if (selectedDate && data.length > 0) {
      const timestamps = [...new Set(data.map(d => d.timestamp))];
      const timesForDate = timestamps
        .filter(ts => ts.startsWith(selectedDate))
        .map(ts => ts.split(' ')[1])
        .sort()
        .reverse();
      setAvailableTimes(timesForDate);
      if (timesForDate.length > 0 && !timesForDate.includes(selectedTime)) {
        setSelectedTime(timesForDate[0]);
      }
    }
  }, [selectedDate, data]);

  const fetchData = async (isRefresh = false) => {
    if (!value.machineCode) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/csv?ip=${value.machineCode}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const parsedData: VelocityData[] = [];

      lines.forEach(line => {
        const parts = line.trim().split(',').map(part => part.trim());
        if (parts.length >= 11) {
          const timestamp = parts[0];
          for (let section = 1; section <= 10; section++) {
            const velocity = parseFloat(parts[section]);
            if (!isNaN(velocity)) {
              parsedData.push({ section, velocity, timestamp });
            }
          }
        }
      });

      const latestTimestamp = parsedData.reduce((latest, current) => new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest).timestamp;
      const latestData = parsedData.filter(d => d.timestamp === latestTimestamp);
      let maxVelocity = 0;
      let meanVelocity = 0;
      latestData.forEach(item => {
        maxVelocity = Math.max(maxVelocity, item.velocity);
        meanVelocity += item.velocity;
      });
      meanVelocity /= latestData.length;
      setMaxVelocity(maxVelocity);
      setMeanVelocity(meanVelocity);

      const uniqueTimestamps = [...new Set(parsedData.map(d => d.timestamp))].sort();
      if (uniqueTimestamps.length > 1) {
        const previousTimestamp = uniqueTimestamps[uniqueTimestamps.length - 2];
        const prevData = parsedData.filter(d => d.timestamp === previousTimestamp);
        let prevMaxVelocity = 0;
        let prevMeanVelocity = 0;
        prevData.forEach(item => {
          prevMaxVelocity = Math.max(prevMaxVelocity, item.velocity);
          prevMeanVelocity += item.velocity;
        });
        prevMeanVelocity /= prevData.length;
        const maxVelocityIncrease = prevMaxVelocity !== 0 ? ((maxVelocity - prevMaxVelocity) / prevMaxVelocity * 100) : 0;
        const meanVelocityIncrease = prevMeanVelocity !== 0 ? ((meanVelocity - prevMeanVelocity) / prevMeanVelocity * 100) : 0;
        setMaxVelocityIncrease(maxVelocityIncrease.toFixed(2));
        setMeanVelocityIncrease(meanVelocityIncrease.toFixed(2));
      }

      setData(parsedData);
      const timeSeries = calculateTimeSeriesData(parsedData);
      setTimeSeriesData(timeSeries);

      const timestamps = [...new Set(parsedData.map(d => d.timestamp))];
      const dates = [...new Set(timestamps.map(ts => ts.split(' ')[0]))].sort().reverse();
      setAvailableDates(dates);

      if (dates.length > 0) {
        const latestDate = dates[0];
        setSelectedDate(latestDate);
        setManualDate(formatDateForInput(latestDate));
        setDateRangeStart(formatDateForInput(dates[dates.length - 1]));
        setDateRangeEnd(formatDateForInput(latestDate));
        const timesForDate = timestamps.filter(ts => ts.startsWith(latestDate)).map(ts => ts.split(' ')[1]).sort().reverse();
        setAvailableTimes(timesForDate);
        if (timesForDate.length > 0) {
          const latestTime = timesForDate[0];
          setSelectedTime(latestTime);
          setManualTime(latestTime);
          setTimeRangeStart(timesForDate[timesForDate.length - 1]);
          setTimeRangeEnd(latestTime);
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

  useEffect(() => {
    if (timeSelectionMode === 'manual' && manualDate && manualTime) {
      const formattedDate = formatDateFromInput(manualDate);
      const targetTimestamp = `${formattedDate} ${manualTime}`;
      if (data.some(d => d.timestamp === targetTimestamp)) {
        setSelectedDate(formattedDate);
        setSelectedTime(manualTime);
      }
    }
  }, [timeSelectionMode, manualDate, manualTime, data]);

  useEffect(() => {
    if (timeSelectionMode === 'range') {
      const rangeFiltered = data.filter(d => isTimestampInRange(d.timestamp));
      setFilteredData(rangeFiltered);
    } else if (selectedDate && selectedTime && data.length > 0) {
      const targetTimestamp = `${selectedDate} ${selectedTime}`;
      const filtered = data.filter(d => d.timestamp === targetTimestamp).sort((a, b) => a.section - b.section);
      let maxVelocityi = 0;
      let meanVelocityi = 0;
      filtered.forEach(item => {
        maxVelocityi = Math.max(maxVelocityi, item.velocity);
        meanVelocityi += item.velocity;
      });
      meanVelocityi /= 10;
      setMaxVelocity(maxVelocityi);
      setMeanVelocity(meanVelocityi);
      setFilteredData(filtered);
    }
  }, [selectedDate, selectedTime, data, timeSelectionMode, dateRangeStart, dateRangeEnd, timeRangeStart, timeRangeEnd]);

  useEffect(() => {
    if (timeSeriesData.length > 0) {
      let filtered = filterTimeSeriesData(timeSeriesData, timePeriod);
      if (timeSelectionMode === 'range') {
        filtered = filtered.filter(item => isTimestampInRange(item.timestamp));
      }
      setFilteredTimeSeriesData(filtered);
    }
  }, [timeSeriesData, timePeriod, timeSelectionMode, dateRangeStart, dateRangeEnd, timeRangeStart, timeRangeEnd]);

  useEffect(() => {
    if (filteredData.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    Chart.Chart.register(
      Chart.CategoryScale, Chart.LinearScale, Chart.BarElement, Chart.BarController,
      Chart.LineElement, Chart.LineController, Chart.PointElement, Chart.Title, Chart.Tooltip, Chart.Legend
    );

    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chartData = {
      labels: filteredData.map(d => `Section ${d.section}`),
      datasets: [
        {
          type: 'bar' as const, label: 'Velocity (m/s)', data: filteredData.map(d => d.velocity),
          backgroundColor: 'rgba(147, 197, 253, 0.8)', borderColor: 'rgba(96, 165, 250, 1)',
          borderWidth: 1, borderRadius: 8, borderSkipped: false,
        },
        {
          type: 'line' as const, label: 'Velocity Trend', data: filteredData.map(d => d.velocity),
          borderColor: 'rgba(248, 113, 113, 0.8)', backgroundColor: 'rgba(248, 113, 113, 0.2)',
          borderWidth: 3, pointBackgroundColor: 'rgba(248, 113, 113, 1)', pointBorderColor: '#ffffff',
          pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, fill: false, tension: 0.4,
        }
      ]
    };

    chartRef.current = new Chart.Chart(ctx, {
      type: 'bar', data: chartData,
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
          title: { display: true, text: timeSelectionMode === 'range' ? 'River Velocity Profile (Range View)' : 'River Velocity Profile by Section', font: { size: 16, weight: 'bold' }, color: '#60a5fa', padding: { top: 10, bottom: 5 } },
          subtitle: { display: true, text: timeSelectionMode === 'range' ? `Range: ${dateRangeStart} ${timeRangeStart} - ${dateRangeEnd} ${timeRangeEnd}` : `Timestamp: ${selectedDate} ${selectedTime}`, font: { size: 13 }, color: '#64748b', padding: { bottom: 20 } },
          legend: { display: true, position: 'top' as const, labels: { usePointStyle: true, color: '#64748b', font: { size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)', titleColor: '#1f2937', bodyColor: '#374151',
            borderColor: 'rgba(209, 213, 219, 0.8)', borderWidth: 1, cornerRadius: 8, displayColors: true,
            callbacks: {
              label: (context) => `${context.dataset.label || ''}: ${context.parsed.y.toFixed(4)} m/s`,
              afterLabel: (context) => `Section: ${context.label}`
            }
          }
        },
        scales: {
          x: { display: true, title: { display: true, text: 'Section Number (Bank to Bank)', color: '#64748b', font: { size: 13 } }, grid: { display: true, color: 'rgba(209, 213, 219, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
          y: { display: true, title: { display: true, text: 'Velocity (m/s)', color: '#64748b', font: { size: 13 } }, grid: { display: true, color: 'rgba(209, 213, 219, 0.3)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: (value) => typeof value === 'number' ? value.toFixed(2) : value }, beginAtZero: true }
        },
        animation: { duration: 1000, easing: 'easeInOutQuart' },
        hover: { animationDuration: 200 }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [filteredData, propFlowDirection, selectedDate, selectedTime, timeSelectionMode, dateRangeStart, dateRangeEnd, timeRangeStart, timeRangeEnd]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-slate-700 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'meanVelocity' ? '' : 'Max'} Velocity: ${entry.value.toFixed(4)} m/s`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RefreshIcon = ({ className = "w-4 h-4", spinning = false }: { className?: string, spinning?: boolean }) => (
    <svg className={`${className} ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const TimeSelectionModeButtons = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button onClick={() => setTimeSelectionMode('dropdown')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${timeSelectionMode === 'dropdown' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
        Dropdown Selection
      </button>
      <button onClick={() => setTimeSelectionMode('range')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${timeSelectionMode === 'range' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
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
          <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <RefreshIcon className="w-4 h-4 mr-2" spinning={refreshing} />
            {refreshing ? 'Refreshing...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  // MODIFICATION: Process time series data to insert breaks for gaps > 30 minutes
  const timeSeriesWithGaps = [];
  if (filteredTimeSeriesData.length > 0) {
    timeSeriesWithGaps.push(filteredTimeSeriesData[0]);
    for (let i = 1; i < filteredTimeSeriesData.length; i++) {
      const prevPoint = filteredTimeSeriesData[i - 1];
      const currentPoint = filteredTimeSeriesData[i];
      const prevDate = new Date(prevPoint.timestamp);
      const currentDate = new Date(currentPoint.timestamp);
      const diffMinutes = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60);

      if (diffMinutes > 60) {
        timeSeriesWithGaps.push({ ...currentPoint, meanVelocity: null });
      }
      timeSeriesWithGaps.push(currentPoint);
    }
  }

  return (
    <div className="space-y-6">
      {iseUserAdmin && (
        <motion.div className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <TimeSelectionModeButtons />
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                {timeSelectionMode === 'dropdown' && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Date</label>
                      <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {availableDates.map(date => (<option key={date} value={date}>{date}</option>))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Time</label>
                      <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        {availableTimes.map(time => (<option key={time} value={time}>{time}</option>))}
                      </select>
                    </div>
                  </>
                )}
                {timeSelectionMode === 'manual' && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Time</label>
                      <input type="time" step="1" value={manualTime} onChange={(e) => setManualTime(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                  </>
                )}
                {timeSelectionMode === 'range' && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input type="date" value={dateRangeStart} onChange={(e) => setDateRangeStart(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">Start Time</label>
                      <input type="time" step="1" value={timeRangeStart} onChange={(e) => setTimeRangeStart(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">End Date</label>
                      <input type="date" value={dateRangeEnd} onChange={(e) => setDateRangeEnd(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-slate-700 mb-1">End Time</label>
                      <input type="time" step="1" value={timeRangeEnd} onChange={(e) => setTimeRangeEnd(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                  </>
                )}
              </div>
              <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <RefreshIcon className="w-4 h-4 mr-2" spinning={refreshing} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {lastFetchTime && (
              <div className="mt-3 text-xs text-slate-500">
                Last updated: {lastFetchTime.toLocaleString()}
                {timeSelectionMode === 'range' && filteredData.length > 0 && (<span className="ml-4">Showing {filteredData.length / 10} timestamps in range</span>)}
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="relative" style={{ height: '400px' }}>
              <canvas ref={canvasRef} />
            </div>
            {filteredData.length === 0 && !loading && (
              <div className="text-center py-8 text-slate-500">
                <p>No data available for the selected {timeSelectionMode === 'range' ? 'range' : 'timestamp'}</p>
                {timeSelectionMode !== 'dropdown' && (<p className="text-sm mt-1">Try adjusting your selection or use dropdown mode</p>)}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <button onClick={downloadCSV} className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
        Download CSV
      </button>

      <motion.div className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Time Period</label>
              <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                {timePeriodOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
              </select>
            </div>
            <div className="text-sm text-slate-600">
              {filteredTimeSeriesData.length > 0 && (<span>Showing {filteredTimeSeriesData.length} data points{timeSelectionMode === 'range' && ' (filtered by range)'}</span>)}
            </div>
          </div>
        </div>
        <div className="p-4">
          <div style={{ width: '100%', height: '400px' }}>
            {filteredTimeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* MODIFICATION: Use `timeSeriesWithGaps` for the data prop */}
                <LineChart data={timeSeriesWithGaps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="timestamp" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={80}
                    tickFormatter={(value) => {
                      const dateObj = new Date(value);
                      const hours = dateObj.getHours();
                      const minutes = dateObj.getMinutes();
                      const roundedMinutes = Math.floor(minutes / 15) * 15;
                      const year = dateObj.getFullYear();
                      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const day = String(dateObj.getDate()).padStart(2, '0');
                      const hour = String(hours).padStart(2, '0');
                      const minute = String(roundedMinutes).padStart(2, '0');
                      return `${year}-${month}-${day} ${hour}:${minute}`;
                    }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Velocity (m/s)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone" dataKey="meanVelocity" stroke="#3b82f6" strokeWidth={2} name="Velocity"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                    // MODIFICATION: Explicitly disable connecting nulls
                    connectNulls={false}
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