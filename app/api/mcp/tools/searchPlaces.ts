/**
 * Search Places Tool
 * MCP tool for searching local businesses
 */

import { placesClient } from '@/lib/google-maps/places';
import { sessionStore } from '@/lib/session/store';
import {
  validateString,
  validateRadius,
  validateMaxResults,
  validateLatLng,
  validateBoolean,
  validateNumber,
} from '@/lib/utils/validation';
import { parseQuery, isNearMeQuery } from '@/lib/utils/parsing';
import type {
  SearchPlacesInput,
  SearchPlacesOutput,
  LatLng,
  Bounds,
  PlaceResult,
} from '@/types/localhub';

/**
 * Calculate bounds from a list of place results
 */
function calculateBounds(results: PlaceResult[]): Bounds {
  if (results.length === 0) {
    // Return default bounds
    return {
      ne: { lat: 0, lng: 0 },
      sw: { lat: 0, lng: 0 },
    };
  }

  let minLat = results[0].location.lat;
  let maxLat = results[0].location.lat;
  let minLng = results[0].location.lng;
  let maxLng = results[0].location.lng;

  for (const result of results) {
    minLat = Math.min(minLat, result.location.lat);
    maxLat = Math.max(maxLat, result.location.lat);
    minLng = Math.min(minLng, result.location.lng);
    maxLng = Math.max(maxLng, result.location.lng);
  }

  return {
    ne: { lat: maxLat, lng: maxLng },
    sw: { lat: minLat, lng: minLng },
  };
}

/**
 * Calculate center point from bounds or results
 */
function calculateCenter(results: PlaceResult[], location?: LatLng): LatLng {
  if (location) {
    return location;
  }

  if (results.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const bounds = calculateBounds(results);
  return {
    lat: (bounds.ne.lat + bounds.sw.lat) / 2,
    lng: (bounds.ne.lng + bounds.sw.lng) / 2,
  };
}

/**
 * Calculate distance between two coordinates (in meters)
 * Using Haversine formula
 */
function calculateDistance(from: LatLng, to: LatLng): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter results by minimum rating
 */
function filterByRating(
  results: PlaceResult[],
  minRating: number
): PlaceResult[] {
  return results.filter(
    (place) => place.rating !== undefined && place.rating >= minRating
  );
}

/**
 * Sort results by the specified criteria
 */
function sortResults(
  results: PlaceResult[],
  sortBy: 'relevance' | 'rating' | 'distance',
  origin?: LatLng
): PlaceResult[] {
  const sorted = [...results];

  switch (sortBy) {
    case 'rating':
      // Sort by rating (highest first), then by number of reviews
      sorted.sort((a, b) => {
        if (a.rating === undefined && b.rating === undefined) return 0;
        if (a.rating === undefined) return 1;
        if (b.rating === undefined) return -1;

        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }

        // If ratings are equal, sort by review count
        const aReviews = a.user_ratings_total || 0;
        const bReviews = b.user_ratings_total || 0;
        return bReviews - aReviews;
      });
      break;

    case 'distance':
      // Sort by distance from origin
      if (!origin) {
        console.warn('Cannot sort by distance without origin coordinates');
        return sorted;
      }

      sorted.sort((a, b) => {
        const distA = calculateDistance(origin, a.location);
        const distB = calculateDistance(origin, b.location);
        return distA - distB;
      });
      break;

    case 'relevance':
    default:
      // Keep Google's default relevance sorting
      break;
  }

  return sorted;
}

/**
 * Search Places Tool Handler
 */
export async function searchPlaces(
  input: unknown
): Promise<SearchPlacesOutput> {
  // Validate input
  const params = input as Record<string, unknown>;

  const query = validateString(params.query, 'query');
  const locationText = validateString(params.location_text, 'location_text');

  let origin: LatLng | undefined;
  if (params.origin) {
    origin = validateLatLng(params.origin, 'origin');
  }

  const radiusM = params.radius_m ? validateRadius(params.radius_m) : 5000;

  const openNow = params.open_now
    ? validateBoolean(params.open_now, 'open_now')
    : false;

  const minRating = params.min_rating
    ? validateNumber(params.min_rating, 'min_rating', 1, 5)
    : undefined;

  const sortBy = params.sort_by
    ? (validateString(params.sort_by, 'sort_by') as
        | 'relevance'
        | 'rating'
        | 'distance')
    : 'relevance';

  const maxResults = params.max_results
    ? validateMaxResults(params.max_results)
    : 20;

  // Check if this is a refinement of an existing search
  const existingStateId = params.state_id
    ? validateString(params.state_id, 'state_id')
    : undefined;

  let results: PlaceResult[];
  let searchLocation: LatLng | undefined = origin;

  // If refining an existing search, use cached results
  if (existingStateId) {
    const sessionData = sessionStore.get(existingStateId);
    if (sessionData) {
      results = sessionData.search_results;
      searchLocation = sessionData.center;
    } else {
      throw new Error(`Session not found: ${existingStateId}`);
    }
  } else {
    // Parse query to extract entity and location
    const parsed = parseQuery(query, locationText);

    // Determine search location
    // If "near me" but no origin provided, we need to geocode the location
    if (!searchLocation || isNearMeQuery(locationText)) {
      if (!origin) {
        // Geocode the location text
        searchLocation = await placesClient.geocode(parsed.location);
      } else {
        searchLocation = origin;
      }
    }

    // Search for places
    results = await placesClient.searchPlaces(
      `${parsed.entity} in ${parsed.location}`,
      searchLocation,
      radiusM,
      openNow
    );
  }

  // Apply rating filter
  if (minRating) {
    results = filterByRating(results, minRating);
  }

  // Apply sorting
  results = sortResults(results, sortBy, searchLocation);

  // Limit results to max_results
  const limitedResults = results.slice(0, maxResults);

  // Calculate bounds and center
  const bounds = calculateBounds(limitedResults);
  const center = calculateCenter(limitedResults, searchLocation);

  // Generate state ID and store session
  const stateId = sessionStore.generateStateId();
  sessionStore.set({
    state_id: stateId,
    search_results: limitedResults,
    center,
    bounds,
    last_query: query,
    timestamp: Date.now(),
  });

  return {
    center,
    bounds,
    results: limitedResults,
    state_id: stateId,
  };
}
