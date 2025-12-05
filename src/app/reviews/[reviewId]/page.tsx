import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import ReviewDetailClient from "./review-detail-client";
import { db } from "@/lib/db";
import { placeReview, reviewLike } from "@/schema/places-schema";
import { user } from "@/schema/auth-schema";
import { eq, sql, and } from "drizzle-orm";
import { fetchPlaceDetails } from "@/lib/place-utils";

interface ReviewPageProps {
  params: Promise<{
    reviewId: string;
  }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const { reviewId } = await params;

  // Fetch review data
  const [review] = await db
    .select()
    .from(placeReview)
    .where(eq(placeReview.id, reviewId))
    .limit(1);

  if (!review) {
    notFound();
  }

  // Fetch user data
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

  // Fetch like count
  const likeCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reviewLike)
    .where(eq(reviewLike.reviewId, reviewId));

  const likeCount = likeCountResult[0]?.count || 0;

  // Check if current user liked the review
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

  // Fetch place details
  let placeDetails = null;
  if (review.placeId) {
    placeDetails = await fetchPlaceDetails(review.placeId);
  }

  const reviewData = {
    id: review.id,
    userId: review.userId,
    placeId: review.placeId,
    rating: review.rating,
    review: review.review,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    user: reviewUser,
    place: placeDetails || undefined,
    likeCount,
    isLiked,
  };

  return <ReviewDetailClient review={reviewData} session={session} />;
}

