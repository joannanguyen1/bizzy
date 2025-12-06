"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { LoggedInLayout } from "@/components/logged-in-layout";
import { PublicLayout } from "@/components/public-layout";
import { MapPinIcon, CalendarIcon, PencilIcon, CheckIcon, XIcon, ZoomInIcon, ZoomOutIcon, ArrowLeftIcon, Star } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow-button";
import { FollowersDialog } from "@/components/followers-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import { Slider } from "@/components/ui/slider";
import BoringAvatar from "boring-avatars";
import { Session, User } from "better-auth/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/use-file-upload";
import { blobToBase64 } from "@/lib/image-utils";
import { updateNameSchema } from "@/schema/auth-schema";

const AVATAR_COLORS = ["#F59E0B", "#FBBF24", "#FDE047", "#FEF3C7", "#FFFBEB"];

type Area = { x: number; y: number; width: number; height: number };

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: string = "image/jpeg",
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  if (pixelCrop.x < 0 || pixelCrop.y < 0 || pixelCrop.width <= 0 || pixelCrop.height <= 0) {
    console.error("Invalid crop dimensions");
    return null;
  }
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: true });

    if (!ctx) {
      return null;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    if (mimeType === "image/png") {
      ctx.clearRect(0, 0, outputWidth, outputHeight);
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const quality = mimeType === "image/jpeg" ? 0.95 : undefined;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, mimeType, quality);
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    return null;
  }
}

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
  rating?: number;
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

interface UserItem {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  createdAt: string;
}

interface ProfilePageClientProps {
  profileData: ProfileData;
  places: SavedPlace[];
  userId: string;
  currentUserId: string | null;
  session: {
    session: Session;
    user: User;
  } | null;
  initialFollowers?: UserItem[];
  initialFollowing?: UserItem[];
}

export default function ProfilePageClient({
  profileData: initialProfileData,
  places,
  userId,
  currentUserId,
  session,
  initialFollowers = [],
  initialFollowing = [],
}: ProfilePageClientProps) {
  const queryClient = useQueryClient();
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [placesWithRatings, setPlacesWithRatings] = useState<SavedPlace[]>(places);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [
    { files },
    {
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/png, image/jpeg, image/jpg",
    maxSize: 5 * 1024 * 1024,
    onError: (message) => toast.error(message),
  });

  const previewUrl = files[0]?.preview || null;
  const fileId = files[0]?.id;

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const previousFileIdRef = useRef<string | undefined | null>(null);

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setCropDialogOpen(true);
      setCroppedAreaPixels(null);
      setZoom(1);
    }
    previousFileIdRef.current = fileId;
  }, [fileId]);

  const handleCancelCrop = () => {
    if (fileId) {
      removeFile(fileId);
      setCroppedAreaPixels(null);
      setZoom(1);
      previousFileIdRef.current = null;
    }
    setCropDialogOpen(false);
  };

  const handleApplyAvatar = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const originalFile = files[0]?.file;
      const mimeType = originalFile?.type || "image/jpeg";

      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels, mimeType);

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.");
      }

      const base64Image = await blobToBase64(croppedBlob);

      const response = await fetch("/api/profile/update-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Avatar updated successfully");

        if (profileData) {
          setProfileData({
            ...profileData,
            user: {
              ...profileData.user,
              image: data.image,
            },
          });
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update avatar");
      }

      removeFile(fileId);
      previousFileIdRef.current = null;
      setCroppedAreaPixels(null);
      setZoom(1);
      setCropDialogOpen(false);
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar");
      setCropDialogOpen(false);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleStartEditName = () => {
    setIsEditingName(true);
    setEditedName(profileData?.user.name || "");
    setNameError("");
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName("");
    setNameError("");
  };

  const handleSaveName = async () => {
    const validation = updateNameSchema.safeParse({ name: editedName });

    if (!validation.success) {
      setNameError(validation.error.issues[0]?.message || "Invalid name");
      return;
    }

    setIsSavingName(true);
    try {
      const response = await fetch("/api/profile/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: validation.data.name }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Name updated successfully");

        if (profileData) {
          setProfileData({
            ...profileData,
            user: {
              ...profileData.user,
              name: data.name,
            },
          });
        }

        setIsEditingName(false);
        setEditedName("");
        setNameError("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update name");
      }
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

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

  useEffect(() => {
    const sortedPlaces = [...places].sort((a, b) => {
      const ratingA = a.rating ?? null;
      const ratingB = b.rating ?? null;
      
      if (ratingA === null && ratingB === null) {
        return a.name.localeCompare(b.name);
      }
      if (ratingA === null) return 1;
      if (ratingB === null) return -1;
      
      return ratingB - ratingA;
    });
    
    setPlacesWithRatings(sortedPlaces);
  }, [places]);

  const profileContent = (
    <div className="flex flex-1 min-h-0">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-6 flex-1 w-full min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-8 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="shrink-0 relative">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={openFileDialog}
                    className="relative group cursor-pointer"
                    aria-label="Change avatar"
                  >
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
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PencilIcon className="h-6 w-6 text-white" />
                    </div>
                  </button>
                  <input
                    {...getInputProps()}
                    className="sr-only"
                    aria-label="Upload avatar image"
                    tabIndex={-1}
                  />
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {isOwnProfile && isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveName();
                          } else if (e.key === "Escape") {
                            handleCancelEditName();
                          }
                        }}
                        className={cn("text-2xl font-medium h-auto py-1", nameError && "border-red-500")}
                        maxLength={31}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSaveName}
                        disabled={isSavingName}
                      >
                        <CheckIcon className="size-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCancelEditName}
                        disabled={isSavingName}
                      >
                        <XIcon className="size-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold">{user.name}</h1>
                      {isOwnProfile && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleStartEditName}
                          className="h-8 w-8"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  {nameError && (
                    <p className="text-sm text-red-500 mt-1">{nameError}</p>
                  )}
                </div>
                {!isOwnProfile && session && (
                  <FollowButton
                    userId={userId}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>
              {user.username && (
                <p className="text-muted-foreground mb-4">@{user.username}</p>
              )}
              <div className="flex gap-6 text-sm">
                {session ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground">
                        {profileData.followersCount}
                      </span>
                      <span className="text-muted-foreground">Followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-foreground">
                        {profileData.followingCount}
                      </span>
                      <span className="text-muted-foreground">Following</span>
                    </div>
                  </>
                )}
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-foreground">
                    {places.length}
                  </span>
                  <span className="text-muted-foreground">Places</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {isOwnProfile ? "Your Saved Places" : `${user.name}'s Saved Places`}
            </h2>
            {placesWithRatings.length === 0 ? (
              <div className="py-12 text-center">
                <MapPinIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "You haven't saved any places yet."
                    : "This user hasn't saved any places yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {placesWithRatings.map((place) => {
                  const hasPlaceId = hasValidPlaceId(place.placeId);

                  const cardContent = (
                    <Card
                      className={cn(
                        "hover:shadow-md transition-shadow",
                        hasPlaceId && "cursor-pointer hover:border-primary"
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
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
                          {place.rating !== undefined && place.rating !== null && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-lg">{place.rating.toFixed(1)}</span>
                            </div>
                          )}
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
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {session ? (
        <LoggedInLayout session={session}>
          {profileContent}
        </LoggedInLayout>
      ) : (
        <PublicLayout>
          {profileContent}
        </PublicLayout>
      )}

      {userId && currentUserId && (
        <>
          <FollowersDialog
            open={followersDialogOpen}
            onOpenChange={setFollowersDialogOpen}
            userId={userId}
            currentUserId={currentUserId}
            type="followers"
            initialData={initialFollowers}
          />

          <FollowersDialog
            open={followingDialogOpen}
            onOpenChange={setFollowingDialogOpen}
            userId={userId}
            currentUserId={currentUserId}
            type="following"
            initialData={initialFollowing}
          />
        </>
      )}

      {isOwnProfile && session && (
        <Dialog open={cropDialogOpen} onOpenChange={(open) => !open && handleCancelCrop()}>
          <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
            <DialogDescription className="sr-only">
              Crop avatar image
            </DialogDescription>
            <DialogHeader className="contents space-y-0 text-left">
              <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="-my-1 opacity-60"
                    onClick={handleCancelCrop}
                    aria-label="Cancel"
                  >
                    <ArrowLeftIcon aria-hidden="true" />
                  </Button>
                  <span>Crop avatar</span>
                </div>
                <Button
                  className="-my-1"
                  onClick={handleApplyAvatar}
                  disabled={!previewUrl || isUploadingAvatar}
                  autoFocus
                >
                  {isUploadingAvatar ? "Uploading..." : "Apply"}
                </Button>
              </DialogTitle>
            </DialogHeader>
            {previewUrl && (
              <Cropper
                className="h-96 sm:h-120 bg-black"
                image={previewUrl}
                zoom={zoom}
                aspectRatio={1}
                minZoom={1}
                maxZoom={4}
                onCropChange={handleCropChange}
                onZoomChange={setZoom}
              >
                <CropperDescription>
                  Drag to reposition the image. Use the slider below to zoom in or out.
                </CropperDescription>
                <CropperImage />
                <CropperCropArea className="rounded-full" />
              </Cropper>
            )}
            <DialogFooter className="border-t px-4 py-6">
              <div className="mx-auto flex w-full max-w-80 items-center gap-4">
                <ZoomOutIcon
                  className="shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                <Slider
                  value={[zoom]}
                  min={1}
                  max={4}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                  aria-label="Zoom slider"
                />
                <ZoomInIcon
                  className="shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

