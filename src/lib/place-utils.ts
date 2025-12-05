export async function fetchPlaceDetails(placeId: string) {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const fields = ['place_id', 'name', 'formatted_address'].join(',');
    const apiUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    apiUrl.searchParams.append("place_id", placeId);
    apiUrl.searchParams.append("fields", fields);
    apiUrl.searchParams.append("key", process.env.GOOGLE_MAPS_API_KEY);

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return {
        place_id: data.result.place_id,
        name: data.result.name,
        formatted_address: data.result.formatted_address,
      };
    }
  } catch (error) {
    console.error(`Error fetching place details for ${placeId}:`, error);
  }
  return null;
}

