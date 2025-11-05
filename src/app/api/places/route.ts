import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") || "39.9526,-75.1652"; // Default: Philadelphia
  const radius = searchParams.get("radius") || "5000"; // 5km
  const type = searchParams.get("type") || "tourist_attraction";

  try {
    const apiUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    apiUrl.searchParams.append("location", location);
    apiUrl.searchParams.append("radius", radius);
    apiUrl.searchParams.append("type", type);
    apiUrl.searchParams.append("key", process.env.GOOGLE_MAPS_API_KEY);

    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(JSON.stringify({
      level: "error",
      event: "FETCH_PLACES_ERROR",
      timestamp: new Date().toISOString(),
      message: err instanceof Error ? err.message : String(err)
    }));
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}