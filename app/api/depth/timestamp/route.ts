// app/api/depth/timestamp/route.ts

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return new Response(
      JSON.stringify({ error: 'Missing required query parameter: ip' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Construct URL to the Node.js server endpoint
  const url = `http://${ip}:5000/depth/timestamp`;

  try {
    const fetchRes = await fetch(url);
    if (!fetchRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch depth timestamps' }),
        { status: fetchRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contentType = fetchRes.headers.get('content-type') || 'application/json';
    return new Response(fetchRes.body, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('Error fetching depth timestamps:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


