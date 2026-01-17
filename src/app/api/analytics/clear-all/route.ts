import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/database/client";
import { getSession } from "@/lib/auth/get-session";

// DELETE /api/analytics/clear-all - Clear all analytics data from page_views and link_clicks tables
export async function DELETE(_request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call the database function to clear analytics
    let pageViewsDeleted = 0;
    let linkClicksDeleted = 0;

    try {
      const result = await query<{
        page_views_deleted: number;
        link_clicks_deleted: number;
        cleared_at: string;
      }>("SELECT * FROM clear_analytics_data()");

      if (result.rows && result.rows.length > 0) {
        pageViewsDeleted = Number(result.rows[0].page_views_deleted) || 0;
        linkClicksDeleted = Number(result.rows[0].link_clicks_deleted) || 0;
      }
    } catch (error) {
      console.error("Error calling clear_analytics_data function:", error);
      // Fallback: Delete directly from tables if function fails
      const pageViewsResult = await query<{ count: number }>(
        "SELECT COUNT(*) as count FROM page_views"
      );
      const linkClicksResult = await query<{ count: number }>(
        "SELECT COUNT(*) as count FROM link_clicks"
      );

      pageViewsDeleted = Number(pageViewsResult.rows[0]?.count) || 0;
      linkClicksDeleted = Number(linkClicksResult.rows[0]?.count) || 0;

      // Delete all page views
      await query("DELETE FROM page_views");

      // Delete all link clicks
      await query("DELETE FROM link_clicks");

      // Reset click_count in links table
      await query("UPDATE links SET click_count = 0");
    }

    // On-demand revalidation for all analytics-related paths
    revalidatePath('/api/linktrees');
    revalidatePath('/api/analytics/totals');
    revalidatePath('/api/analytics/batch');
    
    // Get all linktree IDs and revalidate their analytics paths
    const allLinktreesResult = await query<{ id: string }>("SELECT id FROM linktrees");
    
    if (allLinktreesResult.rows && allLinktreesResult.rows.length > 0) {
      for (const linktree of allLinktreesResult.rows) {
        revalidatePath(`/api/linktrees/${linktree.id}/analytics`);
        revalidatePath(`/api/linktrees/${linktree.id}`);
      }
    }

    return NextResponse.json({
      message: "All analytics data cleared successfully",
      success: true,
      deleted: {
        page_views: pageViewsDeleted,
        link_clicks: linkClicksDeleted,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error clearing all analytics data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
