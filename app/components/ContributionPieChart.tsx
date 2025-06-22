"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ContributionPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

const ContributionPieChart = ({ data }: ContributionPieChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Calculate total value for percentage
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set pie chart center and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;
    const innerRadius = radius * 0.5; // For donut chart

    // Add chart title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Discharge Contribution', centerX, 30);

    // Draw sections
    let startAngle = -Math.PI / 2; // Start from top
    
    // First pass: Draw the pie slices
    data.forEach((item) => {
      const sliceAngle = (item.value / total) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;
      
      // Draw slice with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = item.color;
      ctx.fill();
      
      // Draw inner circle for donut effect
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = 'white';
      ctx.fill();
      
      startAngle = endAngle;
    });
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Second pass: Add percentage labels and connecting lines
    startAngle = -Math.PI / 2;
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      
      // Calculate position for label line
      const labelDistance = radius * 1.2;
      const textDistance = radius * 1.4;
      
      const lineX = centerX + Math.cos(midAngle) * radius;
      const lineY = centerY + Math.sin(midAngle) * radius;
      
      const labelX = centerX + Math.cos(midAngle) * labelDistance;
      const labelY = centerY + Math.sin(midAngle) * labelDistance;
      
      const textX = centerX + Math.cos(midAngle) * textDistance;
      let textY = centerY + Math.sin(midAngle) * textDistance;
      
      // Adjust vertical spacing for labels to prevent overlap
      if (index > 0 && index < data.length - 1) {
        const prevItem = data[index - 1];
        const prevValue = prevItem.value / total;
        const prevMidAngle = startAngle - (prevValue * Math.PI);
        
        const prevTextY = centerY + Math.sin(prevMidAngle) * textDistance;
        
        // If labels are too close, adjust vertical position
        if (Math.abs(textY - prevTextY) < 20) {
          textY = prevTextY + 25;
        }
      }
      
      // Draw connecting line to label
      ctx.beginPath();
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(labelX, labelY);
      ctx.lineTo(textX, textY);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Add small dot at bend point
      ctx.beginPath();
      ctx.arc(labelX, labelY, 2, 0, 2 * Math.PI);
      ctx.fillStyle = item.color;
      ctx.fill();
      
      // Calculate percentage
      const percentage = ((item.value / total) * 100).toFixed(1);
      
      // Draw label background (pill shape)
      const labelText = `${item.name}: ${percentage}%`;
      const labelWidth = ctx.measureText(labelText).width + 16;
      const labelHeight = 22;
      const labelRadius = labelHeight / 2;
      
      ctx.beginPath();
      ctx.moveTo(textX - labelWidth / 2 + labelRadius, textY - labelHeight / 2);
      ctx.lineTo(textX + labelWidth / 2 - labelRadius, textY - labelHeight / 2);
      ctx.arc(textX + labelWidth / 2 - labelRadius, textY, labelRadius, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(textX - labelWidth / 2 + labelRadius, textY + labelHeight / 2);
      ctx.arc(textX - labelWidth / 2 + labelRadius, textY, labelRadius, Math.PI / 2, -Math.PI / 2, true);
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
      
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add percentage text
      ctx.fillStyle = '#1f2937'; // Gray-800
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, textX, textY);
      
      startAngle = endAngle;
    });
    
    // Draw center circle with total
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius * 0.9, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(209, 213, 219, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add total text
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total:', centerX, centerY - 10);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`${total.toFixed(2)} m³/s`, centerX, centerY + 12);

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

export default ContributionPieChart; 