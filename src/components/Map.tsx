"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    initMap: () => void;
  }
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize map after script loads
    window.initMap = () => {
      if (!mapRef.current) return;

      // Default center: Pennsylvania
      const paCenter = { lat: 40.2732, lng: -76.8867 };

      const map = new google.maps.Map(mapRef.current, {
        center: paCenter,
        zoom: 7,
        mapTypeControl: false,
      });

      // Create the search input
      const input = document.getElementById("search-box") as HTMLInputElement;
      const searchBox = new google.maps.places.SearchBox(input);

      // Bias results toward current map bounds
      map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
      });

      let markers: google.maps.Marker[] = [];

      // Listen for user selection
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (!places || places.length === 0) return;

        // Clear out old markers
        markers.forEach((marker) => marker.setMap(null));
        markers = [];

        // For each place, add a marker and adjust map
        const bounds = new google.maps.LatLngBounds();

        places.forEach((place) => {
          if (!place.geometry || !place.geometry.location) return;

          const marker = new google.maps.Marker({
            map,
            title: place.name,
            position: place.geometry.location,
          });

          markers.push(marker);

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });

        map.fitBounds(bounds);
      });
    };

    // Load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <input
        id="search-box"
        type="text"
        placeholder="Search for a place in Pennsylvania..."
        className="w-3/4 p-3 mb-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
      />
      <div ref={mapRef} className="w-full h-[600px] rounded-lg shadow-lg" />
    </div>
  );
}
