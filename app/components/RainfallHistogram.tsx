"use client";

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { CloudRain, BarChart3 } from 'lucide-react';

// Register Chart.js components needed for the bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RainfallBarChart = ({ rainfallData }) => {
    // Check if there is any data to display.
    const hasData = rainfallData && rainfallData.length > 0;

    // Format the data for the chart. The labels will be the timestamps.
    const labels = hasData ? rainfallData.map(item => {
        const d = item.parsedDate;
        // Format as 'MM/DD HH:mm' for a concise label
        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }) : [];
    
    // The data points will be the rainfall values.
    const dataPoints = hasData ? rainfallData.map(item => item.rainfall) : [];

    // Chart.js data object for the bar chart.
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Rainfall (mm)',
                data: dataPoints,
                // UPDATE: Changed colors to green
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.8,
                categoryPercentage: 0.7,
            },
        ],
    };

    // Chart.js options object for styling and configuring the bar chart.
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Legend is not needed for a single dataset.
            },
            title: {
                display: true,
                text: 'Rainfall Measurements',
                font: { size: 16, weight: 'bold' },
                color: '#1f2937',
                padding: { bottom: 20 },
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    title: (ctx) => {
                         // Use the original data point to show the full date in the tooltip
                         const originalDataPoint = rainfallData[ctx[0].dataIndex];
                         return originalDataPoint.parsedDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
                    },
                    label: (ctx) => `Rainfall: ${ctx.parsed.y.toFixed(1)} mm`,
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date & Time',
                    color: '#374151',
                    font: { size: 14, weight: 'bold' },
                },
                ticks: { 
                    color: '#6b7280',
                    maxRotation: 90, // Rotate labels to prevent them from overlapping
                    minRotation: 45,
                },
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Rainfall (mm)',
                    color: '#374151',
                    font: { size: 14, weight: 'bold' },
                },
                ticks: {
                    color: '#6b7280',
                },
                grid: { color: 'rgba(0,0,0,0.05)' },
            },
        },
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200 p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
                    <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Rainfall Bar Chart</h2>
                    <p className="text-sm text-gray-600">Individual rainfall measurements for the selected period.</p>
                </div>
            </div>
            <div className="relative h-96 w-full bg-gray-50/50 p-4 rounded-lg border border-gray-200">
                {hasData ? (
                    <Bar options={chartOptions} data={chartData} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <CloudRain className="w-10 h-10 mx-auto text-gray-400" />
                            <p className="mt-2 text-lg font-semibold text-gray-500">No rainfall data to display for the selected range.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RainfallBarChart;