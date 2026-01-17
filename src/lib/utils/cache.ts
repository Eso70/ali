/**
 * Client-side caching utility for API responses
 * Reduces API calls by caching responses in localStorage
 */

const CACHE_PREFIX = 'api_cache_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds (reduced from 30 days for fresher data)

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Get cached data if available and not expired
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    
    // Check if expired
    if (now > entry.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Set cached data with expiration
 */
export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Ignore errors (localStorage might be full or disabled)
  }
}

/**
 * Clear cached data for a specific key
 */
export function clearCachedData(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // Ignore errors
  }
}

/**
 * Fetch with caching - returns cached data if available, otherwise fetches and caches
 */
export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  cacheKey?: string,
  bypassCache = false
): Promise<T> {
  const key = cacheKey || url;
  
  // Clear cache if bypassing
  if (bypassCache) {
    clearCachedData(key);
  } else {
    // Try to get from cache first
    const cached = getCachedData<T>(key);
    if (cached !== null) {
      return cached;
    }
  }
  
  // Fetch from API
  const headers = { ...options?.headers };
  delete (headers as Record<string, unknown>)['Cache-Control'];
  delete (headers as Record<string, unknown>)['Pragma'];
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  setCachedData(key, data);
  
  return data;
}
