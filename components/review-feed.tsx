"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/review-card";

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

export function ReviewFeed() {
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [followingReviews, setFollowingReviews] = useState<Review[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const response = await fetch("/api/reviews/user");
        if (response.ok) {
          const data = await response.json();
          setUserReviews(data.reviews || []);
        }
      } catch (error) {
        console.error("Error fetching user reviews:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    const fetchFollowingReviews = async () => {
      try {
        const response = await fetch("/api/reviews/following");
        if (response.ok) {
          const data = await response.json();
          setFollowingReviews(data.reviews || []);
        }
      } catch (error) {
        console.error("Error fetching following reviews:", error);
      } finally {
        setLoadingFollowing(false);
      }
    };

    fetchUserReviews();
    fetchFollowingReviews();
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Review Feed</h2>
      <Tabs defaultValue="you" className="w-full">
        <TabsList>
          <TabsTrigger value="you">You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="you" className="mt-4">
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {loadingUser ? (
              <p className="text-muted-foreground">Loading your reviews...</p>
            ) : userReviews.length === 0 ? (
              <p className="text-muted-foreground">You haven&apos;t written any reviews yet.</p>
            ) : (
              userReviews.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        </TabsContent>
        <TabsContent value="following" className="mt-4">
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {loadingFollowing ? (
              <p className="text-muted-foreground">Loading reviews...</p>
            ) : followingReviews.length === 0 ? (
              <p className="text-muted-foreground">
                No reviews from users you follow yet.
              </p>
            ) : (
              followingReviews.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

