"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RiverVisualizationProps {
  flowDirection: number;
  sections: {
    id: number;
    velocity: number;
    discharge: number;
    percentage: number;
  }[];
}

const RiverVisualization = ({ flowDirection, sections }: RiverVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get distinct color for each section based on velocity and section ID
  const getVelocityColor = (velocity: number, sectionId: number) => {
    // Normalize velocity to a value between 0 and 1
    const normalizedVelocity = Math.min(Math.max(velocity / 2, 0), 1);
    
    // Base colors for velocity ranges
    let baseColor;
    if (normalizedVelocity < 0.3) {
      // Blues for slow
      const blues = [
        'rgba(219, 234, 254, 0.85)', // blue-100
        'rgba(191, 219, 254, 0.85)', // blue-200
        'rgba(147, 197, 253, 0.85)'  // blue-300
      ];
      baseColor = blues[sectionId % blues.length];
    } else if (normalizedVelocity < 0.5) {
      // Indigos for medium-slow
      const indigos = [
        'rgba(199, 210, 254, 0.85)', // indigo-100
        'rgba(165, 180, 252, 0.85)', // indigo-200
        'rgba(129, 140, 248, 0.85)'  // indigo-300
      ];
      baseColor = indigos[sectionId % indigos.length];
    } else if (normalizedVelocity < 0.7) {
      // Purples/violets for medium
      const purples = [
        'rgba(221, 214, 254, 0.85)', // violet-100
        'rgba(196, 181, 253, 0.85)', // violet-200
        'rgba(167, 139, 250, 0.85)'  // violet-300
      ];
      baseColor = purples[sectionId % purples.length];
    } else if (normalizedVelocity < 0.85) {
      // Pinks for medium-fast
      const pinks = [
        'rgba(252, 231, 243, 0.85)', // pink-100
        'rgba(251, 207, 232, 0.85)', // pink-200
        'rgba(249, 168, 212, 0.85)'  // pink-300
      ];
      baseColor = pinks[sectionId % pinks.length];
    } else {
      // Oranges/ambers for fast
      const oranges = [
        'rgba(254, 243, 199, 0.85)', // amber-100
        'rgba(253, 230, 138, 0.85)', // amber-200
        'rgba(254, 215, 170, 0.85)'  // orange-200
      ];
      baseColor = oranges[sectionId % oranges.length];
    }
    
    // Add slight variation based on section ID to ensure adjacent sections look different
    return baseColor;
  };
  
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
    
    // Draw background
    ctx.fillStyle = '#f8fafc'; // Soft slate-50 background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate section width and positions
    const sectionWidth = canvas.width / 10;
    const angle = (flowDirection * Math.PI) / 180;
    
    // Draw sections with different colors based on velocity
    sections.forEach((section) => {
      const x = (section.id - 1) * sectionWidth;
      
      // Set fill color based on velocity and section ID
      ctx.fillStyle = getVelocityColor(section.velocity, section.id);
      
      // Draw the section
      ctx.beginPath();
      ctx.rect(x, 0, sectionWidth, canvas.height);
      ctx.fill();
      
      // Add subtle texture pattern based on section ID for additional distinction
      const patternDensity = 8 + (section.id % 3) * 4; // Different pattern densities
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'; // Very subtle dark pattern
      
      for (let i = 0; i < canvas.height; i += patternDensity) {
        for (let j = 0; j < sectionWidth; j += patternDensity) {
          const patternSize = 2 + (section.id % 2); // Varying dot sizes
          ctx.beginPath();
          ctx.arc(x + j, i, patternSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Draw section borders with higher contrast
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)'; // Slate-400 with transparency
      ctx.lineWidth = 1; // Slightly thicker for better visibility
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      // Add section labels with better contrast
      ctx.fillStyle = '#334155'; // Slate-700 for better readability
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText(`S${section.id}: ${section.velocity.toFixed(2)}`, x + 5, canvas.height - 15);
      
      // Draw flow direction indicator in section 2
      if (section.id === 2) {
        const arrowSize = 0;
        const arrowX = x + sectionWidth / 2;
        const arrowY = canvas.height / 2;
        
        ctx.fillStyle = 'rgba(14, 165, 233, 0.8)'; // Sky-500 with higher opacity for contrast
        ctx.beginPath();
        
        // Rotate and draw the arrow
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        
        // Arrow shape
        ctx.moveTo(0, -arrowSize / 2);
        ctx.lineTo(arrowSize / 2, arrowSize / 2);
        ctx.lineTo(0, arrowSize / 4);
        ctx.lineTo(-arrowSize / 2, arrowSize / 2);
        ctx.closePath();
        
        ctx.fill();
        
        // Add arrow border for better visibility
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();
      }
    });
    
    // Draw flow direction text with better contrast
    ctx.fillStyle = '#0284c7'; // Sky-600 for better readability
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(`Flow: ${flowDirection}°`, 10, 20);
    
    // Draw legend to explain color meaning
    const legendX = canvas.width - 170;
    const legendY = 10;
    const legendWidth = 160;
    const legendHeight = 130;
    const legendItemHeight = 20;
    
    // Legend background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)'; // Slate-300
    ctx.lineWidth = 1;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
    
    // Legend title
    ctx.fillStyle = '#475569'; // Slate-600
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Velocity Legend', legendX + 10, legendY + 15);
    
    // Legend items
    const legends = [
      { color: 'rgba(191, 219, 254, 0.85)', label: 'Slow (<0.6 m/s)' },
      { color: 'rgba(165, 180, 252, 0.85)', label: 'Medium-slow (0.6-1.0 m/s)' },
      { color: 'rgba(196, 181, 253, 0.85)', label: 'Medium (1.0-1.4 m/s)' },
      { color: 'rgba(251, 207, 232, 0.85)', label: 'Medium-fast (1.4-1.7 m/s)' },
      { color: 'rgba(254, 215, 170, 0.85)', label: 'Fast (>1.7 m/s)' }
    ];
    
    legends.forEach((item, i) => {
      const y = legendY + 25 + (i * legendItemHeight);
      
      // Color box
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX + 10, y, 15, 12);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.strokeRect(legendX + 10, y, 15, 12);
      
      // Label
      ctx.fillStyle = '#475569'; // Slate-600
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(item.label, legendX + 30, y + 9);
    });
    
  }, [flowDirection, sections]);
  
  return (
    <motion.div 
      className="relative w-full h-64 md:h-80 bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
      />
      
      {/* <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
        Live Data
      </div> */}
    </motion.div>
  );
};

export default RiverVisualization; 