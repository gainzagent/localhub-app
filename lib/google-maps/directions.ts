/**
 * Google Maps Directions API Client
 * Methods for calculating routes and directions
 */

import { GoogleMapsClient } from './client';
import { GoogleMapsError } from '../utils/errors';
import type { GoogleDirectionsResponse } from '@/types/google-maps';
import type { LatLng, DirectionsResult } from '@/types/localhub';

export class DirectionsClient extends GoogleMapsClient {
  /**
   * Get directions between two points
   */
  async getDirections(
    origin: LatLng,
    destination: LatLng,
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
  ): Promise<DirectionsResult> {
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode,
    };

    try {
      const response = await this.request<GoogleDirectionsResponse>(
        '/directions/json',
        params
      );

      if (response.status === 'ZERO_RESULTS') {
        throw new GoogleMapsError(
          'No route found between the specified locations',
          'NO_ROUTE'
        );
      }

      if (!response.routes || response.routes.length === 0) {
        throw new GoogleMapsError(
          'No routes returned in response',
          'NO_ROUTES'
        );
      }

      const route = response.routes[0];
      const leg = route.legs[0];

      return {
        polyline: route.overview_polyline.points,
        duration_text: leg.duration.text,
        distance_text: leg.distance.text,
        duration_value: leg.duration.value,
        distance_value: leg.distance.value,
      };
    } catch (error) {
      if (error instanceof GoogleMapsError) {
        throw error;
      }
      throw new GoogleMapsError(
        'Failed to get directions',
        'DIRECTIONS_FAILED',
        error
      );
    }
  }
}

// Factory function for lazy instantiation
let directionsClientInstance: DirectionsClient | null = null;

export function getDirectionsClient(): DirectionsClient {
  if (!directionsClientInstance) {
    directionsClientInstance = new DirectionsClient();
  }
  return directionsClientInstance;
}

// Export convenience instance (will be created on first use)
export const directionsClient = {
  getDirections: (...args: Parameters<DirectionsClient['getDirections']>) =>
    getDirectionsClient().getDirections(...args),
};
