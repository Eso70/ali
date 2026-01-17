import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Helper function to create a redirect response with cleared session cookie
 */
function createLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  
  // Clear the invalid session cookie
  response.cookies.set("admin_session", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  
  return response;
}

/**
 * Validate session token against database
 */
async function validateSession(sessionToken: string): Promise<boolean> {
  try {
    const { query } = await import("@/lib/database/client");
    const result = await query<{ is_session_valid: boolean }>(
      "SELECT is_session_valid($1) as is_session_valid",
      [sessionToken]
    );
    
    return result.rows[0]?.is_session_valid === true;
  } catch {
    return false;
  }
}

/**
 * Next.js 16+ proxy export (replaces middleware)
 * Protects admin routes by validating session before page renders
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin page routes (not API routes) - check session validity
  // This is the FIRST line of defense - blocks access before page renders
  if (pathname.startsWith("/admin") && !pathname.startsWith("/api/")) {
    const sessionToken = request.cookies.get("admin_session")?.value;
    
    // No session token - immediately redirect to login
    if (!sessionToken) {
      return createLoginRedirect(request);
    }
    
    // Check if session is valid in database
    const isValid = await validateSession(sessionToken);
    
    // Session invalid - redirect to login
    if (!isValid) {
      return createLoginRedirect(request);
    }
  }

  // Security headers are handled in next.config.ts
  // Return response without modifying headers here to avoid conflicts
  return NextResponse.next();
}

// Matcher configuration for Next.js 16+ proxy
export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};

