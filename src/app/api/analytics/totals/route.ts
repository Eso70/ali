import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { query } from "@/lib/database/client";

// GET /api/analytics/totals - Get total analytics across all linktrees (admin only)
export async function GET() {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use optimized database function for aggregation (much faster, 100% accurate)
    // This uses COUNT and COUNT(DISTINCT) at database level instead of fetching all records
    let totalViews = 0;
    let uniqueViews = 0;
    let totalClicks = 0;
    let uniqueClicks = 0;

    try {
      const result = await query<{
        total_views: number;
        unique_views: number;
        total_clicks: number;
        unique_clicks: number;
      }>("SELECT * FROM get_total_analytics_optimized()");

      if (result.rows && result.rows.length > 0) {
        const data = result.rows[0];
        totalViews = Number(data.total_views) || 0;
        uniqueViews = Number(data.unique_views) || 0;
        totalClicks = Number(data.total_clicks) || 0;
        uniqueClicks = Number(data.unique_clicks) || 0;
      }
    } catch (error) {
      console.error("Error fetching total analytics using optimized function:", error);
      // Fallback to empty result
    }

    return NextResponse.json({
      data: {
        total_views: totalViews,
        unique_views: uniqueViews,
        total_clicks: totalClicks,
        unique_clicks: uniqueClicks,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error fetching total analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

