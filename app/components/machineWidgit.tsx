"use client";

import React, { useState, useEffect ,useContext} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MyContext } from '../providers';
interface Machine {
  machineCode: string;
  machineName?: string;
  machineType: 'pravaah' | 'tarang' | 'drishti' | 'doordrishti';
  status?: 'online' | 'offline' | 'maintenance';
  longitude?: string;
  latitude?: string;
  addedAt?: string;
  depth?: string;
}

const MachineDetailsWidget =  ({
  isOpen,
  onClose,
  machines,
  handleDeleteMachine,
  openEditModal
}) => {
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>(machines);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
    const {value,setValue} = useContext(MyContext)
  const [shouldNavigate, setShouldNavigate] = useState(false);
    
    const router = useRouter()
  // Machine type configurations with images and colors
  const machineTypeConfig = {
    pravaah: {
      name: 'Pravaah',
      icon: '🌊',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'Water Flow Monitoring'
    },
    tarang: {
      name: 'Tarang',
      icon: '🌡️',
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      description: 'Temperature & Humidity Sensor'
    },
    drishti: {
      name: 'Drishti',
      icon: '👁️',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      description: 'Visual Monitoring System'
    },
    doordrishti: {
      name: 'Doordrishti',
      icon: '📡',
      color: 'from-orange-500 to-orange-700',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      description: 'Remote Vision System'
    }
  };

  function viewMachine(machine: any) {
    setValue({
      machineName: machine.machineName,
      machineCode: machine.machineCode,
      machineType: machine.machineType,
      depth: machine.depth,
    });
    setShouldNavigate(true);
  }

  useEffect(() => {
    if (value && shouldNavigate) {
      router.push("/realtime-data");
      setShouldNavigate(false); // reset flag
    }
  }, [value, shouldNavigate, router]);

  // Filter machines based on selected filter and search query
  useEffect(() => {
    let filtered = machines;

    // Filter by machine type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(machine => machine.machineType === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(machine =>
        machine.machineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.machineCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMachines(filtered);
  }, [machines, selectedFilter, searchQuery]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status text color
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get machine type options for filter
  const machineTypes = ['all', ...Object.keys(machineTypeConfig)] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Widget Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Machine Details</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search machines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {machineTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedFilter(type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === type
                        ? 'bg-white text-blue-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {type === 'all' ? 'All' : machineTypeConfig[type as keyof typeof machineTypeConfig].name}
                    {type !== 'all' && (
                      <span className="ml-1">
                        {machineTypeConfig[type as keyof typeof machineTypeConfig].icon}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Machine Count */}
            <div className="px-4 py-3 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">
                {filteredMachines.length} of {machines.length} machines
              </p>
            </div>

            {/* Machines List */}
            <div className="flex-1 overflow-y-auto">
              {filteredMachines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-1">No machines found</p>
                  <p className="text-sm text-center">
                    {searchQuery.trim() ? 'Try adjusting your search or filters' : 'Add some machines to get started'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {filteredMachines.map((machine) => {
                    const config = machineTypeConfig[machine.machineType];
                    return (
                      <motion.div
                        key={machine.machineCode}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Machine Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl`}>
                              {config.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">
                                {machine.machineName || `Machine ${machine.machineCode}`}
                              </h3>
                              <p className={`text-sm font-medium ${config.textColor}`}>
                                {config.name}
                              </p>
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(machine.status || 'offline')}`}></div>
                        </div>

                        {/* Machine Details */}
                        <div className="space-y-3">
                          {/* Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusTextColor(machine.status || 'offline')}`}>
                              {machine.status || 'offline'}
                            </span>
                          </div>

                          {/* Machine Code */}

                          {/* Type Description */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Function:</span>
                            <span className="text-sm text-gray-700">
                              {config.description}
                            </span>
                          </div>

                          {/* Location */}
                          {(machine.latitude !== '0' || machine.longitude !== '0') && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Location:</span>
                              <span className="text-sm text-gray-700">
                                {parseFloat(machine.latitude || '0').toFixed(4)}, {parseFloat(machine.longitude || '0').toFixed(4)}
                              </span>
                            </div>
                          )}

                          {/* Added Date */}
                          {machine.addedAt && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Added:</span>
                              <span className="text-sm text-gray-700">
                                {new Date(machine.addedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                          <button onClick={()=>{
                            onClose();
                            viewMachine(machine);
                          }} className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                            View Data
                          </button>
                          <button onClick={()=>{
                            onClose();
                           console.log(openEditModal);
                           openEditModal(machine)
                           
                          }} className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                            Configure
                          </button>
                          <button onClick={()=>{
                            console.log(machine)
                            handleDeleteMachine(machine.machineCode)
                          }} className="flex-1 bg-red-50 text-red-600 py-2.5 px-4 rounded-xl text-sm font-semibold shadow-sm hover:bg-red-100 hover:text-red-700 transition-all duration-200">
  Delete
</button>

                          
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Machines: {machines.length}</span>
                <span>
                  Online: {machines.filter(m => m.status === 'online').length}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MachineDetailsWidget;