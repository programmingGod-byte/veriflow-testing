// app/api/newversion/depth/timestamp/[days]/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { days: string } }) {
  const ip = req.nextUrl.searchParams.get('ip');
  const days = params.days;

  if (!ip) {
    return new Response(
      JSON.stringify({ error: 'Missing required query parameter: ip' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = `http://${ip}:5000/newversion/depth/timestamp/${days}`;

  try {
    const fetchRes = await fetch(url);
    if (!fetchRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch depth data by days' }),
        { status: fetchRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contentType = fetchRes.headers.get('content-type') || 'application/json';
    return new Response(fetchRes.body, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('Error fetching days-based data:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
