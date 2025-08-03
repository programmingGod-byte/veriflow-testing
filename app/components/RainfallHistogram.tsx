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

/**
 * Aggregates rainfall data by day. If there are too many days,
 * it will still show individual readings for smaller datasets.
 * @param {Array<object>} data - The raw rainfall data.
 * @param {number} [threshold=7] - The number of days after which to start aggregating.
 * @returns {{labels: Array<string>, dataPoints: Array<number>}}
 */
const processRainfallData = (data, threshold = 7) => {
    if (!data || data.length === 0) {
        return { labels: [], dataPoints: [] };
    }

    const firstDate = data[0].parsedDate;
    const lastDate = data[data.length - 1].parsedDate;
    const dayDifference = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

    // If the time range is less than the threshold, show individual measurements
    if (dayDifference < threshold) {
        const labels = data.map(item => {
            const d = item.parsedDate;
            return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        });
        const dataPoints = data.map(item => item.rainfall);
        return { labels, dataPoints };
    }
    
    // Otherwise, aggregate the data by day
    const dailyTotals = new Map();

    data.forEach(item => {
        const dayKey = item.parsedDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        const currentTotal = dailyTotals.get(dayKey) || 0;
        dailyTotals.set(dayKey, currentTotal + item.rainfall);
    });

    const sortedDays = Array.from(dailyTotals.keys()).sort();
    
    const labels = sortedDays.map(day => {
        const [year, month, date] = day.split('-');
        return `${month}/${date}/${year}`;
    });
    const dataPoints = sortedDays.map(day => dailyTotals.get(day));

    return { labels, dataPoints };
};


const RainfallBarChart = ({ rainfallData }) => {
    // Process the data: aggregate if necessary
    const { labels, dataPoints } = processRainfallData(rainfallData);
    const hasData = dataPoints.length > 0;

    // Chart.js data object for the bar chart.
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Rainfall (mm)',
                data: dataPoints,
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    // Chart.js options object
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
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
                    label: (ctx) => `Total Rainfall: ${ctx.parsed.y.toFixed(1)} mm`,
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    color: '#374151',
                    font: { size: 14, weight: 'bold' },
                },
                ticks: { color: '#6b7280' },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Rainfall (mm)',
                    color: '#374151',
                    font: { size: 14, weight: 'bold' },
                },
                ticks: { color: '#6b7280' },
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
                    <p className="text-sm text-gray-600">Individual or daily total rainfall for the selected period.</p>
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