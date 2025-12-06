"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";

interface Place {
  place_id?: string;
  id?: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  photos?: Array<{ photo_reference: string }>;
  source?: string;
}

export function PlaceRecommendationsCarousel({ interests }: { interests: string[] }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);

      if (interests.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/places/recommendations?interests=${encodeURIComponent(JSON.stringify(interests))}&page=${page}`
        );
        if (response.ok) {
          const data = await response.json();
          if (page === 1) {
            setPlaces(data.places || []);
          } else {
            setPlaces((prev) => [...prev, ...(data.places || [])]);
          }
          setHasMore(data.hasMore || false);
        }
      } catch (error) {
        console.error("Error fetching place recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [JSON.stringify(interests), page]);

  const getPlacePhoto = (place: Place) => {
    if (place.photos && place.photos.length > 0) {
      return `/api/place-photo?photoReference=${place.photos[0].photo_reference}&maxWidth=400`;
    }
    return null;
  };

  if (places.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      <h2 className="text-xl font-semibold mb-4">Place Recommendations</h2>
      <div className="relative w-full min-w-0 max-w-full overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2">
          <div className="flex gap-4 min-w-max px-2">
            {loading && places.length === 0 ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <div key={`skeleton-${index}`} className="shrink-0 w-full max-w-md">
                    <Card className="overflow-hidden h-full animate-pulse">
                      <div className="relative h-48 w-full bg-muted" />
                      <CardContent className="p-4">
                        <div className="h-5 bg-muted rounded mb-2" />
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </>
            ) : (
              places.map((place, index) => {
              const placeId = place.place_id || place.id;
              const photoUrl = getPlacePhoto(place);

              return (
                <div key={placeId || index} className="shrink-0 w-full max-w-md">
                  <Link href={placeId ? `/map/places/${encodeURIComponent(placeId)}` : "#"}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="relative h-48 w-full bg-muted overflow-hidden">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate">{place.name}</h3>
                        {place.formatted_address && (
                          <p className="text-sm text-muted-foreground truncate">
                            {place.formatted_address}
                          </p>
                        )}
                        {place.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{place.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              );
            })
            )}
            {hasMore && !loading && (
              <div className="shrink-0 w-full max-w-md">
                <Card className="h-full flex items-center justify-center min-h-[300px]">
                  <button
                    onClick={() => {
                      if (!hasMore || loading) return;
                      setPage((p) => p + 1);
                    }}
                    disabled={loading || !hasMore}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Load more...
                  </button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

