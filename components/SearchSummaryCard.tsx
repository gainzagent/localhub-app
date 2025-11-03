/**
 * SearchSummaryCard Component
 * Displays a summary of search results with action buttons
 */

import React from 'react';
import type { SearchPlacesOutput } from '@/types/localhub';

interface SearchSummaryCardProps {
  searchResults: SearchPlacesOutput;
  onOpenMap: () => void;
  onRefineSearch?: () => void;
}

export function SearchSummaryCard({
  searchResults,
  onOpenMap,
  onRefineSearch,
}: SearchSummaryCardProps) {
  const { results, state_id } = searchResults;
  const resultCount = results.length;

  // Get a sample of location context from first result
  const locationContext = results[0]?.address.split(',').slice(-2).join(',').trim() || 'your area';

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-w-2xl mx-auto"
      role="region"
      aria-label="Search results summary"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {resultCount > 0
            ? `Found ${resultCount} ${resultCount === 1 ? 'place' : 'places'}`
            : 'No places found'}
        </h2>
        {resultCount > 0 && (
          <p className="text-gray-600 text-sm">
            Showing results near {locationContext}
          </p>
        )}
      </div>

      {resultCount > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-2">
            {results.slice(0, 3).map((place, index) => (
              <div
                key={place.place_id}
                className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-1 text-sm"
              >
                <span className="font-medium text-gray-700">
                  {index + 1}. {place.name}
                </span>
                {place.rating && (
                  <span className="text-yellow-600">★ {place.rating}</span>
                )}
              </div>
            ))}
            {results.length > 3 && (
              <div className="flex items-center px-3 py-1 text-sm text-gray-500">
                +{results.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onOpenMap}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open interactive map"
          disabled={resultCount === 0}
        >
          Open Map
        </button>
        {onRefineSearch && (
          <button
            onClick={onRefineSearch}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Refine your search"
          >
            Refine Search
          </button>
        )}
      </div>

      {resultCount === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Try adjusting your search criteria or expanding the search radius.
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500" aria-live="polite">
        Session ID: {state_id}
      </div>
    </div>
  );
}
