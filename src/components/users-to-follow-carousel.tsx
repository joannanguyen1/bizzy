"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";
import BoringAvatar from "boring-avatars";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";

const AVATAR_COLORS = ["#F59E0B", "#FBBF24", "#FDE047", "#FEF3C7", "#FFFBEB"];

interface User {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  sharedInterests: number;
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

export function UsersToFollowCarousel({ interests }: { interests: string[] }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      if (interests.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/users/suggestions?interests=${encodeURIComponent(JSON.stringify(interests))}`
        );
        if (response.ok) {
          const data = await response.json();
          setUsers((data.users || []).slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching user suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [JSON.stringify(interests)]);

  if (users.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      <h2 className="text-xl font-semibold mb-4">Users to Follow</h2>
      <div className="relative w-full min-w-0 max-w-full overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2">
          <div className="flex gap-4 min-w-max px-2">
            {loading && users.length === 0 ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <div key={`skeleton-${index}`} className="shrink-0 w-64">
                    <Card className="h-full animate-pulse">
                      <CardContent className="p-4 flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted" />
                        <div className="text-center w-full">
                          <div className="h-4 bg-muted rounded mb-2 mx-auto w-24" />
                          <div className="h-3 bg-muted rounded mb-1 mx-auto w-20" />
                          <div className="h-3 bg-muted rounded mx-auto w-32" />
                        </div>
                        <div className="h-8 w-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </>
            ) : (
              users.map((user) => (
              <div key={user.id} className="shrink-0 w-64">
                <Card className="h-full">
                  <CardContent className="p-4 flex flex-col items-center gap-3">
                    <Link
                      href={`/profile/${user.username ? `@${user.username}` : user.id}`}
                      className="flex flex-col items-center gap-2 hover:opacity-70 transition-opacity"
                    >
                      {user.image ? (
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="rounded-full overflow-hidden">
                          <BoringAvatar
                            name={user.name}
                            variant="marble"
                            colors={AVATAR_COLORS}
                            size={64}
                            square={false}
                          />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="font-semibold">{user.name}</p>
                        {user.username && (
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        )}
                        {user.sharedInterests > 0 && (
                          <div className="flex flex-row items-center justify-center gap-1">
                          <SparklesIcon className={cn("size-2 fill-current stroke-1", user.sharedInterests > 2 ? "text-amber-500" : "text-muted-foreground")} />
                          <p className={cn("text-xs text-muted-foreground", user.sharedInterests > 2 ? "text-amber-500" : "")}>
                            {user.sharedInterests} shared interest{user.sharedInterests !== 1 ? "s" : ""}
                          </p>
                          </div>
                        )}
                      </div>
                    </Link>
                    <FollowButton userId={user.id} variant="outline" size="sm" />
                  </CardContent>
                </Card>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

