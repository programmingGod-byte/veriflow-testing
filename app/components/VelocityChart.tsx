"use client";

import { useRef, useEffect, useState ,useContext} from 'react';
import { motion } from 'framer-motion';
import { MyContext } from '../providers';

interface VelocityData {
  section: number;
  velocity: number;
  depth: number;
  width: number;
  flowDirection: number;
  timestamp: string;
}

interface VelocityChartProps {
  flowDirection?: number;
}

const VelocityChart = ({ flowDirection: propFlowDirection }: VelocityChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {value,setValue} = useContext(MyContext);
  const [data, setData] = useState<VelocityData[]>([]);
  const [filteredData, setFilteredData] = useState<VelocityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("VALUE")
        console.log(value)
        if(!value.ip){
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
        // console.log(lines)
        const parsedData: VelocityData[] = lines.map(line => {
          const parts = line.trim().split(','); // Split by comma
          return {
            section: parseInt(parts[0]),
            velocity: parseFloat(parts[1]),
            depth: parseFloat(parts[2]),
            width: parseFloat(parts[3]),
            flowDirection: parseFloat(parts[4]),
            timestamp: parts[5].trim() // Timestamp is already complete in column 6
          };
        });

        setData(parsedData);
        
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
      setFilteredData(filtered);
    }
  }, [selectedDate, selectedTime, data]);

  // Canvas drawing logic
  useEffect(() => {
    if (filteredData.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set margins
    const margin = {
      top: 40,
      right: 30,
      bottom: 50,
      left: 60
    };
    
    // Calculate chart dimensions
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Find max velocity for scaling
    const maxVelocity = Math.max(...filteredData.map(d => d.velocity)) * 1.1;
    const currentFlowDirection = filteredData[0]?.flowDirection || propFlowDirection || 0;
    
    // Calculate bar width
    const barWidth = chartWidth / filteredData.length * 0.7;
    const barSpacing = chartWidth / filteredData.length * 0.3;
    
    // Draw background grid
    ctx.fillStyle = 'rgba(250, 251, 252, 0.8)';
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);
    
    // Draw coordinate system 
    ctx.strokeStyle = 'rgba(209, 213, 219, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw grid lines
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + chartHeight - (i / 5) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      // Add y-axis labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.fillText((maxVelocity * i / 5).toFixed(2), margin.left - 10, y + 4);
    }
    
    // Add x-axis title
    ctx.fillStyle = '#64748b';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Section Number (Bank to Bank)', margin.left + chartWidth / 2, canvas.height - 10);
    
    // Add y-axis title
    ctx.save();
    ctx.translate(20, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Velocity (m/s)', 0, 0);
    ctx.restore();
    
    // Add chart title
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`River Velocity Profile by Section`, canvas.width / 2, margin.top / 2);
    
    // Add flow direction and timestamp labels
    ctx.font = '13px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Flow Direction: ${currentFlowDirection.toFixed(2)}°`, canvas.width / 2, margin.top / 2 + 20);
    
    // Draw bars with rounded tops and shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // First pass to draw bars
    filteredData.forEach((d, i) => {
      const x = margin.left + (i * (barWidth + barSpacing)) + barSpacing / 2;
      const y = margin.top + chartHeight - (d.velocity / maxVelocity) * chartHeight;
      const height = (d.velocity / maxVelocity) * chartHeight;
      const radius = barWidth / 4;
      
      // Create gradient for bars
      const gradient = ctx.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, 'rgba(147, 197, 253, 0.85)');
      gradient.addColorStop(1, 'rgba(96, 165, 250, 0.65)');
      
      // Draw bar with rounded tops
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + height);
      ctx.closePath();
      ctx.fill();
    });
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw line connecting the data points
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    filteredData.forEach((d, i) => {
      const x = margin.left + (i * (barWidth + barSpacing)) + barSpacing / 2 + barWidth / 2;
      const y = margin.top + chartHeight - (d.velocity / maxVelocity) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw value labels and data points
    filteredData.forEach((d, i) => {
      const x = margin.left + (i * (barWidth + barSpacing)) + barSpacing / 2 + barWidth / 2;
      const y = margin.top + chartHeight - (d.velocity / maxVelocity) * chartHeight;
      
      // Create value background
      const valueText = d.velocity.toFixed(4);
      const textWidth = ctx.measureText(valueText).width + 10;
      const valueBgY = y - 25;
      
      // Draw value bubble
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(x - textWidth/2, valueBgY, textWidth, 20, 5);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw connecting line to data point
      ctx.beginPath();
      ctx.moveTo(x, valueBgY + 20);
      ctx.lineTo(x, y - 5);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add value text
      ctx.fillStyle = '#3b82f6';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(valueText, x, valueBgY + 10);
      
      // Add small dot at data point
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add stroke to dots
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Add section number on x-axis
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(d.section.toString(), x, margin.top + chartHeight + 15);
    });
    
    // Draw chart border
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, margin.top, chartWidth, chartHeight);
    
  }, [filteredData, propFlowDirection]);

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
  );
};

export default VelocityChart;