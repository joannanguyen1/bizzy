import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { placeReview, reviewLike } from "@/schema/places-schema";
import { user } from "@/schema/auth-schema";
import { eq, sql, and, inArray, desc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ placeId: string }> }
) {
  try {
    const session = await auth.api.getSession(req);
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
      .orderBy(desc(placeReview.createdAt))
      .limit(50);

    if (reviews.length === 0) {
      return NextResponse.json({ reviews: [] }, { status: 200 });
    }

    const reviewIds = reviews.map((r) => r.id);

    const [likeCounts, userLikes] = await Promise.all([
      db
        .select({
          reviewId: reviewLike.reviewId,
          count: sql<number>`count(*)::int`,
        })
        .from(reviewLike)
        .where(inArray(reviewLike.reviewId, reviewIds))
        .groupBy(reviewLike.reviewId),
      session?.user
        ? db
            .select({
              reviewId: reviewLike.reviewId,
            })
            .from(reviewLike)
            .where(
              and(
                inArray(reviewLike.reviewId, reviewIds),
                eq(reviewLike.userId, session.user.id)
              )
            )
        : Promise.resolve([]),
    ]);

    const likeCountMap = new Map(
      likeCounts.map((lc) => [lc.reviewId, lc.count])
    );
    const userLikedSet = new Set(userLikes.map((ul) => ul.reviewId));

    const reviewsWithLikes = reviews.map((review) => ({
      ...review,
      likeCount: likeCountMap.get(review.id) || 0,
      isLiked: userLikedSet.has(review.id),
    }));

    return NextResponse.json({ reviews: reviewsWithLikes }, { status: 200 });
  } catch (err) {
    console.error("GET /places/[placeId]/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

