import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { placeReview, reviewLike } from "@/schema/places-schema";
import { follow } from "@/schema/follow-schema";
import { eq, desc, inArray, sql, and } from "drizzle-orm";

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
      .select()
      .from(placeReview)
      .where(inArray(placeReview.userId, followingIds))
      .orderBy(desc(placeReview.createdAt));

    const reviewsWithLikes = await Promise.all(
      reviews.map(async (review) => {
        const likeCountResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(reviewLike)
          .where(eq(reviewLike.reviewId, review.id));

        const [like] = await db
          .select()
          .from(reviewLike)
          .where(
            and(
              eq(reviewLike.reviewId, review.id),
              eq(reviewLike.userId, session.user.id)
            )
          )
          .limit(1);

        return {
          ...review,
          likeCount: likeCountResult[0]?.count || 0,
          isLiked: !!like,
        };
      })
    );

    return NextResponse.json({ reviews: reviewsWithLikes }, { status: 200 });
  } catch (err) {
    console.error("GET /reviews/following error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

