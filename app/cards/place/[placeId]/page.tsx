/**
 * Place Details Card Page
 * Displays place card at /cards/place/[placeId]
 */

import { notFound } from 'next/navigation';
import { PlaceCard } from '@/components/PlaceCard';
import { placesClient } from '@/lib/google-maps/places';

interface PageProps {
  params: {
    placeId: string;
  };
}

export default async function PlaceCardPage({ params }: PageProps) {
  const { placeId } = params;

  try {
    // Fetch place details
    const placeDetails = await placesClient.getPlaceDetails(placeId);

    // Convert to PlaceResult format
    const place = {
      place_id: placeDetails.place_id,
      name: placeDetails.name,
      location: { lat: 0, lng: 0 }, // We don't have coordinates in details response
      address: placeDetails.address,
      rating: placeDetails.rating,
      user_ratings_total: placeDetails.user_ratings_total,
      phone: placeDetails.phone,
      open_now: placeDetails.opening_hours?.open_now,
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <PlaceCard place={place} />

          {placeDetails.website && (
            <div className="mt-4 text-center">
              <a
                href={placeDetails.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Visit Website
              </a>
            </div>
          )}

          {placeDetails.opening_hours?.weekday_text && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Opening Hours
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {placeDetails.opening_hours.weekday_text.map((day, index) => (
                  <li key={index}>{day}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching place details:', error);
    notFound();
  }
}
