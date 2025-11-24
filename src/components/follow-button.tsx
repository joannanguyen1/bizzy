"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  variant = "default",
  size = "default",
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/follow-status`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkFollowStatus();
  }, [userId]);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    const previousState = isFollowing;

    setIsFollowing(!isFollowing);

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);

      if (onFollowChange) {
        onFollowChange(data.isFollowing);
      }

      toast.success(
        data.isFollowing ? "Successfully followed user" : "Successfully unfollowed user"
      );
    } catch (error) {
      setIsFollowing(previousState);
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        "Following"
      ) : (
        "Follow"
      )}
    </Button>
  );
}

