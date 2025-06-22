'use client';

import { useState, useEffect, useContext } from 'react';
import { Play, Image, Calendar, Clock, Download, ChevronDown, Filter, X, Search, Grid, List, Eye, FileImage, Video } from 'lucide-react';
import { MyContext } from '../providers';
export default function MediaViewer() {
  const [activeTab, setActiveTab] = useState('image');
  const [activeOption, setActiveOption] = useState('latest');
  const [latestMedia, setLatestMedia] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [filteredMediaList, setFilteredMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter states
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [BASE_URL,setBaseUrl] = useState("")
const {value,setValue} = useContext(MyContext)
  // Extract unique dates and times from media list
  const extractDatesTimes = (mediaData) => {
    const dates = new Set();
    const times = new Set();
    
    mediaData.forEach(media => {
      const date = new Date(media.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      dates.add(dateStr);
      times.add(timeStr);
    });
    
    setAvailableDates(Array.from(dates).sort());
    setAvailableTimes(Array.from(times).sort());
  };

  // Filter media based on selected date and time
  const filterMedia = () => {
    let filtered = [...mediaList];
    
    if (selectedDate) {
      filtered = filtered.filter(media => {
        const mediaDate = new Date(media.timestamp).toLocaleDateString();
        return mediaDate === selectedDate;
      });
    }
    
    if (selectedTime) {
      filtered = filtered.filter(media => {
        const mediaTime = new Date(media.timestamp).toLocaleTimeString();
        return mediaTime === selectedTime;
      });
    }
    
    setFilteredMediaList(filtered);
  };


  useEffect(() => {
    console.log("VVVVVVVVVVVVVVVV")
    console.log(value)
    if(value.ip.length>0){
        setBaseUrl(`http://${value.ip}:5000`)
        fetchLatestMedia("image")
  
    }
        
    return () => {
      
    }
  }, [value])
  

  // Reset filters
  const resetFilters = () => {
    setSelectedDate('');
    setSelectedTime('');
    setFilteredMediaList([]);
    setShowFilters(true);
  };

  // Fetch latest media
  const fetchLatestMedia = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = type === 'image' ? '/photo-latest' : '/video-latest';
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (!response.ok) throw new Error('Failed to fetch latest media');
      
      const data = await response.json();
      const mediaName = data.name;
      
      // Fetch the actual media file
      const mediaEndpoint = type === 'image' ? '/photos/' : '/videos/';
      const mediaResponse = await fetch(`${BASE_URL}${mediaEndpoint}${mediaName}`);
      
      if (!mediaResponse.ok) throw new Error('Failed to fetch media file');
      
      const mediaBlob = await mediaResponse.blob();
      const mediaUrl = URL.createObjectURL(mediaBlob);
      
      setLatestMedia({
        name: mediaName,
        url: mediaUrl,
        type: type
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch media list by timestamp
  const fetchMediaList = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = type === 'image' ? '/api/photos' : '/api/videos';
      const response = await fetch(`${BASE_URL}${endpoint}`);
      
      if (!response.ok) throw new Error('Failed to fetch media list');
      
      const data = await response.json();
      // Sort by timestamp (newest first)
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setMediaList(sortedData);
      extractDatesTimes(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific media file
  const fetchMediaFile = async (name, type) => {
    setLoading(true);
    try {
      const endpoint = type === 'image' ? '/photos/' : '/videos/';
      const response = await fetch(`${BASE_URL}${endpoint}${name}`);
      
      if (!response.ok) throw new Error('Failed to fetch media file');
      
      const mediaBlob = await response.blob();
      const mediaUrl = URL.createObjectURL(mediaBlob);
      
      setSelectedMedia({
        name: name,
        url: mediaUrl,
        type: type
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveOption('latest');
    setLatestMedia(null);
    setMediaList([]);
    setFilteredMediaList([]);
    setSelectedMedia(null);
    setError(null);
    resetFilters();
  };

  // Handle option change
  const handleOptionChange = (option) => {
    setActiveOption(option);
    setLatestMedia(null);
    setMediaList([]);
    setFilteredMediaList([]);
    setSelectedMedia(null);
    setError(null);
    resetFilters();
    
    if (option === 'latest') {
      fetchLatestMedia(activeTab);
    } else {
      fetchMediaList(activeTab);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLatestMedia(activeTab);
  }, [activeTab]);

  // Apply filters when date/time selection changes
  useEffect(() => {
    if (mediaList.length > 0 && (selectedDate || selectedTime)) {
      filterMedia();
      setShowFilters(false);
    }
  }, [selectedDate, selectedTime, mediaList]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center bg-white/50 rounded-2xl p-1 backdrop-blur-sm border border-white/30">
              <button
                onClick={() => handleTabChange('image')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-200 ${
                  activeTab === 'image'
                    ? 'bg-white text-blue-600 shadow-lg shadow-blue-100 font-medium'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <FileImage size={18} />
                <span>Photos</span>
              </button>
              <button
                onClick={() => handleTabChange('video')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-200 ${
                  activeTab === 'video'
                    ? 'bg-white text-purple-600 shadow-lg shadow-purple-100 font-medium'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <Video size={18} />
                <span>Videos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mode Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleOptionChange('latest')}
              className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl border-2 transition-all duration-300 font-medium ${
                activeOption === 'latest'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-xl shadow-blue-200/50 scale-105'
                  : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-lg hover:scale-105 backdrop-blur-sm'
              }`}
            >
              <div className={`p-2 rounded-lg ${activeOption === 'latest' ? 'bg-white/20' : 'bg-gradient-to-r from-blue-600 to-cyan-500'}`}>
                <Clock size={20} className={activeOption === 'latest' ? 'text-white' : 'text-blue-600'} />
              </div>
              <span>Latest {activeTab === 'image' ? 'Photo' : 'Video'}</span>
            </button>
            
            <button
              onClick={() => handleOptionChange('timestamp')}
              className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl border-2 transition-all duration-300 font-medium ${
                activeOption === 'timestamp'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-xl shadow-purple-200/50 scale-105'
                  : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:border-purple-300 hover:shadow-lg hover:scale-105 backdrop-blur-sm'
              }`}
            >
              <div className={`p-2 rounded-lg ${activeOption === 'timestamp' ? 'bg-white/20' : 'bg-purple-50 group-hover:bg-purple-100'}`}>
                <Search size={20} className={activeOption === 'timestamp' ? 'text-white' : 'text-purple-600'} />
              </div>
              <span>See by time</span>
            </button>
          </div>
        </div>

        {/* Filter Section for Browse Mode */}
        {activeOption === 'timestamp' && showFilters && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Find Your Media</h3>
                <p className="text-slate-600">Select a date and time to browse your {activeTab === 'image' ? 'photos' : 'videos'}</p>
              </div>
              
              <div className="flex flex-wrap gap-6 items-center justify-center">
                {/* Date Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 min-w-[200px]"
                  >
                    <Calendar size={20} className="text-blue-600" />
                    <span className="flex-1 text-left font-medium text-slate-700">
                      {selectedDate || 'Select Date'}
                    </span>
                    <ChevronDown size={20} className="text-slate-400" />
                  </button>
                  {showDateDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-64 overflow-y-auto min-w-[250px]">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSelectedDate('');
                            setShowDateDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                        >
                          All Dates
                        </button>
                        {availableDates.map((date) => (
                          <button
                            key={date}
                            onClick={() => {
                              setSelectedDate(date);
                              setShowDateDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors font-medium"
                          >
                            {date}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                    className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 transition-all duration-200 min-w-[200px]"
                  >
                    <Clock size={20} className="text-purple-600" />
                    <span className="flex-1 text-left font-medium text-slate-700">
                      {selectedTime || 'Select Time'}
                    </span>
                    <ChevronDown size={20} className="text-slate-400" />
                  </button>
                  {showTimeDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-64 overflow-y-auto min-w-[250px]">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSelectedTime('');
                            setShowTimeDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                        >
                          All Times
                        </button>
                        {availableTimes.map((time) => (
                          <button
                            key={time}
                            onClick={() => {
                              setSelectedTime(time);
                              setShowTimeDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-colors font-medium"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Button */}
                {(selectedDate || selectedTime) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border-2 border-red-200 rounded-2xl hover:from-red-100 hover:to-pink-100 hover:border-red-300 transition-all duration-200 font-medium"
                  >
                    <X size={20} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Applied Filters Display */}
        {activeOption === 'timestamp' && !showFilters && (selectedDate || selectedTime) && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Filter className="text-indigo-600" size={20} />
                  <span className="font-medium text-indigo-800">
                    Filtered by: {selectedDate && `${selectedDate}`} {selectedDate && selectedTime && ' • '} {selectedTime && `${selectedTime}`}
                  </span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Change Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200"></div>
                <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-slate-600 font-medium">Loading your media...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="text-red-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Something went wrong</h4>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Latest Media Display */}
        {activeOption === 'latest' && latestMedia && !loading && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Latest {activeTab === 'image' ? 'Photo' : 'Video'}
              </h3>
              <p className="text-slate-600">Your most recent capture</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-inner">
              <div className="mb-6 text-center">
                <p className="text-sm font-medium text-slate-500 mb-6 bg-slate-100 rounded-full px-4 py-2 inline-block">
                  {latestMedia.name}
                </p>
                <div className="flex justify-center">
                  {activeTab === 'image' ? (
                    <img
                      src={latestMedia.url}
                      alt={latestMedia.name}
                      className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-white"
                      style={{ maxHeight: '600px' }}
                    />
                  ) : (
                    <video
                      src={latestMedia.url}
                      controls
                      preload="metadata"
                      className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-white"
                      style={{ maxHeight: '600px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
              <div className="text-center">
                <a
                  href={latestMedia.url}
                  download={latestMedia.name}
                  className="inline-flex items-center space-x-3 px-8 py-4  text-white rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 font-medium"
                >
                  <Download size={20} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Media List Display */}
        {activeOption === 'timestamp' && filteredMediaList.length > 0 && !loading && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Found {filteredMediaList.length} {filteredMediaList.length === 1 ? 'item' : 'items'}
                </h3>
                <p className="text-slate-600">Click any item to view it</p>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/80 rounded-2xl p-1 backdrop-blur-sm border border-white/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            
            <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {filteredMediaList.map((media, index) => (
                <div
                  key={index}
                  className={`group bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-white ${
                    viewMode === 'list' ? 'flex items-center space-x-6' : ''
                  }`}
                  onClick={() => fetchMediaFile(media.name, activeTab)}
                >
                  <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                      {activeTab === 'image' ? (
                        <FileImage size={28} className="text-blue-600" />
                      ) : (
                        <Video size={28} className="text-purple-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className={`${viewMode === 'list' ? 'flex-grow' : ''}`}>
                    <h4 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1" title={media.name}>
                      {media.name}
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500 flex items-center space-x-2">
                        <Calendar size={14} />
                        <span>{formatDate(media.timestamp)}</span>
                      </p>
                      <p className="text-sm text-slate-500 flex items-center space-x-2">
                        <Clock size={14} />
                        <span>{formatTime(media.timestamp)}</span>
                      </p>
                    </div>
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex-shrink-0">
                      <Eye size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Media Display */}
        {selectedMedia && (
          <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                {activeTab === 'image' ? 'Photo' : 'Video'} Preview
              </h3>
              <p className="text-slate-600">Full resolution view</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-inner">
              <div className="mb-6 text-center">
                <p className="text-sm font-medium text-slate-500 mb-6 bg-slate-100 rounded-full px-4 py-2 inline-block">
                  {selectedMedia.name}
                </p>
                <div className="flex justify-center">
                  {activeTab === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-white"
                      style={{ maxHeight: '600px' }}
                    />
                  ) : (
                    <video
                      src={selectedMedia.url}
                      controls
                      preload="metadata"
                      className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-white"
                      style={{ maxHeight: '600px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
              <div className="text-center">
                <a
                  href={selectedMedia.url}
                  download={selectedMedia.name}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 font-medium"
                >
                  <Download size={20} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Empty States */}
        {!loading && !error && !latestMedia && !selectedMedia && activeOption === 'timestamp' && showFilters && mediaList.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              {activeTab === 'image' ? (
                <FileImage size={48} className="text-slate-400" />
              ) : (
                <Video size={48} className="text-slate-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No {activeTab === 'image' ? 'photos' : 'videos'} found</h3>
            <p className="text-slate-600">Your collection is empty. Upload some media to get started!</p>
          </div>
        )}
{/* No Filter Results */}
        {!loading && !error && activeOption === 'timestamp' && !showFilters && mediaList.length > 0 && filteredMediaList.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={48} className="text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No matches found</h3>
            <p className="text-slate-600 mb-4">
              No {activeTab === 'image' ? 'photos' : 'videos'} found for the selected date and time.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              <X size={18} />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}