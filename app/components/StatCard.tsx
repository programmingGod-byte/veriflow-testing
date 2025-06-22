"use client";

import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  color?: 'blue' | 'cyan' | 'purple' | 'green' | 'amber' | 'red';
  delay?: number;
}

const StatCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  change, 
  color = 'blue',
  delay = 0 
}: StatCardProps) => {
  
  // Define softer color styles based on theme
  const colorStyles = {
    blue: {
      background: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-600',
      icon: 'bg-blue-100 text-blue-500',
    },
    cyan: {
      background: 'bg-cyan-50',
      border: 'border-cyan-100',
      text: 'text-cyan-600',
      icon: 'bg-cyan-100 text-cyan-500',
    },
    purple: {
      background: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-600',
      icon: 'bg-purple-100 text-purple-500',
    },
    green: {
      background: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      icon: 'bg-emerald-100 text-emerald-500',
    },
    amber: {
      background: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-600',
      icon: 'bg-amber-100 text-amber-500',
    },
    red: {
      background: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-600',
      icon: 'bg-red-100 text-red-500',
    }
  };

  // Get the selected color style
  const selectedColor = colorStyles[color] || colorStyles.blue; // Fallback to blue if color is invalid
  
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return (
        <svg 
          className="w-3 h-3 text-emerald-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
      );
    } else if (trend === 'down') {
      return (
        <svg 
          className="w-3 h-3 text-red-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      );
    } else {
      return (
        <svg 
          className="w-3 h-3 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 12h14" 
          />
        </svg>
      );
    }
  };

  return (
    <motion.div
      className={`p-6 rounded-lg shadow-sm ${selectedColor.background} border ${selectedColor.border}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <div className="flex items-baseline">
            <p className={`text-2xl font-semibold ${selectedColor.text}`}>
              {typeof value === 'number' ? value.toFixed(2) : value}
            </p>
            {unit && (
              <p className="ml-1 text-sm font-medium text-gray-500">
                {unit}
              </p>
            )}
          </div>
          
          {change && (
            <div className="flex items-center mt-2">
              {getTrendIcon(change.trend)}
              <p className={`text-xs font-medium ml-1 ${
                change.trend === 'up' ? 'text-emerald-500' : 
                change.trend === 'down' ? 'text-red-400' : 
                'text-gray-500'
              }`}>
                {change.value}%
              </p>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-full ${selectedColor.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard; 