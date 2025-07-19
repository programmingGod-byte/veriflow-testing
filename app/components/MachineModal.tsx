import React from 'react';
import { X, Monitor, Plus, Check } from 'lucide-react';

const AddMachineModal = ({
  machineId,
  setMachineId,
  machinePassword,
  setMachinePassword,
  selectedMachineType,
  setSelectedMachineType,
  isAddingMachine,
  setIsAddingMachine,
  isAddMachineModalOpen,
  setIsAddMachineModalOpen,
  handleAddMachine
}) => {
  const machineTypes = [
    {
      id: 'pravaah',
      name: 'Pravaah',
      description: 'Flow Management System',
      icon: Monitor,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'tarang',
      name: 'Tarang',
      description: 'Wave Analysis System',
      icon: Monitor,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'drishti',
      name: 'Drishti',
      description: 'Vision Processing Unit',
      icon: Monitor,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'doordrishti',
      name: 'Doordrishti',
      description: 'Remote Vision System',
      icon: Monitor,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  if (!isAddMachineModalOpen) return null;

  return (
    <form onSubmit={handleAddMachine} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl p-4">
      <div className="w-full max-w-3xl bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-6 sm:px-8 sm:py-8">
          <button
            onClick={() => setIsAddMachineModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Add New Machine</h2>
            <p className="text-blue-100 text-sm sm:text-base">Connect your device to the system</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 space-y-8">
          {/* Machine Type Selection */}
          <div>
            <label className="block text-base sm:text-xl font-semibold text-white mb-4">Select Machine Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {machineTypes.map((machine) => {
                const IconComponent = machine.icon;
                const isSelected = selectedMachineType === machine.id;

                return (
                  <div
                    key={machine.id}
                    className={`relative cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-400 bg-white/30 ring-2 ring-blue-200 shadow'
                        : 'border-white/20 hover:border-blue-200 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedMachineType(machine.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${machine.gradient} flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">{machine.name}</h3>
                        <p className="text-white/80 text-sm">{machine.description}</p>
                      </div>

                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Machine Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Machine Name</label>
              <input
                type="text"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300 border border-white/30"
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Machine Code</label>
              <input
                type="text"
                value={machinePassword}
                onChange={(e) => setMachinePassword(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300 border border-white/30"
                placeholder=""
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={() => setIsAddMachineModalOpen(false)}
              className="w-full sm:w-auto flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition border border-white/20"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isAddingMachine ||
                !selectedMachineType ||
                !machineId.trim() ||
                !machinePassword.trim()
              }
              className="w-full sm:w-auto flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:transform-none"
            >
              {isAddingMachine ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Machine
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddMachineModal;
