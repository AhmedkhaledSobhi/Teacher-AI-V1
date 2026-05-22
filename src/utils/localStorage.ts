/**
 * Enhanced localStorage utilities for chat thread management
 * This module provides simple caching for the last active thread ID
 * to restore user context on page refresh.
 *
 * Features:
 * - Timestamp tracking for debugging
 * - Backward compatibility with old cache format
 * - Cache info for debugging
 */

// Storage key for the current thread ID
const CURRENT_THREAD_ID_KEY = "ai_teacher_current_thread_id";

/**
 * Interface for cached thread data with timestamp
 */
interface CachedThreadData {
  threadId: string;
  cachedAt: number; // Unix timestamp in milliseconds
}

/**
 * Interface for cache info (for debugging)
 */
export interface CacheInfo {
  threadId: string;
  cachedAt: string; // ISO string
  ageInMinutes: number;
}

/**
 * Get the last active thread ID from localStorage
 * Supports both new format (with timestamp) and old format (plain string)
 * @returns The thread ID or null if not found
 */
export const getCurrentThreadId = (): string | null => {
  try {
    const cached = localStorage.getItem(CURRENT_THREAD_ID_KEY);
    if (!cached) return null;

    // Try to parse as new format (with timestamp)
    try {
      const data: CachedThreadData = JSON.parse(cached);
      return data.threadId;
    } catch {
      // Fallback for old format (plain string)
      // This ensures backward compatibility
      return cached;
    }
  } catch (error) {
    console.error("Error getting current thread ID:", error);
    return null;
  }
};

/**
 * Set the current active thread ID in localStorage with timestamp
 * @param threadId - The thread ID to cache
 */
export const setCurrentThreadId = (threadId: string): void => {
  try {
    const cacheData: CachedThreadData = {
      threadId,
      cachedAt: Date.now(),
    };

    localStorage.setItem(CURRENT_THREAD_ID_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error setting current thread ID:", error);
  }
};

/**
 * Clear the cached thread ID (useful for logout or thread deletion)
 */
export const clearCurrentThreadId = (): void => {
  try {
    localStorage.removeItem(CURRENT_THREAD_ID_KEY);
  } catch (error) {
    console.error("Error clearing current thread ID:", error);
  }
};

/**
 * Get detailed cache information for debugging
 * @returns Cache info with thread ID, timestamp, and age, or null if no cache
 */
export const getCacheInfo = (): CacheInfo | null => {
  try {
    const cached = localStorage.getItem(CURRENT_THREAD_ID_KEY);
    if (!cached) return null;

    try {
      // Try new format
      const data: CachedThreadData = JSON.parse(cached);
      return {
        threadId: data.threadId,
        cachedAt: new Date(data.cachedAt).toISOString(),
        ageInMinutes: Math.floor((Date.now() - data.cachedAt) / 60000),
      };
    } catch {
      // Old format - return basic info
      return {
        threadId: cached,
        cachedAt: "Unknown (old format)",
        ageInMinutes: -1,
      };
    }
  } catch (error) {
    console.error("Error getting cache info:", error);
    return null;
  }
};
