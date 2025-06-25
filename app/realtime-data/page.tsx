











  "use client";

  import { useState, useEffect,useContext } from 'react';
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
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dischargeHistory, setDischargeHistory] = useState(timeSeriesData);
    const {value,setValue} = useContext(MyContext)
    const [maxVelocity, setMaxVelocity] = useState(0);
    const [meanVelocity, setMeanVelocity] = useState(0);
    // Format time consistently for both server and client
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    };

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
                className="text-3xl font-bold tracking-tight text-blue-500 sm:text-4xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Real-Time River Data
              </motion.h1>
              

              <motion.h1 
                className="text font-bold tracking-tight text-blue-500 sm:text-4xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {
                  value.name
                }
              </motion.h1>

              <motion.div 
                className="flex items-center mt-4 sm:mt-0"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="text-slate-600 text-sm mr-4">
                  Last updated: {formatTime(currentTime)}
                </span>
                <button
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 ${
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
            <p className="mt-2 max-w-4xl text-slate-500">
              Real-time visualization and analysis of river conditions including flow velocity, discharge rates, and water levels. 
              Data is automatically updated every minute.
            </p>
          </div>
          
          {/* Key stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Discharge" 
              value={data.totalDischarge} 
              unit="m³/s"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              change={{ value: 2.3, trend: 'up' }}
              color="blue"
              delay={0.1}
            />
            
            <StatCard 
              title="Max Velocity" 
              value={maxVelocity} 
              unit="m/s"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              color="cyan"
              delay={0.2}
            />
            
              

            <StatCard 
              title="Mean Velocity" 
              value={meanVelocity} 
              unit="m/s"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              }
              color="purple"
              delay={0.3}
            />
            
            <StatCard 
              title="Channel Width" 
              value="5.43" 
              unit="meters"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              }
              color="green"
              delay={0.4}
            />
          </div>
          
          {/* River visualization and water level */}
          <div >
            <div >
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                <h2 className="text-xl font-semibold mb-4 text-slate-700">River Cross-Section Visualization</h2>
                <RiverVisualization 
                  flowDirection={data.flowDirection} 
                  sections={data.sections}
                />
                <div className="mt-4 text-sm text-slate-500">
                  This visualization shows the river cross-section with color-coded flow velocities. 
                  The arrow indicates the primary flow direction.
                </div>
              </div>
            </div>
            
            {/* <div className="lg:col-span-1 flex flex-col">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 h-full">
                <h2 className="text-xl font-semibold mb-4 text-slate-700">Water Level</h2>
                <div className="h-72 md:h-80 flex items-center justify-center">
                  <WaterLevelIndicator 
                    currentLevel={waterLevelData.currentLevel}
                    maxLevel={waterLevelData.maxLevel}
                    dangerLevel={waterLevelData.dangerLevel}
                    warningLevel={waterLevelData.warningLevel}
                    normalLevel={waterLevelData.normalLevel}
                    location={waterLevelData.location}
                    lastUpdated={waterLevelData.lastUpdated}
                  />
                </div>
              </div>
            </div> */}
          </div>
          
          {/* Discharge Graph */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Discharge Over Time</h2>
            <DischargeGraph data={dischargeHistory} />
            <div className="mt-4 text-sm text-slate-500">
              Historical and real-time discharge measurements showing the total river flow volume over the past week.
              Trend analysis helps predict potential flooding conditions.
            </div>
          </div>
          
          {/* Rearranged charts as requested - one below the other */}
          <div className="space-y-6">
            {/* Velocity Profile */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">Velocity Profile</h2>
              <VelocityChart setMaxVelocity={setMaxVelocity} setMeanVelocity={setMeanVelocity} data={velocityData} flowDirection={data.flowDirection} />
              <div className="mt-4 text-sm text-slate-500">
                Velocity distribution across the river channel sections from bank to bank.
                Higher velocities typically occur in the central channel.
              </div>
            </div>
            
            {/* Discharge Contribution Pie Chart */}
            {/* <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">Discharge Contribution</h2>
              <DischargeContributionPieChart 
                data={data.sections} 
                totalDischarge={data.totalDischarge} 
              />
              <div className="mt-4 text-sm text-slate-500">
                Proportion of the total discharge contributed by each river section.
                Sections with higher velocity and depth contribute more to the total flow.
              </div>
            </div> */}
            
            {/* Discharge Bar Chart */}
            {/* <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
              <h2 className="text-xl font-semibold mb-4 text-slate-700">Section Discharge Distribution</h2>
              <DischargeBarChart data={dischargeData} />
              <div className="mt-4 text-sm text-slate-500">
                Discharge values for each section of the river channel. The discharge is calculated
                based on the cross-sectional area and flow velocity at each position.
              </div>
            </div> */}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Discharge Over Time</h2>
            <MediaViewer />
            <div className="mt-4 text-sm text-slate-500">
              Historical and real-time image and video viewer
            </div>
          </div>
          

          
          {/* Data summary and export options */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium text-slate-700">Data Summary</h3>
                <p className="mt-1 text-sm text-slate-500">
                  All measurements taken at Main River Station on {currentTime.toLocaleDateString()} at {formatTime(currentTime)}.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4 flex">
                <button
                  type="button"
                  className="mr-3 inline-flex items-center px-4 py-2 border border-slate-200 rounded-md shadow-sm text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Historical
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  } 