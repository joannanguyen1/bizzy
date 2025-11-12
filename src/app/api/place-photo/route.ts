import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const photoReference = searchParams.get("photoReference");
  const maxWidth = searchParams.get("maxWidth") || "400";

  if (!photoReference) {
    return NextResponse.json({ error: 'photoReference is required' }, { status: 400 });
  }

  try {
    const googlePhotoUrl = new URL("https://maps.googleapis.com/maps/api/place/photo");
    googlePhotoUrl.searchParams.append("maxwidth", maxWidth);
    googlePhotoUrl.searchParams.append("photoreference", photoReference);
    googlePhotoUrl.searchParams.append("key", process.env.GOOGLE_MAPS_API_KEY);

    const response = await fetch(googlePhotoUrl.toString());

    if (!response.ok) {
      throw new Error(`Google Photos API error: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error("Error fetching photo:", err);
    return NextResponse.json({ error: "Failed to fetch photo" }, { status: 500 });
  }
}