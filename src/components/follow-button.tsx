"use client";

import { useEffect, useRef } from "react";
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
  const onFollowChangeRef = useRef(onFollowChange);
  const prevIsFollowingRef = useRef(isFollowing);

  useEffect(() => {
    onFollowChangeRef.current = onFollowChange;
  }, [onFollowChange]);

  useEffect(() => {
    if (onFollowChangeRef.current && prevIsFollowingRef.current !== isFollowing) {
      prevIsFollowingRef.current = isFollowing;
      onFollowChangeRef.current(isFollowing);
    }
  }, [isFollowing]);

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
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

