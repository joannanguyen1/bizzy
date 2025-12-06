import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MapPlaceClient from "./map-place-client";

interface MapPlacePageProps {
  params: Promise<{
    placeId: string;
  }>;
}

export default async function MapPlacePage({ params }: MapPlacePageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const { placeId } = await params;

  return <MapPlaceClient session={session} placeId={decodeURIComponent(placeId)} />;
}

