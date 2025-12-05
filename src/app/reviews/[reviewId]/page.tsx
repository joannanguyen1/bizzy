import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReviewDetailClient from "./review-detail-client";

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

  return <ReviewDetailClient reviewId={reviewId} session={session} />;
}

