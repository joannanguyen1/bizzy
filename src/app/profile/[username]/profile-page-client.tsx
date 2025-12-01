"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { LoggedInLayout } from "@/components/logged-in-layout";
import { MapPinIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";
import { FollowersDialog } from "@/components/followers-dialog";
import BoringAvatar from "boring-avatars";
import { Session, User } from "better-auth/types";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = ["#F59E0B", "#FBBF24", "#FDE047", "#FEF3C7", "#FFFBEB"];

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    username: string | null;
    createdAt: string;
  };
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface SavedPlace {
  id: string;
  userId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string | null;
  createdAt: string;
  updatedAt: string;
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

function hasValidPlaceId(placeId: string | null): boolean {
  return Boolean(placeId && typeof placeId === 'string' && placeId.trim().length > 0);
}

interface ProfilePageClientProps {
  profileData: ProfileData;
  places: SavedPlace[];
  userId: string;
  currentUserId: string;
  session: {
    session: Session;
    user: User;
  };
}

export default function ProfilePageClient({
  profileData: initialProfileData,
  places,
  userId,
  currentUserId,
  session,
}: ProfilePageClientProps) {
  const queryClient = useQueryClient();
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

  const prefetchFollowers = () => {
    queryClient.prefetchQuery({
      queryKey: ["followers", userId],
      queryFn: async () => {
        const response = await fetch(`/api/users/${userId}/followers`);
        if (!response.ok) throw new Error("Failed to fetch followers");
        const data = await response.json();
        return data.followers || [];
      },
    });
  };

  const prefetchFollowing = () => {
    queryClient.prefetchQuery({
      queryKey: ["following", userId],
      queryFn: async () => {
        const response = await fetch(`/api/users/${userId}/following`);
        if (!response.ok) throw new Error("Failed to fetch following");
        const data = await response.json();
        return data.following || [];
      },
    });
  };

  const isOwnProfile = userId === currentUserId;
  const user = profileData.user;

  const handleFollowChange = async () => {
    try {
      const profileResponse = await fetch(`/api/profile/${userId}`);
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setProfileData({
          ...profile,
          user: {
            ...profile.user,
            username: user.username,
          },
        });
      }
    } catch (error) {
      console.error("Error refreshing profile data:", error);
    }
  };

  return (
    <LoggedInLayout session={session}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="shrink-0">
                {user.image ? (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="rounded-full overflow-hidden">
                    <BoringAvatar
                      name={user.name}
                      variant="marble"
                      colors={AVATAR_COLORS}
                      size={96}
                      square={false}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                  </div>
                  {!isOwnProfile && (
                    <FollowButton
                      userId={userId}
                      onFollowChange={handleFollowChange}
                    />
                  )}
                </div>
                <CardDescription className={cn("mb-4", !user.username && "opacity-0")}>@{user.username}</CardDescription>
                <div className="flex gap-6 text-sm">
                  <button
                    onClick={() => setFollowersDialogOpen(true)}
                    onMouseEnter={prefetchFollowers}
                    className="flex flex-col hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    <span className="font-semibold text-foreground">
                      {profileData.followersCount}
                    </span>
                    <span className="text-muted-foreground">Followers</span>
                  </button>
                  <button
                    onClick={() => setFollowingDialogOpen(true)}
                    onMouseEnter={prefetchFollowing}
                    className="flex flex-col hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    <span className="font-semibold text-foreground">
                      {profileData.followingCount}
                    </span>
                    <span className="text-muted-foreground">Following</span>
                  </button>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {places.length}
                    </span>
                    <span className="text-muted-foreground">Places</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            {isOwnProfile ? "Your Saved Places" : `${user.name}'s Saved Places`}
          </h2>
          {places.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPinIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "You haven't saved any places yet."
                    : "This user hasn't saved any places yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            places.map((place) => {
              const hasPlaceId = hasValidPlaceId(place.placeId);

              const cardContent = (
                <Card
                  className={cn(
                    "hover:shadow-md transition-shadow",
                    hasPlaceId && "cursor-pointer hover:border-primary"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2">{place.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mb-2">
                          <MapPinIcon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{place.formattedAddress}</span>
                        </CardDescription>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>
                            Saved on{" "}
                            {new Date(place.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );

              if (hasPlaceId) {
                const placeIdValue = String(place.placeId).trim();
                return (
                  <Link
                    key={place.id}
                    href={`/map/places/${encodeURIComponent(placeIdValue)}`}
                    className="block w-full no-underline relative z-1 pointer-events-auto"
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div key={place.id} className="relative z-1">
                  {cardContent}
                </div>
              );
            })
          )}
        </div>
      </div>

      {userId && (
        <>
          <FollowersDialog
            open={followersDialogOpen}
            onOpenChange={setFollowersDialogOpen}
            userId={userId}
            currentUserId={currentUserId}
            type="followers"
          />

          <FollowersDialog
            open={followingDialogOpen}
            onOpenChange={setFollowingDialogOpen}
            userId={userId}
            currentUserId={currentUserId}
            type="following"
          />
        </>
      )}
    </LoggedInLayout>
  );
}

