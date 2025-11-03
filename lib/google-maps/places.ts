/**
 * Google Maps Places API Client
 * Methods for searching places and getting place details
 */

import { GoogleMapsClient } from './client';
import { GoogleMapsError } from '../utils/errors';
import { SimpleCache, generateCacheKey } from '../utils/cache';
import type {
  GooglePlacesSearchResponse,
  GooglePlaceDetailsResponse,
  GooglePlace,
  GoogleGeocodingResponse,
} from '@/types/google-maps';
import type { LatLng, PlaceResult, PlaceDetails } from '@/types/localhub';

// Create cache instances with appropriate TTLs
const searchCache = new SimpleCache<PlaceResult[]>(300000); // 5 minutes
const detailsCache = new SimpleCache<PlaceDetails>(300000); // 5 minutes
const geocodeCache = new SimpleCache<LatLng>(600000); // 10 minutes (addresses don't change)

export class PlacesClient extends GoogleMapsClient {
  /**
   * Search for places using Text Search API
   */
  async searchPlaces(
    query: string,
    location?: LatLng,
    radius?: number,
    openNow?: boolean
  ): Promise<PlaceResult[]> {
    // Generate cache key
    const cacheKey = generateCacheKey(
      'search',
      query,
      location,
      radius,
      openNow
    );

    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log(`[PlacesClient] Cache hit for search: ${query}`);
      return cached;
    }

    const params: Record<string, string | number | boolean> = {
      query,
    };

    if (location) {
      params.location = `${location.lat},${location.lng}`;
    }

    if (radius) {
      params.radius = radius;
    }

    if (openNow) {
      params.opennow = true;
    }

    try {
      const response = await this.request<GooglePlacesSearchResponse>(
        '/place/textsearch/json',
        params
      );

      if (response.status === 'ZERO_RESULTS') {
        searchCache.set(cacheKey, []);
        return [];
      }

      const results = response.results.map((place) =>
        this.mapPlaceToResult(place)
      );

      // Cache the results
      searchCache.set(cacheKey, results);

      return results;
    } catch (error) {
      if (error instanceof GoogleMapsError) {
        throw error;
      }
      throw new GoogleMapsError(
        'Failed to search places',
        'SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Get detailed information about a place
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    // Check cache first
    const cacheKey = generateCacheKey('details', placeId);
    const cached = detailsCache.get(cacheKey);
    if (cached) {
      console.log(`[PlacesClient] Cache hit for place details: ${placeId}`);
      return cached;
    }

    const params = {
      place_id: placeId,
      fields:
        'place_id,name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,website,opening_hours',
    };

    try {
      const response = await this.request<GooglePlaceDetailsResponse>(
        '/place/details/json',
        params
      );

      if (response.status === 'ZERO_RESULTS') {
        throw new GoogleMapsError(
          `Place not found: ${placeId}`,
          'NOT_FOUND'
        );
      }

      const details = this.mapPlaceToDetails(response.result);

      // Cache the details
      detailsCache.set(cacheKey, details);

      return details;
    } catch (error) {
      if (error instanceof GoogleMapsError) {
        throw error;
      }
      throw new GoogleMapsError(
        'Failed to get place details',
        'DETAILS_FAILED',
        error
      );
    }
  }

  /**
   * Geocode a location string to coordinates
   */
  async geocode(address: string): Promise<LatLng> {
    // Check cache first
    const cacheKey = generateCacheKey('geocode', address);
    const cached = geocodeCache.get(cacheKey);
    if (cached) {
      console.log(`[PlacesClient] Cache hit for geocode: ${address}`);
      return cached;
    }

    const params = {
      address,
    };

    try {
      const response = await this.request<GoogleGeocodingResponse>(
        '/geocode/json',
        params
      );

      if (response.status === 'ZERO_RESULTS') {
        throw new GoogleMapsError(
          `Location not found: ${address}`,
          'LOCATION_NOT_FOUND'
        );
      }

      const result = response.results[0];
      const coordinates = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      };

      // Cache the coordinates
      geocodeCache.set(cacheKey, coordinates);

      return coordinates;
    } catch (error) {
      if (error instanceof GoogleMapsError) {
        throw error;
      }
      throw new GoogleMapsError(
        'Failed to geocode location',
        'GEOCODING_FAILED',
        error
      );
    }
  }

  /**
   * Clear all caches (useful for testing)
   */
  clearCaches(): void {
    searchCache.clear();
    detailsCache.clear();
    geocodeCache.clear();
  }

  /**
   * Map Google Place to PlaceResult
   */
  private mapPlaceToResult(place: GooglePlace): PlaceResult {
    return {
      place_id: place.place_id,
      name: place.name,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      address: place.formatted_address,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      phone:
        place.formatted_phone_number || place.international_phone_number,
      open_now: place.opening_hours?.open_now,
    };
  }

  /**
   * Map Google Place to PlaceDetails
   */
  private mapPlaceToDetails(place: GooglePlace): PlaceDetails {
    return {
      place_id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone:
        place.formatted_phone_number || place.international_phone_number,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      website: place.website,
      opening_hours: place.opening_hours
        ? {
            open_now: place.opening_hours.open_now || false,
            weekday_text: place.opening_hours.weekday_text || [],
          }
        : undefined,
    };
  }
}

// Factory function for lazy instantiation
let placesClientInstance: PlacesClient | null = null;

export function getPlacesClient(): PlacesClient {
  if (!placesClientInstance) {
    placesClientInstance = new PlacesClient();
  }
  return placesClientInstance;
}

// Export convenience instance (will be created on first use)
export const placesClient = {
  searchPlaces: (...args: Parameters<PlacesClient['searchPlaces']>) =>
    getPlacesClient().searchPlaces(...args),
  getPlaceDetails: (...args: Parameters<PlacesClient['getPlaceDetails']>) =>
    getPlacesClient().getPlaceDetails(...args),
  geocode: (...args: Parameters<PlacesClient['geocode']>) =>
    getPlacesClient().geocode(...args),
  clearCaches: () => getPlacesClient().clearCaches(),
};
