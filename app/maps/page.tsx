"use client";
import React, { useState, useEffect, useContext } from 'react';
import { Moon, Sun, MapPin, Loader, Search, X, Plus, Edit, Save, AlertCircle } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { MyContext } from '../providers';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import map-related components with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

const MapComponent = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [modalLatitude, setModalLatitude] = useState('');
  const [modalLongitude, setModalLongitude] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  const { value, setValue, user, setUser, setAllMachines, allMachines } = useContext(MyContext);
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Initialize client-side only code
  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import Leaflet only on client side
    const initializeLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const leaflet = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        // Fix for default markers in react-leaflet
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        
        setL(leaflet.default);
      }
    };
    
    initializeLeaflet();
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth');
    }

    if (user) {
      console.log(user);
      console.log("all Machines", allMachines);
    }
    
    if (allMachines.length > 0) {
      let finalMachines = [];
      allMachines.map((machine, index) => {
        let obj = {
          name: machine.name,
          longitude: parseFloat(machine.longitude),
          latitude: parseFloat(machine.latitude),
          description: `Machine ID: ${machine.id}`,
          id: machine.id,
          password: machine.password,
          category: "machine",
          image: "https://via.placeholder.com/300x200?text=Machine",
        };
        finalMachines.push(obj);
      });
      setLocations(finalMachines);
      setFilteredLocations(finalMachines);
    }
  }, [status, router, user, allMachines]);

  // Default coordinates for map center
  const defaultLat = 31.7754;
  const defaultLng = 76.9861;

  // Simulate fetching data from server
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Filter locations based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm, locations]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Create custom markers for different types
  const createCustomIcon = (color = 'blue') => {
    if (!L) return null;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>`,
      iconSize: [25, 25],
      iconAnchor: [12, 25],
      popupAnchor: [0, -25],
    });
  };

  // Open modal for adding/editing location
  const openModal = (machine) => {
    setSelectedMachine(machine);
    setModalLatitude(machine.latitude.toString());
    setModalLongitude(machine.longitude.toString());
    setIsModalOpen(true);
    setUpdateError('');
    setUpdateSuccess('');
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
    setModalLatitude('');
    setModalLongitude('');
    setUpdateError('');
    setUpdateSuccess('');
  };

  // Update machine location
  const updateMachineLocation = async () => {
    if (!modalLatitude || !modalLongitude || !selectedMachine) {
      setUpdateError('Please enter both latitude and longitude');
      return;
    }

    const lat = parseFloat(modalLatitude);
    const lng = parseFloat(modalLongitude);

    if (isNaN(lat) || isNaN(lng)) {
      setUpdateError('Please enter valid numeric coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      setUpdateError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setUpdateError('Longitude must be between -180 and 180');
      return;
    }

    setIsUpdating(true);
    setUpdateError('');

    try {
      const response = await fetch('/api/machines/addlocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          machinePassword: selectedMachine.id,
          latitude: lat,
          longitude: lng,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateSuccess('Location updated successfully!');
        
        // Update local state
        const updatedMachines = allMachines.map(machine => 
          machine.id === selectedMachine.id 
            ? { ...machine, latitude: lat.toString(), longitude: lng.toString() }
            : machine
        );
        setAllMachines(updatedMachines);

        // Update locations for map
        const updatedLocations = locations.map(location =>
          location.id === selectedMachine.id
            ? { ...location, latitude: lat, longitude: lng }
            : location
        );
        setLocations(updatedLocations);
        setFilteredLocations(updatedLocations);

        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        setUpdateError(data.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating machine location:', error);
      setUpdateError('Network error. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Component to handle map clicks
  const MapClickHandler = () => {
    if (!isClient || !useMapEvents) return null;
    
    const MapEvents = useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setClickedLocation({ 
          lat: lat.toFixed(6), 
          lng: lng.toFixed(6),
          position: [lat, lng]
        });
      },
    });
    return null;
  };

  // Get marker color based on category
  const getMarkerColor = (category) => {
    const colorMap = {
      machine: '#3B82F6',
      landmark: '#10B981',
      park: '#8B5CF6',
      monument: '#F59E0B',
      restaurant: '#EF4444'
    };
    return colorMap[category] || '#6B7280';
  };

  const tileLayerUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileLayerAttribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading locations from server...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className={`rounded-lg shadow-lg p-6 mb-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="text-blue-500" />
              Interactive Location Map
            </h1>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search machines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-10 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Machine List */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3">Your Machines</h2>
            <div className="grid gap-3">
              {allMachines.map((machine) => (
                <div 
                  key={machine.id} 
                  className={`p-4 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{machine.name}</h3>
                      <p className="text-sm opacity-70">ID: {machine.id}</p>
                      <p className="text-sm opacity-70">
                        Location: {machine.latitude || '0'}, {machine.longitude || '0'}
                        {(machine.latitude === '0' || machine.longitude === '0') && 
                          <span className="text-yellow-500 ml-2">⚠️ Location not set</span>
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(machine)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                      Add Location
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className="text-sm opacity-80">Total Machines</p>
              <p className="text-xl font-bold text-blue-500">{allMachines.length}</p>
            </div>
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className="text-sm opacity-80">With Locations</p>
              <p className="text-xl font-bold text-green-500">
                {allMachines.filter(m => m.latitude !== '0' && m.longitude !== '0').length}
              </p>
            </div>
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
              <p className="text-sm opacity-80">Without Locations</p>
              <p className="text-xl font-bold text-orange-500">
                {allMachines.filter(m => m.latitude === '0' || m.longitude === '0').length}
              </p>
            </div>
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className="text-sm opacity-80">Map Center</p>
              <p className="text-xs opacity-60">INDIA</p>
            </div>
          </div>

          {/* Clicked Location Info */}
          {clickedLocation && (
            <div className={`p-3 rounded border-l-4 border-red-500 ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
              <h3 className="font-semibold text-red-600 dark:text-red-400">Custom Location</h3>
              <p className="text-sm opacity-80">
                Latitude: {clickedLocation.lat} | Longitude: {clickedLocation.lng}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className={`mt-3 p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className="text-sm opacity-80">
              💡 Click on markers to see machine details, use "Add Location" to update coordinates
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div className={`rounded-lg shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="w-full h-96 relative" style={{ minHeight: '500px' }}>
            {isClient && L ? (
              <MapContainer
                center={[defaultLat, defaultLng]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  key={isDarkMode ? 'dark' : 'light'}
                  url={tileLayerUrl}
                  attribution={tileLayerAttribution}
                  subdomains={isDarkMode ? 'abcd' : 'abc'}
                  maxZoom={19}
                />
                
                {/* Machine markers (only show those with valid coordinates) */}
                {filteredLocations
                  .filter(location => location.latitude !== 0 && location.longitude !== 0)
                  .map((location) => (
                  <Marker
                    key={location.id}
                    position={[location.latitude, location.longitude]}
                    icon={createCustomIcon(getMarkerColor(location.category))}
                  >
                    <Popup maxWidth={300}>
                      <div className="p-3 max-w-sm cursor-pointer" onClick={()=>{
                              setValue({
                                  ip:location.id,
                                  name:location.name
                              })
                               new Promise(resolve => setTimeout(resolve, 100)).then(()=>{
                                  router.push("/realtime-data")
                               })
                      }}>
                        <img
                          src={location.image}
                          alt={location.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          onError={(e) => {
                            e.target.src = 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?semt=ais_hybrid&w=740';
                          }}
                        />
                        <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {location.category}
                          </span>
                          <span className="text-gray-500">
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Custom clicked location marker */}
                {clickedLocation && (
                  <Marker 
                    position={clickedLocation.position}
                    icon={createCustomIcon('#EF4444')}
                  >
                    <Popup>
                      <div className="p-2">
                        <strong>Custom Location</strong><br/>
                        Lat: {clickedLocation.lat}<br/>
                        Lng: {clickedLocation.lng}
                      </div>
                    </Popup>
                  </Marker>
                )}

                <MapClickHandler />
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Loading map...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for updating machine location */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-md mx-4 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-xl font-bold mb-4">Update Machine Location</h2>
            
            {selectedMachine && (
              <div className="mb-4">
                <p className="text-sm opacity-70">Machine: {selectedMachine.name}</p>
                <p className="text-sm opacity-70">ID: {selectedMachine.id}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={modalLatitude}
                  onChange={(e) => setModalLatitude(e.target.value)}
                  placeholder="Enter latitude (-90 to 90)"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={modalLongitude}
                  onChange={(e) => setModalLongitude(e.target.value)}
                  placeholder="Enter longitude (-180 to 180)"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {updateError && (
                <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm">{updateError}</span>
                </div>
              )}

              {updateSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-100 text-green-700 rounded-lg">
                  <Save size={16} />
                  <span className="text-sm">{updateSuccess}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={isUpdating}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={updateMachineLocation}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update Location
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;