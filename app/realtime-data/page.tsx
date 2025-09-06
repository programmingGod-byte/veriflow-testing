"use client";

import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import RiverVisualization from '../components/RiverVisualization';
import VelocityChart from '../components/VelocityChart';
import DischargeContributionPieChart from '../components/DischargeContributionPieChart';
import DischargeBarChart from '../components/DischargeBarChart';
import DischargeGraph from '../components/DischargeGraph';

import StatCard from '../components/StatCard';
import WaterLevelIndicator from '../components/WaterLevelIndicator';
import { MyContext } from '../providers';
import MediaViewer from '../components/DisplayImageAndVideos';
// import FlowAngleDashboard from '../components/FlowDirectionChart';
import TemperatureChart from '../components/TemperatureChart';
import BatteryChart from '../components/BatteryLevel';
import WeatherForecast from '../components/weatherForcast';
// Mock data based on the provided images
const riverData = {
  flowDirection: 62.5,
  sections: [
    { id: 1, velocity: 0.1508, discharge: 0.01, percentage: 0.8 },
    { id: 2, velocity: 0.1619, discharge: 0.02, percentage: 1.6 },
    { id: 3, velocity: 0.3205, discharge: 0.06, percentage: 4.8 },
    { id: 4, velocity: 0.6571, discharge: 0.13, percentage: 10.5 },
    { id: 5, velocity: 0.8939, discharge: 0.17, percentage: 13.7 },
    { id: 6, velocity: 1.7368, discharge: 0.35, percentage: 28.2 },
    { id: 7, velocity: 1.2910, discharge: 0.27, percentage: 21.8 },
    { id: 8, velocity: 0.7755, discharge: 0.13, percentage: 10.5 },
    { id: 9, velocity: 0.5315, discharge: 0.06, percentage: 4.8 },
    { id: 10, velocity: 0.3997, discharge: 0.02, percentage: 1.6 }
  ],
  totalDischarge: 1.24
};

// Mock time-series data for DischargeGraph
const timeSeriesData = [
  { date: '2025-04-14', discharge: 0.95 },
  { date: '2025-04-15', discharge: 1.02 },
  { date: '2025-04-16', discharge: 1.15 },
  { date: '2025-04-17', discharge: 1.28 },
  { date: '2025-04-18', discharge: 1.19 },
  { date: '2025-04-19', discharge: 1.22 },
  { date: '2025-04-20', discharge: 1.24 }
];

const waterLevelData = {
  currentLevel: 2.8,
  maxLevel: 5.0,
  dangerLevel: 4.0,
  warningLevel: 3.5,
  normalLevel: 2.0,
  location: 'Main River Channel',
  lastUpdated: new Date().toLocaleString()
};

export default function RealtimeDataPage() {
  const [data, setData] = useState(riverData);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dischargeHistory, setDischargeHistory] = useState(timeSeriesData);
  const { value, setValue,iseUserAdmin } = useContext(MyContext)
  const [maxVelocity, setMaxVelocity] = useState(0);
  const [currentDepth, setCurrentDepth] = useState(0)
  const [batteryLevel, setBatteryLevel] = useState(0)
  const [meanVelocity, setMeanVelocity] = useState(0);
  const [maxVelocityIncrease, setMaxVelocityIncrease] = useState(0);
  const [channelWidth, setTotalChannelWidth] = useState(0)
  const [meanVelocityIncrease, setMeanVelocityIncrease] = useState(0);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };
  // Format time consistently for both server and client
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (!value.machineCode) return;
    async function fetchWidth() {
      try {
        const fetching = await fetch(`/api/newversion/width/?ip=${value.machineCode}`)
        const data = await fetching.json();
        setTotalChannelWidth(data.width)
        //console.log("###############################################################3")
        //console.log(data)
      } catch (error) {

      }
    }
    fetchWidth()
  }, [value])

  // Auto-refresh the data every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Simulate data fluctuation
      setData(prevData => {
        const newData = {
          ...prevData,
          sections: prevData.sections.map(section => ({
            ...section,
            velocity: section.velocity * (0.95 + Math.random() * 0.1),
            discharge: section.discharge * (0.95 + Math.random() * 0.1)
          }))
        };

        // Recalculate total discharge and percentages
        const newTotal = newData.sections.reduce((sum, section) => sum + section.discharge, 0);
        newData.totalDischarge = parseFloat(newTotal.toFixed(2));

        newData.sections = newData.sections.map(section => ({
          ...section,
          percentage: parseFloat(((section.discharge / newTotal) * 100).toFixed(1))
        }));

        return newData;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Function to manually refresh data with animation
  const refreshData = () => {
    setIsRefreshing(true);

    // Simulate API call delay
    setTimeout(() => {
      setData(prevData => {
        const newData = {
          ...prevData,
          sections: prevData.sections.map(section => ({
            ...section,
            velocity: section.velocity * (0.9 + Math.random() * 0.2),
            discharge: section.discharge * (0.9 + Math.random() * 0.2)
          }))
        };

        // Recalculate total discharge and percentages
        const newTotal = newData.sections.reduce((sum, section) => sum + section.discharge, 0);
        newData.totalDischarge = parseFloat(newTotal.toFixed(2));

        newData.sections = newData.sections.map(section => ({
          ...section,
          percentage: parseFloat(((section.discharge / newTotal) * 100).toFixed(1))
        }));

        // Update time-series data with new point
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        setDischargeHistory(prev => {
          // Remove oldest point if we have more than 7
          const updated = prev.length >= 7 ? [...prev.slice(1)] : [...prev];
          // Add the newest point
          return [...updated, { date: dateStr, discharge: newData.totalDischarge }];
        });

        return newData;
      });

      setCurrentTime(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  // Velocity and discharge data for charts
  const velocityData = data.sections.map(section => ({
    section: section.id,
    velocity: section.velocity
  }));

  const dischargeData = data.sections.map(section => ({
    day: `Section ${section.id}`,
    value: section.discharge
  }));

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gray-900 text-gray-200' 
        : 'bg-gray-50 text-gray-800'
    }`}>
      {/* Dark Mode Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full transition-all duration-300 ${
          isDarkMode 
            ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
            : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
        } shadow-lg`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isDarkMode ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </motion.button>

      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page header */}
        <div className="border-b border-gray-200 pb-5">
          <div className="flex flex-wrap items-center justify-between">
            <motion.div
              className="flex items-center justify-center gap-3 flex-wrap"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h5 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600">
                {value.machineName}
              </h5>

              <span className="text-base sm:text-lg font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-xl shadow-sm">
                {value.machineType}
              </span>
            </motion.div>


            <motion.div
              className="flex items-center mt-4 sm:mt-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="text-slate-600 text-sm mr-4">
                {/* Last updated: {formatTime(currentTime)} */}
              </span>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
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
          <p className="mt-2 max-w-4xl text-slate-500">
            Real-time visualization and analysis of river conditions including flow velocity, discharge rates, and water levels.
            Data is automatically updated every minute.
          </p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Depth"
            value={currentDepth}
            unit="m"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            // change={{ value: 2.3, trend: 'up' }}
            color="blue"
            delay={0.1}
          />


          {/* Fixed StatCard for machines that are not tarang */}
          {value?.machineType !== "tarang" && (
            <StatCard
              title="Velocity"
              value={meanVelocity}
              unit="m/s"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              }
              color="purple"
              change={{ value: meanVelocityIncrease, trend: meanVelocityIncrease > 0 ? 'up' : 'down' }}
              delay={0.3}
            />
          )}

{value?.machineType !== "tarang" && (
            <StatCard
              title="Battery Health"
              value={batteryLevel}
              unit="%"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              }
              color="red"
              // change={{ value: meanVelocityIncrease, trend: meanVelocityIncrease > 0 ? 'up' : 'down' }}
              delay={0.3}
            />
          )}


          {/* Fixed StatCard for machines that are not tarang AND not pravaah */}
          {(value?.machineType !== "tarang" && value?.machineType !== "pravaah") && (
            <StatCard
              title="Channel Width"
              value={channelWidth}
              unit="meters"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              }
              color="green"
              delay={0.4}
            />
          )}
        </div>

        {/* For doordrishti and drishti machines */}
        {(value?.machineType === "doordrishti" || value?.machineType === "drishti") && (
          <>
            {/* River Cross-Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">River Cross-Section Visualization</h2>
              <RiverVisualization setCurrentDepth={setCurrentDepth} />
              <div className="mt-4 text-sm text-slate-500">
                This visualization shows the river cross-section with color-coded flow velocities.
                The arrow indicates the primary flow direction.
              </div>
            </div>

            {/* Velocity Profile */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">Velocity Profile</h2>
              <VelocityChart
                setMaxVelocityIncrease={setMaxVelocityIncrease}
                setMeanVelocityIncrease={setMeanVelocityIncrease}
                setMaxVelocity={setMaxVelocity}
                setMeanVelocity={setMeanVelocity}
                data={velocityData}
                flowDirection={data.flowDirection}
              />
              <div className="mt-4 text-sm text-slate-500">
                Velocity distribution across the river channel sections from bank to bank.
                Higher velocities typically occur in the central channel.
              </div>
            </div>

            <>

             <div
  className={`bg-white rounded-lg p-4 shadow-sm border border-slate-100 mt-6 ${
    !iseUserAdmin ? "hidden" : ""
  }`}
>
  {/* <h2 className="text-xl font-semibold mb-4 text-slate-700"> Battery Health </h2> */}
  <BatteryChart setBatteryLevel={setBatteryLevel} />
</div>

            
          </>


            {/* Temperature Chart */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 mt-6">
              
              <>
              {
                iseUserAdmin  && (
                  <>
                  <h2 className="text-xl font-semibold mb-4 text-slate-700">Temperature Over Time</h2>
                  <TemperatureChart />
                  </>
                )
              }
              </>
            </div>

            {/* Media Viewer */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 mt-6">
              <MediaViewer />
              <div className="mt-4 text-sm text-slate-500">
                Historical and real-time image and video viewer
              </div>
            </div>
          </>
        )}










        {/* For tarang machines */}
        {value?.machineType === "tarang" && (
          <>
            {/* River Cross-Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">River Cross-Section Visualization</h2>
              <RiverVisualization setCurrentDepth={setCurrentDepth} />
              <div className="mt-4 text-sm text-slate-500">
                This visualization shows the river cross-section with color-coded flow velocities.
                The arrow indicates the primary flow direction.
              </div>
            </div>
          </>
        )}

        {/* For pravaah machines */}
        {value?.machineType === "pravaah" && (
          <>
            {/* River Cross-Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">River Cross-Section Visualization</h2>
              <RiverVisualization setCurrentDepth={setCurrentDepth} />
              <div className="mt-4 text-sm text-slate-500">
                This visualization shows the river cross-section with color-coded flow velocities.
                The arrow indicates the primary flow direction.
              </div>
            </div>

            {/* Velocity Profile */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">Velocity Profile</h2>
              <VelocityChart
                setMaxVelocityIncrease={setMaxVelocityIncrease}
                setMeanVelocityIncrease={setMeanVelocityIncrease}
                setMaxVelocity={setMaxVelocity}
                setMeanVelocity={setMeanVelocity}
                data={velocityData}
                flowDirection={data.flowDirection}
              />
              <div className="mt-4 text-sm text-slate-500">
                Velocity distribution across the river channel sections from bank to bank.
                Higher velocities typically occur in the central channel.
              </div>
            </div>
          </>
        )}


        <>
        
        {
          iseUserAdmin && (
           <WeatherForecast latitude={value.latitude} longitude={value.longitude}/> 
          )
        }
        </>






        
      </motion.div>
    </div>
  );
} 