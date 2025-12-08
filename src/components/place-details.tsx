"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/review-card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Star, MapPin, Phone, Globe, Clock, DollarSign, CheckCircle2, XCircle, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import GoogleIcon from "./GoogleIcon";

interface PlaceDetail {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  price_level?: number;
  business_status?: string;
  types?: string[];
}

interface AppReview {
  id: string;
  userId: string;
  placeId: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
  likeCount: number;
  isLiked: boolean;
}

interface PlaceDetailsProps {
  placeId: string;
}

export default function PlaceDetails({ placeId }: PlaceDetailsProps) {
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaceDetails() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/place-details?placeId=${encodeURIComponent(placeId)}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch place details');
        }

        const data = await response.json();
        setPlace(data.result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (placeId) {
      fetchPlaceDetails();
    }
  }, [placeId]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoadingReviews(true);
        const response = await fetch(`/api/places/${encodeURIComponent(placeId)}/reviews`);

        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    }

    if (placeId) {
      fetchReviews();
    }
  }, [placeId]);

  const getPriceLevel = (level?: number) => {
    if (!level) return null;
    return '$'.repeat(level);
  };

  const getPhotoUrl = (photoReference: string, maxWidth: number = 800) => {
    return `/api/place-photo?photoReference=${encodeURIComponent(photoReference)}&maxWidth=${maxWidth}`;
  };

  // Calculate average rating from app reviews
  const appRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!place) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No place details found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl mb-2">{place.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{place.formatted_address}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {appRating !== null ? (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">{appRating.toFixed(1)}</span>
                  </div>
                  {place.rating && (
                    <div className="flex items-center gap-1">
                      <GoogleIcon className="h-5 w-5" />
                      <span className="text-sm text-muted-foreground">
                        ({place.rating.toFixed(1)})
                      </span>
                    </div>

                  )}
                </>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">Be the first to review!</span>
                  {place.rating && (
                    <div className="flex items-center text-muted-foreground">
                      (
                      <GoogleIcon className="size-3 mr-1" />
                      <span className="text-sm">
                      {place.rating.toFixed(1)}
                    </span>
                      )
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList>
          <TabsTrigger value="reviews">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6 space-y-4">
          <AnimatePresence mode="wait">
            {loadingReviews ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center"
              >
                <p className="text-muted-foreground">Loading reviews...</p>
              </motion.div>
            ) : reviews.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="py-12 text-center"
              >
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to review!
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="details" className="mt-6 space-y-6">
          {place.photos && place.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel className="w-full">
                  <CarouselContent>
                    {place.photos.slice(0, 10).map((photo, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                          <img
                            src={getPhotoUrl(photo.photo_reference, 1200)}
                            alt={`${place.name} photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {place.photos.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {place.formatted_phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={`tel:${place.formatted_phone_number}`}
                      className="text-primary hover:underline"
                    >
                      {place.formatted_phone_number}
                    </a>
                  </div>
                )}

                {place.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {place.price_level && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{getPriceLevel(place.price_level)}</span>
                  </div>
                )}

                {place.business_status && (
                  <div className="flex items-center gap-2">
                    {place.business_status === 'OPERATIONAL' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="text-sm text-green-600">Open</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <span className="text-sm text-red-600">Closed</span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {place.opening_hours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Hours
                    {place.opening_hours.open_now && (
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      )}>
                        Open Now
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {place.opening_hours.weekday_text.map((hours, index) => (
                      <p key={index} className="text-sm text-muted-foreground">{hours}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {place.types && place.types.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {place.types.slice(0, 8).map((type, index) => (
                    <span
                      key={index}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        "bg-primary/10 text-primary border border-primary/20"
                      )}
                    >
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
