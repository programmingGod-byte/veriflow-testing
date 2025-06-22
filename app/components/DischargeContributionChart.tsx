"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DischargeContributionChartProps {
  data: {
    id: number;
    discharge: number;
    percentage: number;
  }[];
  totalDischarge: number;
}

// Define interface for label info
interface LabelInfo {
  id: number;
  percentage: number;
  angle: number;
  significant: boolean;
}

const DischargeContributionChart = ({ 
  data, 
  totalDischarge 
}: DischargeContributionChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate a color based on section number
  const getSectionColor = (section: number) => {
    const colors = [
      'rgba(239, 68, 68, 0.9)',    // Section 1 - Red (red-500)
      'rgba(59, 130, 246, 0.9)',   // Section 2 - Blue (blue-500)
      'rgba(234, 179, 8, 0.9)',    // Section 3 - Yellow (yellow-500)
      'rgba(20, 184, 166, 0.9)',   // Section 4 - Teal (teal-500)
      'rgba(139, 92, 246, 0.9)',   // Section 5 - Purple (purple-500)
      'rgba(147, 51, 234, 0.9)',   // Section 6 - Deep Purple (purple-600)
      'rgba(6, 182, 212, 0.9)',    // Section 7 - Cyan (cyan-500)
      'rgba(249, 115, 22, 0.9)',   // Section 8 - Orange (orange-500)
      'rgba(245, 158, 11, 0.9)',   // Section 9 - Amber (amber-500)
      'rgba(34, 197, 94, 0.9)'     // Section 10 - Green (green-500)
    ];
    
    // Section numbers are 1-based, array indices are 0-based
    return colors[(section - 1) % colors.length];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    // Initial setup
    setCanvasDimensions();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background if needed
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate center point and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.6; // Reduced radius to leave space for labels
    
    // Sort data by discharge (descending) to make pie chart more readable
    const sortedData = [...data].sort((a, b) => b.discharge - a.discharge);
    
    // Draw title with nice style
    ctx.fillStyle = '#1e3a8a'; // dark blue color (blue-900)
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Discharge Contribution by Section', centerX, 30);
    
    // Add total info
    ctx.font = '14px Arial';
    ctx.fillStyle = '#1e40af'; // blue-800
    ctx.fillText(`Total: ${totalDischarge.toFixed(2)} m³/s`, centerX, 55);
    
    // Draw pie chart with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    let startAngle = 0;
    const labelInfo: LabelInfo[] = []; // Store label information to draw after the pie
    
    // First pass - draw the pie slices
    sortedData.forEach(d => {
      const sectionId = d.id;
      const sliceAngle = (d.percentage / 100) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      // Fill with color
      ctx.fillStyle = getSectionColor(sectionId);
      ctx.fill();
      
      // Draw slice border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Calculate midpoint angle for label
      const midAngle = startAngle + sliceAngle / 2;
      
      // Store label information for later drawing
      labelInfo.push({
        id: sectionId,
        percentage: d.percentage,
        angle: midAngle,
        significant: d.percentage > 5
      });
      
      startAngle += sliceAngle;
    });
    
    // Turn off shadow for the rest of the drawing
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Second pass - draw labels and leader lines
    labelInfo.forEach(info => {
      const { id, percentage, angle, significant } = info;
      
      // Calculate label positions
      const labelRadius = radius * 1.2; // Distance from center for label line start
      const labelDistance = radius * 1.4; // Distance from center for label text
      
      // For readability, group angles into upper and lower hemispheres
      const isRightHemisphere = angle < Math.PI / 2 || angle > (3 * Math.PI) / 2;
      
      // Start point of leader line (on the pie)
      const lineStartX = centerX + Math.cos(angle) * radius;
      const lineStartY = centerY + Math.sin(angle) * radius;
      
      // Middle control point for line
      const controlX = centerX + Math.cos(angle) * labelRadius;
      const controlY = centerY + Math.sin(angle) * labelRadius;
      
      // End point for leader line and text positioning
      const lineEndX = centerX + Math.cos(angle) * labelDistance;
      const lineEndY = centerY + Math.sin(angle) * labelDistance;
      
      // Extra offset for text
      const textOffsetX = isRightHemisphere ? 10 : -10;
      
      // Draw leader line
      ctx.beginPath();
      ctx.moveTo(lineStartX, lineStartY);
      ctx.lineTo(controlX, controlY);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw small dot at the intersection with the pie
      ctx.beginPath();
      ctx.arc(lineStartX, lineStartY, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      
      // Only draw label text for significant slices
      if (significant) {
        // Draw label container
        const labelWidth = 80;
        const labelHeight = 30;
        const labelPadding = 5;
        
        const labelBgX = isRightHemisphere ? lineEndX : lineEndX - labelWidth;
        const labelBgY = lineEndY - labelHeight / 2;
        
        // Background for the label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.strokeStyle = getSectionColor(id);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(labelBgX, labelBgY, labelWidth, labelHeight, 5);
        ctx.fill();
        ctx.stroke();
        
        // Draw section text
        ctx.fillStyle = '#1f2937'; // Gray-800
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = isRightHemisphere ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Section ${id}`, isRightHemisphere ? labelBgX + labelPadding : labelBgX + labelWidth - labelPadding, labelBgY + labelHeight / 3);
        
        // Draw percentage
        ctx.font = '11px Arial';
        ctx.fillText(`${percentage.toFixed(1)}%`, isRightHemisphere ? labelBgX + labelPadding : labelBgX + labelWidth - labelPadding, labelBgY + labelHeight * 2/3);
      }
    });
    
    // Draw a subtle donut hole in the center
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(209, 213, 219, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw central info
    ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${sortedData.length}`, centerX, centerY - 8);
    ctx.font = '10px Arial';
    ctx.fillText('Sections', centerX, centerY + 8);
    
    // Draw compact legend for smaller sections
    const smallSections = labelInfo.filter(info => !info.significant);
    if (smallSections.length > 0) {
      const legendX = 20;
      const legendY = canvas.height - 20 - (smallSections.length * 20);
      const legendWidth = 150;
      const legendHeight = (smallSections.length * 20) + 10;
      
      // Draw legend background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
      ctx.strokeStyle = 'rgba(209, 213, 219, 1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
      
      // Draw legend title
      ctx.fillStyle = '#4b5563';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Small Contributions:', legendX + 5, legendY + 5);
      
      // Draw legend items
      smallSections.forEach((info, index) => {
        const y = legendY + 20 + (index * 15);
        
        // Draw color square
        ctx.fillStyle = getSectionColor(info.id);
        ctx.fillRect(legendX + 10, y, 10, 10);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(legendX + 10, y, 10, 10);
        
        // Draw text
        ctx.fillStyle = '#4b5563';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Section ${info.id}: ${info.percentage.toFixed(1)}%`, legendX + 25, y + 5);
      });
    }
    
    // Add resize handler
    const handleResize = () => {
      setCanvasDimensions();
      // Redraw the chart on resize
      // (Relying on the component rerendering)
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, totalDischarge]);
  
  return (
    <motion.div 
      className="relative w-full h-72 md:h-96 bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200"
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

export default DischargeContributionChart; 