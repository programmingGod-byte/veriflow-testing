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
    const fetchResponse = await fetch(`http://${ip}:5000/battery.csv`);
    
    if (!fetchResponse.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch CSV from ${ip}` }), {
        status: fetchResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const csvText = await fetchResponse.text();

    return new Response(csvText, {
      status: 200,
      headers: { 'Content-Type': 'text/csv' },
    });

  } catch (error) {
    console.error('Error fetching CSV:', error);
    return new Response(JSON.stringify({ error: 'Internal server error while fetching CSV.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
