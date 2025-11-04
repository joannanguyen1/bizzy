import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") || "39.9526,-75.1652"; // Default: Philadelphia
  const radius = searchParams.get("radius") || "5000"; // 5km
  const type = searchParams.get("type") || "tourist_attraction";

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", {
      params: {
        location,
        radius,
        type,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    return NextResponse.json(response.data);
  } catch (err) {
    console.error("Error fetching places:", err);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
