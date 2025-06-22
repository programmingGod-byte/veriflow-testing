"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface VelocityProfileGraphProps {
  data: {
    depth: number;
    velocity: number;
  }[];
}

const VelocityProfileGraph = ({ data }: VelocityProfileGraphProps) => {
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
      top: 50,
      right: 40,
      bottom: 60,
      left: 80,
    };

    // Calculate chart dimensions
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;

    // Sort data by depth
    const sortedData = [...data].sort((a, b) => a.depth - b.depth);

    // Find max values for scaling
    const maxDepth = Math.max(...sortedData.map((d) => d.depth)) * 1.1;
    const maxVelocity = Math.max(...sortedData.map((d) => d.velocity)) * 1.1;

    // Draw background and border
    ctx.fillStyle = "#f8fafc"; // Slate-50
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = "#1e40af"; // Blue-800
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Velocity-Depth Profile", canvas.width / 2, 30);

    // Draw axes
    ctx.strokeStyle = "#475569"; // Slate-600
    ctx.lineWidth = 1.5;
    
    // Y-axis (depth)
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();
    
    // X-axis (velocity)
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();

    // Draw grid lines with lighter color
    ctx.strokeStyle = "#e2e8f0"; // Slate-200
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (depth)
    const depthStep = Math.ceil(maxDepth / 5);
    for (let i = 0; i <= maxDepth; i += depthStep) {
      const y = margin.top + (i / maxDepth) * chartHeight;
      
      ctx.beginPath();
      ctx.moveTo(margin.left - 5, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      // Y-axis labels
      ctx.fillStyle = "#64748b"; // Slate-500
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`${i} m`, margin.left - 10, y);
    }
    
    // Vertical grid lines (velocity)
    const velocityStep = Math.ceil(maxVelocity / 5);
    for (let i = 0; i <= maxVelocity; i += velocityStep) {
      const x = margin.left + (i / maxVelocity) * chartWidth;
      
      ctx.beginPath();
      ctx.moveTo(x, margin.top + chartHeight + 5);
      ctx.lineTo(x, margin.top);
      ctx.stroke();
      
      // X-axis labels
      ctx.fillStyle = "#64748b"; // Slate-500
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`${i} m/s`, x, margin.top + chartHeight + 10);
    }
    
    // Axis labels
    ctx.fillStyle = "#1e293b"; // Slate-800
    ctx.font = "bold 14px Arial";
    
    // Y-axis label
    ctx.save();
    ctx.translate(25, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Depth (m)", 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Velocity (m/s)", margin.left + chartWidth / 2, canvas.height - 10);

    // Draw data bars
    const barWidth = Math.min(30, chartWidth / (sortedData.length * 2));
    
    // Calculate average velocity
    const avgVelocity = sortedData.reduce((sum, item) => sum + item.velocity, 0) / sortedData.length;

    sortedData.forEach((point, index) => {
      const x = margin.left;
      const y = margin.top + (point.depth / maxDepth) * chartHeight;
      const width = (point.velocity / maxVelocity) * chartWidth;
      const barHeight = Math.min(barWidth, chartHeight / (sortedData.length + 1));
      
      // Create gradient based on velocity value
      const gradient = ctx.createLinearGradient(x, y, x + width, y);
      
      // Use color gradient based on relation to average
      if (point.velocity > avgVelocity * 1.2) {
        // Higher than average - blue to purple
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)"); // Blue-500
        gradient.addColorStop(1, "rgba(139, 92, 246, 0.8)"); // Purple-500
      } else if (point.velocity < avgVelocity * 0.8) {
        // Lower than average - green to teal
        gradient.addColorStop(0, "rgba(52, 211, 153, 0.8)"); // Green-400
        gradient.addColorStop(1, "rgba(20, 184, 166, 0.8)"); // Teal-500
      } else {
        // Near average - blue to cyan
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)"); // Blue-500
        gradient.addColorStop(1, "rgba(6, 182, 212, 0.8)"); // Cyan-500
      }
      
      // Draw bar with shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw rounded bar
      const radius = Math.min(barHeight / 2, 5);
      
      ctx.beginPath();
      ctx.moveTo(x, y - barHeight / 2 + radius);
      ctx.lineTo(x, y + barHeight / 2 - radius);
      ctx.quadraticCurveTo(x, y + barHeight / 2, x + radius, y + barHeight / 2);
      ctx.lineTo(x + width - radius, y + barHeight / 2);
      ctx.quadraticCurveTo(x + width, y + barHeight / 2, x + width, y + barHeight / 2 - radius);
      ctx.lineTo(x + width, y - barHeight / 2 + radius);
      ctx.quadraticCurveTo(x + width, y - barHeight / 2, x + width - radius, y - barHeight / 2);
      ctx.lineTo(x + radius, y - barHeight / 2);
      ctx.quadraticCurveTo(x, y - barHeight / 2, x, y - barHeight / 2 + radius);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Reset shadow for text
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw value label
      ctx.fillStyle = "#f8fafc"; // Slate-50
      ctx.strokeStyle = "#1e3a8a"; // Blue-900
      ctx.lineWidth = 0.5;
      
      // Create pill-shaped value box
      const valueText = `${point.velocity.toFixed(2)} m/s`;
      const textWidth = ctx.measureText(valueText).width + 10;
      const textHeight = 18;
      const textRadius = textHeight / 2;
      const textX = x + width + 10;
      const textY = y;
      
      // Draw pill shape as background for text
      ctx.beginPath();
      ctx.moveTo(textX - textWidth / 2 + textRadius, textY - textHeight / 2);
      ctx.lineTo(textX + textWidth / 2 - textRadius, textY - textHeight / 2);
      ctx.arc(textX + textWidth / 2 - textRadius, textY, textRadius, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(textX - textWidth / 2 + textRadius, textY + textHeight / 2);
      ctx.arc(textX - textWidth / 2 + textRadius, textY, textRadius, Math.PI / 2, -Math.PI / 2, true);
      ctx.closePath();
      
      // Use color based on velocity
      if (point.velocity > avgVelocity * 1.2) {
        ctx.fillStyle = "#818cf8"; // Indigo-400
      } else if (point.velocity < avgVelocity * 0.8) {
        ctx.fillStyle = "#34d399"; // Green-400
      } else {
        ctx.fillStyle = "#0ea5e9"; // Sky-500
      }
      
      ctx.fill();
      ctx.stroke();
      
      // Add value text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(valueText, textX, textY);
    });
    
    // Draw a connecting line through data points for profile visualization
    ctx.beginPath();
    sortedData.forEach((point, index) => {
      const x = margin.left + (point.velocity / maxVelocity) * chartWidth;
      const y = margin.top + (point.depth / maxDepth) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = "rgba(30, 64, 175, 0.8)"; // Blue-800
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();
    
    // Add data points
    sortedData.forEach((point) => {
      const x = margin.left + (point.velocity / maxVelocity) * chartWidth;
      const y = margin.top + (point.depth / maxDepth) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb"; // Blue-600
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    
    // Add legend
    const legendX = margin.left + chartWidth - 180;
    const legendY = margin.top + 25;
    const legendWidth = 170;
    const legendHeight = 80;
    const legendPadding = 10;
    
    // Draw legend background
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "#e2e8f0"; // Slate-200
    ctx.lineWidth = 1;
    
    // Rounded rectangle for legend
    const legendRadius = 8;
    ctx.beginPath();
    ctx.moveTo(legendX + legendRadius, legendY);
    ctx.lineTo(legendX + legendWidth - legendRadius, legendY);
    ctx.quadraticCurveTo(legendX + legendWidth, legendY, legendX + legendWidth, legendY + legendRadius);
    ctx.lineTo(legendX + legendWidth, legendY + legendHeight - legendRadius);
    ctx.quadraticCurveTo(legendX + legendWidth, legendY + legendHeight, legendX + legendWidth - legendRadius, legendY + legendHeight);
    ctx.lineTo(legendX + legendRadius, legendY + legendHeight);
    ctx.quadraticCurveTo(legendX, legendY + legendHeight, legendX, legendY + legendHeight - legendRadius);
    ctx.lineTo(legendX, legendY + legendRadius);
    ctx.quadraticCurveTo(legendX, legendY, legendX + legendRadius, legendY);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    // Legend title
    ctx.fillStyle = "#1e293b"; // Slate-800
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Velocity Categories:", legendX + legendPadding, legendY + legendPadding);
    
    // Legend items
    const categories = [
      { label: "High (>20% above avg)", color: "#818cf8" }, // Indigo-400
      { label: "Average (±20%)", color: "#0ea5e9" }, // Sky-500
      { label: "Low (<20% below avg)", color: "#34d399" }, // Green-400
    ];
    
    const itemHeight = 18;
    const colorBoxSize = 12;
    
    categories.forEach((category, i) => {
      const itemY = legendY + legendPadding + 20 + i * itemHeight;
      
      // Color box
      ctx.fillStyle = category.color;
      ctx.fillRect(legendX + legendPadding, itemY, colorBoxSize, colorBoxSize);
      
      // Label
      ctx.fillStyle = "#334155"; // Slate-700
      ctx.font = "12px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(category.label, legendX + legendPadding + colorBoxSize + 6, itemY + colorBoxSize / 2);
    });
    
  }, [data]);

  return (
    <motion.div 
      className="relative w-full h-72 md:h-96 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  );
};

export default VelocityProfileGraph; 