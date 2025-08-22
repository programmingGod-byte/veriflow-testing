'use client';

import React, { useState, useEffect } from 'react';

// Default coordinates for Delhi, India
const DELHI_COORDS = {
  latitude: 28.6139,
  longitude: 77.2090,
};

const WeatherForecast = ({ latitude = DELHI_COORDS.latitude, longitude = DELHI_COORDS.longitude }) => {
  const [forecast, setForecast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('Delhi');

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // We call our own API route, not the Google API directly
        const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}&days=5`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Something went wrong');
        }

        const data = await response.json();
        setForecast(data);

        // Simple check to update the location name
        if (latitude === DELHI_COORDS.latitude && longitude === DELHI_COORDS.longitude) {
            setLocationName('Delhi');
        } else {
            setLocationName(`Lat: ${latitude}, Lon: ${longitude}`);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]); // Re-run the effect if coordinates change

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-gray-500">Loading forecast...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">Error: {error}</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {forecast.map((day, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="font-bold text-lg text-gray-800">{day.date.split(',')[0]}</p>
            <p className="text-sm text-gray-500 mb-2">{day.date.split(',').slice(1).join(', ')}</p>
            <p className="text-3xl font-bold text-blue-600 my-2">
              {day.maxTemp}°<span className="text-gray-400">/{day.minTemp}°C</span>
            </p>
            <p className="text-gray-600 text-sm">{day.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl max-w-6xl mx-auto shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        5-Day Weather Forecast for <span className="text-blue-600">{locationName}</span>
      </h2>
      {renderContent()}
    </div>
  );
};

export default WeatherForecast;