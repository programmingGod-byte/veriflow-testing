'use client';

import { SessionProvider } from 'next-auth/react';
import React, { createContext, useState } from 'react';

// lib/encryption.ts


// Create and export the context
export const MyContext = createContext();

// Create and export the provider component
export function Providers({ children }) {
  const [value, setValue] = useState({
    machineName: "",
    machineCode: "",
    machineType: "",

  });
  const [iseUserAdmin, setIsUserAdmin] = useState(false)
  const [user, setUser] = useState([])
  const [allMachines, setAllMachines] = useState([])

  return (
    <SessionProvider>
      <MyContext.Provider value={{ allMachines, setAllMachines, value, setValue, user, setUser, setIsUserAdmin, iseUserAdmin }}>
        {children}
      </MyContext.Provider>
    </SessionProvider>
  );
}

































// <motion.div
//         className="relative w-full bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         {/* Header with controls */}
//         <div className="p-4 border-b border-slate-100">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div className="flex items-center space-x-3">
//               <h3 className="text-lg font-semibold text-slate-800">River Velocity Profile</h3>
//               {lastFetchTime && (
//                 <span className="text-xs text-slate-500">
//                   Last updated: {lastFetchTime.toLocaleTimeString()}
//                 </span>
//               )}
//             </div>

//             {/* Action buttons */}
//             <div className="flex items-center space-x-2">
//                 <button
//                   onClick={downloadCSV}
//                   className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
//                 >
//                   <DownloadIcon className="w-4 h-4 mr-2" />
//                   Download CSV
//                 </button>

//               <button
//                 onClick={handleRefresh}
//                 disabled={refreshing}
//                 className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <RefreshIcon className="w-4 h-4 mr-2" spinning={refreshing} />
//                 {refreshing ? 'Refreshing...' : 'Refresh'}
//               </button>
//             </div>
//           </div>

//           {/* Time selection mode buttons */}
//           <div className="mt-4">
//             <TimeSelectionModeButtons />
//           </div>

//           {/* Time selection controls */}
//           <div className="space-y-4">
//             {/* Dropdown Selection Mode */}
//             {timeSelectionMode === 'dropdown' && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Date:</label>
//                   <select
//                     value={selectedDate}
//                     onChange={(e) => setSelectedDate(e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="">Select date...</option>
//                     {availableDates.map(date => (
//                       <option key={date} value={date}>{date}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Time:</label>
//                   <select
//                     value={selectedTime}
//                     onChange={(e) => setSelectedTime(e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     disabled={!selectedDate}
//                   >
//                     <option value="">Select time...</option>
//                     {availableTimes.map(time => (
//                       <option key={time} value={time}>{time}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             )}

//             {/* Manual Input Mode */}
//             {timeSelectionMode === 'manual' && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Date:</label>
//                   <input
//                     type="date"
//                     value={manualDate}
//                     onChange={(e) => setManualDate(e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Time:</label>
//                   <input
//                     type="time"
//                     step="1"
//                     value={manualTime}
//                     onChange={(e) => setManualTime(e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Range Selection Mode */}
//             {timeSelectionMode === 'range' && (
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Start Date:</label>
//                     <input
//                       type="date"
//                       value={dateRangeStart}
//                       onChange={(e) => setDateRangeStart(e.target.value)}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">End Date:</label>
//                     <input
//                       type="date"
//                       value={dateRangeEnd}
//                       onChange={(e) => setDateRangeEnd(e.target.value)}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">Start Time (optional):</label>
//                     <input
//                       type="time"
//                       step="1"
//                       value={timeRangeStart}
//                       onChange={(e) => setTimeRangeStart(e.target.value)}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-1">End Time (optional):</label>
//                     <input
//                       type="time"
//                       step="1"
//                       value={timeRangeEnd}
//                       onChange={(e) => setTimeRangeEnd(e.target.value)}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Chart container */}
//         <div className="p-4">
//           {filteredData.length > 0 ? (
//             <div className="relative">
//               <canvas
//                 ref={canvasRef}
//                 className="w-full"
//                 style={{ height: '400px' }}
//               />
//             </div>
//           ) : (
//             <div className="flex items-center justify-center h-96">
//               <div className="text-center">
//                 <p className="text-slate-500 mb-2">No data available for selected time</p>
//                 {timeSelectionMode !== 'range' && (
//                   <p className="text-sm text-slate-400">
//                     Please select a valid date and time combination
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </motion.div>




