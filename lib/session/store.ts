/**
 * Session State Management
 * In-memory session storage for conversation context
 */

import { v4 as uuidv4 } from 'uuid';
import type { SessionState } from '@/types/localhub';

const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

class SessionStore {
  private sessions: Map<string, SessionState> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  /**
   * Generate a new unique state ID
   */
  generateStateId(): string {
    return uuidv4();
  }

  /**
   * Store session state
   */
  set(state: SessionState): void {
    this.sessions.set(state.state_id, {
      ...state,
      timestamp: Date.now(),
    });
  }

  /**
   * Retrieve session state
   */
  get(stateId: string): SessionState | undefined {
    const session = this.sessions.get(stateId);

    if (!session) {
      return undefined;
    }

    // Check if session has expired
    if (this.isExpired(session)) {
      this.sessions.delete(stateId);
      return undefined;
    }

    return session;
  }

  /**
   * Delete session state
   */
  delete(stateId: string): void {
    this.sessions.delete(stateId);
  }

  /**
   * Check if session has expired
   */
  private isExpired(session: SessionState): boolean {
    return Date.now() - session.timestamp > SESSION_EXPIRY_MS;
  }

  /**
   * Remove all expired sessions
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, session] of this.sessions.entries()) {
      if (now - session.timestamp > SESSION_EXPIRY_MS) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.sessions.delete(key);
    }

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired sessions`);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL_MS);

    // Ensure cleanup stops when process exits
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => {
        this.stopCleanup();
      });
    }
  }

  /**
   * Stop automatic cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get total number of active sessions
   */
  size(): number {
    this.cleanup(); // Clean up expired sessions first
    return this.sessions.size;
  }

  /**
   * Clear all sessions (for testing)
   */
  clear(): void {
    this.sessions.clear();
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();
