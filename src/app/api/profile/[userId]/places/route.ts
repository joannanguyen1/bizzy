import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { savedPlace, placeReview } from "@/schema/places-schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const places = await db
      .select({
        id: savedPlace.id,
        userId: savedPlace.userId,
        name: savedPlace.name,
        formattedAddress: savedPlace.formattedAddress,
        latitude: savedPlace.latitude,
        longitude: savedPlace.longitude,
        placeId: savedPlace.placeId,
        createdAt: savedPlace.createdAt,
        updatedAt: savedPlace.updatedAt,
        rating: placeReview.rating,
      })
      .from(savedPlace)
      .leftJoin(
        placeReview,
        and(
          eq(savedPlace.placeId, placeReview.placeId),
          eq(placeReview.userId, userId)
        )
      )
      .where(eq(savedPlace.userId, userId))
      .orderBy(desc(savedPlace.createdAt));

    return NextResponse.json({ places });
  } catch (err) {
    console.error("Error fetching user places:", err);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}

