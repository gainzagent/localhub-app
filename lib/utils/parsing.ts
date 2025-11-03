/**
 * Query Parsing Utilities
 * Functions for parsing natural language queries
 */

/**
 * Extract business type (entity) and location (where) from query
 * This is a simple implementation - in production, you'd use NLP
 */
export interface ParsedQuery {
  entity: string;
  location: string;
}

/**
 * Common location keywords that indicate a location phrase
 */
const LOCATION_KEYWORDS = [
  'near',
  'in',
  'at',
  'around',
  'close to',
  'by',
  'next to',
];

/**
 * Parse a natural language query into entity and location
 * Examples:
 * - "pizza near Ponsonby" -> { entity: "pizza", location: "Ponsonby" }
 * - "cafes in Wellington CBD" -> { entity: "cafes", location: "Wellington CBD" }
 */
export function parseQuery(query: string, locationText: string): ParsedQuery {
  const queryLower = query.toLowerCase();
  const locationLower = locationText.toLowerCase();

  // Extract entity (business type)
  let entity = query;
  for (const keyword of LOCATION_KEYWORDS) {
    const index = queryLower.indexOf(keyword);
    if (index !== -1) {
      entity = query.substring(0, index).trim();
      break;
    }
  }

  // Use provided location or extract from query
  let location = locationText;
  if (!location || location.toLowerCase() === 'near me') {
    // Extract location from query if not provided
    for (const keyword of LOCATION_KEYWORDS) {
      const index = queryLower.indexOf(keyword);
      if (index !== -1) {
        location = query.substring(index + keyword.length).trim();
        break;
      }
    }
  }

  return {
    entity: entity.trim(),
    location: location.trim(),
  };
}

/**
 * Check if location text indicates "near me"
 */
export function isNearMeQuery(locationText: string): boolean {
  const lower = locationText.toLowerCase();
  return (
    lower === 'near me' ||
    lower === 'nearby' ||
    lower === 'close by' ||
    lower === 'around here'
  );
}

/**
 * Format a search query for Google Places API
 */
export function formatSearchQuery(entity: string, location: string): string {
  return `${entity} in ${location}`.trim();
}
