"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import BoringAvatar from "boring-avatars";
import { Session, User } from "better-auth/types";
import { PublicLayout } from "@/components/public-layout";
import { LoggedInLayout } from "@/components/logged-in-layout";

const AVATAR_COLORS = ["#F59E0B", "#FBBF24", "#FDE047", "#FEF3C7", "#FFFBEB"];

interface Review {
  id: string;
  userId: string;
  placeId: string;
  rating: number;
  review: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
  place?: {
    place_id: string;
    name: string;
    formatted_address?: string;
  };
  likeCount: number;
  isLiked: boolean;
}

function getInitials(name: string) {
  if (!name) return "US";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ReviewDetailClient({
  review,
  session,
}: {
  review: Review;
  session: { session: Session; user: User } | null;
}) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(review.isLiked);
  const [likeCount, setLikeCount] = useState(review.likeCount);
  const [isToggling, setIsToggling] = useState(false);

  const handleLike = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/reviews/${review.id}`);
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount((prev) => (previousLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/reviews/${review.id}/like`, {
        method: previousLiked ? "DELETE" : "POST",
      });

      if (!response.ok) {
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const reviewContent = (
    <div className="flex flex-1 min-h-0">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-6 flex-1 w-full min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-8 pb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6">
            <div className="flex items-center gap-3">
              {review.user?.image ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={review.user.image} alt={review.user.name} />
                  <AvatarFallback>{getInitials(review.user.name)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="rounded-full overflow-hidden">
                  <BoringAvatar
                    name={review.user?.name || "User"}
                    variant="marble"
                    colors={AVATAR_COLORS}
                    size={48}
                    square={false}
                  />
                </div>
              )}
              <div>
                {session ? (
                  <Link
                    href={`/profile/${review.user?.username ? `@${review.user.username}` : review.userId}`}
                    className="font-semibold text-lg hover:underline"
                  >
                    {review.user?.name || "User"}
                  </Link>
                ) : (
                  <span className="font-semibold text-lg">{review.user?.name || "User"}</span>
                )}
                {review.place && (
                  <div>
                    <Link
                      href={`/map/places/${encodeURIComponent(review.place.place_id)}`}
                      className="text-muted-foreground hover:underline"
                    >
                      {review.place.name}
                    </Link>
                    {review.place.formatted_address && (
                      <p className="text-sm text-muted-foreground">
                        {review.place.formatted_address}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-base whitespace-pre-wrap">{review.review}</p>
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <span className="text-sm text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
              {session && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={handleLike}
                  disabled={isToggling}
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                  />
                  <span>{likeCount}</span>
                </Button>
              )}
              {!session && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-5 w-5" />
                  <span>{likeCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (session) {
    return <LoggedInLayout session={session}>{reviewContent}</LoggedInLayout>;
  }

  return <PublicLayout>{reviewContent}</PublicLayout>;
}

