"use client";
import { Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import Map from "@/components/Map";
import NavBar from "@/components/nav-bar";
import PlaceDetails from "@/components/place-details";

function MapContent() {
  const searchParams = useSearchParams();
  const placeId = searchParams.get('placeId');

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <div className={`flex items-center justify-center p-10 ${placeId ? 'lg:w-1/2' : 'w-full'}`}>
        <Map />
      </div>
      
      {placeId && (
        <div
          className="lg:w-1/2 p-6 overflow-y-auto max-h-screen bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700"
          tabIndex={0}
          role="region"
          aria-label="Place details"
        >
          <PlaceDetails placeId={placeId} />
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white flex flex-col">
      <NavBar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading map...</div>}>
        <MapContent />
      </Suspense>
    </main>
  );
}

