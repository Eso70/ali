import { NextRequest, NextResponse } from "next/server";
import { extractAnalyticsData } from "@/lib/utils/analytics";
import { getLinktreeIdByUid } from "@/lib/supabase/queries";
import { addView } from "@/lib/utils/batch-queue";

// POST /api/public/linktrees/[uid]/view - Track unique page view
// Batched inserts reduce database load significantly
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    
    // Validate UID - skip if null/empty to reduce API calls
    if (!uid || !uid.trim()) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    // Get linktree ID
    const linktreeId = await getLinktreeIdByUid(uid);
    if (!linktreeId || !linktreeId.trim()) {
      return NextResponse.json({ success: true }, { status: 200 }); // Don't error, just return success
    }

    // Extract minimal analytics data (server extracts referrer from headers)
    const analyticsData = await extractAnalyticsData(request);
    
    // Validate analytics data - skip if IP is null/empty
    if (!analyticsData.ip_address || !analyticsData.ip_address.trim()) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    // Add to batch queue (will be inserted in batch) - fire and forget
    addView({
      linktree_id: linktreeId.trim(),
      ip_address: analyticsData.ip_address.trim(),
      session_id: analyticsData.session_id?.trim() || null,
      viewed_at: new Date().toISOString(),
    }).catch(() => {
      // Silently fail - analytics shouldn't break the page
    });

    // Return immediately - batch insert happens in background
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    // Always return success - analytics failures shouldn't break the page
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

