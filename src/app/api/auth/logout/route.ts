import { query } from "@/lib/database/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    // Invalidate session in database
    if (sessionToken) {
      await query("SELECT logout_admin($1)", [sessionToken]);
    }

    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

    // Delete cookie with explicit expiration and all possible paths
    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Delete cookie with multiple attempts to ensure it's cleared
    response.cookies.set("admin_session", "", cookieOptions);
    response.cookies.delete("admin_session");

    return response;
  } catch {
    // Even on error, try to delete the cookie
    const response = NextResponse.json(
      { error: "هەڵەیەکی نادیار ڕوویدا" },
      { status: 500 }
    );

    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("admin_session", "", cookieOptions);
    response.cookies.delete("admin_session");

    return response;
  }
}

