"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Heart } from "lucide-react";
import BoringAvatar from "boring-avatars";
import { authClient } from "@/lib/auth-client";
import nprogress from "nprogress";

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
  };
  likeCount?: number;
  isLiked?: boolean;
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

export function ReviewCard({ review }: { review: Review }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(review.isLiked || false);
  const [likeCount, setLikeCount] = useState(review.likeCount || 0);
  const [isToggling, setIsToggling] = useState(false);

  const handleLike = async () => {
    if (isToggling) return;

    const session = await authClient.getSession();
    if (!session?.data?.user) {
      return;
    }

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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCardClick = () => {
    nprogress.start();
    router.push(`/reviews/${review.id}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    nprogress.start();
    router.push(`/profile/${review.user?.username ? `@${review.user.username}` : review.userId}`);
  };

  const handlePlaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    nprogress.start();
    router.push(`/map/places/${encodeURIComponent(review.place!.place_id)}`);
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {review.user?.image ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.user.image} alt={review.user.name} />
                <AvatarFallback>{getInitials(review.user.name)}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="rounded-full overflow-hidden">
                <BoringAvatar
                  name={review.user?.name || "User"}
                  variant="marble"
                  colors={AVATAR_COLORS}
                  size={40}
                  square={false}
                />
              </div>
            )}
            <div>
              <button
                onClick={handleUserClick}
                className="font-semibold hover:underline text-left"
              >
                {review.user?.name || "User"}
              </button>
              {review.place && (
                <div>
                  <button
                    onClick={handlePlaceClick}
                    className="text-sm text-muted-foreground hover:underline text-left"
                  >
                    {review.place.name}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm mb-3 whitespace-pre-wrap">{review.review}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(review.createdAt)}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              disabled={isToggling}
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{likeCount}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

