"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RiverCrossSectionProps {
  data: {
    distance: number;
    depth: number;
    velocity?: number;
  }[];
  maxDepth?: number;
  maxDistance?: number;
  width?: number;
  height?: number;
  animate?: boolean;
  delay?: number;
}

const RiverCrossSection = ({
  data,
  maxDepth,
  maxDistance,
  width = 1000,
  height = 400,
  animate = true,
  delay = 0
}: RiverCrossSectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Compute max values if not provided
  const computedMaxDepth = maxDepth || Math.max(...data.map(d => d.depth)) * 1.2;
  const computedMaxDistance = maxDistance || Math.max(...data.map(d => d.distance));
  
  // Sort data by distance to ensure proper rendering
  const sortedData = [...data].sort((a, b) => a.distance - b.distance);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = '#fafafa'; // Even softer off-white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.lineWidth = 0.3; // Thinner grid lines
    ctx.strokeStyle = '#f0f4f8'; // Even softer grid lines
    
    // Vertical grid lines
    const verticalGridCount = 10;
    for (let i = 0; i <= verticalGridCount; i++) {
      const x = (i / verticalGridCount) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    const horizontalGridCount = 8;
    for (let i = 0; i <= horizontalGridCount; i++) {
      const y = (i / horizontalGridCount) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw axis labels
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#a0aec0'; // Even softer text color
    
    // X-axis labels
    for (let i = 0; i <= verticalGridCount; i++) {
      const x = (i / verticalGridCount) * canvas.width;
      const value = (i / verticalGridCount) * computedMaxDistance;
      ctx.fillText(`${value.toFixed(1)}m`, x - 15, canvas.height - 5);
    }
    
    // Y-axis labels
    for (let i = 0; i <= horizontalGridCount; i++) {
      const y = (i / horizontalGridCount) * canvas.height;
      const value = ((horizontalGridCount - i) / horizontalGridCount) * computedMaxDepth;
      ctx.fillText(`${value.toFixed(1)}m`, 5, y + 4);
    }
    
    // Add title
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = '#a0aec0'; // Softer title color
    ctx.fillText('River Cross Section', canvas.width / 2 - 70, 20);
    
    // Draw the river cross section
    if (sortedData.length < 2) return;
    
    // Create river surface gradient
    const surfaceGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    surfaceGradient.addColorStop(0, 'rgba(226, 246, 254, 0.6)'); // Ultra soft sky-100 with transparency
    surfaceGradient.addColorStop(0.5, 'rgba(186, 230, 253, 0.6)'); // Ultra soft sky-200 with transparency
    surfaceGradient.addColorStop(1, 'rgba(226, 246, 254, 0.6)'); // Ultra soft sky-100 with transparency
    
    // Draw the river bottom
    ctx.beginPath();
    
    // Start at water surface
    ctx.moveTo(0, 0);
    
    // Draw left bank
    const firstPoint = sortedData[0];
    const firstX = (firstPoint.distance / computedMaxDistance) * canvas.width;
    const firstY = (firstPoint.depth / computedMaxDepth) * canvas.height;
    ctx.lineTo(firstX, firstY);
    
    // Draw river bottom contour
    for (let i = 1; i < sortedData.length; i++) {
      const point = sortedData[i];
      const x = (point.distance / computedMaxDistance) * canvas.width;
      const y = (point.depth / computedMaxDepth) * canvas.height;
      
      // Add slight curve for natural appearance
      const prevPoint = sortedData[i - 1];
      const prevX = (prevPoint.distance / computedMaxDistance) * canvas.width;
      const prevY = (prevPoint.depth / computedMaxDepth) * canvas.height;
      
      const cpX = (prevX + x) / 2;
      const cpY = Math.max(prevY, y);
      
      ctx.quadraticCurveTo(cpX, cpY, x, y);
      
      // Draw velocity indicators if available
      if (point.velocity !== undefined && prevPoint.velocity !== undefined) {
        const avgVelocity = (point.velocity + prevPoint.velocity) / 2;
        const normalizedVelocity = Math.min(avgVelocity / 2, 1); // Normalize velocity (0-1)
        
        // Draw velocity arrows
        const arrowCount = Math.ceil(normalizedVelocity * 3) + 1; // 1-4 arrows based on velocity
        const sectionWidth = x - prevX;
        
        for (let j = 0; j < arrowCount; j++) {
          const arrowX = prevX + (sectionWidth * (j + 1)) / (arrowCount + 1);
          const depthRatio = 0.7; // Draw arrows at 70% of depth
          const surfaceY = 0;
          const bottomY = (prevY + y) / 2;
          const arrowY = surfaceY + (bottomY - surfaceY) * depthRatio;
          
          const arrowLength = normalizedVelocity * 15;
          
          // Draw arrow shaft
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(arrowX - arrowLength, arrowY);
          ctx.lineTo(arrowX, arrowY);
          
          // Determine color based on velocity
          let arrowColor;
          if (avgVelocity < 0.5) {
            arrowColor = 'rgba(167, 243, 208, 0.7)'; // Even softer green-200 for slow
          } else if (avgVelocity < 1.5) {
            arrowColor = 'rgba(165, 243, 252, 0.7)'; // Even softer cyan-200 for medium
          } else {
            arrowColor = 'rgba(191, 219, 254, 0.7)'; // Even softer blue-200 for fast
          }
          
          ctx.strokeStyle = arrowColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Draw arrow head
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX - 5, arrowY - 3);
          ctx.lineTo(arrowX - 5, arrowY + 3);
          ctx.closePath();
          ctx.fillStyle = arrowColor;
          ctx.fill();
          ctx.restore();
        }
      }
    }
    
    // Draw right bank to surface
    const lastPoint = sortedData[sortedData.length - 1];
    const lastX = (lastPoint.distance / computedMaxDistance) * canvas.width;
    const lastY = (lastPoint.depth / computedMaxDepth) * canvas.height;
    ctx.lineTo(canvas.width, lastY);
    
    // Back to surface and close path
    ctx.lineTo(canvas.width, 0);
    ctx.closePath();
    
    // Fill with gradient
    ctx.fillStyle = surfaceGradient;
    ctx.fill();
    
    // Create depth gradient fill
    const depthGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    depthGradient.addColorStop(0, 'rgba(224, 242, 254, 0.7)'); // Even softer sky-100 at surface
    depthGradient.addColorStop(0.7, 'rgba(186, 230, 253, 0.6)'); // Even softer sky-200 middle
    depthGradient.addColorStop(1, 'rgba(125, 211, 252, 0.5)'); // Even softer sky-300 at deepest
    
    // Draw water body
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    // Draw water surface
    ctx.lineTo(canvas.width, 0);
    
    // Draw right bank
    ctx.lineTo(lastX, lastY);
    
    // Draw river bottom in reverse
    for (let i = sortedData.length - 2; i >= 0; i--) {
      const point = sortedData[i];
      const x = (point.distance / computedMaxDistance) * canvas.width;
      const y = (point.depth / computedMaxDepth) * canvas.height;
      
      const nextPoint = sortedData[i + 1];
      const nextX = (nextPoint.distance / computedMaxDistance) * canvas.width;
      const nextY = (nextPoint.depth / computedMaxDepth) * canvas.height;
      
      const cpX = (nextX + x) / 2;
      const cpY = Math.max(nextY, y);
      
      ctx.quadraticCurveTo(cpX, cpY, x, y);
    }
    
    // Back to surface
    ctx.lineTo(0, 0);
    
    // Fill with depth gradient
    ctx.fillStyle = depthGradient;
    ctx.fill();
    
    // Draw wave pattern on surface
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    const waveAmplitude = 1.5; // Slightly smaller waves
    const waveFrequency = 30;
    
    for (let x = 0; x <= canvas.width; x += 5) {
      const y = Math.sin(x / waveFrequency) * waveAmplitude;
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)'; // Even softer sky-100 for waves
    ctx.lineWidth = 0.8; // Thinner wave line
    ctx.stroke();
    
    // Add depth markers
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#93c5fd'; // Softer blue-300 for depth markers
    
    const depthMarkerCount = 3;
    for (let i = 0; i < sortedData.length; i += Math.ceil(sortedData.length / depthMarkerCount)) {
      const point = sortedData[i];
      const x = (point.distance / computedMaxDistance) * canvas.width;
      const y = (point.depth / computedMaxDepth) * canvas.height;
      
      // Draw depth line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(226, 240, 253, 0.5)'; // Even softer blue-50 for depth lines
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 0.8; // Thinner depth lines
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw depth value
      ctx.fillText(`${point.depth.toFixed(2)}m`, x + 3, y - 5);
    }
    
    // Add velocity legend if velocity data is available
    const hasVelocityData = sortedData.some(d => d.velocity !== undefined);
    
    if (hasVelocityData) {
      // Draw legend
      const legendX = canvas.width - 120;
      const legendY = 40;
      const legendWidth = 110;
      const legendHeight = 80;
      
      // Legend background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // More transparent background
      ctx.strokeStyle = '#f0f4f8'; // Even softer border
      ctx.lineWidth = 0.8; // Thinner border
      ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
      ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
      
      // Legend title
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8'; // Softer slate-400 title
      ctx.fillText('Velocity', legendX + 10, legendY + 15);
      
      // Legend items
      ctx.font = '10px Inter, sans-serif';
      
      // Fast
      ctx.fillStyle = 'rgba(191, 219, 254, 0.7)'; // Even softer blue-200
      ctx.fillRect(legendX + 10, legendY + 25, 15, 10);
      ctx.fillStyle = '#94a3b8'; // Softer slate-400 text
      ctx.fillText('Fast (>1.5 m/s)', legendX + 30, legendY + 33);
      
      // Medium
      ctx.fillStyle = 'rgba(165, 243, 252, 0.7)'; // Even softer cyan-200
      ctx.fillRect(legendX + 10, legendY + 45, 15, 10);
      ctx.fillStyle = '#94a3b8'; // Softer slate-400 text
      ctx.fillText('Medium (0.5-1.5 m/s)', legendX + 30, legendY + 53);
      
      // Slow
      ctx.fillStyle = 'rgba(167, 243, 208, 0.7)'; // Even softer green-200
      ctx.fillRect(legendX + 10, legendY + 65, 15, 10);
      ctx.fillStyle = '#94a3b8'; // Softer slate-400 text
      ctx.fillText('Slow (<0.5 m/s)', legendX + 30, legendY + 73);
    }
    
  }, [sortedData, computedMaxDepth, computedMaxDistance, width, height]);
  
  return (
    <motion.div
      className="relative bg-white rounded-lg shadow-sm border border-slate-50 p-4 mb-6"
      initial={animate ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={animate ? { opacity: 1, y: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto"
      />
    </motion.div>
  );
};

export default RiverCrossSection; 