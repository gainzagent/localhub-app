/**
 * Google Maps API Base Client
 * Base class for making authenticated requests to Google Maps Platform APIs
 */

import { GoogleMapsError } from '../utils/errors';
import type { GoogleMapsStatus } from '@/types/google-maps';

export class GoogleMapsClient {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  /**
   * Make a GET request to Google Maps API
   */
  protected async request<T>(
    endpoint: string,
    params: Record<string, string | number | boolean>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add API key
    url.searchParams.append('key', this.apiKey);

    // Add other parameters
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, String(value));
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new GoogleMapsError(
          `HTTP error: ${response.status} ${response.statusText}`,
          'HTTP_ERROR'
        );
      }

      const data = await response.json();

      // Check API-level status
      if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new GoogleMapsError(
          data.error_message || `API returned status: ${data.status}`,
          data.status
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof GoogleMapsError) {
        throw error;
      }

      throw new GoogleMapsError(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Check if a status indicates success
   */
  protected isSuccessStatus(status: GoogleMapsStatus): boolean {
    return status === 'OK' || status === 'ZERO_RESULTS';
  }

  /**
   * Get API key for client-side usage (Maps JavaScript API)
   */
  getApiKey(): string {
    return this.apiKey;
  }
}
