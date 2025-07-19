import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Monitor, Network, Tag } from 'lucide-react';

const EditMachineModal = () => {
  const [editMachineName, setEditMachineName] = useState('Production Server');
  const [editMachineIp, setEditMachineIp] = useState('192.168.1.100');
  const [editMachineType, setEditMachineType] = useState('pravaah');
  const [isEditingMachine, setIsEditingMachine] = useState(false);
  const [isEditMachineModalOpen, setIsEditMachineModalOpen] = useState(true);

  const machineTypes = [
    { value: 'pravaah', label: 'Pravaah', color: 'bg-blue-100 text-blue-800' },
    { value: 'tarang', label: 'Tarang', color: 'bg-green-100 text-green-800' },
    { value: 'doordrishti', label: 'Doordrishti', color: 'bg-purple-100 text-purple-800' },
    { value: 'drishti', label: 'Drishti', color: 'bg-orange-100 text-orange-800' }
  ];

  const handleEditMachine = () => {
    // Basic validation
    if (!editMachineName.trim() || !editMachineIp.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsEditingMachine(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsEditingMachine(false);
      setIsEditMachineModalOpen(false);
      console.log('Machine updated:', {
        name: editMachineName,
        ip: editMachineIp,
        type: editMachineType
      });
    }, 1500);
  };

  if (!isEditMachineModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Machine</h2>
              <p className="text-sm text-gray-500">Update machine configuration</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditMachineModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Machine Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Tag className="w-4 h-4 text-gray-400" />
                Machine Name
              </label>
              <input
                type="text"
                value={editMachineName}
                onChange={(e) => setEditMachineName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="e.g., Production Server"
                required
              />
            </div>

            {/* IP Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Network className="w-4 h-4 text-gray-400" />
                IP Address
              </label>
              <input
                type="text"
                value={editMachineIp}
                onChange={(e) => setEditMachineIp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="e.g., 192.168.1.100"
                required
                pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
              />
            </div>

            {/* Machine Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Monitor className="w-4 h-4 text-gray-400" />
                Machine Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {machineTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      editMachineType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="machineType"
                      value={type.value}
                      checked={editMachineType === type.value}
                      onChange={(e) => setEditMachineType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${type.color}`}>
                        {type.label}
                      </span>
                      {editMachineType === type.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => setIsEditMachineModalOpen(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditMachine}
              disabled={isEditingMachine}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {isEditingMachine ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Updating...
                </div>
              ) : (
                'Update Machine'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditMachineModal;