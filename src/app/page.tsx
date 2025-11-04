"use client";
import Map from "@/components/Map";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-10">
      <h1 className="text-3xl font-bold mb-6">Explore Fun Activities in Pennsylvania</h1>
      <Map />
    </main>
  );
}
