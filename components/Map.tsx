"use client";
/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

declare global {
  interface Window {
    initMap: () => void;
  }
}

interface SelectedPlace {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

interface GoogleMapsPlaceResult {
  geometry?: {
    location: google.maps.LatLng;
  };
  name?: string;
  formatted_address?: string;
  place_id?: string;
}

interface PlacesServiceConstructor {
  new (map: google.maps.Map): {
    getDetails: (
      request: { placeId: string; fields: string[] },
      callback: (place: GoogleMapsPlaceResult | null, status: string) => void
    ) => void;
  };
}

interface PlacesNamespace {
  PlacesService: PlacesServiceConstructor;
}

interface MapProps {
  placeId?: string;
}

export default function Map({ placeId = undefined }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const clickMarkerRef = useRef<google.maps.Marker | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaceSaved, setIsPlaceSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(false);

  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const [userNotes, setUserNotes] = useState<{ rating: number; review: string } | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const locationAttemptedRef = useRef(false);

  const checkIfPlaceIsSaved = async (placeIdToCheck: string) => {
    setIsCheckingSaved(true);
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        setIsCheckingSaved(false);
        return;
      }

      const response = await fetch(
        `/api/places/check?placeId=${encodeURIComponent(placeIdToCheck)}`
      );
      if (response.ok) {
        const data = await response.json();
        setIsPlaceSaved(data.isSaved);
      }
    } catch (error) {
      console.error("Error checking if place is saved:", error);
    } finally {
      setIsCheckingSaved(false);
    }
  };

  const getCurrentLocation = (map: google.maps.Map) => {
    if (!navigator.geolocation || locationAttemptedRef.current) return;

    locationAttemptedRef.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };

        if (map && window.google?.maps) {
          map.setCenter(userLocation);
          map.setZoom(16);

          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }

          userMarkerRef.current = new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });

          toast.success("Location found!");
        }
      },
      () => {
        console.log("Location access denied or unavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !mapInstanceRef.current || !window.google?.maps) return;

    const maps = window.google.maps;
    const clickedLocation = event.latLng;

    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
    }

    clickMarkerRef.current = new maps.Marker({
      position: clickedLocation,
      map: mapInstanceRef.current,
      title: "Selected Location",
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#EA4335",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    const geocoder = new maps.Geocoder();

    try {
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode(
          { location: clickedLocation },
          (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
            if (status === "OK" && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      if (results && results.length > 0) {
        const result = results[0];

        const clickedPlace: SelectedPlace = {
          name: result.formatted_address?.split(",")[0] || "Selected Location",
          formattedAddress:
            result.formatted_address ||
            `${clickedLocation.lat().toFixed(6)}, ${clickedLocation.lng().toFixed(6)}`,
          latitude: clickedLocation.lat(),
          longitude: clickedLocation.lng(),
          placeId: result.place_id,
        };

        setSelectedPlace(clickedPlace);
        setIsPlaceSaved(false);
        setUserNotes(null);

        if (result.place_id) {
          checkIfPlaceIsSaved(result.place_id);
        }
      } else {
        const fallbackPlace: SelectedPlace = {
          name: "Selected Location",
          formattedAddress: `${clickedLocation.lat().toFixed(6)}, ${clickedLocation.lng().toFixed(
            6
          )}`,
          latitude: clickedLocation.lat(),
          longitude: clickedLocation.lng(),
        };

        setSelectedPlace(fallbackPlace);
        setIsPlaceSaved(false);
        setUserNotes(null);
      }
    } catch (error) {
      console.error("Geocoding error:", error);

      const fallbackPlace: SelectedPlace = {
        name: "Selected Location",
        formattedAddress: `${clickedLocation.lat().toFixed(6)}, ${clickedLocation.lng().toFixed(
          6
        )}`,
        latitude: clickedLocation.lat(),
        longitude: clickedLocation.lng(),
      };

      setSelectedPlace(fallbackPlace);
      setIsPlaceSaved(false);
      setUserNotes(null);
    }
  };

  const loadPlaceById = (placeId: string, map: google.maps.Map) => {
    if (!window.google?.maps?.places) return;

    const maps = window.google.maps;
    const placesNamespace = maps.places as unknown as PlacesNamespace;
    const PlacesServiceConstructor = placesNamespace.PlacesService;
    if (!PlacesServiceConstructor) return;

    const service = new PlacesServiceConstructor(map);

    service.getDetails(
      {
        placeId,
        fields: ["geometry", "name", "formatted_address", "place_id"],
      },
      (place: GoogleMapsPlaceResult | null, status: string) => {
        if (status === "OK" && place) {
          if (!place.geometry?.location) return;

          if (markerRef.current) {
            markerRef.current.setMap(null);
          }

          map.panTo(place.geometry.location);
          map.setZoom(15);

          markerRef.current = new maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name,
          });

          const loadedPlace: SelectedPlace = {
            name: place.name || "",
            formattedAddress: place.formatted_address || "",
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            placeId: place.place_id,
          };

          setSelectedPlace(loadedPlace);
          setUserNotes(null);

          if (place.place_id) {
            checkIfPlaceIsSaved(place.place_id);
          }
        }
      }
    );
  };

  useEffect(() => {
    setIsPlaceSaved(false);
    setSelectedPlace(null);
    setUserNotes(null);
    locationAttemptedRef.current = false;

    if (placeId) {
      checkIfPlaceIsSaved(placeId);
    }

    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      const maps = window.google.maps;
      const phillyCenter: google.maps.LatLngLiteral = { lat: 39.9526, lng: -75.1652 };
      const phillyBounds = new maps.LatLngBounds(
        { lat: 39.86, lng: -75.3 },
        { lat: 40.14, lng: -74.95 }
      );

      const map = new maps.Map(mapRef.current, {
        center: phillyCenter,
        zoom: 12,
        mapTypeControl: false,
        restriction: {
          latLngBounds: phillyBounds,
          strictBounds: true,
        },
      });

      mapInstanceRef.current = map;
      map.addListener("click", handleMapClick);

      maps.event.addListenerOnce(map, "tilesloaded", () => {
        if (placeId) {
          loadPlaceById(placeId, map);
        } else {
          getCurrentLocation(map);
        }
      });
    };

    let checkGoogle: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    if (window.google?.maps) {
      initMap();
    } else {
      checkGoogle = setInterval(() => {
        if (window.google?.maps) {
          if (checkGoogle) clearInterval(checkGoogle);
          if (timeoutId) clearTimeout(timeoutId);
          initMap();
        }
      }, 100);

      timeoutId = setTimeout(() => {
        if (checkGoogle) clearInterval(checkGoogle);
      }, 10000);
    }

    return () => {
      if (checkGoogle) clearInterval(checkGoogle);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [placeId]);

  useEffect(() => {
    const fetchUserNotes = async () => {
      if (!selectedPlace?.placeId) {
        setUserNotes(null);
        return;
      }

      const session = await authClient.getSession();
      const user = session?.data?.user;

      if (!user) {
        setUserNotes(null);
        return;
      }

      try {
        const response = await fetch(
          `/api/places/${encodeURIComponent(selectedPlace.placeId)}/review`
        );

        if (response.status === 401) {
          setUserNotes(null);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUserNotes(data ? { rating: data.rating, review: data.review } : null);
        }
      } catch (error) {
        console.error("Error fetching user notes:", error);
      }
    };

    fetchUserNotes();
  }, [selectedPlace?.placeId]);

  const handleSubmitReview = async () => {
    if (!selectedPlace?.placeId) {
      toast.error("Missing place ID for review.");
      return;
    }
    if (!rating || !review.trim()) {
      toast.error("Please provide a rating and review.");
      return;
    }

    try {
      const response = await fetch(
        `/api/places/${encodeURIComponent(selectedPlace.placeId)}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, review }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Failed to save review");
      }

      setUserNotes({ rating, review });
      toast.success("Review submitted successfully!");
      setIsReviewPopupOpen(false);
      setRating(null);
      setReview("");
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review.");
    }
  };

  const handleAddPlace = async (): Promise<boolean> => {
    if (!selectedPlace) return false;

    setIsSaving(true);
    try {
      const session = await authClient.getSession();

      if (!session?.data?.user) {
        toast.error("You must be logged in to save places");
        return false;
      }

      const response = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPlace),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);

        if (response.status === 409) {
          setIsPlaceSaved(true);
          toast.info("Place is already saved");
          return true;
        }

        throw new Error(error?.error || "Failed to save place");
      }

      toast.success("Place saved successfully!");
      setIsPlaceSaved(true);
      return true;
    } catch (error) {
      console.error("Error saving place:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save place");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPlaceWithReview = async () => {
    const ok = await handleAddPlace();
    if (ok) {
      setIsReviewPopupOpen(true);
    }
  };

  const handleOpenReviewPopup = () => {
    if (!selectedPlace?.placeId || !isPlaceSaved) {
      toast.error("Save this place before adding a review.");
      return;
    }

    setRating(userNotes?.rating ?? null);
    setReview(userNotes?.review ?? "");
    setIsReviewPopupOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div ref={mapRef} className="w-full h-[600px] rounded-lg shadow-lg" />

      {selectedPlace && (
        <div className="w-3/4 mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
            {selectedPlace.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {selectedPlace.formattedAddress}
          </p>
          <button
            onClick={handleAddPlaceWithReview}
            disabled={isSaving || isPlaceSaved || isCheckingSaved}
            className={`w-full px-4 py-2 font-medium rounded-md transition-colors ${
              isPlaceSaved
                ? "bg-green-600 hover:bg-green-700 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white"
            }`}
          >
            {isSaving
              ? "Saving..."
              : isCheckingSaved
              ? "Checking..."
              : isPlaceSaved
              ? "Saved"
              : "Add Place"}
          </button>

          {isPlaceSaved && (
            <button
              type="button"
              onClick={handleOpenReviewPopup}
              className="mt-3 w-full px-4 py-2 text-sm font-semibold rounded-md border border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {userNotes ? "Edit Your Review" : "Add a Review"}
            </button>
          )}
        </div>
      )}

      {userNotes && (
        <div className="w-3/4 mt-3">
          <button
            type="button"
            onClick={() => setIsNotesOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-4 text-lg font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <span>Your Notes</span>
            <span
              className={`text-black text-xl transition-transform ${
                isNotesOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {isNotesOpen && (
            <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= userNotes.rating;
                  return (
                    <span
                      key={star}
                      className={`text-2xl ${
                        isActive ? "text-orange-500" : "text-orange-200"
                      }`}
                    >
                      ★
                    </span>
                  );
                })}
              </div>

              <p className="text-xl text-orange-900 leading-relaxed">
                {userNotes.review}
              </p>
            </div>
          )}
        </div>
      )}

      {isReviewPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 sm:p-8 border border-orange-200">
            <h2 className="text-xl font-semibold mb-1 text-gray-900">
              Add Your Review
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Share how your experience was at this spot.
            </p>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-800">
                Rating (1–5)
              </label>

              <div
                className="flex items-center gap-2 text-3xl"
                onMouseLeave={() => setHoverRating(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeValue = hoverRating ?? rating ?? 0;
                  const isActive = star <= activeValue;

                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="focus:outline-none"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      <span
                        className={`transition-transform ${
                          isActive
                            ? "text-orange-400 drop-shadow-sm scale-105"
                            : "text-gray-300 hover:text-orange-300"
                        }`}
                      >
                        ★
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-1 text-xs text-gray-500">
                {rating
                  ? `You selected ${rating} / 5.`
                  : "Click a star to choose your rating."}
              </p>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-800">
                Your Review
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 text-sm p-3 resize-none"
                rows={4}
                placeholder="What did you like or dislike about this place?"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsReviewPopupOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-orange-500 text-white shadow-sm hover:bg-orange-600 disabled:bg-orange-300"
                disabled={!rating || !review.trim()}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
