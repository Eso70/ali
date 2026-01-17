import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { getLinktreeAnalytics } from "@/lib/supabase/queries";
import { query } from "@/lib/database/client";

// Cache for 30 days (2592000 seconds)
export const revalidate = 2592000;

// GET /api/linktrees/[id]/analytics - Get analytics data for a linktree (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid linktree ID format" },
        { status: 400 }
      );
    }

    // Verify linktree exists
    const linktreeResult = await query<{ id: string }>(
      "SELECT id FROM linktrees WHERE id = $1",
      [id]
    );

    if (!linktreeResult.rows || linktreeResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Linktree not found" },
        { status: 404 }
      );
    }

    // Get analytics data
    const analytics = await getLinktreeAnalytics(id);

    return NextResponse.json({ data: analytics }, {
      headers: {
        // Cache for 30 days with stale-while-revalidate
        'Cache-Control': 'private, s-maxage=2592000, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

