// app/api/depth/getdata/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameter: ip" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Construct URL for the node server (ensure proper encoding of the parameters)
  const url = `http://${ip}:5000/rainfall_data.csv`;

  try {
    const fetchRes = await fetch(url);

    if (!fetchRes.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch depth data" }),
        { status: fetchRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Force CSV content type instead of JSON
    return new Response(fetchRes.body, {
      status: 200,
      headers: { "Content-Type": "text/csv" },
    });
  } catch (err) {
    console.error("Error fetching depth data:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
