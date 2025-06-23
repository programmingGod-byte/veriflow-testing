// app/api/media/route.ts

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');
  const type = searchParams.get('type'); // 'image' or 'video'
  const name = searchParams.get('name'); // filename (e.g., photo_20250621_095321.jpg)

  if (!ip || !type || !name) {
    return new Response(JSON.stringify({ error: 'Missing required query parameters: ip, type, name' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const folder = type === 'image' ? 'photos' : 'videos';
  const url = `http://${ip}:5000/${folder}/${name}`;

  try {
    const fetchRes = await fetch(url);
    if (!fetchRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch media' }), {
        status: fetchRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream media content
    const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';
    return new Response(fetchRes.body, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });

  } catch (err) {
    console.error('Error fetching media:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
