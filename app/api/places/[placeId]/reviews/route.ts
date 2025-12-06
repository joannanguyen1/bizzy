import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { placeReview } from "@/schema/places-schema";
import { user } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ placeId: string }> }
) {
  try {
    const { placeId } = await context.params;
    const decodedPlaceId = decodeURIComponent(placeId);

    const reviews = await db
      .select({
        id: placeReview.id,
        userId: placeReview.userId,
        placeId: placeReview.placeId,
        rating: placeReview.rating,
        review: placeReview.review,
        createdAt: placeReview.createdAt,
        updatedAt: placeReview.updatedAt,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          image: user.image,
        },
      })
      .from(placeReview)
      .innerJoin(user, eq(placeReview.userId, user.id))
      .where(eq(placeReview.placeId, decodedPlaceId))
      .orderBy(placeReview.createdAt);

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (err) {
    console.error("GET /places/[placeId]/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

