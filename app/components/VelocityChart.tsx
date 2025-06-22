"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VelocityChartProps {
  data: {
    section: number;
    velocity: number;
  }[];
  flowDirection: number;
}

const VelocityChart = ({ data, flowDirection }: VelocityChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
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
    const maxVelocity = Math.max(...data.map(d => d.velocity)) * 1.1;
    
    // Calculate bar width
    const barWidth = chartWidth / data.length * 0.7;
    const barSpacing = chartWidth / data.length * 0.3;
    
    // Draw background grid
    ctx.fillStyle = 'rgba(250, 251, 252, 0.8)'; // Even lighter gray background
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);
    
    // Draw coordinate system 
    ctx.strokeStyle = 'rgba(209, 213, 219, 0.3)'; // Lighter grid lines
    ctx.lineWidth = 1;
    
    // Draw grid lines
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + chartHeight - (i / 5) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      // Add y-axis labels
      ctx.fillStyle = '#94a3b8'; // slate-400 - softer text color
      ctx.font = '11px Arial';
      ctx.textAlign = 'right';
      ctx.fillText((maxVelocity * i / 5).toFixed(2), margin.left - 10, y + 4);
    }
    
    // Add x-axis title
    ctx.fillStyle = '#64748b'; // slate-500 - softer text
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
    ctx.fillStyle = '#60a5fa'; // blue-400 - softer blue
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`River Velocity Profile by Section`, canvas.width / 2, margin.top / 2);
    
    // Add flow direction label 
    ctx.font = '13px Arial';
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.fillText(`Flow Direction: ${flowDirection}°`, canvas.width / 2, margin.top / 2 + 20);
    
    // Draw bars with rounded tops and shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'; // Lighter shadow
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // First pass to draw bars
    data.forEach((d, i) => {
      const x = margin.left + (i * (barWidth + barSpacing)) + barSpacing / 2;
      const y = margin.top + chartHeight - (d.velocity / maxVelocity) * chartHeight;
      const height = (d.velocity / maxVelocity) * chartHeight;
      const radius = barWidth / 4;
      
      // Create gradient for bars - using softer blues
      const gradient = ctx.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, 'rgba(147, 197, 253, 0.85)'); // blue-300 with opacity
      gradient.addColorStop(1, 'rgba(96, 165, 250, 0.65)'); // blue-400 with opacity
      
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
    
    // Reset shadow for the rest of drawing
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw line connecting the data points
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)'; // red-400 with opacity - softer red
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = margin.left + (i * (barWidth + barSpacing)) + barSpacing / 2 + barWidth / 2;
      const y = margin.top + chartHeight - (d.velocity / maxVelocity) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw elegant inline value labels
    data.forEach((d, i) => {
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
      
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)'; // blue-300 with opacity
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw connecting line to data point
      ctx.beginPath();
      ctx.moveTo(x, valueBgY + 20);
      ctx.lineTo(x, y - 5);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)'; // slate-300 with opacity
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add value text
      ctx.fillStyle = '#3b82f6'; // blue-500 - softer than blue-800
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(valueText, x, valueBgY + 10);
      
      // Add small dot at data point
      ctx.fillStyle = '#f87171'; // red-400 - softer red
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add stroke to dots
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Add section number on x-axis
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(d.section.toString(), x, margin.top + chartHeight + 15);
    });
    
    // Draw chart border
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)'; // slate-200
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, margin.top, chartWidth, chartHeight);
    
  }, [data, flowDirection]);
  
  return (
    <motion.div 
      className="relative w-full h-72 md:h-96 bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
      />
    </motion.div>
  );
};

export default VelocityChart; 