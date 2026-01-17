import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getLinksByLinktreeId,
  createLink,
  reorderLinks,
} from "@/lib/supabase/queries";
import { getSession } from "@/lib/auth/get-session";

// Cache for 30 days (2592000 seconds)
export const revalidate = 2592000;

// GET /api/linktrees/[id]/links - Get all links for a linktree (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin session
    const session = await getSession();
    if (!session || !session.user) {
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
    
    const links = await getLinksByLinktreeId(id);

    return NextResponse.json({ 
      data: links 
    }, {
      headers: {
        // Cache for 30 days with stale-while-revalidate
        'Cache-Control': 'private, s-maxage=2592000, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST /api/linktrees/[id]/links - Create a new link (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin session
    const session = await getSession();
    if (!session || !session.user) {
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
    
    const body = await request.json();
    const { 
      platform, 
      url, 
      display_order, 
      display_name, 
      description, 
      default_message, 
      metadata 
    } = body;

    // Validate required fields
    if (!platform || !url) {
      return NextResponse.json(
        { error: "Missing required fields: platform, url" },
        { status: 400 }
      );
    }

    const link = await createLink(
      id, 
      platform, 
      url, 
      display_order,
      display_name || null,
      description || null,
      default_message || null,
      metadata || null
    );
    
    // On-demand revalidation
    revalidatePath(`/api/linktrees/${id}/links`);
    revalidatePath(`/api/linktrees/${id}`);
    revalidatePath('/api/linktrees');
    
    return NextResponse.json({ data: link }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create link" },
      { status: 500 }
    );
  }
}

// PATCH /api/linktrees/[id]/links/reorder - Reorder links (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin session
    const session = await getSession();
    if (!session || !session.user) {
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
    
    const body = await request.json();
    const { link_ids } = body;

    if (!Array.isArray(link_ids)) {
      return NextResponse.json(
        { error: "link_ids must be an array" },
        { status: 400 }
      );
    }

    await reorderLinks(id, link_ids);
    
    // On-demand revalidation
    revalidatePath(`/api/linktrees/${id}/links`);
    revalidatePath(`/api/linktrees/${id}`);
    revalidatePath('/api/linktrees');
    
    return NextResponse.json({ message: "Links reordered successfully" }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error reordering links:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reorder links" },
      { status: 500 }
    );
  }
}

