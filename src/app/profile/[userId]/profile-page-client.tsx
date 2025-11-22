"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoggedInLayout } from "@/components/logged-in-layout";
import { MapPinIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  userId: string;
  currentUserId: string;
  session: {
    session: Session;
    user: User;
  };
}

export default function ProfilePageClient({
  userId,
  currentUserId,
  session,
}: ProfilePageClientProps) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await fetch(`/api/profile/${userId}`);
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile");
        }
        const profile = await profileResponse.json();
        setProfileData(profile);
        setIsFollowing(profile.isFollowing || false);

        const placesResponse = await fetch(`/api/profile/${userId}/places`);
        if (!placesResponse.ok) {
          throw new Error("Failed to fetch places");
        }
        const placesData = await placesResponse.json();
        const fetchedPlaces = placesData.places || [];
        
        setPlaces(fetchedPlaces);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading || !profileData) {
    return (
      <LoggedInLayout session={session}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </LoggedInLayout>
    );
  }

  const isOwnProfile = userId === currentUserId;
  const user = profileData.user;

  const handleFollowToggle = async () => {
    if (isUpdatingFollow || isOwnProfile) return;

    setIsUpdatingFollow(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/profile/${userId}/follow`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      setIsFollowing(!isFollowing);
      
      setProfileData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          followersCount: isFollowing
            ? prev.followersCount - 1
            : prev.followersCount + 1,
        };
      });
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  return (
    <LoggedInLayout session={session}>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 w-full h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
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
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{user.name}</CardTitle>
                        <CardDescription className="mb-4">{user.email}</CardDescription>
                      </div>
                      {!isOwnProfile && (
                        <Button
                          onClick={handleFollowToggle}
                          disabled={isUpdatingFollow}
                          variant={isFollowing ? "outline" : "default"}
                          className="ml-4"
                        >
                          {isUpdatingFollow
                            ? "..."
                            : isFollowing
                            ? "Following"
                            : "Follow"}
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {profileData.followersCount}
                        </span>
                        <span className="text-muted-foreground">Followers</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {profileData.followingCount}
                        </span>
                        <span className="text-muted-foreground">Following</span>
                      </div>
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

            <div className="space-y-4 pb-8">
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
                        className="block w-full no-underline relative z-[1] pointer-events-auto"
                      >
                        {cardContent}
                      </Link>
                    );
                  }

                  return (
                    <div key={place.id} className="relative z-[1]">
                      {cardContent}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </LoggedInLayout>
  );
}

