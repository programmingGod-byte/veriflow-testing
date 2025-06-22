import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Chart from 'chart.js';

interface DischargeContributionPieChartProps {
  data: {
    id: number;
    discharge: number;
    percentage: number;
  }[];
  totalDischarge: number;
}

const DischargeContributionPieChart = ({ 
  data, 
  totalDischarge 
}: DischargeContributionPieChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart.Chart | null>(null);
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

  // Modern gradient color palette
  const getModernColors = () => [
    {
      bg: 'rgba(99, 102, 241, 0.8)',      // Indigo
      border: 'rgb(99, 102, 241)',
      hover: 'rgba(99, 102, 241, 0.9)'
    },
    {
      bg: 'rgba(236, 72, 153, 0.8)',      // Pink
      border: 'rgb(236, 72, 153)',
      hover: 'rgba(236, 72, 153, 0.9)'
    },
    {
      bg: 'rgba(14, 165, 233, 0.8)',      // Sky blue
      border: 'rgb(14, 165, 233)',
      hover: 'rgba(14, 165, 233, 0.9)'
    },
    {
      bg: 'rgba(34, 197, 94, 0.8)',       // Emerald
      border: 'rgb(34, 197, 94)',
      hover: 'rgba(34, 197, 94, 0.9)'
    },
    {
      bg: 'rgba(251, 146, 60, 0.8)',      // Orange
      border: 'rgb(251, 146, 60)',
      hover: 'rgba(251, 146, 60, 0.9)'
    },
    {
      bg: 'rgba(168, 85, 247, 0.8)',      // Purple
      border: 'rgb(168, 85, 247)',
      hover: 'rgba(168, 85, 247, 0.9)'
    },
    {
      bg: 'rgba(6, 182, 212, 0.8)',       // Cyan
      border: 'rgb(6, 182, 212)',
      hover: 'rgba(6, 182, 212, 0.9)'
    },
    {
      bg: 'rgba(245, 158, 11, 0.8)',      // Amber
      border: 'rgb(245, 158, 11)',
      hover: 'rgba(245, 158, 11, 0.9)'
    },
    {
      bg: 'rgba(239, 68, 68, 0.8)',       // Red
      border: 'rgb(239, 68, 68)',
      hover: 'rgba(239, 68, 68, 0.9)'
    },
    {
      bg: 'rgba(16, 185, 129, 0.8)',      // Teal
      border: 'rgb(16, 185, 129)',
      hover: 'rgba(16, 185, 129, 0.9)'
    }
  ];

  useEffect(() => {
    // Register Chart.js components
    Chart.Chart.register(
      Chart.ArcElement,
      Chart.Tooltip,
      Chart.Legend,
      Chart.DoughnutController,
      Chart.CategoryScale
    );

    const canvas = chartRef.current;
    if (!canvas || !data || data.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Sort data by discharge (descending)
    const sortedData = [...data].sort((a, b) => b.discharge - a.discharge);
    const colors = getModernColors();

    // Prepare data for Chart.js
    const chartData = {
      labels: sortedData.map(d => `Section ${d.id}`),
      datasets: [{
        data: sortedData.map(d => d.percentage),
        backgroundColor: sortedData.map((_, index) => colors[index % colors.length].bg),
        borderColor: sortedData.map((_, index) => colors[index % colors.length].border),
        hoverBackgroundColor: sortedData.map((_, index) => colors[index % colors.length].hover),
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 15, // This creates the "bulge" effect
        spacing: 2
      }]
    };

    // Create the chart
    chartInstance.current = new Chart.Chart(canvas, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: {
                size: 12,
                family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              },
              color: '#475569',
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    const value = dataset.data[i] as number;
                    const discharge = sortedData[i].discharge;
                    return {
                      text: `${label}: ${value.toFixed(1)}% (${discharge.toFixed(2)} m³/s)`,
                      fillStyle: dataset.backgroundColor[i],
                      strokeStyle: dataset.borderColor[i],
                      lineWidth: dataset.borderWidth,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            cornerRadius: 12,
            displayColors: true,
            padding: 16,
            titleFont: {
              size: 14,
              weight: 'bold',
              family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            },
            bodyFont: {
              size: 13,
              family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            },
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return `Section ${sortedData[index].id}`;
              },
              label: (context) => {
                const index = context.dataIndex;
                const percentage = context.parsed;
                const discharge = sortedData[index].discharge;
                return [
                  `Percentage: ${percentage.toFixed(2)}%`,
                  `Discharge: ${discharge.toFixed(2)} m³/s`,
                  `Contribution: ${((discharge / totalDischarge) * 100).toFixed(2)}%`
                ];
              }
            }
          }
        },
        cutout: '60%',
        radius: '90%',
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000,
          easing: 'easeOutQuart'
        },
        onHover: (event, elements) => {
          if (elements.length > 0) {
            setHoveredSection(elements[0].index);
            canvas.style.cursor = 'pointer';
          } else {
            setHoveredSection(null);
            canvas.style.cursor = 'default';
          }
        },
        interaction: {
          intersect: false,
          mode: 'point'
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, totalDischarge]);

  const validData = data?.filter(d => 
    typeof d.discharge === 'number' && isFinite(d.discharge) && !isNaN(d.discharge)
  ) || [];

  if (validData.length === 0) {
    return (
      <motion.div 
        className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No discharge data available</p>
          <p className="text-slate-400 text-sm mt-1">Please provide valid discharge data to view the chart</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          Discharge Contribution by Section
        </h2>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            Total Discharge: <span className="font-semibold text-indigo-600">{totalDischarge.toFixed(2)} m³/s</span>
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Sections: <span className="font-semibold text-emerald-600">{validData.length}</span>
          </span>
        </div>
      </motion.div>

      {/* Chart Container */}
      <motion.div 
        className="relative h-96 p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
      >
        <canvas ref={chartRef} className="w-full h-full" />
        
        {/* Center Info */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="text-center bg-white rounded-full p-4 shadow-sm border border-slate-100">
            <div className="text-2xl font-bold text-slate-800">
              {validData.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              SECTIONS
            </div>
            {hoveredSection !== null && (
              <motion.div 
                className="mt-2 p-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-sm font-semibold text-indigo-700">
                  Section {validData.sort((a, b) => b.discharge - a.discharge)[hoveredSection]?.id}
                </div>
                <div className="text-xs text-indigo-600">
                  {validData.sort((a, b) => b.discharge - a.discharge)[hoveredSection]?.percentage.toFixed(1)}%
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Footer */}
      <motion.div 
        className="px-6 py-3 bg-slate-50 border-t border-slate-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Hover over sections for detailed information</span>
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            Interactive Chart
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Demo component with sample data
const DemoChart = () => {
  const sampleData = [
    { id: 1, discharge: 45.67, percentage: 25.3 },
    { id: 2, discharge: 38.21, percentage: 21.2 },
    { id: 3, discharge: 29.45, percentage: 16.3 },
    { id: 4, discharge: 22.18, percentage: 12.3 },
    { id: 5, discharge: 18.92, percentage: 10.5 },
    { id: 6, discharge: 12.34, percentage: 6.8 },
    { id: 7, discharge: 8.76, percentage: 4.9 },
    { id: 8, discharge: 5.23, percentage: 2.9 }
  ];
  
  const totalDischarge = sampleData.reduce((sum, item) => sum + item.discharge, 0);

  return (
    <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <DischargeContributionPieChart 
          data={sampleData} 
          totalDischarge={totalDischarge} 
        />
      </div>
    </div>
  );
};

export default DemoChart;