"use client";
/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  const placeIdFromUrl = searchParams.get("placeId");

  const loadPlaceById = (placeId: string, map: any) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    const google = window.google as any;
    const service = new google.maps.places.PlacesService(map);

    service.getDetails(
      {
        placeId: placeId,
        fields: ["geometry", "name", "formatted_address", "place_id"],
      },
      (place: any, status: string) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          if (!place.geometry || !place.geometry.location) return;

          // Clear old marker if exists
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }

          map.panTo(place.geometry.location);
          map.setZoom(15);

          // Create and store new marker
          markerRef.current = new google.maps.Marker({
            position: place.geometry.location,
            map,
            title: place.name,
          });

          // Store selected place data
          setSelectedPlace({
            name: place.name || "",
            formattedAddress: place.formatted_address || "",
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            placeId: place.place_id,
          });

        }
      }
    );
  };

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const google = window.google as any;

      const phillyCenter = { lat: 39.9526, lng: -75.1652 };
      const phillyBounds = new google.maps.LatLngBounds(
        { lat: 39.86, lng: -75.30 }, // SW corner
        { lat: 40.14, lng: -74.95 }  // NE corner
      );

      const map = new google.maps.Map(mapRef.current, {
        center: phillyCenter,
        zoom: 12,
        mapTypeControl: false,
        restriction: {
          latLngBounds: phillyBounds,
          strictBounds: true,
        },
      });

      mapInstanceRef.current = map;

      // Load place from URL if placeId is provided
      if (placeIdFromUrl) {
        loadPlaceById(placeIdFromUrl, map);
      }
    };

    let checkGoogle: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Wait for the script to load (NavBar loads it)
      checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          if (checkGoogle) clearInterval(checkGoogle);
          if (timeoutId) clearTimeout(timeoutId);
          initMap();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      timeoutId = setTimeout(() => {
        if (checkGoogle) clearInterval(checkGoogle);
      }, 10000);
    }

    return () => {
      if (checkGoogle) clearInterval(checkGoogle);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [placeIdFromUrl]);

  const handleAddPlace = async () => {
    if (!selectedPlace) return;

    setIsSaving(true);
    try {
      // Get current session
      const session = await authClient.getSession();
      
      if (!session?.data?.user) {
        toast.error("You must be logged in to save places");
        return;
      }

      // Save place to database
      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedPlace),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save place");
      }

      toast.success("Place saved successfully!");
      setSelectedPlace(null);
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
            disabled={isSaving}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            {isSaving ? "Saving..." : "Add Place"}
          </button>
        </div>
      )}
    </div>
  );
}
