import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { placeReview, reviewLike } from "@/schema/places-schema";
import { follow } from "@/schema/follow-schema";
import { user } from "@/schema/auth-schema";
import { eq, desc, inArray, sql, and } from "drizzle-orm";

async function fetchPlaceDetails(placeId: string) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const fields = ['place_id', 'name', 'formatted_address'].join(',');
    const apiUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    apiUrl.searchParams.append("place_id", placeId);
    apiUrl.searchParams.append("fields", fields);
    apiUrl.searchParams.append("key", process.env.GOOGLE_MAPS_API_KEY);

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return {
        place_id: data.result.place_id,
        name: data.result.name,
        formatted_address: data.result.formatted_address,
      };
    }
  } catch (error) {
    console.error(`Error fetching place details for ${placeId}:`, error);
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const following = await db
      .select({
        followingId: follow.followingId,
      })
      .from(follow)
      .where(eq(follow.followerId, session.user.id));

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json({ reviews: [] }, { status: 200 });
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
      .where(inArray(placeReview.userId, followingIds))
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
    console.error("GET /reviews/following error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

