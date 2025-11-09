"use client";
/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    window.initMap = () => {
      if (!mapRef.current || !inputRef.current || !window.google) return;

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

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        bounds: phillyBounds,
        strictBounds: true,
        fields: ["geometry", "name", "formatted_address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
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
      });
    };
  }, []);

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
      
      // Clear input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error saving place:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save place");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`}
        strategy="afterInteractive"
      />

      <div className="flex flex-col items-center justify-center w-full h-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for places in Philadelphia..."
          className="w-3/4 p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
        />
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
    </>
  );
}
