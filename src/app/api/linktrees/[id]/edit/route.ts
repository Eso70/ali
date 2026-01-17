import { NextRequest, NextResponse } from "next/server";
import {
  getLinktreeById,
  getLinksByLinktreeId,
} from "@/lib/supabase/queries";
import { getSession } from "@/lib/auth/get-session";
import { editDataResponseSchema } from "@/lib/validation/linktree";

// GET /api/linktrees/[id]/edit - Get linktree with links for editing (admin only)
// Optimized: Single request instead of two separate requests
export async function GET(
  _request: NextRequest,
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
    
    // Fetch linktree and links in parallel for better performance
    const [linktree, links] = await Promise.all([
      getLinktreeById(id),
      getLinksByLinktreeId(id),
    ]);

    if (!linktree) {
      return NextResponse.json(
        { error: "Linktree not found" },
        { status: 404 }
      );
    }

    // Prepare response data with proper null handling
    const responseData = {
      linktree: {
        id: linktree.id,
        name: linktree.name || "",
        subtitle: linktree.subtitle || null,
        seo_name: linktree.seo_name || "",
        uid: linktree.uid || "",
        image: linktree.image || null,
        background_color: linktree.background_color || "#6366f1",
        template_config: linktree.template_config || null,
        expire_date: linktree.expire_date || null,
        footer_text: linktree.footer_text || null,
        footer_phone: linktree.footer_phone || null,
        footer_hidden: linktree.footer_hidden ?? false,
        created_at: linktree.created_at || new Date().toISOString(),
        updated_at: linktree.updated_at || new Date().toISOString(),
      },
      links: (links || []).map(link => {
        // Safely handle metadata - ensure it's either an object or null
        let safeMetadata: Record<string, unknown> | null = null;
        if (link.metadata && typeof link.metadata === "object" && !Array.isArray(link.metadata)) {
          try {
            // Ensure metadata is a plain object
            safeMetadata = link.metadata as Record<string, unknown>;
          } catch {
            safeMetadata = null;
          }
        }
        
        return {
          id: link.id,
          platform: link.platform || "",
          url: link.url || "",
          display_name: link.display_name || null,
          description: link.description || null,
          default_message: link.default_message || null,
          display_order: typeof link.display_order === "number" ? link.display_order : 0,
          metadata: safeMetadata,
        };
      }),
    };

    // Validate response data with Zod schema (non-blocking)
    // Wrap in try-catch to prevent crashes from validation errors
    try {
      const validationResult = editDataResponseSchema.safeParse(responseData);
      if (!validationResult.success) {
        console.error("Response data validation failed:", JSON.stringify(validationResult.error.issues, null, 2));
        // Still return data but log the validation error
        // This allows the system to work even if schema is slightly off
      }
    } catch (validationError) {
      console.error("Validation error (non-blocking):", validationError);
      // Continue execution even if validation fails
    }

    return NextResponse.json(
      { 
        data: responseData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching edit data:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch edit data";
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}

