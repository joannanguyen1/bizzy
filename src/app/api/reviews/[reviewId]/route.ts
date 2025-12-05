import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { placeReview, reviewLike } from "@/schema/places-schema";
import { user } from "@/schema/auth-schema";
import { eq, sql, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await auth.api.getSession(req);
    const { reviewId } = await context.params;

    const [review] = await db
      .select()
      .from(placeReview)
      .where(eq(placeReview.id, reviewId))
      .limit(1);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const [reviewUser] = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, review.userId))
      .limit(1);

    const likeCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviewLike)
      .where(eq(reviewLike.reviewId, reviewId));

    const likeCount = likeCountResult[0]?.count || 0;

    let isLiked = false;
    if (session?.user) {
      const [like] = await db
        .select()
        .from(reviewLike)
        .where(
          and(
            eq(reviewLike.reviewId, reviewId),
            eq(reviewLike.userId, session.user.id)
          )
        )
        .limit(1);
      isLiked = !!like;
    }

    return NextResponse.json(
      {
        ...review,
        user: reviewUser,
        likeCount,
        isLiked,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /reviews/[reviewId] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

