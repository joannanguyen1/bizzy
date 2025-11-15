import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedPlace } from "@/schema/places-schema";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
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

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, formattedAddress, latitude, longitude, placeId } = body;

    if (!name || !formattedAddress || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, formattedAddress, latitude, longitude" },
        { status: 400 }
      );
    }

    if (placeId) {
      const existingPlace = await db
        .select()
        .from(savedPlace)
        .where(
          and(
            eq(savedPlace.userId, session.user.id),
            eq(savedPlace.placeId, placeId)
          )
        )
        .limit(1);

      if (existingPlace.length > 0) {
        return NextResponse.json(
          { error: "Place is already saved", place: existingPlace[0] },
          { status: 409 }
        );
      }
    }

    const newPlace = await db.insert(savedPlace).values({
      id: randomUUID(),
      userId: session.user.id,
      name,
      formattedAddress,
      latitude,
      longitude,
      placeId: placeId || null,
    }).returning();

    return NextResponse.json({ success: true, place: newPlace[0] }, { status: 201 });
  } catch (err) {
    console.error(JSON.stringify({
      level: "error",
      event: "SAVE_PLACE_ERROR",
      timestamp: new Date().toISOString(),
      message: err instanceof Error ? err.message : String(err)
    }));
    return NextResponse.json({ error: "Failed to save place" }, { status: 500 });
  }
}