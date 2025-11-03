/**
 * Simple In-Memory Cache
 * Provides TTL-based caching for API responses
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class SimpleCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private defaultTTL: number = 300000) {
    // 5 minutes default TTL
    // Start cleanup interval to remove expired entries
    this.startCleanup();
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set a value in cache with optional TTL
   */
  set(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);

    // Ensure cleanup runs on process exit
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => this.stopCleanup());
    }
  }

  /**
   * Stop cleanup interval
   */
  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(
        `[Cache] Cleaned up ${keysToDelete.length} expired entries`
      );
    }
  }
}

/**
 * Generate a cache key from function name and arguments
 */
export function generateCacheKey(
  prefix: string,
  ...args: unknown[]
): string {
  const serialized = args
    .map((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg);
      }
      return String(arg);
    })
    .join(':');

  return `${prefix}:${serialized}`;
}

/**
 * Decorator to add caching to async functions
 */
export function withCache<T>(
  cache: SimpleCache<T>,
  keyPrefix: string,
  ttl?: number
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = generateCacheKey(keyPrefix, ...args);

      // Try to get from cache
      const cached = cache.get(cacheKey);
      if (cached !== undefined) {
        console.log(`[Cache] Hit for ${cacheKey}`);
        return cached;
      }

      // Call original method
      console.log(`[Cache] Miss for ${cacheKey}`);
      const result = await originalMethod.apply(this, args);

      // Store in cache
      cache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}
