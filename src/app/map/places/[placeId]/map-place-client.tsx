"use client";

import Map from "@/components/Map";
import PlaceDetails from "@/components/place-details";
import { LoggedInLayout } from "@/components/logged-in-layout";
import { PublicLayout } from "@/components/public-layout";
import { Session, User } from "better-auth/types";
import PlacesSearchCommand from "@/components/places-search-command";
import Script from "next/script";

interface MapPlaceClientProps {
  session: {
    session: Session;
    user: User;
  } | null;
  placeId: string;
}

export default function MapPlaceClient({ session, placeId }: MapPlaceClientProps) {
  const content = (
    <>
      <Script
        id="google-maps-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
      <div className="flex flex-1 h-screen overflow-hidden">
        <div className="p-4 md:p-6 flex flex-col gap-4 flex-1 w-full h-full overflow-hidden bg-background">
          {session && (
            <div className="flex items-center justify-start">
              <PlacesSearchCommand />
            </div>
          )}

          <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
            <div className="flex items-center justify-center lg:w-1/2 overflow-hidden">
              <Map placeId={placeId} />
            </div>

            <div className="lg:w-1/2 overflow-y-auto">
              <PlaceDetails placeId={placeId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (session) {
    return <LoggedInLayout session={session}>{content}</LoggedInLayout>;
  }

  return <PublicLayout>{content}</PublicLayout>;
}

