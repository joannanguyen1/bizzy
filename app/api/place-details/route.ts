import { NextResponse } from "next/server";

export async function GET(req: Request) {
if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error("Missing GOOGLE_MAPS_API_KEY");
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
}

const { searchParams } = new URL(req.url);
const placeId = searchParams.get("placeId");

if (!placeId) {
    return NextResponse.json({ error: 'placeId parameter is required' }, { status: 400 });
}

try {
    const fields = [
    'place_id',
    'name',
    'formatted_address',
    'formatted_phone_number',
    'website',
    'rating',
    'user_ratings_total',
    'reviews',
    'opening_hours',
    'photos',
    'price_level',
    'business_status',
    'types'
    ].join(',');

    const apiUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    apiUrl.searchParams.append("place_id", placeId);
    apiUrl.searchParams.append("fields", fields);
    apiUrl.searchParams.append("key", process.env.GOOGLE_MAPS_API_KEY);

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
        console.error("Google API Error:", {
            status: data.status,
            error_message: data.error_message,
            available_fields: data.html_attributions
        });
        return NextResponse.json(
            { 
                error: data.error_message || `Google API returned status: ${data.status}`,
                status: data.status
            }, 
            { status: 400 }
        );
    }

    return NextResponse.json(data);
} catch (err) {
    console.error("Error fetching place details:", err);
    return NextResponse.json({ 
    error: "Failed to fetch place details",
    details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
}
}