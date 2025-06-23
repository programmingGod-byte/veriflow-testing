export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');
  const type = searchParams.get('type'); // 'image' or 'video'

  if (!ip || !type) {
    return new Response(JSON.stringify({ error: 'Missing required query parameters: ip and type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const endpoint = type === 'image' ? 'photo-latest' : 'video-latest';

  try {
    const remoteRes = await fetch(`http://${ip}:5000/${endpoint}`);
    if (!remoteRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch from remote server' }), {
        status: remoteRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await remoteRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Unexpected error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
