"use client";

import { useState, useEffect ,useContext} from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, RefreshCw, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { MyContext } from '../providers';

interface TimestampData {
  date: string;
  time: string;
}

interface DepthData {
  date: string;
  time: string;
  values: number[];
}

interface RiverDepthVisualizationProps {
  serverIp?: string;
}

const RiverDepthVisualization = ({ serverIp = "13.203.226.108" }: RiverDepthVisualizationProps) => {
   const { value, setValue } = useContext(MyContext);
  const [timestamps, setTimestamps] = useState<TimestampData[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<TimestampData | null>(null);
  const [depthData, setDepthData] = useState<DepthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ip, setIp] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');

useEffect(() => {
  if(value && value.ip){
    console.log(value, "from river ");
    setIp(value.ip);
  }
}, [value])

useEffect(() => {
  if(ip) {
    fetchTimestamps();
  }
}, [ip])

  const getUniqueDates = () => {
    const dates = [...new Set(timestamps.map(t => t.date))];
    return dates.sort();
  };

  const getTimesForDate = (date: string) => {
    const times = timestamps
      .filter(t => t.date === date)
      .map(t => t.time)
      .sort();
    return times;
  };

  const fetchTimestamps = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/depth/timestamp?ip=${encodeURIComponent(ip)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timestamps');
      }
      const data = await response.json();
      setTimestamps(data);
      
      if (data.length > 0) {
        const latest = data[data.length - 1];
        setSelectedTimestamp(latest);
        setSelectedDate(latest.date);
        setAvailableTimes(getTimesForDate(latest.date));
        setSelectedTime(latest.time);
        await fetchDepthData(latest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch timestamps');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepthData = async (timestamp: TimestampData) => {
    try {
      const response = await fetch(
        `/api/depth/getdata?ip=${encodeURIComponent(ip)}&date=${encodeURIComponent(timestamp.date)}&time=${encodeURIComponent(timestamp.time)}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch depth data');
      }
      const data = await response.json();
      setDepthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch depth data');
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const timesForDate = getTimesForDate(date);
    setAvailableTimes(timesForDate);
    setSelectedTime('');
    setDepthData(null);
  };

  const handleTimeChange = async (time: string) => {
    setSelectedTime(time);
    const timestamp = { date: selectedDate, time };
    setSelectedTimestamp(timestamp);
    setLoading(true);
    await fetchDepthData(timestamp);
    setLoading(false);
  };

  const chartData = depthData ? depthData.values.slice(0, 15).map((depth, index) => ({
    section: `S${index + 1}`,
    depth:  10.13 -parseFloat(depth.toFixed(3)),
    sectionNumber: index + 1
  })) : [];

  console.log("depthData", depthData);
  const stats = depthData ? {
    maxDepth: 10.13 -  Math.min(...depthData.values.slice(0, 15)),
    minDepth: 10.13 - Math.max(...depthData.values.slice(0, 15)),
    avgDepth: 10.13 -depthData.values.slice(0, 15).reduce((a, b) => a + b, 0) / 15,
    meanDepth: 10.13 - depthData.values[15]
  } : null;

  const getDepthColor = (depth: number) => {
    if (depth > 8) return '#ef4444';
    if (depth > 6) return '#f97316';
    if (depth > 4) return '#eab308';
    if (depth > 2) return '#22c55e';
    return '#3b82f6';
  };

  const getDepthStatus = () => {
    if (!stats) return 'Unknown';
    if (stats.avgDepth > 8) return 'Very Deep';
    if (stats.avgDepth > 6) return 'Deep';
    if (stats.avgDepth > 4) return 'Medium';
    if (stats.avgDepth > 2) return 'Shallow';
    return 'Very Shallow';
  };

  const getStatusColor = () => {
    const status = getDepthStatus();
    switch (status) {
      case 'Very Deep':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Deep':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Shallow':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Very Shallow':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`Section ${data.sectionNumber}`}</p>
          <p className="text-blue-600">{`Depth: ${data.depth}m`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          
          {selectedTimestamp && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{selectedTimestamp.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{selectedTimestamp.time}</span>
              </div>
            </div>
          )}
        </div>

        {timestamps.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Date:</label>
              <select
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a date...</option>
                {getUniqueDates().map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Time:</label>
              <select
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={!selectedDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose a time...</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Max Depth</p>
                <p className="text-2xl font-bold text-blue-600">{stats.maxDepth.toFixed(2)}m</p>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Min Depth</p>
                <p className="text-2xl font-bold text-red-600">{stats.minDepth.toFixed(2)}m</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Depth</p>
                <p className="text-2xl font-bold text-green-600">{stats.avgDepth.toFixed(2)}m</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mean Depth</p>
                <p className="text-2xl font-bold text-purple-600">{stats.meanDepth.toFixed(2)}m</p>
              </div>
              <TrendingDown className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content - Chart on Left, Analysis on Right */}
      <div className="flex gap-6">
        {/* Left side - Section Depth Distribution Chart */}
        {chartData.length > 0 && (
          <motion.div 
            className="flex-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Section Depth Distribution</h3>
            
            <div className="flex gap-6">
              {/* Legend on left side of chart */}
              
              {/* Chart */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="section" 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="depth" 
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getDepthColor(entry.depth)} opacity={0.6}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Right side - River Depth Analysis */}
        {stats && (
          <motion.div 
            className="w-80 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="mb-4">
              <div className={`px-3 py-2 rounded-md text-sm font-medium border ${getStatusColor()}`}>
                {getDepthStatus()}
              </div>
            </div>
            
            <div className="text-sm text-slate-600 mb-4">
              <div className="font-medium">River Depth Analysis</div>
              {selectedTimestamp && (
                <div className="text-xs mt-1">
                  Updated: {selectedTimestamp.date} at {selectedTimestamp.time}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-md p-3 shadow-sm border border-slate-200 mb-4">
              <div className="text-lg font-bold text-slate-800">{stats.avgDepth.toFixed(2)} m</div>
              <div className="text-xs text-slate-500">Average Depth</div>
            </div>
            
            <div className="space-y-2">
              <div className={`p-2 rounded-md border ${
                stats.avgDepth > 8 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 mr-2"></div>
                  <div className="text-xs font-medium text-slate-700">Very Deep (&gt;8m)</div>
                </div>
              </div>
              
              <div className={`p-2 rounded-md border ${
                stats.avgDepth > 6 && stats.avgDepth <= 8 ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 mr-2"></div>
                  <div className="text-xs font-medium text-slate-700">Deep (6-8m)</div>
                </div>
              </div>
              
              <div className={`p-2 rounded-md border ${
                stats.avgDepth > 4 && stats.avgDepth <= 6 ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 mr-2"></div>
                  <div className="text-xs font-medium text-slate-700">Medium (4-6m)</div>
                </div>
              </div>
              
              <div className={`p-2 rounded-md border ${
                stats.avgDepth > 2 && stats.avgDepth <= 4 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 mr-2"></div>
                  <div className="text-xs font-medium text-slate-700">Shallow (2-4m)</div>
                </div>
              </div>
              
              <div className={`p-2 rounded-md border ${
                stats.avgDepth <= 2 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 mr-2"></div>
                  <div className="text-xs font-medium text-slate-700">Very Shallow (&lt;2m)</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded">
                  <div className="font-medium text-slate-700">Max</div>
                  <div className="text-slate-600">{stats.maxDepth.toFixed(2)}m</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <div className="font-medium text-slate-700">Min</div>
                  <div className="text-slate-600">{stats.minDepth.toFixed(2)}m</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading data...</span>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No depth data available. Please check your server connection and try again.</p>
        </div>
      )}
    </div>
  );
};

export default RiverDepthVisualization;