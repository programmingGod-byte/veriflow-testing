// app/api/newversion/depth/timestamp/range/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const ip = searchParams.get('ip');

  if (!start || !end || !ip) {
    return new Response(
      JSON.stringify({ error: 'Missing required query parameters: start, end, or ip' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const encodedStart = encodeURIComponent(start);
  const encodedEnd = encodeURIComponent(end);
  const url = `http://${ip}:5000/new/version/timestamp/${encodedStart}&${encodedEnd}`;

  try {
    const fetchRes = await fetch(url);
    if (!fetchRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch range-based depth data' }),
        { status: fetchRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contentType = fetchRes.headers.get('content-type') || 'application/json';
    return new Response(fetchRes.body, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('Error fetching range-based data:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
