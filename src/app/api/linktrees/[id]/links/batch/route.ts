import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  batchCreateLinks,
  getLinktreeById,
  deleteAllLinksForLinktree,
} from "@/lib/supabase/queries";
import { getSession } from "@/lib/auth/get-session";
import { batchLinksUpdateSchema, validatePlatformUrl, sanitizeString } from "@/lib/validation/linktree";

// POST /api/linktrees/[id]/links/batch - Batch delete and create links (admin only)
// Optimized: Single request to replace all links instead of multiple sequential requests
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

    const { id: linktreeId } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(linktreeId)) {
      return NextResponse.json(
        { error: "Invalid linktree ID format" },
        { status: 400 }
      );
    }

    // Verify linktree exists
    const linktree = await getLinktreeById(linktreeId);
    if (!linktree) {
      return NextResponse.json(
        { error: "Linktree not found" },
        { status: 404 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const validationResult = batchLinksUpdateSchema.safeParse({
      deleteIds: body.deleteIds || [],
      createLinks: (body.createLinks || []).map((link: Record<string, unknown>) => ({
        platform: link.platform,
        url: link.url,
        display_order: link.display_order,
        display_name: link.display_name || null,
        description: link.description || null,
        default_message: link.default_message || null,
        metadata: link.metadata || null,
        linktree_id: linktreeId,
      })),
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: errors,
        },
        { status: 400 }
      );
    }

    // Note: deleteIds is validated but not used - we delete ALL links for the linktree instead
    const { createLinks } = validationResult.data;

    // Additional validation: Validate platform URLs and ensure required fields exist
    const invalidLinks: Array<{ index: number; platform: string; url: string; reason: string }> = [];
    createLinks.forEach((link, index) => {
      // Check if platform and URL are defined
      if (!link.platform || typeof link.platform !== "string") {
        invalidLinks.push({ 
          index, 
          platform: String(link.platform || "undefined"), 
          url: String(link.url || "undefined"),
          reason: "Platform is missing or invalid"
        });
        return;
      }
      
      if (!link.url || typeof link.url !== "string" || link.url.trim().length === 0) {
        invalidLinks.push({ 
          index, 
          platform: link.platform, 
          url: String(link.url || "undefined"),
          reason: "URL is missing or empty"
        });
        return;
      }
      
      // Validate URL format for the platform
      if (!validatePlatformUrl(link.platform, link.url)) {
        invalidLinks.push({ 
          index, 
          platform: link.platform, 
          url: link.url,
          reason: `Invalid URL format for platform: ${link.platform}`
        });
      }
    });

    if (invalidLinks.length > 0) {
      const errorDetails = invalidLinks.map(link => 
        `Link ${link.index + 1} (${link.platform}): ${link.reason}`
      ).join("; ");
      
      return NextResponse.json(
        { 
          error: "Invalid URL format for platform(s)",
          details: invalidLinks,
          message: errorDetails,
        },
        { status: 400 }
      );
    }

    // Sanitize string fields in createLinks and ensure metadata is Record or undefined (not null)
    const sanitizedCreateLinks = createLinks.map(link => {
      let safeMetadata: Record<string, unknown> | undefined = undefined;
      if (link.metadata && typeof link.metadata === "object" && !Array.isArray(link.metadata) && link.metadata !== null) {
        safeMetadata = link.metadata as Record<string, unknown>;
      }
      
      return {
        linktree_id: link.linktree_id,
        platform: link.platform,
        url: link.url,
        display_order: link.display_order,
        display_name: link.display_name ? sanitizeString(link.display_name) : null,
        description: link.description ? sanitizeString(link.description) : null,
        default_message: link.default_message ? sanitizeString(link.default_message) : null,
        metadata: safeMetadata,
      };
    });

    // Execute batch operations sequentially: DELETE ALL LINKS FIRST, then CREATE
    // ALWAYS delete ALL links for the linktree to prevent duplicates and ensure clean state
    // This is safer than deleting by IDs because it ensures no links are left behind
    await deleteAllLinksForLinktree(linktreeId);
    
    // Only create new links after ALL deletion is complete
    // Sequential execution ensures no duplicates
    const createdLinks = sanitizedCreateLinks.length > 0
      ? await batchCreateLinks(sanitizedCreateLinks)
      : [];

    // On-demand revalidation
    revalidatePath(`/api/linktrees/${linktreeId}/links`);
    revalidatePath(`/api/linktrees/${linktreeId}`);
    revalidatePath('/api/linktrees');
    revalidatePath(`/api/public/linktrees/${linktree.uid}`);

    return NextResponse.json({
      data: {
        deletedCount: "all", // Indicates all links were deleted
        createdCount: createdLinks.length,
        links: createdLinks,
      }
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Error batch updating links:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to batch update links" },
      { status: 500 }
    );
  }
}

