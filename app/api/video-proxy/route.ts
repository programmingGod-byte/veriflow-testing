// File: app/api/video-proxy/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  // Get the target IP from the URL's query parameters
  const ip = request.nextUrl.searchParams.get('ip');

  if (!ip) {
    return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
  }

  // The full URL to the video on your local device
  const videoUrl = `http://${ip}:5000/videos/video.mp4`;

  // Get the 'Range' header from the incoming request to support video seeking
  const range = request.headers.get('range');
  const headers = new Headers();
  if (range) {
    headers.set('Range', range);
  }

  try {
    // Fetch the video from the local device, passing the Range header
    const videoResponse = await fetch(videoUrl, {
      headers: headers,
      // Important for performance with large files on some servers
      cache: 'no-store', 
    });

    // If the device returned an error (e.g., video not found), forward it
    if (!videoResponse.ok) {
      return new Response(videoResponse.body, {
        status: videoResponse.status,
        statusText: videoResponse.statusText,
      });
    }

    // Get the readable stream from the video response
    const videoStream = videoResponse.body;

    // Create a new streaming response, copying the headers from the original
    // This passes along 'Content-Type', 'Content-Length', 'Content-Range', etc.
    return new Response(videoStream, {
      status: videoResponse.status, // Will be 200 for full content, 206 for partial
      statusText: videoResponse.statusText,
      headers: videoResponse.headers,
    });
    
  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: Could not proxy video request.' },
      { status: 500 }
    );
  }
}