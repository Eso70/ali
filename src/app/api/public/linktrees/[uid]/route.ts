import { NextRequest, NextResponse } from "next/server";
import {
  getLinktreeWithLinksByUid,
} from "@/lib/supabase/queries";

// Cache for 30 days (2592000 seconds)
export const revalidate = 2592000;

// GET /api/public/linktrees/[uid] - Get linktree by UID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    
    // Optimized: Fetch linktree and links in a single database query
    const { linktree, links } = await getLinktreeWithLinksByUid(uid);

    if (!linktree) {
      return NextResponse.json(
        { error: "Linktree not found" },
        { status: 404 }
      );
    }

    // View tracking is handled via dedicated view tracking API route (unique views only)

    return NextResponse.json(
      {
        data: {
          ...linktree,
          links,
        },
      },
      {
        headers: {
          // Cache for 30 days with stale-while-revalidate for better performance
          'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching linktree:", error);
    return NextResponse.json(
      { error: "Failed to fetch linktree" },
      { status: 500 }
    );
  }
}

