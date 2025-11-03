/**
 * Compose Map Resource Tool
 * MCP tool for generating fullscreen map HTML resource
 */

import { sessionStore } from '@/lib/session/store';
import { validateString } from '@/lib/utils/validation';
import { MCPError } from '@/lib/utils/errors';
import type { ComposeMapResourceOutput } from '@/types/localhub';

/**
 * Compose Map Resource Tool Handler
 */
export async function composeMapResource(
  input: unknown
): Promise<ComposeMapResourceOutput> {
  // Validate input
  const params = input as Record<string, unknown>;
  const stateId = validateString(params.state_id, 'state_id');

  const routePolyline = params.route_polyline
    ? validateString(params.route_polyline, 'route_polyline')
    : undefined;

  // Retrieve session state
  const session = sessionStore.get(stateId);
  if (!session) {
    throw new MCPError(
      `Session not found or expired: ${stateId}`,
      'SESSION_NOT_FOUND'
    );
  }

  // In a real implementation, we would generate the HTML resource here
  // For now, we just return the resource metadata
  // The actual HTML will be served from /resources/map.html

  return {
    resource_id: 'localhub-map-v1',
    state_id: stateId,
    display_mode: 'fullscreen',
  };
}
