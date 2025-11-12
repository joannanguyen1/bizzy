"use client";
import { useState, useEffect } from "react";

interface PlaceDetail {
place_id: string;
name: string;
formatted_address: string;
formatted_phone_number?: string;
website?: string;
rating?: number;
user_ratings_total?: number;
reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    profile_photo_url?: string;
}>;
opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
};
photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
}>;
price_level?: number;
business_status?: string;
types?: string[];
}

interface PlaceDetailsProps {
placeId: string;
}

export default function PlaceDetails({ placeId }: PlaceDetailsProps) {
const [place, setPlace] = useState<PlaceDetail | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
async function fetchPlaceDetails() {
    try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(`/api/place-details?placeId=${encodeURIComponent(placeId)}`);
        
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch place details');
    }

    const data = await response.json();
    setPlace(data.result);
    } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
    setLoading(false);
    }
}

if (placeId) {
    fetchPlaceDetails();
}
}, [placeId]);

const getPriceLevel = (level?: number) => {
    if (!level) return null;
    return '$'.repeat(level);
};

const getPhotoUrl = (photoReference: string, maxWidth: number = 400) => {
    return `/api/place-photo?photoReference=${encodeURIComponent(photoReference)}&maxWidth=${maxWidth}`;
};

if (loading) {
    return (
    <div className="p-6">
        <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
    </div>
    );
}

if (error) {
    return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
    </div>
    );
}

// No data state
if (!place) {
    return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700">No place details found</p>
    </div>
    );
}

return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
    {/* Header Section */}
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
        <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{place.name}</h1>
            <p className="text-gray-600 flex items-center">
            {place.formatted_address}
            </p>
        </div>
        {place.rating && (
            <div className="text-right ml-4">
            <div className="flex items-center gap-1">
                <span className="font-semibold text-lg">{place.rating}*</span>
            </div>
            <p className="text-sm text-gray-500">
                ({place.user_ratings_total} reviews)
            </p>
            </div>
        )}
        </div>
    </div>

    {/* Photos Section */}
    {place.photos && place.photos.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Photos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {place.photos.slice(0, 6).map((photo, index) => (
            <img
                key={index}
                src={getPhotoUrl(photo.photo_reference)}
                alt={`${place.name} photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg hover:shadow-lg transition-shadow"
            />
            ))}
        </div>
        </div>
    )}

    {/* Information Grid */}
    <div className="grid md:grid-cols-2 gap-6">
        {/* Contact & Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Information</h2>
        <div className="space-y-3">
            {place.formatted_phone_number && (
            <div className="flex items-center gap-2">
                <a 
                href={`tel:${place.formatted_phone_number}`} 
                className="text-blue-600 hover:underline"
                >
                {place.formatted_phone_number}
                </a>
            </div>
            )}
            
            {place.website && (
            <div className="flex items-center gap-2">
                <a 
                href={place.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
                >
                Visit Website
                </a>
            </div>
            )}

            {place.price_level && (
            <div className="flex items-center gap-2">
                <span>Price Level: {getPriceLevel(place.price_level)}</span>
            </div>
            )}

            {place.business_status && (
            <div className="flex items-center gap-2">
                <span className={place.business_status === 'OPERATIONAL' ? 'text-green-600' : 'text-red-600'}>
                {place.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}
                </span>
            </div>
            )}
        </div>
        </div>

        {/* Hours */}
        {place.opening_hours && (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Hours
            {place.opening_hours.open_now && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Open Now
                </span>
            )}
            </h2>
            <div className="space-y-1">
            {place.opening_hours.weekday_text.map((hours, index) => (
                <p key={index} className="text-sm text-gray-700">{hours}</p>
            ))}
            </div>
        </div>
        )}
    </div>

    {/* Categories */}
    {place.types && place.types.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
            {place.types.slice(0, 8).map((type, index) => (
            <span 
                key={index} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            ))}
        </div>
        </div>
    )}

    {/* Reviews Section */}
    {place.reviews && place.reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
        <div className="space-y-4">
            {place.reviews.slice(0, 3).map((review, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                {review.profile_photo_url && (
                <img
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    className="w-10 h-10 rounded-full"
                />
            )}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{review.author_name}</span>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                        <span
                            key={i}
                            className={`text-lg ${
                            i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                        >
                            ⭐
                        </span>
                        ))}
                    </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                    <p className="text-gray-500 text-xs mt-1">
                    {new Date(review.time * 1000).toLocaleDateString()}
                    </p>
                </div>
                </div>
            </div>
            ))}
        </div>
        </div>
    )}
    </div>
);
}