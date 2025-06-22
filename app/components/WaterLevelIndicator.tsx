"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaterLevelIndicatorProps {
  currentLevel: number;  // Current water level in meters
  maxLevel: number;      // Maximum level for the gauge in meters
  dangerLevel: number;   // Level at which danger warning appears
  warningLevel: number;  // Level at which warning appears
  normalLevel: number;   // Level considered normal
  location: string;      // Name of location being measured
  lastUpdated: string;   // Timestamp of last update
}

export default function WaterLevelIndicator({
  currentLevel,
  maxLevel,
  dangerLevel,
  warningLevel,
  normalLevel,
  location,
  lastUpdated,
}: WaterLevelIndicatorProps) {
  // Calculate percentage of fill
  const fillPercentage = Math.min((currentLevel / maxLevel) * 100, 100);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  useEffect(() => {
    // Set initial render to false after mount
    setIsInitialRender(false);
  }, []);
  
  // Determine status based on current level
  const getStatus = () => {
    if (currentLevel >= dangerLevel) return 'Danger';
    if (currentLevel >= warningLevel) return 'Warning';
    if (currentLevel >= normalLevel) return 'Normal';
    return 'Low';
  };
  
  // Get color based on status
  const getStatusColor = () => {
    const status = getStatus();
    switch (status) {
      case 'Danger':
        return 'bg-red-600';
      case 'Warning':
        return 'bg-amber-500';
      case 'Normal':
        return 'bg-blue-500';
      case 'Low':
        return 'bg-blue-300';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Get status text color based on status
  const getStatusTextColor = () => {
    const status = getStatus();
    switch (status) {
      case 'Danger':
        return 'text-red-600';
      case 'Warning':
        return 'text-amber-500';
      case 'Normal':
        return 'text-blue-500';
      case 'Low':
        return 'text-blue-300';
      default:
        return 'text-blue-500';
    }
  };
  
  // Get background color for status badge
  const getStatusBgColor = () => {
    const status = getStatus();
    switch (status) {
      case 'Danger':
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'Warning':
        return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'Normal':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Low':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-300';
    }
  };
  
  // Calculate positions for threshold markers
  const dangerPosition = (dangerLevel / maxLevel) * 100;
  const warningPosition = (warningLevel / maxLevel) * 100;
  const normalPosition = (normalLevel / maxLevel) * 100;
  
  const containerStyle = {
    position: 'relative' as const,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(226, 232, 240, 1)',
  };

  const fillStyle = {
    position: 'absolute' as const,
    bottom: 0,
    width: '100%',
    height: `${fillPercentage}%`,
    backgroundColor: getStatusColor().replace('bg-', 'rgb-'),
    transition: 'height 0.5s ease-out, background-color 0.3s ease',
  };

  // Custom getStatusColorRGB function to get RGB values with softer colors
  const getStatusColorRGB = () => {
    const status = getStatus();
    switch (status) {
      case 'Danger':
        return 'rgba(248, 113, 113, 0.75)'; // red-400 with opacity - softer
      case 'Warning':
        return 'rgba(251, 191, 36, 0.75)'; // amber-400 with opacity - softer
      case 'Normal':
        return 'rgba(96, 165, 250, 0.75)'; // blue-400 with opacity - softer
      case 'Low':
        return 'rgba(191, 219, 254, 0.75)'; // blue-200 with opacity - softer
      default:
        return 'rgba(96, 165, 250, 0.75)'; // blue-400 with opacity - softer
    }
  };
  
  try {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-2 flex justify-between items-center">
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBgColor()}`}>
            {getStatus()}
          </div>
        </div>
        
        <div className="text-xs text-slate-500 mb-2">
          <div>Location: {location}</div>
          <div className="text-xs">Last updated: {lastUpdated}</div>
        </div>
        
        <div className="flex flex-1">
          {/* Main water level visualization container */}
          <div className="relative w-4/5 h-full rounded-lg overflow-hidden border border-slate-200">
            {/* Level markers on the right side */}
            <div className="absolute right-0 top-0 h-full w-12 bg-slate-50 border-l border-slate-200 z-10">
              {/* Max level marker */}
              <div className="absolute top-0 right-0 left-0 flex items-center">
                <div className="h-px w-2 bg-slate-400"></div>
                <div className="text-[10px] text-slate-600 ml-1">{maxLevel}m</div>
              </div>
              
              {/* Danger level marker */}
              <div 
                className="absolute right-0 left-0 flex items-center" 
                style={{ top: `${100 - dangerPosition}%` }}
              >
                <div className="h-px w-2 bg-red-400"></div>
                <div className="text-[10px] text-red-500 ml-1">{dangerLevel}m</div>
              </div>
              
              {/* Warning level marker */}
              <div 
                className="absolute right-0 left-0 flex items-center" 
                style={{ top: `${100 - warningPosition}%` }}
              >
                <div className="h-px w-2 bg-amber-400"></div>
                <div className="text-[10px] text-amber-500 ml-1">{warningLevel}m</div>
              </div>
              
              {/* Normal level marker */}
              <div 
                className="absolute right-0 left-0 flex items-center" 
                style={{ top: `${100 - normalPosition}%` }}
              >
                <div className="h-px w-2 bg-blue-400"></div>
                <div className="text-[10px] text-blue-500 ml-1">{normalLevel}m</div>
              </div>
              
              {/* Zero level marker */}
              <div className="absolute bottom-0 right-0 left-0 flex items-center">
                <div className="h-px w-2 bg-slate-400"></div>
                <div className="text-[10px] text-slate-600 ml-1">0m</div>
              </div>
              
              {/* Current level marker on right side */}
              <div 
                className="absolute right-0 left-0 flex items-center" 
                style={{ top: `${100 - fillPercentage}%` }}
              >
                <div className="h-0.5 w-4 bg-black"></div>
                <div className="text-[10px] font-bold text-slate-900 ml-1">{currentLevel}m</div>
              </div>
            </div>
            
            {/* Water container */}
            <div style={{...containerStyle, width: 'calc(100% - 3rem)'}}>
              {/* Animated water fill */}
              <motion.div
                initial={isInitialRender ? { height: 0 } : { height: `${fillPercentage}%` }}
                animate={{ height: `${fillPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  backgroundColor: getStatusColorRGB(),
                  backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)',
                }}
                className="border-t border-white border-opacity-30"
              >
                {/* Water wave effect */}
                <svg
                  className="absolute inset-0 w-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M0 80 Q 25 70, 50 75 T 100 65 L 100 100 L 0 100 Z"
                    fill="rgba(255, 255, 255, 0.3)"
                    animate={{
                      d: [
                        "M0 80 Q 25 70, 50 75 T 100 65 L 100 100 L 0 100 Z",
                        "M0 75 Q 25 80, 50 70 T 100 75 L 100 100 L 0 100 Z",
                        "M0 70 Q 25 75, 50 80 T 100 70 L 100 100 L 0 100 Z",
                        "M0 80 Q 25 70, 50 75 T 100 65 L 100 100 L 0 100 Z",
                      ]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 8,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.path
                    d="M0 85 Q 25 80, 50 82 T 100 78 L 100 100 L 0 100 Z"
                    fill="rgba(255, 255, 255, 0.4)"
                    animate={{
                      d: [
                        "M0 85 Q 25 80, 50 82 T 100 78 L 100 100 L 0 100 Z",
                        "M0 80 Q 25 85, 50 77 T 100 82 L 100 100 L 0 100 Z",
                        "M0 78 Q 25 82, 50 85 T 100 80 L 100 100 L 0 100 Z",
                        "M0 85 Q 25 80, 50 82 T 100 78 L 100 100 L 0 100 Z",
                      ]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 6,
                      ease: "easeInOut"
                    }}
                  />
                </svg>
              </motion.div>
              
              {/* Threshold lines */}
              <div 
                className="absolute left-0 right-0 border-t border-dashed border-red-400 z-10"
                style={{ top: `${100 - dangerPosition}%` }}
              ></div>
              <div 
                className="absolute left-0 right-0 border-t border-dashed border-amber-400 z-10"
                style={{ top: `${100 - warningPosition}%` }}
              ></div>
              <div 
                className="absolute left-0 right-0 border-t border-dashed border-blue-400 z-10"
                style={{ top: `${100 - normalPosition}%` }}
              ></div>
            </div>
          </div>
          
          {/* Right side info panel */}
          <div className="w-1/5 pl-2">
            <div className="bg-white rounded-md p-1 shadow-sm border border-slate-200 mb-2">
              <div className="text-sm font-bold text-slate-800">{currentLevel} m</div>
              <div className="text-[10px] text-slate-500">Current</div>
            </div>
            
            <div className="space-y-1">
              <div className={`p-1 rounded-md border ${
                currentLevel >= dangerLevel ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
                  <div className="text-[10px] font-medium text-slate-700">Danger</div>
                </div>
              </div>
              
              <div className={`p-1 rounded-md border ${
                currentLevel >= warningLevel && currentLevel < dangerLevel ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mr-1"></div>
                  <div className="text-[10px] font-medium text-slate-700">Warning</div>
                </div>
              </div>
              
              <div className={`p-1 rounded-md border ${
                currentLevel >= normalLevel && currentLevel < warningLevel ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-1"></div>
                  <div className="text-[10px] font-medium text-slate-700">Normal</div>
                </div>
              </div>
              
              <div className={`p-1 rounded-md border ${
                currentLevel < normalLevel ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-300 mr-1"></div>
                  <div className="text-[10px] font-medium text-slate-700">Low</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Fallback render if motion fails
    console.error("Error rendering WaterLevelIndicator with motion:", error);
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-2 flex justify-between items-center">
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBgColor()}`}>
            {getStatus()}
          </div>
        </div>
        
        <div className="text-xs text-slate-500 mb-2">
          <div>Location: {location}</div>
          <div className="text-xs">Last updated: {lastUpdated}</div>
        </div>
        
        <div className="relative flex-1 rounded-lg overflow-hidden border border-slate-200">
          <div className="absolute right-0 top-0 h-full w-12 bg-slate-50 border-l border-slate-200">
            {/* Level markers */}
            <div className="absolute top-0 right-0 left-0 flex items-center">
              <div className="h-px w-2 bg-slate-400"></div>
              <div className="text-[10px] text-slate-600 ml-1">{maxLevel}m</div>
            </div>
            <div className="absolute bottom-0 right-0 left-0 flex items-center">
              <div className="h-px w-2 bg-slate-400"></div>
              <div className="text-[10px] text-slate-600 ml-1">0m</div>
            </div>
            <div className="absolute right-0 left-0 flex items-center" style={{ top: `${100 - fillPercentage}%` }}>
              <div className="h-0.5 w-4 bg-black"></div>
              <div className="text-[10px] font-bold text-slate-900 ml-1">{currentLevel}m</div>
            </div>
          </div>
          
          <div style={{...containerStyle, width: 'calc(100% - 3rem)'}}>
            <div style={{
              ...fillStyle,
              backgroundColor: getStatusColorRGB(),
              backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)',
            }} className="border-t border-white border-opacity-30">
              {/* Simple non-animated waves */}
              <svg
                className="absolute inset-0 w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 80 Q 25 70, 50 75 T 100 65 L 100 100 L 0 100 Z"
                  fill="rgba(255, 255, 255, 0.3)"
                />
                <path
                  d="M0 85 Q 25 80, 50 82 T 100 78 L 100 100 L 0 100 Z"
                  fill="rgba(255, 255, 255, 0.4)"
                />
              </svg>
            </div>
            
            {/* Threshold lines */}
            <div className="absolute left-0 right-12 border-t border-dashed border-red-400" style={{ top: `${100 - dangerPosition}%` }}></div>
            <div className="absolute left-0 right-12 border-t border-dashed border-amber-400" style={{ top: `${100 - warningPosition}%` }}></div>
            <div className="absolute left-0 right-12 border-t border-dashed border-blue-400" style={{ top: `${100 - normalPosition}%` }}></div>
          </div>
        </div>
      </div>
    );
  }
} 