// app/api/csv/route.ts
// app/api/csv/route.ts

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');

  if (!ip) {
    return new Response(JSON.stringify({ error: 'Missing IP address in query string.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fetchResponse = await fetch(`http://${ip}:5000/latest-width`);

    if (!fetchResponse.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch data from ${ip}` }), {
        status: fetchResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await fetchResponse.json(); // ✅ JSON because your backend returns JSON
    let inc = (data["last"].width - data["secondLast"].width)/data["last"].width * 100
    let width = data["last"].width
    return new Response(JSON.stringify({inc,width}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }, // ✅ this should be application/json
    });

  } catch (error) {
    console.error('Error fetching JSON:', error);
    return new Response(JSON.stringify({ error: 'Internal server error while fetching JSON.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
