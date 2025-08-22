import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const days = searchParams.get('days') || 5; // Default to 5 days
  
  const apiKey = process.env.GOOGLE_WEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured.' }, { status: 500 });
  }
  
  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required.' }, { status: 400 });
  }

  const apiUrl = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lon}&days=${days}`;

  try {
    const weatherResponse = await fetch(apiUrl);

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.json();
      console.error("Google Weather API Error:", errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch weather data');
    }

    const data = await weatherResponse.json();
    
    // Format the data to be more frontend-friendly
    const formattedForecast = data.forecastDays.map(day => ({
      date: new Date(day.interval.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
      minTemp: Math.round(day.minTemperature.degrees),
      maxTemp: Math.round(day.maxTemperature.degrees),
      description: day.daytimeForecast.weatherCondition.description.text,
    }));
    
    return NextResponse.json(formattedForecast);

  } catch (error) {
    console.error("Server-side weather fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}