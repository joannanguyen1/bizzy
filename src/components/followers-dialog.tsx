"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";
import { useFollowers, useFollowing } from "@/hooks/use-followers";
import BoringAvatar from "boring-avatars";
import { CircleUserRoundIcon } from "lucide-react";

const AVATAR_COLORS = ["#F59E0B", "#FBBF24", "#FDE047", "#FEF3C7", "#FFFBEB"];

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentUserId: string;
  type: "followers" | "following";
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

export function FollowersDialog({
  open,
  onOpenChange,
  userId,
  currentUserId,
  type,
}: FollowersDialogProps) {
  const followersQuery = useFollowers(userId);
  const followingQuery = useFollowing(userId);

  const query = type === "followers" ? followersQuery : followingQuery;
  const users = query.data || [];
  const isLoading = query.isLoading && !query.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">{type}</DialogTitle>
          <DialogDescription>
            {type === "followers"
              ? "People who follow this user"
              : "People this user follows"}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CircleUserRoundIcon className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No {type} yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/profile/${user.username ? `@${user.username}` : user.id}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    {user.image ? (
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="rounded-full overflow-hidden shrink-0">
                        <BoringAvatar
                          name={user.name}
                          variant="marble"
                          colors={AVATAR_COLORS}
                          size={40}
                          square={false}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                    </div>
                  </Link>
                  {user.id !== currentUserId && (
                    <FollowButton userId={user.id} variant="outline" size="sm" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

