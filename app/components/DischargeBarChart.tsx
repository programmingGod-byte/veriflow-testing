"use client";

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Chart from 'chart.js';

// Register Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.BarElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler,
  Chart.BarController
);

interface DischargeBarChartProps {
  data: {
    day: string;
    value: number;
  }[];
}

const DischargeBarChart = ({ data }: DischargeBarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart.Chart | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Return early if data is empty
    if (!data || data.length === 0) return;

    // Filter out invalid data points
    const validData = data.filter(d => typeof d.value === 'number' && isFinite(d.value) && !isNaN(d.value));
    
    // Return if no valid data remains
    if (validData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find min and max values for dynamic coloring
    const values = validData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Create gradient colors based on value
    const backgroundColors = validData.map((d, index) => {
      const isHovered = hoveredIndex === index;
      const isSelected = selectedBar === index;
      
      if (d.value === maxValue) {
        return isHovered || isSelected ? 'rgba(248, 113, 113, 0.95)' : 'rgba(248, 113, 113, 0.8)';
      } else if (d.value === minValue) {
        return isHovered || isSelected ? 'rgba(96, 165, 250, 0.95)' : 'rgba(96, 165, 250, 0.8)';
      } else {
        return isHovered || isSelected ? 'rgba(52, 211, 153, 0.95)' : 'rgba(52, 211, 153, 0.8)';
      }
    });

    const borderColors = validData.map((d) => {
      if (d.value === maxValue) {
        return 'rgba(248, 113, 113, 1)';
      } else if (d.value === minValue) {
        return 'rgba(96, 165, 250, 1)';
      } else {
        return 'rgba(52, 211, 153, 1)';
      }
    });

    // Create the chart
    chartRef.current = new Chart.Chart(ctx, {
      type: 'bar',
      data: {
        labels: validData.map(d => d.day),
        datasets: [{
          label: 'Discharge (m³/s)',
          data: validData.map(d => d.value),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: backgroundColors.map(color => color.replace('0.8', '1')),
          hoverBorderColor: borderColors,
          hoverBorderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: window.devicePixelRatio || 1,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
          onProgress: (animation) => {
            // Custom progress animation
            const progress = animation.currentStep / animation.numSteps;
            canvas.style.opacity = (0.3 + 0.7 * progress).toString();
          },
          onComplete: () => {
            canvas.style.opacity = '1';
          }
        },
        hover: {
          animationDuration: 200,
          onHover: (event, elements) => {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
            const newHoveredIndex = elements.length > 0 ? elements[0].index : null;
            if (newHoveredIndex !== hoveredIndex) {
              setHoveredIndex(newHoveredIndex);
            }
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const clickedIndex = elements[0].index;
            setSelectedBar(selectedBar === clickedIndex ? null : clickedIndex);
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#374151',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 13,
            },
            padding: 12,
            callbacks: {
              title: (tooltipItems) => {
                return `Section: ${tooltipItems[0].label}`;
              },
              label: (context) => {
                const value = context.parsed.y;
                const percentage = ((value / avgValue - 1) * 100).toFixed(1);
                const trend = value > avgValue ? '↑' : value < avgValue ? '↓' : '→';
                return [
                  `Discharge: ${value.toFixed(2)} m³/s`,
                  `${trend} ${Math.abs(parseFloat(percentage))}% from average`,
                  `Rank: ${values.sort((a, b) => b - a).indexOf(value) + 1} of ${values.length}`
                ];
              },
            },
            external: (context) => {
              // Custom tooltip positioning
              const tooltip = context.tooltip;
              if (tooltip.opacity === 0) return;
              
              // Add custom styling to tooltip
              const tooltipEl = document.getElementById('chartjs-tooltip');
              if (tooltipEl) {
                tooltipEl.style.transition = 'all 0.2s ease';
                tooltipEl.style.transform = 'scale(1.02)';
              }
            }
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Section',
              color: '#64748b',
              font: {
                size: 14,
                weight: 'bold',
              },
              padding: 10,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 11,
              },
              maxRotation: 45,
              minRotation: 0,
            },
            grid: {
              display: false,
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Discharge (m³/s)',
              color: '#64748b',
              font: {
                size: 14,
                weight: 'bold',
              },
              padding: 10,
            },
            ticks: {
              color: '#94a3b8',
              font: {
                size: 11,
              },
              callback: function(value) {
                return parseFloat(value.toString()).toFixed(2);
              },
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.5)',
              lineWidth: 1,
            },
            beginAtZero: true,
          },
        },
      },
      plugins: [{
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart) => {
          const ctx = chart.canvas.getContext('2d');
          if (!ctx) return;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
          ctx.fillRect(0, 0, chart.canvas.width, chart.canvas.height);
          ctx.restore();
        }
      }, {
        id: 'chartTitle',
        beforeDraw: (chart) => {
          const ctx = chart.canvas.getContext('2d');
          if (!ctx) return;
          
          ctx.save();
          ctx.font = 'bold 18px Arial';
          ctx.fillStyle = '#3b82f6';
          ctx.textAlign = 'center';
          ctx.fillText('Section Discharge Distribution', chart.canvas.width / 2, 30);
          
          ctx.font = '12px Arial';
          ctx.fillStyle = '#64748b';
          ctx.fillText(`Average: ${avgValue.toFixed(2)} m³/s`, chart.canvas.width / 2, 50);
          ctx.restore();
        }
      }, {
        id: 'dataLabels',
        afterDatasetsDraw: (chart) => {
          const ctx = chart.canvas.getContext('2d');
          if (!ctx) return;
          
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((element, index) => {
              const data = dataset.data[index] as number;
              const isHovered = hoveredIndex === index;
              const isSelected = selectedBar === index;
              
              if (isHovered || isSelected) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
                ctx.lineWidth = 1;
                
                const x = element.x;
                const y = element.y - 25;
                const text = data.toFixed(2);
                const textWidth = ctx.measureText(text).width + 12;
                const textHeight = 20;
                
                // Draw rounded rectangle
                ctx.beginPath();
                ctx.roundRect(x - textWidth / 2, y - textHeight / 2, textWidth, textHeight, 6);
                ctx.fill();
                ctx.stroke();
                
                // Draw connecting line
                ctx.beginPath();
                ctx.moveTo(x, element.y - 5);
                ctx.lineTo(x, y + textHeight / 2);
                ctx.stroke();
                
                // Draw text
                ctx.fillStyle = '#3b82f6';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, x, y);
                
                ctx.restore();
              }
            });
          });
        }
      }]
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, hoveredIndex, selectedBar]);

  // Sample data for demonstration
  const sampleData = data.length > 0 ? data : [
    { day: 'S1', value: 12.45 },
    { day: 'S2', value: 18.23 },
    { day: 'S3', value: 8.67 },
    { day: 'S4', value: 22.11 },
    { day: 'S5', value: 15.89 },
    { day: 'S6', value: 11.34 },
    { day: 'S7', value: 19.56 },
    { day: 'S8', value: 14.78 }
  ];

  return (
    <motion.div 
      className="relative w-full h-80 md:h-96 bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {/* Floating stats panel */}
      {(hoveredIndex !== null || selectedBar !== null) && (
        <motion.div
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-200 z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            const activeIndex = selectedBar !== null ? selectedBar : hoveredIndex;
            const activeData = sampleData[activeIndex!];
            const values = sampleData.map(d => d.value);
            const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            const rank = values.sort((a, b) => b - a).indexOf(activeData.value) + 1;
            
            return (
              <div className="text-sm">
                <div className="font-semibold text-slate-700 mb-1">
                  {activeData.day}
                </div>
                <div className="text-blue-600 font-bold">
                  {activeData.value.toFixed(2)} m³/s
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  Rank: {rank}/{values.length}
                </div>
                <div className="text-slate-500 text-xs">
                  {activeData.value > avgValue ? '↑ Above' : activeData.value < avgValue ? '↓ Below' : '→ At'} average
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-400"></div>
          <span className="text-slate-600">Highest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-400"></div>
          <span className="text-slate-600">Lowest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-400"></div>
          <span className="text-slate-600">Others</span>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        className="w-full h-full transition-all duration-300 hover:brightness-105" 
      />
    </motion.div>
  );
};

export default DischargeBarChart;