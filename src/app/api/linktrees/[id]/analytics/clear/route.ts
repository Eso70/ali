import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/database/client";
import { getSession } from "@/lib/auth/get-session";

// DELETE /api/linktrees/[id]/analytics/clear - Clear all analytics data for a linktree
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
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

    // Delete all page views
    await query("DELETE FROM page_views WHERE linktree_id = $1", [id]);

    // Delete all link clicks
    await query("DELETE FROM link_clicks WHERE linktree_id = $1", [id]);

    // Recalculate all counts (should be 0 after deletion, but ensures consistency)
    try {
      await query("SELECT recalculate_all_linktree_counts($1)", [id]);
    } catch (recalculateError) {
      console.error("Error recalculating counts:", recalculateError);
      // Fallback: Reset click_count manually
      await query(
        "UPDATE links SET click_count = 0, updated_at = NOW() WHERE linktree_id = $1",
        [id]
      );
    }

    // On-demand revalidation
    revalidatePath(`/api/linktrees/${id}/analytics`);
    revalidatePath(`/api/linktrees/${id}`);
    revalidatePath('/api/linktrees');

    return NextResponse.json({
      message: "Analytics data cleared successfully",
      success: true,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error clearing analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

