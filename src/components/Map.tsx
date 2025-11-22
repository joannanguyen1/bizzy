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
  const locationAttemptedRef = useRef(false);

  const checkIfPlaceIsSaved = async (placeIdToCheck: string) => {
    setIsCheckingSaved(true);
    try {
      const session = await authClient.getSession();
      if (!session?.data?.user) {
        setIsCheckingSaved(false);
        return;
      }

      const response = await fetch(`/api/places/check?placeId=${encodeURIComponent(placeIdToCheck)}`);
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
      (error) => {
        console.log("Location access denied or unavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Handle map clicks to add pins
  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !mapInstanceRef.current || !window.google?.maps) return;

    const maps = window.google.maps;
    const clickedLocation = event.latLng;
    
    // Remove previous click marker
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
    }

    // Add new marker at clicked location
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

    // Use Geocoding API to get address information
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
        
        // Create a place object from the clicked location
        const clickedPlace: SelectedPlace = {
          name: result.formatted_address?.split(',')[0] || "Selected Location",
          formattedAddress: result.formatted_address || `${clickedLocation.lat().toFixed(6)}, ${clickedLocation.lng().toFixed(6)}`,
          latitude: clickedLocation.lat(),
          longitude: clickedLocation.lng(),
          placeId: result.place_id, // This will be undefined for some locations, but that's OK
        };

        setSelectedPlace(clickedPlace);
        setIsPlaceSaved(false); // Reset saved status for new location
        
        // If we have a place_id, check if it's already saved
        if (result.place_id) {
          checkIfPlaceIsSaved(result.place_id);
        }
      } else {
        // Fallback if geocoding doesn't return results
        const fallbackPlace: SelectedPlace = {
          name: "Selected Location",
          formattedAddress: `${clickedLocation.lat().toFixed(6)}, ${clickedLocation.lng().toFixed(6)}`,
          latitude: clickedLocation.lat(),
          longitude: clickedLocation.lng(),
        };
        
        setSelectedPlace(fallbackPlace);
        setIsPlaceSaved(false);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      
      // Fallback place when geocoding fails
      const fallbackPlace: SelectedPlace = {
        name: "Selected Location",
        formattedAddress: `${clickedLocation.lat().toFixed(6)}, ${clickedLocation.lng().toFixed(6)}`,
        latitude: clickedLocation.lat(),
        longitude: clickedLocation.lng(),
      };
      
      setSelectedPlace(fallbackPlace);
      setIsPlaceSaved(false);
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
        placeId: placeId,
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
    locationAttemptedRef.current = false;

    if (placeId) {
      checkIfPlaceIsSaved(placeId);
    }

    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      const maps = window.google.maps;
      const phillyCenter: google.maps.LatLngLiteral = { lat: 39.9526, lng: -75.1652 };
      const phillyBounds = new maps.LatLngBounds(
        { lat: 39.86, lng: -75.30 },
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

      // Add click listener to the map
      map.addListener("click", handleMapClick);

      maps.event.addListenerOnce(map, 'tilesloaded', () => {
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

  const handleAddPlace = async () => {
    if (!selectedPlace) return;

    setIsSaving(true);
    try {
      const session = await authClient.getSession();

      if (!session?.data?.user) {
        toast.error("You must be logged in to save places");
        return;
      }

      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedPlace),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409) {
          setIsPlaceSaved(true);
          toast.info("Place is already saved");
          return;
        }
        throw new Error(error.error || "Failed to save place");
      }

      toast.success("Place saved successfully!");
      setIsPlaceSaved(true);
    } catch (error) {
      console.error("Error saving place:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save place");
    } finally {
      setIsSaving(false);
    }
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
            onClick={handleAddPlace}
            disabled={isSaving || isPlaceSaved || isCheckingSaved}
            className={`w-full px-4 py-2 font-medium rounded-md transition-colors ${
              isPlaceSaved
                ? "bg-green-600 hover:bg-green-700 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white"
            }`}
          >
            {isSaving ? "Saving..." : isCheckingSaved ? "Checking..." : isPlaceSaved ? "Saved" : "Add Place"}
          </button>
        </div>
      )}
    </div>
  );
}