"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface DischargeContributionPieChartProps {
  data: {
    id: number;
    discharge: number;
    percentage: number;
  }[];
  totalDischarge: number;
}

// Define interface for label positions
interface LabelPosition {
  id: number;
  percentage: number;
  angle: number;
  significant: boolean;
  startAngle: number;
  endAngle: number;
}

const DischargeContributionPieChart = ({ 
  data, 
  totalDischarge 
}: DischargeContributionPieChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate a color based on section number - using softer pastel colors
  const getSectionColor = (section: number) => {
    const colors = [
      'rgba(252, 165, 165, 0.8)',   // Section 1 - Soft Red (red-300)
      'rgba(147, 197, 253, 0.8)',   // Section 2 - Soft Blue (blue-300)
      'rgba(253, 224, 71, 0.8)',    // Section 3 - Soft Yellow (yellow-300)
      'rgba(94, 234, 212, 0.8)',    // Section 4 - Soft Teal (teal-300)
      'rgba(196, 181, 253, 0.8)',   // Section 5 - Soft Purple (purple-300)
      'rgba(216, 180, 254, 0.8)',   // Section 6 - Soft Violet (violet-300)
      'rgba(103, 232, 249, 0.8)',   // Section 7 - Soft Cyan (cyan-300)
      'rgba(253, 186, 116, 0.8)',   // Section 8 - Soft Orange (orange-300)
      'rgba(251, 191, 36, 0.8)',    // Section 9 - Soft Amber (amber-400)
      'rgba(134, 239, 172, 0.8)'    // Section 10 - Soft Green (green-300)
    ];
    
    // Section numbers are 1-based, array indices are 0-based
    return colors[(section - 1) % colors.length];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Return early if data is empty
    if (!data || data.length === 0) return;
    
    // Filter out invalid data points
    const validData = data.filter(d => 
      typeof d.discharge === 'number' && isFinite(d.discharge) && !isNaN(d.discharge) &&
      typeof d.percentage === 'number' && isFinite(d.percentage) && !isNaN(d.percentage)
    );
    
    // Return if no valid data remains
    if (validData.length === 0) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    // Initial setup
    setCanvasDimensions();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate center point and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.55; // Reduced radius to leave space for labels
    
    // Sort data by discharge (descending) to make pie chart more readable
    const sortedData = [...validData].sort((a, b) => b.discharge - a.discharge);
    
    // Draw title with nice style
    ctx.fillStyle = '#60a5fa'; // Soft blue color (blue-400)
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Discharge Contribution by Section', centerX, 30);
    
    // Add total info
    ctx.font = '14px Arial';
    ctx.fillStyle = '#3b82f6'; // Soft blue color (blue-500)
    ctx.fillText(`Total: ${totalDischarge.toFixed(2)} m³/s`, centerX, 55);
    
    // Draw pie chart
    let startAngle = -Math.PI / 2; // Start from the top
    
    // Calculate total percentage (in case it doesn't add up to 100%)
    const totalPercentage = sortedData.reduce((sum, item) => sum + item.percentage, 0);
    
    // Store label information for organizing them
    const labelPositions: LabelPosition[] = [];
    
    // First pass - draw the pie slices
    sortedData.forEach(d => {
      const sectionId = d.id;
      // Normalize percentage if total isn't 100%
      const normalizedPercentage = totalPercentage > 0 ? (d.percentage / totalPercentage) * 100 : 0;
      const sliceAngle = (normalizedPercentage / 100) * 2 * Math.PI;
      
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
      
      // Store label information
      labelPositions.push({
        id: sectionId,
        percentage: d.percentage,
        angle: midAngle,
        significant: d.percentage >= 5, // Consider sections with >5% significant
        startAngle: startAngle,
        endAngle: startAngle + sliceAngle
      });
      
      startAngle += sliceAngle;
    });
    
    // Draw a white circle in the center (donut hole)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#f1f5f9'; // slate-100 - softer border
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add sections count in the center
    ctx.fillStyle = '#60a5fa'; // blue-400 - soft blue
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sortedData.length.toString(), centerX, centerY - 5);
    
    ctx.font = '12px Arial';
    ctx.fillText('Sections', centerX, centerY + 12);
    
    // Organize labels to prevent overlap
    const significantLabels = labelPositions.filter(label => label.significant);
    const insignificantLabels = labelPositions.filter(label => !label.significant);
    
    // Draw labels for significant sections
    significantLabels.forEach(label => {
      const midAngle = label.angle;
      
      // Calculate label position
      const labelDistance = radius * 1.3; // Distance from center
      const labelX = centerX + Math.cos(midAngle) * labelDistance;
      const labelY = centerY + Math.sin(midAngle) * labelDistance;
      
      // Draw line from pie to label
      const pieX = centerX + Math.cos(midAngle) * radius;
      const pieY = centerY + Math.sin(midAngle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(pieX, pieY);
      ctx.lineTo(labelX, labelY);
      ctx.strokeStyle = getSectionColor(label.id);
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Create label box
      const labelText = `Section ${label.id}`;
      const percentText = `${label.percentage.toFixed(1)}%`;
      const boxWidth = 80;
      const boxHeight = 35;
      const boxRadius = 5;
      
      // Determine text anchor point based on angle
      const isRightSide = Math.cos(midAngle) > 0;
      const isBottomHalf = Math.sin(midAngle) > 0;
      
      let boxX, boxY;
      
      if (isRightSide) {
        boxX = labelX;
      } else {
        boxX = labelX - boxWidth;
      }
      
      boxY = labelY - boxHeight / 2;
      
      // Draw label box with rounded corners
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, boxRadius);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = getSectionColor(label.id);
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add text
      ctx.fillStyle = '#64748b'; // slate-500 - softer text
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, boxX + boxWidth / 2, boxY + boxHeight * 0.35);
      
      ctx.font = 'bold 11px Arial';
      ctx.fillText(percentText, boxX + boxWidth / 2, boxY + boxHeight * 0.7);
    });
    
    // Draw legend for smaller sections
    if (insignificantLabels.length > 0) {
      const legendX = 5;
      const legendY = canvas.height - 30 - (insignificantLabels.length * 15);
      const legendWidth = 140;
      const legendHeight = (insignificantLabels.length * 15) + 25;
      
      // Draw legend background
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.rect(legendX, legendY, legendWidth, legendHeight);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0'; // slate-200 - softer border
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add legend title
      ctx.fillStyle = '#64748b'; // slate-500 - softer text
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Small Sections', legendX + 10, legendY + 15);
      
      // Draw legend items
      insignificantLabels.forEach((label, index) => {
        const itemY = legendY + 30 + (index * 15);
        
        // Draw color box
        ctx.fillStyle = getSectionColor(label.id);
        ctx.fillRect(legendX + 10, itemY - 8, 10, 10);
        
        // Draw label text
        ctx.fillStyle = '#64748b'; // slate-500 - softer text
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(
          `Section ${label.id} (${label.percentage.toFixed(1)}%)`,
          legendX + 25,
          itemY
        );
      });
    }
    
    // Set up resize handler
    const handleResize = () => {
      setCanvasDimensions();
      
      // Redraw everything when canvas size changes
      // In a real application, you would want to debounce this
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ... (Redraw code - this is why we use useEffect)
    };
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, totalDischarge]);
  
  return (
    <motion.div 
      className="relative w-full h-96 bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
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

export default DischargeContributionPieChart; 