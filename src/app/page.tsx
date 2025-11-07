"use client";
import Map from "@/components/Map";
import NavBar from "@/components/nav-bar";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <main>
        <section className="h-screen max-w-screen">
          <NavBar />
          <div className="mx-auto max-w-lg my-20 flex flex-col items-start">
            <div className="font-light text-4xl mb-4">
              <h1>Your circle.</h1>
              <h1>Your city.</h1>
              <h1>Your friends.</h1>
            </div>
            <Button className="rounded-full">Begin your hive</Button>
          </div>
        </section>
      </main>
    </>
  );
}
