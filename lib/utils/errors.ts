/**
 * Error Handling Utilities
 * Custom error classes and error handling helpers
 */

export class GoogleMapsError extends Error {
  constructor(
    message: string,
    public status: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GoogleMapsError';
    Object.setPrototypeOf(this, GoogleMapsError.prototype);
  }
}

export class MCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MCPError';
    Object.setPrototypeOf(this, MCPError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export function isGoogleMapsError(error: unknown): error is GoogleMapsError {
  return error instanceof GoogleMapsError;
}

export function isMCPError(error: unknown): error is MCPError {
  return error instanceof MCPError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export function handleAPIError(error: unknown): never {
  if (isGoogleMapsError(error)) {
    throw new MCPError(
      `Google Maps API error: ${error.message}`,
      'GOOGLE_MAPS_ERROR',
      { status: error.status }
    );
  }
  if (isValidationError(error)) {
    throw new MCPError(
      `Validation error: ${error.message}`,
      'VALIDATION_ERROR',
      { field: error.field, value: error.value }
    );
  }
  throw new MCPError(
    formatErrorMessage(error),
    'INTERNAL_ERROR',
    error
  );
}
