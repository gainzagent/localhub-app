/**
 * Get Place Details Tool
 * MCP tool for getting detailed business information
 */

import { placesClient } from '@/lib/google-maps/places';
import { validateString } from '@/lib/utils/validation';
import type { GetPlaceDetailsInput, PlaceDetails } from '@/types/localhub';

/**
 * Get Place Details Tool Handler
 */
export async function getPlaceDetails(
  input: unknown
): Promise<PlaceDetails> {
  // Validate input
  const params = input as Record<string, unknown>;
  const placeId = validateString(params.place_id, 'place_id');

  // Get details from Google Places API
  const details = await placesClient.getPlaceDetails(placeId);

  return details;
}
