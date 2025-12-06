"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFollowStatus } from "@/hooks/use-follow-status";

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
  const { isFollowing, isLoading, toggleFollow, isToggling } = useFollowStatus(userId);

  useEffect(() => {
    if (onFollowChange) {
      onFollowChange(isFollowing);
    }
  }, [isFollowing, onFollowChange]);

  if (isLoading) {
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
      onClick={toggleFollow}
      disabled={isToggling}
    >
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        "Following"
      ) : (
        "Follow"
      )}
    </Button>
  );
}

