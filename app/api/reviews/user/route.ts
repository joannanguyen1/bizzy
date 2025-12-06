import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { placeReview, reviewLike } from "@/schema/places-schema";
import { user } from "@/schema/auth-schema";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { fetchPlaceDetails } from "@/lib/place-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      .where(eq(placeReview.userId, session.user.id))
      .orderBy(desc(placeReview.createdAt));

    const uniquePlaceIds = [...new Set(reviews.map((r) => r.placeId))];
    const placeDetailsMap = new Map<string, { place_id: string; name: string; formatted_address?: string }>();

    await Promise.all(
      uniquePlaceIds.map(async (placeId) => {
        const details = await fetchPlaceDetails(placeId);
        if (details) {
          placeDetailsMap.set(placeId, details);
        }
      })
    );

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
      db
        .select({
          reviewId: reviewLike.reviewId,
        })
        .from(reviewLike)
        .where(
          and(
            inArray(reviewLike.reviewId, reviewIds),
            eq(reviewLike.userId, session.user.id)
          )
        ),
    ]);

    const likeCountMap = new Map(
      likeCounts.map((lc) => [lc.reviewId, lc.count])
    );
    const userLikedSet = new Set(userLikes.map((ul) => ul.reviewId));

    const reviewsWithLikes = reviews.map((review) => {
      const placeDetails = placeDetailsMap.get(review.placeId);

      return {
        id: review.id,
        userId: review.userId,
        placeId: review.placeId,
        rating: review.rating,
        review: review.review,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.user,
        place: placeDetails || undefined,
        likeCount: likeCountMap.get(review.id) || 0,
        isLiked: userLikedSet.has(review.id),
      };
    });

    return NextResponse.json({ reviews: reviewsWithLikes }, { status: 200 });
  } catch (err) {
    console.error("GET /reviews/user error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

