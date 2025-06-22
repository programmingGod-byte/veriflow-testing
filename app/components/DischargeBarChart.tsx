"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DischargeBarChartProps {
  data: {
    day: string;
    value: number;
  }[];
}

const DischargeBarChart = ({ data }: DischargeBarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Return early if data is empty
    if (!data || data.length === 0) return;
    
    // Filter out invalid data points
    const validData = data.filter(d => typeof d.value === 'number' && isFinite(d.value) && !isNaN(d.value));
    
    // Return if no valid data remains
    if (validData.length === 0) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set margins
    const margin = {
      top: 50,
      right: 40,
      bottom: 60,
      left: 70,
    };
    
    // Calculate chart dimensions
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Find max discharge for scaling (with fallback)
    const maxValue = Math.max(...validData.map((d) => d.value));
    const maxDischarge = isFinite(maxValue) ? maxValue * 1.1 : 1;
    
    // Calculate bar width
    const barWidth = chartWidth / validData.length * 0.7;
    const barSpacing = chartWidth / validData.length * 0.3;
    
    // Set background
    ctx.fillStyle = 'rgba(250, 251, 252, 0.8)'; // Lighter background
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)'; // slate-200 - lighter grid lines
    ctx.lineWidth = 1;
    
    // Draw y-axis grid lines
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + chartHeight - (i / 5) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      // Add y-axis labels
      const value = (maxDischarge * i / 5).toFixed(2);
      ctx.fillStyle = '#94a3b8'; // slate-400 - softer text
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${value} m³/s`, margin.left - 10, y + 4);
    }
    
    // Add chart title
    ctx.fillStyle = '#60a5fa'; // blue-400 - softer blue
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Section Discharge Distribution', canvas.width / 2, margin.top / 2);
    
    // Calculate average discharge (safely)
    const sum = validData.reduce((acc, item) => acc + item.value, 0);
    const avgDischarge = validData.length > 0 ? sum / validData.length : 0;
    
    // Add subtitle with average discharge
    ctx.fillStyle = '#64748b'; // slate-500 - softer text
    ctx.font = '12px Arial';
    ctx.fillText(`Average: ${avgDischarge.toFixed(2)} m³/s`, canvas.width / 2, margin.top / 2 + 20);
    
    // Add x-axis title
    ctx.fillStyle = '#64748b'; // slate-500 - softer text
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Section', margin.left + chartWidth / 2, canvas.height - 10);
    
    // Add y-axis title
    ctx.save();
    ctx.translate(15, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Discharge (m³/s)', 0, 0);
    ctx.restore();
    
    // Set shadow for bars
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'; // Lighter shadow
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Get min and max values for coloring
    const minValue = Math.min(...validData.map(item => item.value));
    const maxValueForColor = Math.max(...validData.map(item => item.value));
    
    // Draw bars with gradient
    validData.forEach((d, i) => {
      // Calculate positions
      const x = margin.left + i * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = maxDischarge > 0 ? (d.value / maxDischarge) * chartHeight : 0;
      const y = margin.top + chartHeight - barHeight;
      const radius = 6;
      
      // Safety check for valid coordinates
      if (!isFinite(x) || !isFinite(y) || !isFinite(barHeight)) {
        return; // Skip this bar if any value is invalid
      }
      
      let gradientColors;
      
      // Check if this bar represents the highest or lowest value
      const isHighest = d.value === maxValueForColor;
      const isLowest = d.value === minValue;
      
      if (isHighest) {
        gradientColors = {
          top: 'rgba(248, 113, 113, 0.85)', // red-400 for highest - softer red
          bottom: 'rgba(252, 165, 165, 0.7)' // red-300
        };
      } else if (isLowest) {
        gradientColors = {
          top: 'rgba(96, 165, 250, 0.85)', // blue-400 for lowest - softer blue
          bottom: 'rgba(147, 197, 253, 0.7)' // blue-300
        };
      } else {
        gradientColors = {
          top: 'rgba(52, 211, 153, 0.85)', // emerald-400 for others - softer green
          bottom: 'rgba(110, 231, 183, 0.7)' // emerald-300
        };
      }
      
      // Only create gradient if we have a valid bar height
      if (barHeight > 0) {
        // Create gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, gradientColors.top);
        gradient.addColorStop(1, gradientColors.bottom);
        ctx.fillStyle = gradient;
      } else {
        // Use solid color as fallback for bars with no height
        ctx.fillStyle = gradientColors.top;
      }
      
      // Draw rounded top bar
      ctx.beginPath();
      ctx.moveTo(x, y + barHeight);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.closePath();
      ctx.fill();
      
      // Add subtle border to bar
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // Slightly more pronounced border
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add date labels on x-axis with rotation for better fit
      ctx.save();
      ctx.translate(x + barWidth / 2, margin.top + chartHeight + 15);
      ctx.rotate(Math.PI / 6); // Rotate labels slightly
      ctx.fillStyle = '#94a3b8'; // slate-400 - softer text
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(d.day, 0, 0);
      ctx.restore();
    });
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add value labels above bars
    validData.forEach((d, i) => {
      const x = margin.left + i * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2;
      const barHeight = maxDischarge > 0 ? (d.value / maxDischarge) * chartHeight : 0;
      const y = margin.top + chartHeight - barHeight;
      
      // Skip if position is invalid
      if (!isFinite(x) || !isFinite(y)) return;
      
      // Create value bubble
      const valueText = d.value.toFixed(2);
      const textWidth = ctx.measureText(valueText).width + 10;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(x - textWidth / 2, y - 25, textWidth, 20, 5);
      ctx.fill();
      
      // Add subtle border to bubble
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)'; // slate-300 - softer border
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add connector line
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y - 25);
      ctx.stroke();
      
      // Add text
      ctx.fillStyle = '#3b82f6'; // blue-500 - softer text
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(valueText, x, y - 15);
    });
    
    // Draw chart border
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)'; // slate-200 - softer border
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, margin.top, chartWidth, chartHeight);
    
    // Add trend line (only if we have enough valid points)
    if (validData.length > 1) {
      const points = validData.map((d, i) => {
        const x = margin.left + i * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2;
        const y = margin.top + chartHeight - (maxDischarge > 0 ? (d.value / maxDischarge) * chartHeight : 0);
        return { x, y };
      });
      
      // Draw smooth curve through data points
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      
      // Last curve
      const last = points.length - 1;
      ctx.quadraticCurveTo(
        points[last].x,
        points[last].y,
        points[last].x,
        points[last].y
      );
      
      ctx.strokeStyle = 'rgba(252, 165, 165, 0.8)'; // red-300 - softer red
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add dots at data points
      points.forEach((point) => {
        ctx.fillStyle = 'rgba(248, 113, 113, 0.9)'; // red-400 - softer red
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add white border to dots
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }, [data]);
  
  return (
    <motion.div 
      className="relative w-full h-72 md:h-80 bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
      />
    </motion.div>
  );
};

export default DischargeBarChart; 