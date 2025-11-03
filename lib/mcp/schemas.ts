/**
 * MCP Tool JSON Schemas
 * Schema definitions for all MCP tools
 */

import type { MCPTool } from '@/types/mcp';

export const searchPlacesSchema: MCPTool = {
  name: 'search_places',
  description:
    'Find local businesses and display them on an interactive map. Searches for places like restaurants, cafes, shops, and services based on user queries. Supports filtering by rating, open hours, and sorting options.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Business type or name (e.g., "pizza", "pharmacy", "cafes")',
      },
      location_text: {
        type: 'string',
        description:
          'Location description (e.g., "Ponsonby", "Wellington CBD", "near me")',
      },
      origin: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
        },
        additionalProperties: false,
        description:
          "Optional: User's current coordinates for 'near me' queries",
      },
      radius_m: {
        type: 'number',
        description: 'Search radius in meters (default: 5000, max: 50000)',
      },
      open_now: {
        type: 'boolean',
        description: 'Filter to only businesses open now (default: false)',
      },
      min_rating: {
        type: 'number',
        description: 'Minimum rating filter (1-5, e.g., 4 for 4+ stars)',
      },
      sort_by: {
        type: 'string',
        enum: ['relevance', 'rating', 'distance'],
        description:
          'Sort results by relevance (default), rating (highest first), or distance (closest first)',
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of results to return (max: 20)',
      },
      state_id: {
        type: 'string',
        description:
          'Optional: Previous state ID for refining existing search results',
      },
    },
    required: ['query', 'location_text'],
    additionalProperties: false,
  },
  _meta: {
    component: {
      display: 'inline',
      title: 'LocalHub Results',
      expand_to: 'fullscreen',
    },
  },
};

export const getPlaceDetailsSchema: MCPTool = {
  name: 'get_place_details',
  description:
    'Get detailed information about a specific business including full address, phone number, website, hours, and reviews.',
  inputSchema: {
    type: 'object',
    properties: {
      place_id: {
        type: 'string',
        description: 'Google Maps place_id from search results',
      },
    },
    required: ['place_id'],
    additionalProperties: false,
  },
};

export const getDirectionsSchema: MCPTool = {
  name: 'get_directions',
  description:
    "Get directions from user's location to a business, including route, travel time, and distance.",
  inputSchema: {
    type: 'object',
    properties: {
      origin: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
        },
        required: ['lat', 'lng'],
        additionalProperties: false,
        description: 'Starting location coordinates',
      },
      destination: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
        },
        required: ['lat', 'lng'],
        additionalProperties: false,
        description: 'Destination coordinates',
      },
      mode: {
        type: 'string',
        enum: ['driving', 'walking', 'transit', 'bicycling'],
        description: 'Travel mode (default: driving)',
      },
    },
    required: ['origin', 'destination'],
    additionalProperties: false,
  },
};

export const composeMapResourceSchema: MCPTool = {
  name: 'compose_map_resource',
  description:
    'Create an interactive fullscreen map showing search results with clickable markers.',
  inputSchema: {
    type: 'object',
    properties: {
      state_id: {
        type: 'string',
        description: 'Session state ID from search results',
      },
      route_polyline: {
        type: 'string',
        description: 'Optional: Encoded polyline for directions overlay',
      },
    },
    required: ['state_id'],
    additionalProperties: false,
  },
  _meta: {
    embedded_resource: {
      id: 'localhub-map-v1',
      content_type: 'text/html',
      inline_html_path: '/resources/map.html',
    },
  },
};

export const allTools: MCPTool[] = [
  searchPlacesSchema,
  getPlaceDetailsSchema,
  getDirectionsSchema,
  composeMapResourceSchema,
];
