/**
 * MapCard Component
 * Displays a preview card for the interactive map
 */

import React from 'react';

interface MapCardProps {
  stateId: string;
  resultCount: number;
  locationName: string;
  onOpenFullscreen: () => void;
}

export function MapCard({
  stateId,
  resultCount,
  locationName,
  onOpenFullscreen,
}: MapCardProps) {
  return (
    <div
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md border border-blue-200 p-6 max-w-2xl mx-auto"
      role="region"
      aria-label="Interactive map preview"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Interactive Map
          </h2>
          <p className="text-gray-600 text-sm">
            {resultCount} {resultCount === 1 ? 'location' : 'locations'} near {locationName}
          </p>
        </div>
        <div
          className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl"
          aria-hidden="true"
        >
          📍
        </div>
      </div>

      <div className="bg-white/60 rounded-lg p-4 mb-4 border border-blue-100">
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span>
            Clickable markers
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></span>
            Business details
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></span>
            Get directions
          </span>
        </div>
      </div>

      <button
        onClick={onOpenFullscreen}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
        aria-label="Open map in fullscreen"
      >
        <span>Open Fullscreen Map</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Session: {stateId.slice(0, 8)}...
      </div>
    </div>
  );
}
