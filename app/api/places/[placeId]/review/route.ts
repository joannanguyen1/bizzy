import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { placeReview } from "@/schema/places-schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ placeId: string }> }
) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { placeId } = await context.params;
    const decodedPlaceId = decodeURIComponent(placeId);

    const [review] = await db
      .select()
      .from(placeReview)
      .where(
        and(
          eq(placeReview.placeId, decodedPlaceId),
          eq(placeReview.userId, session.user.id)
        )
      )
      .limit(1);

    if (!review) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(
      {
        rating: review.rating,
        review: review.review,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /places/[placeId]/review error:", err);
    return NextResponse.json(
      { error: "Failed to load review" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ placeId: string }> }
) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { placeId } = await context.params;
    const decodedPlaceId = decodeURIComponent(placeId);

    const body = await req.json();
    const rating = Number(body.rating);
    const reviewText = String(body.review ?? "").trim();

    if (
      !Number.isFinite(rating) ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      !reviewText
    ) {
      return NextResponse.json(
        { error: "Rating must be an integer from 1 to 5, and review text cannot be empty" },
        { status: 400 }
      );
    }

    await db
      .insert(placeReview)
      .values({
        placeId: decodedPlaceId,
        userId: session.user.id,
        rating,
        review: reviewText,
      })
      .onConflictDoUpdate({
        target: [placeReview.placeId, placeReview.userId],
        set: {
          rating,
          review: reviewText,
        },
      });

    return NextResponse.json(
      {
        rating,
        review: reviewText,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /places/[placeId]/review error:", err);
    return NextResponse.json(
      { error: "Failed to save review" },
      { status: 500 }
    );
  }
}
