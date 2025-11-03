/**
 * Google Maps API Type Definitions
 * Types for Google Maps Platform API responses
 */

export interface GoogleLatLng {
  lat: number;
  lng: number;
}

export interface GoogleGeometry {
  location: GoogleLatLng;
  viewport?: {
    northeast: GoogleLatLng;
    southwest: GoogleLatLng;
  };
}

export interface GooglePlace {
  place_id: string;
  name: string;
  geometry: GoogleGeometry;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  website?: string;
  business_status?: string;
  types?: string[];
}

export interface GooglePlacesSearchResponse {
  results: GooglePlace[];
  status: string;
  error_message?: string;
  next_page_token?: string;
}

export interface GooglePlaceDetailsResponse {
  result: GooglePlace;
  status: string;
  error_message?: string;
}

export interface GoogleDirectionsLeg {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  start_address: string;
  end_address: string;
  start_location: GoogleLatLng;
  end_location: GoogleLatLng;
}

export interface GoogleDirectionsRoute {
  legs: GoogleDirectionsLeg[];
  overview_polyline: {
    points: string;
  };
  summary: string;
  warnings: string[];
}

export interface GoogleDirectionsResponse {
  routes: GoogleDirectionsRoute[];
  status: string;
  error_message?: string;
}

export interface GoogleGeocodingResult {
  place_id: string;
  formatted_address: string;
  geometry: GoogleGeometry;
  types: string[];
}

export interface GoogleGeocodingResponse {
  results: GoogleGeocodingResult[];
  status: string;
  error_message?: string;
}

export type GoogleMapsStatus =
  | 'OK'
  | 'ZERO_RESULTS'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR';
