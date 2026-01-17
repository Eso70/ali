/**
 * Shared utilities for linktree components
 * Prevents code duplication across components
 */

/**
 * Format date to YYYY-MM-DD HH:MM format (used in admin components)
 */
export function formatDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return String(date);
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return String(date);
  }
}

/**
 * Check if a date is expired
 */
export function isExpired(expireDate?: string | null): boolean {
  if (!expireDate) return false;
  try {
    return new Date(expireDate) < new Date();
  } catch {
    return false;
  }
}

/**
 * Get absolute URL for a linktree UID
 */
export function getAbsoluteUrl(uid: string): string {
  if (typeof window === "undefined") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) {
      return appUrl;
    }
    // Use PORT from environment or default to 3001
    const port = process.env.PORT || 3001;
    return `http://localhost:${port}`;
  }
  const baseUrl = window.location.origin;
  if (uid === "ali") {
    return baseUrl;
  }
  return `${baseUrl}/${uid}`;
}

/**
 * Optimized memo comparison for template props
 * Only checks essential fields that affect rendering
 */
export function areTemplatePropsEqual(
  prevProps: { linktree: { id: string; name: string; subtitle?: string | null; image?: string | null; footer_text?: string | null; footer_phone?: string | null }; links: Array<{ id: string; url: string; display_name?: string | null }>; theme: { from: string; via: string; to: string } },
  nextProps: { linktree: { id: string; name: string; subtitle?: string | null; image?: string | null; footer_text?: string | null; footer_phone?: string | null }; links: Array<{ id: string; url: string; display_name?: string | null }>; theme: { from: string; via: string; to: string } }
): boolean {
  // Quick reference checks first
  if (prevProps.linktree.id !== nextProps.linktree.id) return false;
  if (prevProps.linktree.name !== nextProps.linktree.name) return false;
  if (prevProps.linktree.subtitle !== nextProps.linktree.subtitle) return false;
  if (prevProps.linktree.image !== nextProps.linktree.image) return false;
  if (prevProps.linktree.footer_text !== nextProps.linktree.footer_text) return false;
  if (prevProps.linktree.footer_phone !== nextProps.linktree.footer_phone) return false;
  
  // Theme checks
  if (prevProps.theme.from !== nextProps.theme.from) return false;
  if (prevProps.theme.via !== nextProps.theme.via) return false;
  if (prevProps.theme.to !== nextProps.theme.to) return false;
  
  // Links array check - only check length and IDs for performance
  if (prevProps.links.length !== nextProps.links.length) return false;
  
  // Only check IDs and URLs (most critical for rendering)
  for (let i = 0; i < prevProps.links.length; i++) {
    const prevLink = prevProps.links[i];
    const nextLink = nextProps.links[i];
    if (!nextLink) return false;
    if (prevLink.id !== nextLink.id) return false;
    if (prevLink.url !== nextLink.url) return false;
    // Only check display_name if it changed (optional optimization)
    if (prevLink.display_name !== nextLink.display_name) return false;
  }
  
  return true;
}
