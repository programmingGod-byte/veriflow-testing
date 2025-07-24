'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { Play, Image, Calendar, Clock, Download, ChevronDown, Filter, X, Search, Grid, List, Eye, FileImage, Video } from 'lucide-react';
import { MyContext } from '../providers';

// Enhanced Video Player Component with Better Error Handling and Format Support
const VideoPlayer = ({ src, name, className, onError }) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState('');
  const videoRef = useRef(null);
  
  // More comprehensive video format support
  const getSupportedVideoSources = (baseSrc, filename) => {
    const sources = [];
    const baseName = filename.split('.')[0];
    const originalExt = filename.toLowerCase().split('.').pop();
    
    // Always include the original source first
    sources.push({
      src: baseSrc,
      type: getVideoMimeType(originalExt)
    });
    
    // Add fallback formats that are commonly supported
    const fallbackFormats = ['mp4', 'webm', 'ogg'];
    fallbackFormats.forEach(format => {
      if (format !== originalExt) {
        const fallbackSrc = baseSrc.replace(filename, `${baseName}.${format}`);
        sources.push({
          src: fallbackSrc,
          type: getVideoMimeType(format)
        });
      }
    });
    
    return sources;
  };
  
  const getVideoMimeType = (ext) => {
    const videoMimeTypes = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'ogv': 'video/ogg',
      'avi': 'video/mp4', // Fallback to mp4 for broader support
      'mov': 'video/mp4', // Fallback to mp4 for broader support
      'wmv': 'video/mp4', // Fallback to mp4 for broader support
      'mkv': 'video/mp4', // Fallback to mp4 for broader support
      '3gp': 'video/3gpp',
      'flv': 'video/mp4', // Fallback to mp4 for broader support
      'm4v': 'video/mp4',
      'mpg': 'video/mpeg',
      'mpeg': 'video/mpeg'
    };
    return videoMimeTypes[ext] || 'video/mp4';
  };

  const handleVideoError = (e) => {
    const error = e.target.error;
    let errorMessage = 'Unknown video error';
    
    if (error) {
      switch(error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading video';
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = 'Video format not supported or corrupted';
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported by browser';
          break;
        default:
          errorMessage = `Video error (code: ${error.code})`;
      }
    }
    
    console.error('Video error details:', {
      code: error?.code,
      message: error?.message,
      src: src,
      name: name
    });
    
    setErrorDetails(errorMessage);
    setVideoError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully:', name);
    setIsLoading(false);
    setVideoError(false);
    setErrorDetails('');
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play:', name);
    setIsLoading(false);
    setVideoError(false);
  };

  const handleLoadStart = () => {
    setVideoError(false);
    setIsLoading(true);
    setErrorDetails('');
  };

  // Test video URL accessibility
  const testVideoUrl = async (url) => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Allow cross-origin requests
      });
      return true;
    } catch (error) {
      console.warn('Video URL test failed:', error);
      return false;
    }
  };

  useEffect(() => {
    if (src && videoRef.current) {
      // Test the video URL
      testVideoUrl(src).then(isAccessible => {
        if (!isAccessible) {
          console.warn('Video URL may not be accessible:', src);
        }
      });
    }
  }, [src]);
  
  if (videoError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Video size={24} className="text-red-600" />
        </div>
        <p className="text-red-600 font-medium mb-2">Video Playback Error</p>
        <p className="text-red-500 text-sm mb-2">{errorDetails}</p>
        <p className="text-red-400 text-xs mb-4">File: {name}</p>
        <div className="space-y-2">
          <a 
            href={src} 
            download={name}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            <span>Download Video</span>
          </a>
          <br />
          <button
            onClick={() => {
              setVideoError(false);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Play size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Loading video...</span>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        preload="metadata"
        className={className}
        style={{ maxHeight: '500px' }}
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
        onCanPlay={handleVideoCanPlay}
        onLoadStart={handleLoadStart}
        playsInline
        muted // Start muted to avoid autoplay issues
        crossOrigin="anonymous"
      >
        <source src={src} type={getVideoMimeType(name.split('.').pop())} />
        {/* Fallback message */}
        <p className="text-gray-600 p-4">
          Your browser does not support the video tag. 
          <a href={src} download={name} className="text-blue-600 hover:underline ml-1">
            Download the video instead
          </a>
        </p>
      </video>
    </div>
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

  const testDirectUrl = async () => {
    try {
      const response = await fetch(media.url, { method: 'HEAD' });
      console.log('Direct URL test:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        acceptRanges: response.headers.get('accept-ranges')
      });
    } catch (error) {
      console.error('Direct URL test failed:', error);
    }
  };
  
  return (
    <div className="bg-gray-100 p-3 rounded mt-2 text-xs">
      <p><strong>Name:</strong> {media.name}</p>
      <p><strong>Type:</strong> {media.type}</p>
      <p><strong>MIME Type:</strong> {media.mimeType || 'Not set'}</p>
      <p><strong>URL Type:</strong> {media.url.startsWith('blob:') ? 'Blob URL' : 'Direct URL'}</p>
      <p><strong>URL:</strong> {media.url.substring(0, 80)}...</p>
      <div className="mt-2 space-x-2">
        {media.url.startsWith('blob:') && (
          <button 
            onClick={testBlob}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
          >
            Test Blob
          </button>
        )}
        <button 
          onClick={testDirectUrl}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
        >
          Test URL
        </button>
      </div>
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
  const [STATIC_VIDEO_URL,setStaticVideo] = useState("")
  // --- MODIFICATION: Static URI for the video ---
  // Replace this with the actual static URL of your video file.
  // const STATIC_VIDEO_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const STATIC_VIDEO_NAME = " Video.mp4";


  // Enhanced MIME type detection with better video support
  const getMimeType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes = {
      // Video formats - prioritize widely supported formats
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'ogv': 'video/ogg',
      // These formats may need conversion on the server side
      'avi': 'video/mp4', // Serve as mp4 for better compatibility
      'mov': 'video/mp4', // Serve as mp4 for better compatibility
      'wmv': 'video/mp4', // Serve as mp4 for better compatibility
      'mkv': 'video/mp4', // Serve as mp4 for better compatibility
      '3gp': 'video/3gpp',
      'flv': 'video/mp4', // Serve as mp4 for better compatibility
      'm4v': 'video/mp4',
      'mpg': 'video/mpeg',
      'mpeg': 'video/mpeg',
      // Image formats
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'tiff': 'image/tiff',
      'ico': 'image/x-icon'
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
    if(value.machineCode.length > 0){
      console.log("Setting base URL with IP:", value.machineCode);
      setBaseUrl(`http://${value.machineCode}:5000`);

      // ✅ MODIFICATION: Change this line to use your new API proxy
      setStaticVideo(`/api/video-proxy?ip=${value.machineCode}`);
      
      if (activeTab === 'image') {
        fetchLatestMedia("image");
      }
    }
  }, [value]);  // Reset filters
  const resetFilters = () => {
    setSelectedDate('');
    setSelectedTime('');
    setFilteredMediaList([]);
    setShowFilters(true);
    setFiltersApplied(false);
  };

  // Enhanced fetch latest media with better URL handling
  const fetchLatestMedia = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/media-latest?ip=${value.machineCode}&type=${type}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch latest media: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Latest media response:", data);
      
      if (!data.name) {
        throw new Error('No media name received from server');
      }
      
      const mediaName = data.name;
      
      // Create URL with proper encoding and cache busting
      const mediaEndpoint = type === 'image' ? 'image' : 'video';
      const timestamp = Date.now();
      const directUrl = `/api/media?ip=${value.machineCode}&type=${mediaEndpoint}&name=${encodeURIComponent(mediaName)}&t=${timestamp}`;
      
      // Get MIME type from filename
      const mimeType = getMimeType(mediaName);
      
      setLatestMedia({
        name: mediaName,
        url: directUrl,
        type: type,
        mimeType: mimeType,
        isDirect: true
      });
    } catch (err) {
      console.error("Error fetching latest media:", err);
      setError(`Failed to load latest ${type}: ${err.message}`);
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
      const response = await fetch(`${endpoint}?ip=${value.machineCode}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch media list: ${response.status} ${response.statusText}`);
      }
 
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid media list format received');
      }
      
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setMediaList(sortedData);
      extractDatesTimes(sortedData);
    } catch (err) {
      console.error("Error fetching media list:", err);
      setError(`Failed to load ${type} list: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fetch specific media file with better error handling
  const fetchMediaFile = async (name, type) => {
    setLoading(true);
    setError(null);
    try {
      // Create URL with proper encoding and cache busting
      const endpoint = type === 'image' ? 'image' : 'video';
      const timestamp = Date.now();
      const directUrl = `/api/media?ip=${value.machineCode}&type=${endpoint}&name=${encodeURIComponent(name)}&t=${timestamp}`;
      
      // Test if the URL is accessible (for debugging)
      try {
        const testResponse = await fetch(directUrl, { method: 'HEAD' });
        console.log('Media file test response:', {
          status: testResponse.status,
          contentType: testResponse.headers.get('content-type'),
          contentLength: testResponse.headers.get('content-length')
        });
      } catch (testError) {
        console.warn('Media file test failed:', testError);
      }
      
      const mimeType = getMimeType(name);
      
      setSelectedMedia({
        name: name,
        url: directUrl,
        type: type,
        mimeType: mimeType,
        isDirect: true
      });
    } catch (err)
 {
      console.error("Error fetching media file:", err);
      setError(`Failed to load media file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset state, but ensure 'latest' is default for 'image' tab
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
    // This function now only applies to the 'image' tab
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
    if (value.machineCode.length > 0 && activeTab === 'image') {
      // MODIFICATION: Only fetch on load if it's the image tab.
      // The video tab is now static and doesn't need an initial fetch.
      fetchLatestMedia(activeTab);
    }
  }, [activeTab, value.machineCode]);

  // Cleanup blob URLs (not needed for direct URLs but keeping for consistency)
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
              {/* <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </button> */}
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
        {/* MODIFICATION: The entire section for mode selection and filtering is now conditional on the 'image' tab being active */}
        {activeTab === 'image' && (
          <>
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
                  <span>Latest Photo</span>
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
                    <p className="text-slate-600 text-sm">Select a date and time to browse your photos</p>
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

                    {/* Apply/Reset Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={applyFilters}
                        disabled={!selectedDate && !selectedTime}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-md"
                      >
                        <Filter size={16} />
                        <span>Apply</span>
                      </button>
                      
                      {(selectedDate || selectedTime) && (
                        <button
                          onClick={resetFilters}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all duration-200 font-medium text-sm"
                        >
                          <X size={16} />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters Applied Banner */}
            {filtersApplied && (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium text-sm">
                      Filters applied: {selectedDate && `Date: ${selectedDate}`} {selectedDate && selectedTime && ', '} {selectedTime && `Time: ${selectedTime}`}
                    </span>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="text-green-600 hover:text-green-800 font-medium text-sm hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {activeTab === 'image' ? (
                  <FileImage size={20} className="text-blue-600" />
                ) : (
                  <Video size={20} className="text-purple-600" />
                )}
              </div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">
              Loading {activeTab === 'image' ? 'photos' : 'videos'}...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={24} className="text-red-600" />
            </div>
            <h3 className="text-red-800 font-bold text-lg mb-2">Error Loading Media</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                if (activeOption === 'latest') {
                  fetchLatestMedia(activeTab);
                } else {
                  fetchMediaList(activeTab);
                }
              }}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* MODIFICATION: Conditional Rendering based on activeTab */}
        {activeTab === 'image' ? (
          <>
            {/* Latest Media Display (for Images) */}
            {activeOption === 'latest' && latestMedia && !loading && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Latest Photo
                  </h2>
                  <p className="text-slate-600">{latestMedia.name}</p>
                </div>
                
                <div className="flex justify-center">
                  <div className="relative max-w-2xl w-full">
                    <img
                      src={latestMedia.url}
                      alt={latestMedia.name}
                      className="w-full h-auto rounded-xl shadow-lg"
                      style={{ maxHeight: '500px', objectFit: 'contain' }}
                      onError={(e) => {
                        console.error('Image load error:', e);
                        setError(`Failed to load image: ${latestMedia.name}`);
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <a
                        href={latestMedia.url}
                        download={latestMedia.name}
                        className="bg-black/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/30 transition-colors"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  </div>
                </div>
                <MediaDebugInfo media={latestMedia} showDebug={showDebug} />
              </div>
            )}

            {/* Media List Display (for Images) */}
            {activeOption === 'timestamp' && !showFilters && (mediaList.length > 0 || filteredMediaList.length > 0) && !loading && (
              <div className="space-y-6">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {filtersApplied ? 'Filtered Results' : 'All Media'} 
                    <span className="text-lg font-normal text-slate-600 ml-2">
                      ({(filtersApplied ? filteredMediaList : mediaList).length} items)
                    </span>
                  </h2>
                  <div className="flex items-center bg-white/50 rounded-lg p-1 backdrop-blur-sm border border-white/30">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>

                {/* Media Grid/List */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {(filtersApplied ? filteredMediaList : mediaList).map((media, index) => (
                    <div
                      key={index}
                      className={`bg-white/80 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                        viewMode === 'list' ? 'flex items-center p-4' : 'p-4'
                      }`}
                      onClick={() => fetchMediaFile(media.name, activeTab)}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-4 flex items-center justify-center group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
                            <FileImage size={32} className="text-slate-400 group-hover:text-blue-500" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                              {media.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <Calendar size={14} />
                              <span>{formatDate(media.timestamp)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <Clock size={14} />
                              <span>{formatTime(media.timestamp)}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center mr-4 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors flex-shrink-0">
                            <FileImage size={24} className="text-slate-400 group-hover:text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                              {media.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{formatDate(media.timestamp)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>{formatTime(media.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                            <Eye size={18} />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Static Video Display */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Featured Video
                </h2>
              </div>
              
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <VideoPlayer
                    src={STATIC_VIDEO_URL}
                    name={STATIC_VIDEO_NAME}
                    className="w-full rounded-xl shadow-lg"
                    onError={(e) => {
                      console.error('Static video load error:', e);
                      // You might want to set a general error state here if needed
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Selected Media Display (Modal) */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">{selectedMedia.name}</h2>
                  <div className="flex items-center space-x-2">
                    <a
                      href={selectedMedia.url}
                      download={selectedMedia.name}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download size={20} />
                    </a>
                    <button
                      onClick={() => setSelectedMedia(null)}
                      className="bg-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  {selectedMedia.type === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.name}
                      className="max-w-full h-auto rounded-xl shadow-lg"
                      style={{ maxHeight: '70vh' }}
                      onError={(e) => {
                        console.error('Selected image load error:', e);
                        setError(`Failed to load selected image: ${selectedMedia.name}`);
                      }}
                    />
                  ) : (
                    <VideoPlayer
                      src={selectedMedia.url}
                      name={selectedMedia.name}
                      className="w-full rounded-xl shadow-lg"
                      onError={(e) => {
                        console.error('Selected video load error:', e);
                        setError(`Failed to load selected video: ${selectedMedia.name}`);
                      }}
                    />
                  )}
                </div>
                
                <MediaDebugInfo media={selectedMedia} showDebug={showDebug} />
              </div>
            </div>
          </div>
        )}

        {/* Empty State (Only for Images now) */}
        {activeTab === 'image' && activeOption === 'timestamp' && !showFilters && !loading && (
          (filtersApplied ? filteredMediaList.length === 0 : mediaList.length === 0) && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileImage size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {filtersApplied ? 'No media found' : `No photos available`}
              </h3>
              <p className="text-slate-600 mb-6">
                {filtersApplied 
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : `No photos have been captured yet.`
                }
              </p>
              {filtersApplied && (
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}