/**
 * Get Directions Tool
 * MCP tool for calculating routes between locations
 */

import { directionsClient } from '@/lib/google-maps/directions';
import { validateLatLng, validateEnum } from '@/lib/utils/validation';
import type {
  GetDirectionsInput,
  DirectionsResult,
} from '@/types/localhub';

const TRAVEL_MODES = ['driving', 'walking', 'transit', 'bicycling'] as const;

/**
 * Get Directions Tool Handler
 */
export async function getDirections(
  input: unknown
): Promise<DirectionsResult> {
  // Validate input
  const params = input as Record<string, unknown>;

  const origin = validateLatLng(params.origin, 'origin');
  const destination = validateLatLng(params.destination, 'destination');

  const mode = params.mode
    ? validateEnum(params.mode, 'mode', TRAVEL_MODES)
    : 'driving';

  // Get directions from Google Directions API
  const directions = await directionsClient.getDirections(
    origin,
    destination,
    mode
  );

  return directions;
}
