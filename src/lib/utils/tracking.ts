/**
 * Client-side tracking utilities for unique views/clicks
 * Uses localStorage + sessionStorage to prevent duplicate API calls
 */

const STORAGE_PREFIX = 'ali_tracked_';
const SESSION_PREFIX = 'ali_session_';
const STORAGE_EXPIRY_DAYS = 30; // Track for 30 days to avoid duplicates

// In-memory cache to prevent duplicate calls within the same page load
// This works even if localStorage/sessionStorage fail
const inMemoryCache = new Set<string>();

/**
 * Check if localStorage is available and working
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a view has already been tracked for this linktree
 * Uses in-memory cache, sessionStorage (current session), and localStorage (persistent)
 */
export function hasTrackedView(uid: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const cacheKey = `view_${uid}`;
  
  // First check in-memory cache (fastest, same page load)
  if (inMemoryCache.has(cacheKey)) {
    return true;
  }
  
  // Then check sessionStorage (faster, current session only)
  const sessionKey = `${SESSION_PREFIX}view_${uid}`;
  try {
    if (sessionStorage.getItem(sessionKey)) {
      inMemoryCache.add(cacheKey); // Add to in-memory cache
      return true; // Already tracked in this session
    }
  } catch {
    // sessionStorage might be disabled, continue to localStorage check
  }
  
  // Finally check localStorage (persistent across sessions)
  if (!isLocalStorageAvailable()) {
    // If localStorage is not available, use in-memory cache only
    return false;
  }
  
  const key = `${STORAGE_PREFIX}view_${uid}`;
  let tracked: string | null = null;
  
  try {
    tracked = localStorage.getItem(key);
  } catch {
    // localStorage access failed, return false to allow tracking
    return false;
  }
  
  if (!tracked) return false;
  
  // Check if expired (older than 30 days)
  try {
    const data = JSON.parse(tracked);
    const expiryTime = data.timestamp + (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    if (Date.now() > expiryTime) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore removal errors
      }
      return false;
    }
    // Valid and not expired - add to in-memory cache
    inMemoryCache.add(cacheKey);
    return true;
  } catch {
    // Invalid data, remove it
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
    return false;
  }
}

/**
 * Mark a view as tracked
 * Uses in-memory cache, sessionStorage (current session), and localStorage (persistent)
 */
export function markViewTracked(uid: string): void {
  if (typeof window === 'undefined') return;
  
  const cacheKey = `view_${uid}`;
  
  // Mark in in-memory cache first (fastest, same page load)
  inMemoryCache.add(cacheKey);
  
  // Mark in sessionStorage (current session)
  const sessionKey = `${SESSION_PREFIX}view_${uid}`;
  try {
    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // sessionStorage might be disabled, continue
  }
  
  // Also mark in localStorage (persistent)
  if (!isLocalStorageAvailable()) {
    return; // Can't use localStorage
  }
  
  const key = `${STORAGE_PREFIX}view_${uid}`;
  const data = {
    timestamp: Date.now(),
    uid: uid,
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage might be full or disabled, silently fail
    // At least in-memory cache and sessionStorage should work
  }
}

/**
 * Check if a click has already been tracked for this link
 * Uses in-memory cache, sessionStorage (current session), and localStorage (persistent)
 */
export function hasTrackedClick(linkId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const cacheKey = `click_${linkId}`;
  
  // First check in-memory cache (fastest, same page load)
  if (inMemoryCache.has(cacheKey)) {
    return true;
  }
  
  // Then check sessionStorage (faster, current session only)
  const sessionKey = `${SESSION_PREFIX}click_${linkId}`;
  try {
    if (sessionStorage.getItem(sessionKey)) {
      inMemoryCache.add(cacheKey); // Add to in-memory cache
      return true; // Already tracked in this session
    }
  } catch {
    // sessionStorage might be disabled, continue to localStorage check
  }
  
  // Finally check localStorage (persistent across sessions)
  if (!isLocalStorageAvailable()) {
    // If localStorage is not available, use in-memory cache only
    return false;
  }
  
  const key = `${STORAGE_PREFIX}click_${linkId}`;
  let tracked: string | null = null;
  
  try {
    tracked = localStorage.getItem(key);
  } catch {
    // localStorage access failed, return false to allow tracking
    return false;
  }
  
  if (!tracked) return false;
  
  // Check if expired (older than 30 days)
  try {
    const data = JSON.parse(tracked);
    const expiryTime = data.timestamp + (STORAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    if (Date.now() > expiryTime) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore removal errors
      }
      return false;
    }
    // Valid and not expired - add to in-memory cache
    inMemoryCache.add(cacheKey);
    return true;
  } catch {
    // Invalid data, remove it
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
    return false;
  }
}

/**
 * Mark a click as tracked
 * Uses in-memory cache, sessionStorage (current session), and localStorage (persistent)
 */
export function markClickTracked(linkId: string): void {
  if (typeof window === 'undefined') return;
  
  const cacheKey = `click_${linkId}`;
  
  // Mark in in-memory cache first (fastest, same page load)
  inMemoryCache.add(cacheKey);
  
  // Mark in sessionStorage (current session)
  const sessionKey = `${SESSION_PREFIX}click_${linkId}`;
  try {
    sessionStorage.setItem(sessionKey, '1');
  } catch {
    // sessionStorage might be disabled, continue
  }
  
  // Also mark in localStorage (persistent)
  if (!isLocalStorageAvailable()) {
    return; // Can't use localStorage
  }
  
  const key = `${STORAGE_PREFIX}click_${linkId}`;
  const data = {
    timestamp: Date.now(),
    linkId: linkId,
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage might be full or disabled, silently fail
    // At least in-memory cache and sessionStorage should work
  }
}

