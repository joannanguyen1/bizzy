import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedPlace } from "@/schema/places-schema";
import { user } from "@/schema/auth-schema";
import { eq, inArray, sql } from "drizzle-orm";

interface Place {
  place_id?: string;
  id?: string;
  name: string;
  formatted_address?: string;
  source?: string;
  photos?: Array<{ photo_reference: string }>;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const interestsParam = searchParams.get("interests");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    let userInterests: string[] = [];
    if (interestsParam) {
      try {
        userInterests = JSON.parse(interestsParam);
      } catch {
        userInterests = [];
      }
    } else {
      const currentUser = await db
        .select({ interests: user.interests })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

      if (currentUser[0]?.interests) {
        try {
          userInterests = JSON.parse(currentUser[0].interests);
        } catch {
          userInterests = [];
        }
      }
    }

    if (userInterests.length === 0) {
      return NextResponse.json({ places: [], hasMore: false });
    }

    const places: Place[] = [];

    if (process.env.GOOGLE_MAPS_API_KEY) {
      for (const interest of userInterests.slice(0, 3)) {
        try {
          const apiUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
          apiUrl.searchParams.append("location", "39.9526,-75.1652");
          apiUrl.searchParams.append("radius", "5000");
          apiUrl.searchParams.append("type", interest);
          apiUrl.searchParams.append("key", process.env.GOOGLE_MAPS_API_KEY);

          const response = await fetch(apiUrl.toString());
          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              places.push(...data.results.map((place: Place) => ({
                ...place,
                source: "google",
              })));
            }
          }
        } catch (error) {
          console.error(`Error fetching places for ${interest}:`, error);
        }
      }
    }

    const usersWithSimilarInterests = await db
      .select({
        id: user.id,
        interests: user.interests,
      })
      .from(user)
      .where(sql`${user.interests} IS NOT NULL`);

    const similarUserIds: string[] = [];
    for (const u of usersWithSimilarInterests) {
      if (!u.interests) continue;
      try {
        const theirInterests = JSON.parse(u.interests);
        const overlap = userInterests.filter((i) => theirInterests.includes(i)).length;
        if (overlap > 0) {
          similarUserIds.push(u.id);
        }
      } catch {
        continue;
      }
    }

    if (similarUserIds.length > 0) {
      const communityPlaces = await db
        .select()
        .from(savedPlace)
        .where(
          inArray(
            savedPlace.userId,
            similarUserIds.slice(0, 20)
          )
        )
        .limit(20);

      for (const place of communityPlaces) {
        if (place.placeId) {
          places.push({
            place_id: place.placeId,
            name: place.name,
            formatted_address: place.formattedAddress,
            source: "community",
          });
        }
      }
    }

    const uniquePlaces = Array.from(
      new Map(places.map((p) => [p.place_id || p.id, p])).values()
    );

    const paginatedPlaces = uniquePlaces.slice(offset, offset + limit);
    const hasMore = offset + limit < uniquePlaces.length;

    return NextResponse.json({
      places: paginatedPlaces,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching place recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

