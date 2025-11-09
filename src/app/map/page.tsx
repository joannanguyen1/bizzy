"use client";
import { Suspense } from "react";
import Map from "@/components/Map";
import NavBar from "@/components/nav-bar";

function MapContent() {
  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <Map />
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

