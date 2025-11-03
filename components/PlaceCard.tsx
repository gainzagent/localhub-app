/**
 * PlaceCard Component
 * Displays a summary of a single place result
 */

import React from 'react';
import type { PlaceResult } from '@/types/localhub';

interface PlaceCardProps {
  place: PlaceResult;
  onClick?: () => void;
}

export function PlaceCard({ place, onClick }: PlaceCardProps) {
  const renderStars = (rating?: number) => {
    if (!rating) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
        <span className="text-yellow-500 text-sm">
          {'★'.repeat(fullStars)}
          {hasHalfStar && '⯨'}
          {'☆'.repeat(emptyStars)}
        </span>
        <span className="text-gray-600 text-sm">
          {rating} ({place.user_ratings_total || 0})
        </span>
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`View details for ${place.name}`}
    >
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {place.name}
      </h3>

      <div className="space-y-1 text-sm">
        <p className="text-gray-600">{place.address}</p>

        {place.rating && (
          <div className="mt-2">
            {renderStars(place.rating)}
          </div>
        )}

        {place.phone && (
          <p className="text-gray-600 mt-2">
            <span className="font-medium">Phone:</span> {place.phone}
          </p>
        )}

        {place.open_now !== undefined && (
          <div className="mt-2">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                place.open_now
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {place.open_now ? 'Open Now' : 'Closed'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
