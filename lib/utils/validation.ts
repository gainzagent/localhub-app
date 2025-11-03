/**
 * Input Validation Utilities
 * Functions for validating user inputs and API parameters
 */

import { ValidationError } from './errors';
import type { LatLng } from '@/types/localhub';

export function validateLatLng(latLng: unknown, fieldName: string): LatLng {
  if (!latLng || typeof latLng !== 'object') {
    throw new ValidationError(
      `${fieldName} must be an object with lat and lng properties`,
      fieldName,
      latLng
    );
  }

  const { lat, lng } = latLng as Record<string, unknown>;

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new ValidationError(
      `${fieldName} must have numeric lat and lng values`,
      fieldName,
      latLng
    );
  }

  if (lat < -90 || lat > 90) {
    throw new ValidationError(
      `${fieldName}.lat must be between -90 and 90`,
      `${fieldName}.lat`,
      lat
    );
  }

  if (lng < -180 || lng > 180) {
    throw new ValidationError(
      `${fieldName}.lng must be between -180 and 180`,
      `${fieldName}.lng`,
      lng
    );
  }

  return { lat, lng };
}

export function validateString(
  value: unknown,
  fieldName: string,
  minLength = 1,
  maxLength = 1000
): string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string`,
      fieldName,
      value
    );
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      fieldName,
      value
    );
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters`,
      fieldName,
      value
    );
  }

  return trimmed;
}

export function validateNumber(
  value: unknown,
  fieldName: string,
  min?: number,
  max?: number
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} must be a valid number`,
      fieldName,
      value
    );
  }

  if (min !== undefined && value < min) {
    throw new ValidationError(
      `${fieldName} must be at least ${min}`,
      fieldName,
      value
    );
  }

  if (max !== undefined && value > max) {
    throw new ValidationError(
      `${fieldName} must be at most ${max}`,
      fieldName,
      value
    );
  }

  return value;
}

export function validateBoolean(
  value: unknown,
  fieldName: string
): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `${fieldName} must be a boolean`,
      fieldName,
      value
    );
  }
  return value;
}

export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): T {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string`,
      fieldName,
      value
    );
  }

  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      fieldName,
      value
    );
  }

  return value as T;
}

export function sanitizeString(input: string): string {
  // Remove any HTML tags and trim whitespace
  return input.replace(/<[^>]*>/g, '').trim();
}

export function validateRadius(radius: unknown): number {
  const MAX_RADIUS = 50000; // 50km max
  const DEFAULT_RADIUS = 5000; // 5km default

  if (radius === undefined || radius === null) {
    return DEFAULT_RADIUS;
  }

  return validateNumber(radius, 'radius_m', 100, MAX_RADIUS);
}

export function validateMaxResults(maxResults: unknown): number {
  const MAX_ALLOWED = 20;
  const DEFAULT = 20;

  if (maxResults === undefined || maxResults === null) {
    return DEFAULT;
  }

  return validateNumber(maxResults, 'max_results', 1, MAX_ALLOWED);
}
