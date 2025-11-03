/**
 * DirectionsCard Component
 * Displays directions information with route details
 */

import React from 'react';
import type { DirectionsResult } from '@/types/localhub';

interface DirectionsCardProps {
  directions: DirectionsResult;
  originAddress?: string;
  destinationAddress: string;
  mode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}

const modeIcons: Record<string, string> = {
  driving: '🚗',
  walking: '🚶',
  transit: '🚌',
  bicycling: '🚴',
};

const modeLabels: Record<string, string> = {
  driving: 'Driving',
  walking: 'Walking',
  transit: 'Transit',
  bicycling: 'Bicycling',
};

export function DirectionsCard({
  directions,
  originAddress = 'Your location',
  destinationAddress,
  mode = 'driving',
}: DirectionsCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-w-2xl mx-auto"
      role="region"
      aria-label="Directions information"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span role="img" aria-label={modeLabels[mode]}>
            {modeIcons[mode]}
          </span>
          {modeLabels[mode]} Directions
        </h2>
      </div>

      <div className="space-y-4">
        {/* Route overview */}
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Duration</div>
            <div className="text-2xl font-bold text-blue-600">
              {directions.duration_text}
            </div>
          </div>
          <div className="w-px h-12 bg-gray-300" aria-hidden="true"></div>
          <div className="flex-1 text-right">
            <div className="text-sm text-gray-600 mb-1">Distance</div>
            <div className="text-2xl font-bold text-blue-600">
              {directions.distance_text}
            </div>
          </div>
        </div>

        {/* Origin and destination */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" aria-hidden="true"></div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                From
              </div>
              <div className="text-gray-900">{originAddress}</div>
            </div>
          </div>

          <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-6" aria-hidden="true"></div>

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" aria-hidden="true"></div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                To
              </div>
              <div className="text-gray-900 font-medium">
                {destinationAddress}
              </div>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Route information is approximate and may vary based on traffic
            conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
