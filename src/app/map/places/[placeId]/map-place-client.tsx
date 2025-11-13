"use client";

import Map from "@/components/Map";
import PlaceDetails from "@/components/place-details";
import { LoggedInLayout } from "@/components/logged-in-layout";
import { Session, User } from "better-auth/types";
import PlacesSearchCommand from "@/components/places-search-command";
import Script from "next/script";

interface MapPlaceClientProps {
  session: {
    session: Session;
    user: User;
  };
  placeId: string;
}

export default function MapPlaceClient({ session, placeId }: MapPlaceClientProps) {
  return (
    <>
      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
      <LoggedInLayout session={session}>
        <div className="flex flex-1 h-screen overflow-hidden">
          <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-hidden">
            <div className="flex items-center justify-start p-4 border-b border-neutral-200 dark:border-neutral-700">
              <PlacesSearchCommand />
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              <div className="flex items-center justify-center p-4 lg:w-1/2 overflow-hidden">
                <Map placeId={placeId} />
              </div>

              <div className="lg:w-1/2 p-6 overflow-y-auto bg-gray-50 dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700">
                <PlaceDetails placeId={placeId} />
              </div>
            </div>
          </div>
        </div>
      </LoggedInLayout>
    </>
  );
}

