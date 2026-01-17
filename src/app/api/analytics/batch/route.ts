import { NextRequest, NextResponse } from "next/server";
import { extractAnalyticsData } from "@/lib/utils/analytics";
import { getLinktreeIdByUid } from "@/lib/supabase/queries";
import { addView, addClick } from "@/lib/utils/batch-queue";

// POST /api/analytics/batch - Batch process multiple analytics events
// This reduces API calls from N individual calls to 1 batch call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { views = [], clicks = [] } = body as {
      views?: Array<{ uid: string }>;
      clicks?: Array<{ linkId: string; linktreeId: string }>;
    };

    // Extract analytics data once for both views and clicks
    const analyticsData = await extractAnalyticsData(request);
    const hasValidIp = analyticsData.ip_address && analyticsData.ip_address.trim();

    // Process views and clicks in parallel for better performance
    const [viewsResult, clicksResult] = await Promise.all([
      // Process views in batch
      (async () => {
        if (!Array.isArray(views) || views.length === 0 || !hasValidIp) {
          return { count: 0 };
        }
        
        const uniqueViews = new Map<string, string>(); // uid -> linktreeId
        
        // Get all unique UIDs and their linktree IDs
        for (const view of views) {
          if (view.uid && view.uid.trim() && !uniqueViews.has(view.uid.trim())) {
            const linktreeId = await getLinktreeIdByUid(view.uid.trim());
            if (linktreeId) {
              uniqueViews.set(view.uid.trim(), linktreeId);
            }
          }
        }
        
        // Add all views to batch queue - wait for all to complete
        const viewPromises = [];
        for (const linktreeId of uniqueViews.values()) {
          viewPromises.push(addView({
            linktree_id: linktreeId,
            ip_address: analyticsData.ip_address.trim(),
            session_id: analyticsData.session_id?.trim() || null,
            viewed_at: new Date().toISOString(),
          }));
        }
        await Promise.all(viewPromises);
        
        return { count: uniqueViews.size };
      })(),
      
      // Process clicks in batch
      (async () => {
        if (!Array.isArray(clicks) || clicks.length === 0 || !hasValidIp) {
          return { count: 0 };
        }
        
        const uniqueClicks = new Map<string, { linkId: string; linktreeId: string }>();
        
        // Deduplicate clicks
        for (const click of clicks) {
          if (
            click.linkId && 
            click.linkId.trim() && 
            click.linktreeId && 
            click.linktreeId.trim()
          ) {
            const key = `${click.linkId.trim()}_${click.linktreeId.trim()}`;
            if (!uniqueClicks.has(key)) {
              uniqueClicks.set(key, {
                linkId: click.linkId.trim(),
                linktreeId: click.linktreeId.trim(),
              });
            }
          }
        }
        
        // Add all clicks to batch queue - wait for all to complete
        const clickPromises = [];
        for (const click of uniqueClicks.values()) {
          clickPromises.push(addClick({
            link_id: click.linkId,
            linktree_id: click.linktreeId,
            ip_address: analyticsData.ip_address.trim(),
            session_id: analyticsData.session_id?.trim() || null,
            clicked_at: new Date().toISOString(),
          }));
        }
        await Promise.all(clickPromises);
        
        return { count: uniqueClicks.size };
      })(),
    ]);

    return NextResponse.json({ 
      success: true,
      processed: {
        views: viewsResult.count,
        clicks: clicksResult.count,
      }
    }, { status: 200 });
  } catch (error) {
    // Always return success - analytics failures shouldn't break the page
    console.error("Batch analytics error:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
