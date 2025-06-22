import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import * as Chart from "chart.js";

// Register Chart.js components
// Register Chart.js components
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineElement,
  Chart.LineController,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler
);

interface DischargeGraphProps {
  data: {
    date: string;
    discharge: number;
  }[];
}

const DischargeGraph = ({ data }: DischargeGraphProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart.Chart | null>(null);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Format dates for display
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Calculate average for color coding
    const avgDischarge = sortedData.reduce((sum, item) => sum + item.discharge, 0) / sortedData.length;

    // Create gradient for the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8'); // Indigo
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)'); // Blue
    gradient.addColorStop(1, 'rgba(147, 51, 234, 0.4)'); // Purple

    // Create area gradient
    const areaGradient = ctx.createLinearGradient(0, 0, 0, 400);
    areaGradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    areaGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
    areaGradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');

    // Point colors based on discharge value
    const pointColors = sortedData.map(point => {
      if (point.discharge > avgDischarge * 1.2) {
        return '#ef4444'; // Red for high
      } else if (point.discharge < avgDischarge * 0.8) {
        return '#3b82f6'; // Blue for low
      } else {
        return '#10b981'; // Green for normal
      }
    });

    const pointHoverColors = sortedData.map(point => {
      if (point.discharge > avgDischarge * 1.2) {
        return '#dc2626'; // Darker red
      } else if (point.discharge < avgDischarge * 0.8) {
        return '#2563eb'; // Darker blue
      } else {
        return '#059669'; // Darker green
      }
    });

    chartInstance.current = new Chart.Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedData.map(d => formatDate(d.date)),
        datasets: [{
          label: 'Discharge',
          data: sortedData.map(d => d.discharge),
          borderColor: gradient,
          backgroundColor: areaGradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: pointHoverColors,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 4,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          title: {
            display: true,
            text: 'Water Discharge Over Time',
            font: {
              size: 18,
              weight: 'bold',
              family: "'Inter', sans-serif"
            },
            color: '#1f2937',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#f9fafb',
            bodyColor: '#f9fafb',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            callbacks: {
              title: function(context) {
                return `Date: ${context[0].label}`;
              },
              label: function(context) {
                const value = context.parsed.y;
                const status = value > avgDischarge * 1.2 ? ' (High)' :
                              value < avgDischarge * 0.8 ? ' (Low)' : ' (Normal)';
                return `Discharge: ${value.toFixed(2)} m³/s${status}`;
              },
              afterLabel: function(context) {
                const value = context.parsed.y;
                const percentage = ((value - avgDischarge) / avgDischarge * 100).toFixed(1);
                return `Deviation: ${percentage > 0 ? '+' : ''}${percentage}% from avg`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date',
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#374151'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 12
              },
              maxTicksLimit: 8
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Discharge (m³/s)',
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#374151'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 12
              },
              callback: function(value) {
                return value.toFixed(1) + ' m³/s';
              }
            },
            beginAtZero: true
          }
        },
        elements: {
          point: {
            hoverBorderWidth: 3
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  // Calculate trend for display
  const calculateTrend = () => {
    if (data.length < 2) return null;
    
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstDischarge = sortedData[0].discharge;
    const lastDischarge = sortedData[sortedData.length - 1].discharge;
    const difference = ((lastDischarge - firstDischarge) / firstDischarge) * 100;
    
    return {
      percentage: difference.toFixed(1),
      direction: difference > 5 ? 'increasing' : difference < -5 ? 'decreasing' : 'stable',
      icon: difference > 5 ? '📈' : difference < -5 ? '📉' : '➡️',
      color: difference > 5 ? 'text-green-600' : difference < -5 ? 'text-red-600' : 'text-blue-600'
    };
  };

  const trend = calculateTrend();
  const avgDischarge = data.reduce((sum, item) => sum + item.discharge, 0) / data.length;
  const maxDischarge = Math.max(...data.map(d => d.discharge));
  const minDischarge = Math.min(...data.map(d => d.discharge));

  return (
    <motion.div 
      className="relative w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl overflow-hidden shadow-xl border border-slate-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header with stats */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{avgDischarge.toFixed(1)}</div>
              <div className="text-sm opacity-90">Avg m³/s</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-200">{maxDischarge.toFixed(1)}</div>
              <div className="text-sm opacity-90">Max m³/s</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-200">{minDischarge.toFixed(1)}</div>
              <div className="text-sm opacity-90">Min m³/s</div>
            </div>
          </div>
          
          {trend && (
            <div className="text-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
              <div className="text-lg font-semibold">
                {trend.icon} {trend.direction.charAt(0).toUpperCase() + trend.direction.slice(1)}
              </div>
              <div className="text-sm opacity-90">{Math.abs(parseFloat(trend.percentage))}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div className="p-6">
        <div className="relative h-72 md:h-96">
          <canvas ref={chartRef} className="w-full h-full" />
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">High Discharge (&gt;120% avg)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Normal Discharge (80-120% avg)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Low Discharge (&lt;80% avg)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DischargeGraph;