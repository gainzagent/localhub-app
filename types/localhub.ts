/**
 * LocalHub Type Definitions
 * Core types for the LocalHub ChatGPT app
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Bounds {
  ne: LatLng;
  sw: LatLng;
}

export interface PlaceResult {
  place_id: string;
  name: string;
  location: LatLng;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  phone?: string;
  open_now?: boolean;
}

export interface SearchPlacesInput {
  query: string;
  location_text: string;
  origin?: LatLng;
  radius_m?: number;
  open_now?: boolean;
  max_results?: number;
}

export interface SearchPlacesOutput {
  center: LatLng;
  bounds: Bounds;
  results: PlaceResult[];
  state_id: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

export interface GetPlaceDetailsInput {
  place_id: string;
}

export interface DirectionsResult {
  polyline: string;
  duration_text: string;
  distance_text: string;
  duration_value: number;
  distance_value: number;
}

export interface GetDirectionsInput {
  origin: LatLng;
  destination: LatLng;
  mode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}

export interface ComposeMapResourceInput {
  state_id: string;
  route_polyline?: string;
}

export interface ComposeMapResourceOutput {
  resource_id: string;
  state_id: string;
  display_mode: 'fullscreen';
}

export interface SessionState {
  state_id: string;
  search_results: PlaceResult[];
  center: LatLng;
  bounds: Bounds;
  last_query: string;
  timestamp: number;
}
