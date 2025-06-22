"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface DischargeGraphProps {
  data: {
    date: string;
    discharge: number;
  }[];
}

const DischargeGraph = ({ data }: DischargeGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Chart margins
    const margin = {
      top: 40,
      right: 30,
      bottom: 60,
      left: 70,
    };
    
    // Calculate chart dimensions
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Find the max discharge for scaling
    const maxDischarge = Math.max(...sortedData.map(d => d.discharge)) * 1.1;
    
    // Format dates for display
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    };
    
    // Draw background
    ctx.fillStyle = "#ffffff"; // White background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = "#94a3b8"; // Slate-400 - even softer color
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Discharge Over Time", canvas.width / 2, 25);
    
    // Draw axes
    ctx.strokeStyle = "#cbd5e1"; // Slate-300 - softer color
    ctx.lineWidth = 1.5;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = "#f1f5f9"; // Slate-100 - even softer grid lines
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (discharge)
    const dischargeStep = Math.ceil(maxDischarge / 5);
    for (let i = 0; i <= maxDischarge; i += dischargeStep) {
      const y = margin.top + chartHeight - (i / maxDischarge) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(margin.left - 5, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      // Y-axis labels
      ctx.fillStyle = "#94a3b8"; // Slate-400 - softer color
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`${i} m³/s`, margin.left - 10, y);
    }
    
    // Format dates on x-axis
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#94a3b8"; // Slate-400 - softer color
    ctx.font = "12px Arial";

    for (let i = 0; i < 5; i++) {
      const x = margin.left + (i / 4) * chartWidth;
      const tickIndex = Math.floor((i / 4) * (sortedData.length - 1));
      const tickDate = sortedData[tickIndex].date;
      ctx.fillText(formatDate(tickDate), x, margin.top + chartHeight + 10);
    }
    
    // Axis labels
    ctx.fillStyle = "#94a3b8"; // Slate-400 - softer color
    ctx.font = "bold 14px Arial";
    
    // Y-axis label
    ctx.save();
    ctx.translate(20, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Discharge (m³/s)", 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Date", margin.left + chartWidth / 2, canvas.height - 15);
    
    // Calculate the average discharge
    const avgDischarge = sortedData.reduce((sum, item) => sum + item.discharge, 0) / sortedData.length;
    
    // Draw data area
    if (sortedData.length > 1) {
      // Create gradient for area
      const gradient = ctx.createLinearGradient(
        0, 
        margin.top, 
        0, 
        margin.top + chartHeight
      );
      gradient.addColorStop(0, "rgba(224, 242, 254, 0.7)"); // Sky-100 with opacity - softer color
      gradient.addColorStop(1, "rgba(248, 250, 252, 0.1)"); // Slate-50
      
      // Draw filled area
      ctx.beginPath();
      
      // Start at the bottom left
      ctx.moveTo(margin.left, margin.top + chartHeight);
      
      // Draw points along the line
      sortedData.forEach((point, index) => {
        const x = margin.left + (index / (sortedData.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (point.discharge / maxDischarge) * chartHeight;
        ctx.lineTo(x, y);
      });
      
      // Close the path to the bottom right
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw data line
    if (sortedData.length > 1) {
      // Create gradient for line
      const lineGradient = ctx.createLinearGradient(
        margin.left, 
        0, 
        margin.left + chartWidth, 
        0
      );
      lineGradient.addColorStop(0, "#bae6fd"); // Sky-200 - softer color
      lineGradient.addColorStop(0.5, "#93c5fd"); // Blue-300 - softer color
      lineGradient.addColorStop(1, "#c4b5fd"); // Violet-300 - softer color
      
      ctx.beginPath();
      sortedData.forEach((point, index) => {
        const x = margin.left + (index / (sortedData.length - 1)) * chartWidth;
        const y = margin.top + chartHeight - (point.discharge / maxDischarge) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    
    // Draw data points
    sortedData.forEach((point, index) => {
      const x = margin.left + (index / (Math.max(1, sortedData.length - 1))) * chartWidth;
      const y = margin.top + chartHeight - (point.discharge / maxDischarge) * chartHeight;
      
      // Determine color based on relation to average
      let pointColor;
      if (point.discharge > avgDischarge * 1.2) {
        pointColor = "#93c5fd"; // Blue-300 - softer color
      } else if (point.discharge < avgDischarge * 0.8) {
        pointColor = "#ddd6fe"; // Violet-200 - softer color
      } else {
        pointColor = "#bae6fd"; // Sky-200 - softer color
      }
      
      // Draw shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.05)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = pointColor;
      ctx.fill();
      
      // Draw point border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw tooltip on hover or for significant points
      const isSignificant = 
        point.discharge === Math.max(...sortedData.map(d => d.discharge)) || 
        point.discharge === Math.min(...sortedData.map(d => d.discharge));
      
      if (isSignificant) {
        const tooltipText = `${point.discharge.toFixed(2)} m³/s`;
        const tooltipWidth = ctx.measureText(tooltipText).width + 16;
        const tooltipHeight = 24;
        const tooltipRadius = 4;
        
        // Position tooltip above point
        const tooltipX = x - tooltipWidth / 2;
        const tooltipY = y - tooltipHeight - 8;
        
        // Draw tooltip background
        ctx.fillStyle = "#f8fafc"; // Slate-50 - softer color
        ctx.beginPath();
        ctx.moveTo(tooltipX + tooltipRadius, tooltipY);
        ctx.lineTo(tooltipX + tooltipWidth - tooltipRadius, tooltipY);
        ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY, tooltipX + tooltipWidth, tooltipY + tooltipRadius);
        ctx.lineTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight - tooltipRadius);
        ctx.quadraticCurveTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight, tooltipX + tooltipWidth - tooltipRadius, tooltipY + tooltipHeight);
        
        // Draw the pointer
        ctx.lineTo(x + 6, tooltipY + tooltipHeight);
        ctx.lineTo(x, y - 6);
        ctx.lineTo(x - 6, tooltipY + tooltipHeight);
        
        ctx.lineTo(tooltipX + tooltipRadius, tooltipY + tooltipHeight);
        ctx.quadraticCurveTo(tooltipX, tooltipY + tooltipHeight, tooltipX, tooltipY + tooltipHeight - tooltipRadius);
        ctx.lineTo(tooltipX, tooltipY + tooltipRadius);
        ctx.quadraticCurveTo(tooltipX, tooltipY, tooltipX + tooltipRadius, tooltipY);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = "#e2e8f0"; // Slate-200 - softer color
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw tooltip text
        ctx.fillStyle = "#94a3b8"; // Slate-400 - softer color
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tooltipText, x, tooltipY + tooltipHeight / 2);
      }
    });
    
    // Calculate trend
    if (sortedData.length > 2) {
      // Calculate simple trend (first vs last point)
      const firstDischarge = sortedData[0].discharge;
      const lastDischarge = sortedData[sortedData.length - 1].discharge;
      const dischargeDifference = ((lastDischarge - firstDischarge) / firstDischarge) * 100;
      
      const trendText = dischargeDifference > 0 
        ? `↗ Increasing (${dischargeDifference.toFixed(1)}%)`
        : dischargeDifference < 0
        ? `↘ Decreasing (${Math.abs(dischargeDifference).toFixed(1)}%)`
        : "→ Stable (0%)";
      
      const trendColor = dischargeDifference > 0 
        ? "#6ee7b7" // Emerald-300 - softer color
        : dischargeDifference < 0
        ? "#fca5a5" // Red-300 - softer color
        : "#cbd5e1"; // Slate-300 - softer color
      
      // Position at bottom right of chart
      const trendY = margin.top + chartHeight - 10;
      
      ctx.fillStyle = trendColor;
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(trendText, margin.left + chartWidth - 10, trendY);
    }
    
  }, [data]);

  return (
    <motion.div 
      className="relative w-full h-72 md:h-96 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  );
};

export default DischargeGraph; 