"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AlertCard, { AlertLevel } from '../components/AlertCard';
import StatCard from '../components/StatCard';
import WaterLevelIndicator from '../components/WaterLevelIndicator';

// Define alert interface
interface Alert {
  id: string;
  title: string;
  message: string;
  level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  location: string;
  timestamp: string;
}

// Mock alert data
const mockAlerts = [
  {
    id: 'ALT20250420001',
    title: 'High Water Level Alert',
    message: 'Water level has risen to 3.8m, which is above the warning threshold for this location. Monitoring continuously. Prepare for possible evacuation if levels continue to rise.',
    level: 'high' as AlertLevel,
    location: 'Main River Bridge - Sector 7',
    timestamp: '2025-04-20T08:32:15',
    source: 'Sensor #R-547'
  },
  {
    id: 'ALT20250420002',
    title: 'Discharge Rate Increasing',
    message: 'The river discharge rate has increased by 35% in the last 2 hours, indicating possible upstream flooding or heavy rainfall. Current rate: 2.3 m³/s.',
    level: 'medium' as AlertLevel,
    location: 'Confluence Point - Sector 3',
    timestamp: '2025-04-20T09:17:22',
    source: 'Flow Analysis System'
  },
  {
    id: 'ALT20250420003',
    title: 'Critical Velocity Detected',
    message: 'Water velocity has reached 3.2 m/s at monitoring point, which exceeds the critical threshold. High velocity may indicate flash flood conditions and poses erosion risk to infrastructure.',
    level: 'critical' as AlertLevel,
    location: 'Eastern Channel - Sector 12',
    timestamp: '2025-04-20T10:03:45',
    source: 'Visual Detection System'
  },
  {
    id: 'ALT20250420004',
    title: 'Rainfall Warning',
    message: 'Heavy rainfall detected in the upper watershed area. Expect increased water levels in the next 6-12 hours. Predicted accumulation: 75mm over next 24 hours.',
    level: 'medium' as AlertLevel,
    location: 'North Watershed - Region 2',
    timestamp: '2025-04-20T07:45:10',
    source: 'Meteorological Station'
  },
  {
    id: 'ALT20250420005',
    title: 'Turbidity Levels Elevated',
    message: 'Increased turbidity detected in river water, suggesting higher sediment load. This may indicate upstream erosion or construction activity.',
    level: 'low' as AlertLevel,
    location: 'Main River - Sector 5',
    timestamp: '2025-04-20T06:29:33',
    source: 'Water Quality Sensor'
  },
  {
    id: 'ALT20250420006',
    title: 'Sensor Maintenance Required',
    message: 'Water level sensor #WL-389 requires maintenance. Data may be temporarily unreliable or unavailable from this location.',
    level: 'info' as AlertLevel,
    location: 'Western Branch - Sector 9',
    timestamp: '2025-04-20T05:12:45',
    source: 'System Diagnostics'
  }
];

// Monitoring locations data
const monitoringLocations = [
  {
    id: 'loc1',
    name: 'Main River Channel',
    status: 'warning',
    waterLevel: {
      current: 3.8,
      max: 5.0,
      danger: 4.2,
      warning: 3.5,
      normal: 2.0
    },
    lastUpdate: new Date().toLocaleString()
  },
  {
    id: 'loc2',
    name: 'Eastern Tributary',
    status: 'normal',
    waterLevel: {
      current: 2.3,
      max: 4.5,
      danger: 3.8,
      warning: 3.2,
      normal: 1.8
    },
    lastUpdate: new Date().toLocaleString()
  },
  {
    id: 'loc3',
    name: 'Western Branch',
    status: 'danger',
    waterLevel: {
      current: 4.1,
      max: 5.0,
      danger: 4.0,
      warning: 3.5,
      normal: 2.2
    },
    lastUpdate: new Date().toLocaleString()
  }
];

export default function StatusAlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState(mockAlerts);
  const [activeLocation, setActiveLocation] = useState(monitoringLocations[0]);
  const [filter, setFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertStats, setAlertStats] = useState({
    critical: 1,
    high: 1,
    medium: 2,
    low: 1,
    info: 1
  });
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([
    {
      id: '1',
      title: 'Water Level Warning',
      message: 'Water level has reached 80% of maximum capacity at Station Alpha',
      level: 'medium',
      location: 'Station Alpha',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Critical Velocity Alert',
      message: 'Water velocity has exceeded 5m/s at Station Bravo',
      level: 'critical',
      location: 'Station Bravo',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Sensor Maintenance Completed',
      message: 'Routine maintenance completed for sensors at Station Charlie',
      level: 'info',
      location: 'Station Charlie',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // Auto-refresh the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Filter alerts based on selected level
  useEffect(() => {
    if (filter === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.level === filter));
    }
  }, [alerts, filter]);

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  // Function to manually refresh data with animation
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Randomly add a new alert or remove one
      if (Math.random() > 0.5 && alerts.length > 3) {
        // Remove an alert
        const newAlerts = [...alerts];
        newAlerts.pop();
        setAlerts(newAlerts);
        
        // Update stats
        setAlertStats(prev => {
          const levels = ['critical', 'high', 'medium', 'low', 'info'] as AlertLevel[];
          const randomLevel = levels[Math.floor(Math.random() * levels.length)];
          return {
            ...prev,
            [randomLevel]: Math.max(0, prev[randomLevel] - 1)
          };
        });
      } else {
        // Add a new alert
        const levels = ['critical', 'high', 'medium', 'low', 'info'] as AlertLevel[];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        
        const newAlert = {
          id: `ALT${Date.now()}`,
          title: `New ${randomLevel.charAt(0).toUpperCase() + randomLevel.slice(1)} Alert`,
          message: `This is a new ${randomLevel} alert that was just generated. Details would be provided here in a real system.`,
          level: randomLevel,
          location: `Sector ${Math.floor(Math.random() * 20) + 1}`,
          timestamp: new Date().toISOString(),
          source: 'Automated System'
        };
        
        setAlerts([newAlert, ...alerts]);
        
        // Update stats
        setAlertStats(prev => ({
          ...prev,
          [randomLevel]: prev[randomLevel] + 1
        }));
      }
      
      // Update active location data
      setActiveLocation(prev => ({
        ...prev,
        waterLevel: {
          ...prev.waterLevel,
          current: parseFloat((prev.waterLevel.current + (Math.random() * 0.4 - 0.2)).toFixed(1))
        },
        lastUpdate: new Date().toLocaleString()
      }));
      
      setCurrentTime(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page header */}
        <div className="border-b border-gray-200 pb-5">
          <div className="flex flex-wrap items-center justify-between">
            <motion.h1 
              className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Status & Alerts
            </motion.h1>
            
            <motion.div 
              className="flex items-center mt-4 sm:mt-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-gray-600 text-sm mr-4">
                Last updated: {currentTime.toLocaleTimeString()}
              </span>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isRefreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </>
                )}
              </button>
            </motion.div>
          </div>
          <p className="mt-2 max-w-4xl text-gray-600">
            Monitor current alerts and water level status from various sensor locations. 
            Critical information is updated in real-time to help with decision making.
          </p>
        </div>
        
        {/* Alert stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard 
            title="Critical Alerts" 
            value={alertStats.critical}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            color="red"
          />
          
          <StatCard 
            title="High Alerts" 
            value={alertStats.high}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            color="red"
            delay={0.1}
          />
          
          <StatCard 
            title="Medium Alerts" 
            value={alertStats.medium}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="purple"
            delay={0.2}
          />
          
          <StatCard 
            title="Low Alerts" 
            value={alertStats.low}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="blue"
            delay={0.3}
          />
          
          <StatCard 
            title="Info Alerts" 
            value={alertStats.info}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="cyan"
            delay={0.4}
          />
        </div>
        
        {/* Active location water level */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <WaterLevelIndicator 
              currentLevel={activeLocation.waterLevel.current}
              maxLevel={activeLocation.waterLevel.max}
              dangerLevel={activeLocation.waterLevel.danger}
              warningLevel={activeLocation.waterLevel.warning}
              normalLevel={activeLocation.waterLevel.normal}
              location={activeLocation.name}
              lastUpdated={activeLocation.lastUpdate}
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 h-full">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Monitoring Locations</h2>
              <div className="space-y-3">
                {monitoringLocations.map(location => (
                  <button
                    key={location.id}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      activeLocation.id === location.id
                        ? 'bg-blue-100 border-blue-300 border'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveLocation(location)}
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-3 h-3 rounded-full mr-3
                        ${location.status === 'danger' ? 'bg-red-500' : ''}
                        ${location.status === 'warning' ? 'bg-amber-500' : ''}
                        ${location.status === 'normal' ? 'bg-green-500' : ''}
                      `}></div>
                      <span className="text-sm font-medium text-gray-800">{location.name}</span>
                    </div>
                    <div>
                      <span className={`text-sm font-bold
                        ${location.status === 'danger' ? 'text-red-600' : ''}
                        ${location.status === 'warning' ? 'text-amber-600' : ''}
                        ${location.status === 'normal' ? 'text-green-600' : ''}
                      `}>
                        {location.waterLevel.current}m
                      </span>
                    </div>
                  </button>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm transition-colors">
                    + Add Monitoring Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alert filters */}
        <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
          <div className="flex flex-wrap items-center justify-between">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0 text-gray-800">Active Alerts</h2>
            <div className="flex flex-wrap space-x-2">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleFilterChange('critical')}
              >
                Critical
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'high' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleFilterChange('high')}
              >
                High
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'medium' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleFilterChange('medium')}
              >
                Medium
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'low' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleFilterChange('low')}
              >
                Low
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'info' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleFilterChange('info')}
              >
                Info
              </button>
            </div>
          </div>
        </div>
        
        {/* Alert List */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                id={alert.id}
                title={alert.title}
                message={alert.message}
                level={alert.level}
                location={alert.location}
                timestamp={alert.timestamp}
                source={alert.source}
                delay={index * 0.1}
              />
            ))
          ) : (
            <div className="bg-gray-900 rounded-lg p-8 text-center shadow-lg border border-gray-800">
              <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-gray-300">No active alerts</h3>
              <p className="mt-1 text-gray-500">There are no active alerts matching your current filter.</p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => handleFilterChange('all')}
                >
                  View all alerts
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Alert settings card */}
        <div className="bg-white mt-8 rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-xl font-semibold text-slate-800">Alert Settings</h3>
            <p className="text-sm text-slate-500 mt-1">Configure how you want to receive alerts from the system.</p>
          </div>
          
          <div className="p-5 space-y-6">
            {/* SMS Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-base font-medium text-slate-800">SMS Alerts</h4>
                  <p className="text-sm text-slate-500">Receive critical notifications via SMS</p>
                </div>
              </div>
              
              {/* Toggle switch */}
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" checked={smsAlerts} onChange={() => setSmsAlerts(!smsAlerts)} />
                <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-base font-medium text-slate-800">Push Notifications</h4>
                  <p className="text-sm text-slate-500">Get real-time alerts in your browser</p>
                </div>
              </div>
              
              {/* Toggle switch */}
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
                <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            {/* Save Settings button */}
            <div className="mt-6">
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
        
        {/* Alert History */}
        <div className="bg-white mt-8 rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-xl font-semibold text-slate-800">Alert History</h3>
            <p className="text-sm text-slate-500 mt-1">Recent alerts from the monitoring system.</p>
          </div>
          
          {/* Alert History List */}
          <div className="overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto p-4 space-y-4">
              {alertHistory.map((alert, index) => (
                <AlertCard
                  key={alert.id}
                  id={alert.id}
                  title={alert.title}
                  message={alert.message}
                  level={alert.level}
                  location={alert.location}
                  timestamp={alert.timestamp}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* CSS for toggle switches */}
      <style jsx>{`
        input:checked ~ .dot {
          transform: translateX(100%);
        }
        
        input:checked ~ .block {
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
} 