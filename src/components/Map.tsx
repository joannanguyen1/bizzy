"use client";
import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    initMap: () => void;
  }
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    window.initMap = () => {
      if (!mapRef.current || !inputRef.current) return;

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
      });
    };
  }, []);

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
      </div>
    </>
  );
}
