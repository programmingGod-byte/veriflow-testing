'use client';

import { useState, useEffect, useContext } from 'react';
import { Play, Image, Calendar, Clock, Download, ChevronDown, Filter, X, Search, Grid, List, Eye, FileImage, Video } from 'lucide-react';
import { MyContext } from '../providers';

// Video Player Component with Error Handling
const VideoPlayer = ({ src, name, className, onError }) => {
  const [videoError, setVideoError] = useState(false);
  
  const handleVideoError = (e) => {
    console.error('Video error:', e);
    console.error('Video src:', src);
    setVideoError(true);
    if (onError) onError(e);
  };
  
  if (videoError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Video size={24} className="text-red-600" />
        </div>
        <p className="text-red-600 font-medium mb-2">Unable to play video format</p>
        <p className="text-red-500 text-sm mb-4">The video format may not be supported by your browser</p>
        <a 
          href={src} 
          download={name}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Download size={16} />
          <span>Download to play locally</span>
        </a>
      </div>
    );
  }
  
  return (
    <video
      src={src}
      controls
      preload="metadata"
      className={className}
      style={{ maxHeight: '500px' }}
      onError={handleVideoError}
      onLoadStart={() => setVideoError(false)}
      crossOrigin="anonymous"
    >
      <source src={src} type="video/mp4" />
      <source src={src} type="video/webm" />
      <source src={src} type="video/ogg" />
      <source src={src} type="video/avi" />
      <source src={src} type="video/mov" />
      Your browser does not support the video tag.
    </video>
  );
};

// Debug Info Component
const MediaDebugInfo = ({ media, showDebug = false }) => {
  if (!media || !showDebug) return null;
  
  const testBlob = () => {
    if (media.url.startsWith('blob:')) {
      fetch(media.url)
        .then(response => {
          console.log('Blob fetch response:', response);
          console.log('Content-Type:', response.headers.get('content-type'));
          console.log('Content-Length:', response.headers.get('content-length'));
          return response.blob();
        })
        .then(blob => {
          console.log('Blob details:', {
            size: blob.size,
            type: blob.type
          });
        })
        .catch(err => console.error('Blob fetch error:', err));
    }
  };
  
  return (
    <div className="bg-gray-100 p-3 rounded mt-2 text-xs">
      <p><strong>Name:</strong> {media.name}</p>
      <p><strong>Type:</strong> {media.type}</p>
      <p><strong>MIME Type:</strong> {media.mimeType || 'Not set'}</p>
      <p><strong>URL Type:</strong> {media.url.startsWith('blob:') ? 'Blob URL' : 'Direct URL'}</p>
      <p><strong>URL:</strong> {media.url.substring(0, 80)}...</p>
      {media.url.startsWith('blob:') && (
        <button 
          onClick={testBlob}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1 hover:bg-blue-600"
        >
          Test Blob
        </button>
      )}
    </div>
  );
};

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
  const [showDebug, setShowDebug] = useState(false);
  
  // Filter states
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [BASE_URL, setBaseUrl] = useState("");
  const {value, setValue} = useContext(MyContext);

  // Helper function to determine MIME type from filename
  const getMimeType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'mkv': 'video/x-matroska',
      '3gp': 'video/3gpp',
      'flv': 'video/x-flv',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };

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

  // Apply filters - triggered by button click
  const applyFilters = () => {
    if (selectedDate || selectedTime) {
      filterMedia();
      setShowFilters(false);
      setFiltersApplied(true);
    }
  };

  useEffect(() => {
    if(value.ip.length > 0){
      console.log("Setting base URL with IP:", value.ip);
      setBaseUrl(`http://${value.ip}:5000`);
      fetchLatestMedia("image");
    }
  }, [value]);

  // Reset filters
  const resetFilters = () => {
    setSelectedDate('');
    setSelectedTime('');
    setFilteredMediaList([]);
    setShowFilters(true);
    setFiltersApplied(false);
  };

  // Enhanced fetch latest media with proper MIME type handling
  const fetchLatestMedia = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/media-latest?ip=${value.ip}&type=${type}`);

      if (!res.ok) {
        throw new Error('Failed to fetch latest media');
      }

      const data = await res.json();
      console.log("Latest media name:", data.name);
      const mediaName = data.name;
      
      const mediaEndpoint = type === 'image' ? 'image' : 'video';
      const mediaResponse = await fetch(`/api/media?ip=${value.ip}&type=${mediaEndpoint}&name=${mediaName}`);

      if (!mediaResponse.ok) throw new Error('Failed to fetch media file');
      
      // Get content type from response headers
      const contentType = mediaResponse.headers.get('content-type');
      console.log("Response content-type:", contentType);
      
      const mediaBlob = await mediaResponse.blob();
      console.log("Original blob type:", mediaBlob.type);
      
      // Determine the correct MIME type
      let finalMimeType = contentType || mediaBlob.type || getMimeType(mediaName);
      
      // Create a properly typed blob
      const typedBlob = new Blob([mediaBlob], { type: finalMimeType });
      console.log("Final blob type:", typedBlob.type);
      
      const mediaUrl = URL.createObjectURL(typedBlob);
      
      setLatestMedia({
        name: mediaName,
        url: mediaUrl,
        type: type,
        mimeType: finalMimeType,
        originalContentType: contentType,
        blobSize: typedBlob.size
      });
    } catch (err) {
      console.error("Error fetching latest media:", err);
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
      const response = await fetch(`${endpoint}?ip=${value.ip}`);

      if (!response.ok) throw new Error('Failed to fetch media list');
 
      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setMediaList(sortedData);
      extractDatesTimes(sortedData);
    } catch (err) {
      console.error("Error fetching media list:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fetch specific media file with proper MIME type handling
  const fetchMediaFile = async (name, type) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = type === 'image' ? 'image' : 'video';
      
      const response = await fetch(`/api/media?ip=${value.ip}&type=${endpoint}&name=${name}`);

      if (!response.ok) throw new Error('Failed to fetch media file');

      // Get content type from response headers
      const contentType = response.headers.get('content-type');
      console.log("Response content-type for", name, ":", contentType);
      
      const mediaBlob = await response.blob();
      console.log("Original blob type:", mediaBlob.type);
      
      // Determine the correct MIME type
      let finalMimeType = contentType || mediaBlob.type || getMimeType(name);
      
      // Create a properly typed blob
      const typedBlob = new Blob([mediaBlob], { type: finalMimeType });
      console.log("Final blob type:", typedBlob.type);
      
      const mediaUrl = URL.createObjectURL(typedBlob);
      
      setSelectedMedia({
        name: name,
        url: mediaUrl,
        type: type,
        mimeType: finalMimeType,
        originalContentType: contentType,
        blobSize: typedBlob.size
      });
    } catch (err) {
      console.error("Error fetching media file:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Direct URL approach (fallback)
  const fetchMediaFileDirect = async (name, type) => {
    try {
      // Use direct API URL instead of blob
      const endpoint = type === 'image' ? 'image' : 'video';
      const directUrl = `/api/media?ip=${value.ip}&type=${endpoint}&name=${encodeURIComponent(name)}`;
      
      setSelectedMedia({
        name: name,
        url: directUrl,
        type: type,
        isDirect: true,
        mimeType: getMimeType(name)
      });
    } catch (err) {
      console.error("Error with direct URL approach:", err);
      setError(err.message);
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
    if (value.ip.length > 0) {
      fetchLatestMedia(activeTab);
    }
  }, [activeTab, value.ip]);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (latestMedia?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(latestMedia.url);
      }
      if (selectedMedia?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(selectedMedia.url);
      }
    };
  }, [latestMedia, selectedMedia]);

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
              {/* Debug Toggle */}
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center bg-white/50 rounded-xl p-1 backdrop-blur-sm border border-white/30">
              <button
                onClick={() => handleTabChange('image')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activeTab === 'image'
                    ? 'bg-white text-blue-600 shadow-lg shadow-blue-100'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <FileImage size={16} />
                <span>Photos</span>
              </button>
              <button
                onClick={() => handleTabChange('video')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activeTab === 'video'
                    ? 'bg-white text-purple-600 shadow-lg shadow-purple-100'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <Video size={16} />
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
              className={`group flex items-center space-x-2 px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${
                activeOption === 'latest'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-lg shadow-blue-200/50'
                  : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-md backdrop-blur-sm'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeOption === 'latest' ? 'bg-white/20' : 'bg-gradient-to-r from-blue-600 to-cyan-500'}`}>
                <Clock size={16} className={activeOption === 'latest' ? 'text-white' : 'text-white'} />
              </div>
              <span>Latest {activeTab === 'image' ? 'Photo' : 'Video'}</span>
            </button>
            
            <button
              onClick={() => handleOptionChange('timestamp')}
              className={`group flex items-center space-x-2 px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${
                activeOption === 'timestamp'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-transparent shadow-lg shadow-purple-200/50'
                  : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:border-purple-300 hover:shadow-md backdrop-blur-sm'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeOption === 'timestamp' ? 'bg-white/20' : 'bg-gradient-to-r from-blue-600 to-cyan-500'}`}>
                <Search size={16} className={activeOption === 'timestamp' ? 'text-white' : 'text-white'} />
              </div>
              <span>Browse by time</span>
            </button>
          </div>
        </div>

        {/* Filter Section for Browse Mode */}
        {activeOption === 'timestamp' && showFilters && (
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">Find Your Media</h3>
                <p className="text-slate-600 text-sm">Select a date and time to browse your {activeTab === 'image' ? 'photos' : 'videos'}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {/* Date Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 min-w-[160px] text-sm"
                  >
                    <Calendar size={16} className="text-blue-600" />
                    <span className="flex-1 text-left font-medium text-slate-700">
                      {selectedDate || 'Select Date'}
                    </span>
                    <ChevronDown size={16} className="text-slate-400" />
                  </button>
                  {showDateDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto min-w-[200px]">
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setSelectedDate('');
                            setShowDateDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md text-slate-500 transition-colors text-sm"
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
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors font-medium text-sm"
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
                    className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all duration-200 min-w-[160px] text-sm"
                  >
                    <Clock size={16} className="text-purple-600" />
                    <span className="flex-1 text-left font-medium text-slate-700">
                      {selectedTime || 'Select Time'}
                    </span>
                    <ChevronDown size={16} className="text-slate-400" />
                  </button>
                  {showTimeDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto min-w-[200px]">
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setSelectedTime('');
                            setShowTimeDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md text-slate-500 transition-colors text-sm"
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
                            className="w-full text-left px-3 py-2 hover:bg-purple-50 hover:text-purple-600 rounded-md transition-colors font-medium text-sm"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={applyFilters}
                  disabled={!selectedDate && !selectedTime}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                    selectedDate || selectedTime
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Filter size={16} />
                  <span>Apply</span>
                </button>

                {/* Reset Button */}
                {(selectedDate || selectedTime) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 font-medium text-sm"
                  >
                    <X size={16} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Applied Filters Display */}
        {activeOption === 'timestamp' && filtersApplied && (selectedDate || selectedTime) && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Filter className="text-indigo-600" size={18} />
                  <span className="font-medium text-indigo-800 text-sm">
                    Filtered by: {selectedDate && `${selectedDate}`} {selectedDate && selectedTime && ' • '} {selectedTime && `${selectedTime}`}
                  </span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
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
                <div className="w-10 h-10 rounded-full border-3 border-blue-200"></div>
                <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-slate-600 font-medium text-sm">Loading your media...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <X className="text-red-600" size={16} />
              </div>
              <div>
                <h4 className="font-semibold text-red-800 text-sm">Something went wrong</h4>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Latest Media Display */}
        {activeOption === 'latest' && latestMedia && !loading && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-1">
                Latest {activeTab === 'image' ? 'Photo' : 'Video'}
              </h3>
              <p className="text-slate-600 text-sm">Your most recent capture</p>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 shadow-inner">
              <div className="mb-4 text-center">
                <p className="text-xs font-medium text-slate-500 mb-4 bg-slate-100 rounded-full px-3 py-1 inline-block">
                  {latestMedia.name}
                </p>
                <div className="flex justify-center">
                  {activeTab === 'image' ? (
                    <img
                      src={latestMedia.url}
                      alt={latestMedia.name}
                      className="max-w-full h-auto rounded-xl shadow-lg border-2 border-white"
                      style={{ maxHeight: '500px' }}
                    />
                  ) : (
                    <VideoPlayer
                      src={latestMedia.url}
                      name={latestMedia.name}
                      className="max-w-full h-auto rounded-xl shadow-lg border-2 border-white"
                      onError={(e) => {
                        console.error('Video playback failed, trying direct URL approach');
                        // Fallback to direct URL
                        const directUrl = `/api/media?ip=${value.ip}&type=video&name=${encodeURIComponent(latestMedia.name)}`;
                        setLatestMedia(prev => ({ ...prev, url: directUrl, isDirect: true }));
                      }}
                    />
                  )}
                </div>
              </div>
              
              <MediaDebugInfo media={latestMedia} showDebug={showDebug} />
              <div className="flex justify-center mt-4">
                <a
                  href={latestMedia.url}
                  download={latestMedia.name}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-blue-200/50 font-medium text-sm"
                >
                  <Download size={16} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Media List Display */}
        {activeOption === 'timestamp' && !loading && (
          <div className="space-y-6">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-700">
                  {filtersApplied ? filteredMediaList.length : mediaList.length} {activeTab === 'image' ? 'photos' : 'videos'} found
                </span>
              </div>
              
              <div className="flex items-center bg-white/50 rounded-lg p-1 backdrop-blur-sm border border-white/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Media Grid/List */}
            {(filtersApplied ? filteredMediaList : mediaList).length > 0 ? (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {(filtersApplied ? filteredMediaList : mediaList).map((media, index) => (
                  <div
                    key={`${media.name}-${index}`}
                    className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
                      viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
                    }`}
                    onClick={() => fetchMediaFile(media.name, activeTab)}
                  >
                    {viewMode === 'grid' ? (
                      <div className="space-y-3">
                        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                          {activeTab === 'image' ? (
                            <FileImage className="text-slate-400" size={32} />
                          ) : (
                            <Video className="text-slate-400" size={32} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye className="text-white drop-shadow-lg" size={24} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-slate-800 text-sm truncate" title={media.name}>
                            {media.name}
                          </h4>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-xs text-slate-600">
                              <Calendar size={12} />
                              <span>{formatDate(media.timestamp)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-slate-600">
                              <Clock size={12} />
                              <span>{formatTime(media.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {activeTab === 'image' ? (
                            <FileImage className="text-slate-400" size={20} />
                          ) : (
                            <Video className="text-slate-400" size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-800 text-sm truncate" title={media.name}>
                            {media.name}
                          </h4>
                          <p className="text-xs text-slate-600">
                            {formatTimestamp(media.timestamp)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Eye className="text-slate-400 group-hover:text-blue-600 transition-colors" size={18} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'image' ? (
                    <FileImage className="text-slate-400" size={24} />
                  ) : (
                    <Video className="text-slate-400" size={24} />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No {activeTab === 'image' ? 'photos' : 'videos'} found
                </h3>
                <p className="text-slate-500 text-sm">
                  {filtersApplied 
                    ? 'Try adjusting your filters to see more results'
                    : `No ${activeTab === 'image' ? 'photos' : 'videos'} available at this time`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Selected Media Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800 text-lg truncate flex-1 mr-4">
                  {selectedMedia.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <a
                    href={selectedMedia.url}
                    download={selectedMedia.name}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                <div className="flex justify-center">
                  {activeTab === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      style={{ maxHeight: '70vh' }}
                    />
                  ) : (
                    <VideoPlayer
                      src={selectedMedia.url}
                      name={selectedMedia.name}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      onError={(e) => {
                        console.error('Video playback failed in modal, trying direct URL approach');
                        // Fallback to direct URL
                        const directUrl = `/api/media?ip=${value.ip}&type=video&name=${encodeURIComponent(selectedMedia.name)}`;
                        setSelectedMedia(prev => ({ ...prev, url: directUrl, isDirect: true }));
                      }}
                    />
                  )}
                </div>
                
                <MediaDebugInfo media={selectedMedia} showDebug={showDebug} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}