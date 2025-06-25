// app/api/depth/getdata/route.ts

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  if (!ip || !date || !time) {
    return new Response(
      JSON.stringify({ error: 'Missing required query parameters: ip, date, time' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Construct URL for the node server (ensure proper encoding of the parameters)
  const url = `http://${ip}:5000/depth/getdata?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`;

  try {
    const fetchRes = await fetch(url);
    if (!fetchRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch depth data' }),
        { status: fetchRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contentType = fetchRes.headers.get('content-type') || 'application/json';
    return new Response(fetchRes.body, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('Error fetching depth data:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


