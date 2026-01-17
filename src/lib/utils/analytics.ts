/**
 * Analytics utility functions
 */

export interface AnalyticsData {
  ip_address: string;
  session_id?: string;
}

/**
 * Extract IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (cfConnectingIP) {
    return cfConnectingIP.split(",")[0].trim();
  }
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIP) {
    return realIP.split(",")[0].trim();
  }
  
  return "0.0.0.0"; // Fallback
}


/**
 * Generate or get session ID from request
 */
export function getSessionId(request: Request): string {
  // Try to get session ID from cookie
  const cookies = request.headers.get("cookie");
  if (cookies) {
    const sessionMatch = cookies.match(/session[_-]?id=([^;]+)/i);
    if (sessionMatch) {
      return sessionMatch[1];
    }
  }

  // Generate a session ID based on IP + User-Agent hash
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const hash = `${ip}-${userAgent}`.slice(0, 32);
  
  return hash;
}

/**
 * Extract all analytics data from request (simplified - only IP and session ID)
 */
export async function extractAnalyticsData(request: Request): Promise<AnalyticsData> {
  const ip = getClientIP(request);
  const sessionId = getSessionId(request);

  return {
    ip_address: ip,
    session_id: sessionId,
  };
}

