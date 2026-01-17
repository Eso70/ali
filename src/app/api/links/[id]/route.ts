import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateLink, deleteLink } from "@/lib/supabase/queries";
import { getSession } from "@/lib/auth/get-session";
import { query } from "@/lib/database/client";

// PATCH /api/links/[id] - Update a link (admin only)
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
        { error: "Invalid link ID format" },
        { status: 400 }
      );
    }
    
    const body = await request.json();

    const link = await updateLink(id, body);
    
    // On-demand revalidation
    if (link?.linktree_id) {
      revalidatePath(`/api/linktrees/${link.linktree_id}/links`);
      revalidatePath(`/api/linktrees/${link.linktree_id}`);
      revalidatePath('/api/linktrees');
    }
    
    return NextResponse.json({ data: link }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update link" },
      { status: 500 }
    );
  }
}

// DELETE /api/links/[id] - Delete a link (admin only)
export async function DELETE(
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
        { error: "Invalid link ID format" },
        { status: 400 }
      );
    }
    
    // Get linktree_id before deleting
    const linkResult = await query<{ linktree_id: string }>(
      "SELECT linktree_id FROM links WHERE id = $1",
      [id]
    );
    const linkData = linkResult.rows[0] || null;
    
    await deleteLink(id);

    // On-demand revalidation
    if (linkData?.linktree_id) {
      revalidatePath(`/api/linktrees/${linkData.linktree_id}/links`);
      revalidatePath(`/api/linktrees/${linkData.linktree_id}`);
      revalidatePath('/api/linktrees');
    }

    return NextResponse.json({ message: "Link deleted successfully" }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}

