"use client";

import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, RefreshCw, TrendingDown, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MyContext } from '../providers';

// Water Level Indicator Component
interface WaterLevelIndicatorProps {
  currentLevel: number;
  maxLevel: number;
  dangerLevel: number;
  warningLevel: number;
  normalLevel: number;
  location: string;
  lastUpdated: string;
}

const WaterLevelIndicator = ({
  currentLevel,
  maxLevel,
  dangerLevel,
  warningLevel,
  normalLevel,
  location,
  lastUpdated,
}: WaterLevelIndicatorProps) => {
  const fillPercentage = Math.min((currentLevel / maxLevel) * 100, 100);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

  const getStatus = () => {
    if (currentLevel >= dangerLevel) return 'Danger';
    if (currentLevel >= warningLevel) return 'Warning';
    if (currentLevel >= normalLevel) return 'Normal';
    return 'Low';
  };

  const getStatusColorRGB = () => {
    const status = getStatus();
    switch (status) {
      case 'Danger':
        return 'rgba(248, 113, 113, 0.75)';
      case 'Warning':
        return 'rgba(251, 191, 36, 0.75)';
      case 'Normal':
        return 'rgba(96, 165, 250, 0.75)';
      case 'Low':
        return 'rgba(191, 219, 254, 0.75)';
      default:
        return 'rgba(96, 165, 250, 0.75)';
    }
  };

  const getStatusBgColor = () => {
    const status = getStatus();
    switch (status) {
      case 'Danger':
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'Warning':
        return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'Normal':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Low':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-300';
    }
  };

  const dangerPosition = (dangerLevel / maxLevel) * 100;
  const warningPosition = (warningLevel / maxLevel) * 100;
  const normalPosition = (normalLevel / maxLevel) * 100;

  const containerStyle = {
    position: 'relative' as const,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(226, 232, 240, 1)',
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-2 flex justify-between items-center">
        <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBgColor()}`}>
          {getStatus()}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-2">
        <div>Location: {location}</div>
        <div className="text-xs">Last updated: {lastUpdated}</div>
      </div>

      <div className="flex flex-1">
        <div className="relative w-4/5 h-full rounded-lg overflow-hidden border border-slate-200">
          <div className="absolute right-0 top-0 h-full w-12 bg-slate-50 border-l border-slate-200 z-10">
            <div className="absolute top-0 right-0 left-0 flex items-center">
              <div className="h-px w-2 bg-slate-400"></div>
              <div className="text-[10px] text-slate-600 ml-1">{maxLevel}m</div>
            </div>

            <div
              className="absolute right-0 left-0 flex items-center"
              style={{ top: `${100 - dangerPosition}%` }}
            >
              <div className="h-px w-2 bg-red-400"></div>
              <div className="text-[10px] text-red-500 ml-1">{dangerLevel}m</div>
            </div>

            <div
              className="absolute right-0 left-0 flex items-center"
              style={{ top: `${100 - warningPosition}%` }}
            >
              <div className="h-px w-2 bg-amber-400"></div>
              <div className="text-[10px] text-amber-500 ml-1">{warningLevel}m</div>
            </div>

            <div
              className="absolute right-0 left-0 flex items-center"
              style={{ top: `${100 - normalPosition}%` }}
            >
              <div className="h-px w-2 bg-blue-400"></div>
              <div className="text-[10px] text-blue-500 ml-1">{normalLevel}m</div>
            </div>

            <div className="absolute bottom-0 right-0 left-0 flex items-center">
              <div className="h-px w-2 bg-slate-400"></div>
              <div className="text-[10px] text-slate-600 ml-1">0m</div>
            </div>

            <div
              className="absolute right-0 left-0 flex items-center"
              style={{ top: `${100 - fillPercentage}%` }}
            >
              <div className="h-0.5 w-4 bg-black"></div>
              <div className="text-[10px] font-bold text-slate-900 ml-1">{currentLevel}m</div>
            </div>
          </div>

          <div style={{ ...containerStyle, width: 'calc(100% - 3rem)' }}>
            <motion.div
              initial={isInitialRender ? { height: 0 } : { height: `${fillPercentage}%` }}
              animate={{ height: `${fillPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                backgroundColor: getStatusColorRGB(),
                backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)',
              }}
              className="border-t border-white border-opacity-30"
            >
              <svg
                className="absolute inset-0 w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M0 80 Q 25 70, 50 75 T 100 65 L 100 100 L 0 100 Z"
                  fill="rgba(255, 255, 255, 0.3)"
                  animate={{
                    d: [
                      "M0 80 Q 25 70, 50 75 T 100 65 L 100 100 L 0 100 Z",
                      "M0 75 Q 25 80, 50 70 T 100 75 L 100 100 L 0 100 Z",
                      "M0 70 Q 25 75, 50 80 T 100 70 L 100 100 L 0 100 Z",
                      "M0 80 Q 25 70, 50 75 T 100 65 L 100 100 L 0 100 Z",
                    ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 8,
                    ease: "easeInOut"
                  }}
                />
                <motion.path
                  d="M0 85 Q 25 80, 50 82 T 100 78 L 100 100 L 0 100 Z"
                  fill="rgba(255, 255, 255, 0.4)"
                  animate={{
                    d: [
                      "M0 85 Q 25 80, 50 82 T 100 78 L 100 100 L 0 100 Z",
                      "M0 80 Q 25 85, 50 77 T 100 82 L 100 100 L 0 100 Z",
                      "M0 78 Q 25 82, 50 85 T 100 80 L 100 100 L 0 100 Z",
                      "M0 85 Q 25 80, 50 82 T 100 78 L 100 100 L 0 100 Z",
                    ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut"
                  }}
                />
              </svg>
            </motion.div>

            <div
              className="absolute left-0 right-0 border-t border-dashed border-red-400 z-10"
              style={{ top: `${100 - dangerPosition}%` }}
            ></div>
            <div
              className="absolute left-0 right-0 border-t border-dashed border-amber-400 z-10"
              style={{ top: `${100 - warningPosition}%` }}
            ></div>
            <div
              className="absolute left-0 right-0 border-t border-dashed border-blue-400 z-10"
              style={{ top: `${100 - normalPosition}%` }}
            ></div>
          </div>
        </div>

        <div className="w-1/5 pl-2">
          <div className="bg-white rounded-md p-1 shadow-sm border border-slate-200 mb-2">
            <div className="text-sm font-bold text-slate-800">{currentLevel.toPrecision(2)} m</div>
            <div className="text-[10px] text-slate-500">Current</div>
          </div>

          <div className="space-y-1">
            <div className={`p-1 rounded-md border ${currentLevel >= dangerLevel ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
              }`}>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
                <div className="text-[10px] font-medium text-slate-700">Danger</div>
              </div>
            </div>

            <div className={`p-1 rounded-md border ${currentLevel >= warningLevel && currentLevel < dangerLevel ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-400 mr-1"></div>
                <div className="text-[10px] font-medium text-slate-700">Warning</div>
              </div>
            </div>

            <div className={`p-1 rounded-md border ${currentLevel >= normalLevel && currentLevel < warningLevel ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
                <div className="text-[10px] font-medium text-slate-700">Normal</div>
              </div>
            </div>

            <div className={`p-1 rounded-md border ${currentLevel < normalLevel ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-300 mr-1"></div>
                <div className="text-[10px] font-medium text-slate-700">Low</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimestampData {
  date: string;
  time: string;
  average: number;
}

interface RiverDepthVisualizationProps {
  serverIp?: string;
}

const RiverDepthVisualization = ({ serverIp = "13.203.226.108" }: RiverDepthVisualizationProps) => {
  const { value, setValue } = useContext(MyContext);
  const [timestamps, setTimestamps] = useState<TimestampData[]>([]);
  const [filteredData, setFilteredData] = useState<TimestampData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ip, setIp] = useState("");
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [customStartTime, setCustomStartTime] = useState<string>('');
  const [customEndTime, setCustomEndTime] = useState<string>('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  useEffect(() => {
    if (value && value.ip) {
      console.log(value, "from river ");
      setIp(value.ip);
    }
  }, [value])

  useEffect(() => {
    if (ip) {
      fetchTimestamps();
    }
  }, [ip])

  useEffect(() => {
    filterDataByTimeRange();
  }, [timestamps, timeRange, customStartDate, customEndDate, customStartTime, customEndTime, useCustomRange]);

  const filterDataByTimeRange = () => {
    if (timestamps.length === 0) return;

    let filtered = [...timestamps];
    const now = new Date();

    if (useCustomRange && customStartDate && customEndDate) {
      const startDateTime = new Date(`${customStartDate}T${customStartTime || '00:00'}`);
      const endDateTime = new Date(`${customEndDate}T${customEndTime || '23:59'}`);

      filtered = timestamps.filter(item => {
        const itemDateTime = new Date(`${item.date}T${item.time}`);
        return itemDateTime >= startDateTime && itemDateTime <= endDateTime;
      });
    } else if (!useCustomRange) {
      const cutoffTime = new Date(now);

      switch (timeRange) {
        case '1h':
          cutoffTime.setHours(cutoffTime.getHours() - 1);
          break;
        case '2h':
          cutoffTime.setHours(cutoffTime.getHours() - 2);
          break;
        case '6h':
          cutoffTime.setHours(cutoffTime.getHours() - 6);
          break;
        case '12h':
          cutoffTime.setHours(cutoffTime.getHours() - 12);
          break;
        case '1d':
          cutoffTime.setDate(cutoffTime.getDate() - 1);
          break;
        case '3d':
          cutoffTime.setDate(cutoffTime.getDate() - 3);
          break;
        case '7d':
          cutoffTime.setDate(cutoffTime.getDate() - 7);
          break;
        case 'all':
        default:
          // Show all data
          break;
      }

      if (timeRange !== 'all') {
        filtered = timestamps.filter(item => {
          const itemDateTime = new Date(`${item.date}T${item.time}`);
          return itemDateTime >= cutoffTime;
        });
      }
    }

    // Sort by datetime
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });

    setFilteredData(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchTimestamps();
    setRefreshing(false);
  };

  const fetchTimestamps = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/depth/timestamp?ip=${encodeURIComponent(ip)}`);

      if (!response.ok) {


        if (response.status === 404) {
          throw new Error('Data file does not exist on the server');
        } else if (response.status >= 500) {
          throw new Error('Server is not responding. Please try again later');
        } else {
          throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('No timestamp data available');
      }

      setTimestamps(data);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Could not connect to server. Please check your connection and try again');
      } else {
        setError(err instanceof Error ? err.message : 'Could not fetch data from server');
      }
      console.error('Fetch timestamps error:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = filteredData.map((item, index) => ({
    time: `${item.time.slice(0, 5)}`,
    fullDateTime: `${item.date} ${item.time}`,
    depth: 10.13 - parseFloat(item.average.toFixed(2)),
    index: index
  }));

  const stats = filteredData.length > 0 ? {
    maxDepth: Math.max(...filteredData.map(d => d.average)),
    minDepth: Math.min(...filteredData.map(d => d.average)),
    avgDepth: 10 - filteredData.reduce((a, b) => a + b.average, 0) / filteredData.length,
    totalReadings: filteredData.length
  } : null;

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
          <p className="font-semibold text-gray-800">{data.fullDateTime}</p>
          <p className="text-blue-600">{`Average Depth: ${data.depth}m`}</p>
        </div>
      );
    }
    return null;
  };

  const timeRangeOptions = [
    { value: '1h', label: 'Past 1 Hour' },
    { value: '2h', label: 'Past 2 Hours' },
    { value: '6h', label: 'Past 6 Hours' },
    { value: '12h', label: 'Past 12 Hours' },
    { value: '1d', label: 'Past 1 Day' },
    { value: '3d', label: 'Past 3 Days' },
    { value: '7d', label: 'Past 7 Days' },
    { value: 'all', label: 'All Time' },
  ];

  // Get the latest timestamp for water level indicator
  const getLatestTimestamp = () => {
    if (filteredData.length === 0) return 'No data';
    const latest = filteredData[filteredData.length - 1];
    return `${latest.date} ${latest.time}`;
  };

  return (
  <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
    {/* Controls */}
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${(refreshing || loading) ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          
          {stats && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{filteredData.length} readings</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Range Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Time Range Selection */}
        <div>
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={!useCustomRange}
                onChange={() => setUseCustomRange(false)}
                className="text-blue-600"
              />
              Quick Select
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={useCustomRange}
                onChange={() => setUseCustomRange(true)}
                className="text-blue-600"
              />
              Custom Range
            </label>
          </div>
          
          {!useCustomRange && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Custom Date Range Selection */}
        {useCustomRange && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Start Date:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Start Time:</label>
                <input
                  type="time"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">End Date:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">End Time:</label>
                <input
                  type="time"
                  value={customEndTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {error && (
      <motion.div 
        className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="font-medium">Error:</strong>
          <p className="mt-1">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-2 text-sm underline hover:no-underline disabled:opacity-50"
          >
            Try again
          </button>
        </div>
      </motion.div>
    )}

    {/* Main Content - Analysis Data, Chart and Water Level Indicator */}
    {chartData.length > 0 && (
      <motion.div 
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Analysis Data at Top */}
        {stats && (
          <div className="flex items-center gap-4 mb-6">
            <div className={`px-3 py-2 rounded-md text-sm font-medium border ${getStatusColor()}`}>
              {getDepthStatus()}
            </div>
            
            <div className="bg-white rounded-md p-3 shadow-sm border border-slate-200">
              <div className="text-lg font-bold text-slate-800">{stats.avgDepth.toFixed(2)} m</div>
              <div className="text-xs text-slate-500">Average Depth</div>
            </div>
            
            <div className="flex items-center gap-2">
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
                  <div className="w-3 h-3 bg-blue-500 mr-2"></div>
                  <div className="text-xs font-medium text-slate-700">Very Shallow (≤2m)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart and Water Level Indicator Side by Side */}
        <div className="flex gap-6">
          {/* Left side - Chart */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Depth Variation Over Time</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value, index) => {
                      // Show every nth tick based on data length
                      const showEvery = Math.max(1, Math.floor(chartData.length / 10));
                      return index % showEvery === 0 ? value : '';
                    }}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="depth" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#2563eb' }}
                    activeDot={{ r: 5, fill: '#1d4ed8' }}
                    name="Average Depth (m)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Right side - Water Level Indicator */}
          <div className="w-80 h-96 flex-shrink-0">
            <WaterLevelIndicator
              // currentLevel={stats ? stats.avgDepth : 0}
              // maxLevel={stats ? stats.maxDepth : 10}
              // dangerLevel={stats ? stats.maxDepth * 0.8 : 8}
              // warningLevel={stats ? stats.maxDepth * 0.6 : 6}
              // normalLevel={stats ? stats.maxDepth * 0.4 : 4}
              currentLevel={stats ? stats.avgDepth : 0}
              maxLevel={chartData.length > 0 ? Math.max(...chartData.map(d => d.depth)) : 10}
              dangerLevel={chartData.length > 0 ? Math.max(...chartData.map(d => d.depth)) * 0.8 : 8}
              warningLevel={chartData.length > 0 ? Math.max(...chartData.map(d => d.depth)) * 0.6 : 6}
              normalLevel={chartData.length > 0 ? Math.max(...chartData.map(d => d.depth)) * 0.4 : 4}
              
              isInitialRender={true}
              getStatus={getDepthStatus}
              getStatusColorRGB={() => {
                const status = getDepthStatus();
                switch (status) {
                  case 'Very Deep':
                    return 'rgb(239, 68, 68)'; // Red 
                  case 'Deep':
                    return 'rgb(251, 146, 60)'; // Orange
                  case 'Medium':
                    return 'rgb(234, 179, 8)'; // Yellow
                  case 'Shallow':
                    return 'rgb(34, 197, 94)'; // Green
                  case 'Very Shallow':    
                    return 'rgb(59, 130, 246)'; // Blue
                  default:
                    return 'rgb(156, 163, 175)'; // Gray  
                    }
                  }}
              location={ip}
              lastUpdated={getLatestTimestamp()}
            />
          </div>
        </div>
      </motion.div>
    )}


    {/* Loading State */}
    {loading && !error && (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading data...</span>
        </div>
      </div>
    )}

    {/* No Data State */}
    {!loading && !error && filteredData.length === 0 && timestamps.length === 0 && (
      <div className="text-center py-12 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No data available for the selected time range.</p>
        <p className="text-sm mt-2">Try selecting a different time range or refresh the data.</p>
      </div>
    )}
  </div>
);
};

export default RiverDepthVisualization;