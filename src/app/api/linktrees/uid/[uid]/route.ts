import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getLinktreeByUid,
  updateLinktree,
} from "@/lib/supabase/queries";
import { getSession } from "@/lib/auth/get-session";
import { updateLinktreeSchema, sanitizeString, sanitizeSlug } from "@/lib/validation/linktree";
import { normalizeTemplateConfig } from "@/lib/templates/config";
// Template system is now fully dynamic using template_config

// Cache for 30 days (2592000 seconds)
export const revalidate = 2592000;

// GET /api/linktrees/uid/[uid] - Get linktree by UID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
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

    const { uid } = await params;
    
    const linktree = await getLinktreeByUid(uid);

    if (!linktree) {
      return NextResponse.json(
        { error: "Linktree not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: linktree }, {
      headers: {
        // Cache for 30 days with stale-while-revalidate
        'Cache-Control': 'private, s-maxage=2592000, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error("Error fetching linktree:", error);
    return NextResponse.json(
      { error: "Failed to fetch linktree" },
      { status: 500 }
    );
  }
}

// PATCH /api/linktrees/uid/[uid] - Update linktree by UID (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
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

    const { uid } = await params;
    
    // Verify linktree exists
    const existingLinktree = await getLinktreeByUid(uid);
    if (!existingLinktree) {
      return NextResponse.json(
        { error: "Linktree not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    if (body.name) body.name = sanitizeString(body.name);
    if (body.subtitle) body.subtitle = sanitizeString(body.subtitle);
    if (body.slug) body.slug = sanitizeSlug(body.slug);
    if (body.footer_text) body.footer_text = sanitizeString(body.footer_text);
    if (body.footer_phone) body.footer_phone = sanitizeString(body.footer_phone);

    // Validate with Zod schema
    const validationResult = updateLinktreeSchema.safeParse(body);
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

    const validatedData = validationResult.data;

    // Only include fields that are actually provided (not undefined)
    const updateData: {
      name?: string;
      subtitle?: string;
      slug?: string;
      image?: string | null;
      background_color?: string;
      template_config?: Record<string, unknown> | null;
      footer_text?: string;
      footer_phone?: string;
    } = {};

    // Only add fields that are explicitly provided in the request
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.subtitle !== undefined) updateData.subtitle = validatedData.subtitle ?? undefined;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.background_color !== undefined) updateData.background_color = validatedData.background_color;
    const rawTemplateConfig = validatedData.template_config;
    const rawTemplateKey = validatedData.template_key;
    if (rawTemplateConfig !== undefined || rawTemplateKey !== undefined) {
      const baseTemplateConfig =
        rawTemplateConfig && typeof rawTemplateConfig === "object" && !Array.isArray(rawTemplateConfig)
          ? (rawTemplateConfig as Record<string, unknown>)
          : null;
      updateData.template_config = normalizeTemplateConfig(
        typeof rawTemplateKey === "string" ? rawTemplateKey : undefined,
        baseTemplateConfig
      );
    }
    if (validatedData.footer_text !== undefined) updateData.footer_text = validatedData.footer_text ?? undefined;
    if (validatedData.footer_phone !== undefined) updateData.footer_phone = validatedData.footer_phone ?? undefined;

    // Update linktree using the ID from the existing linktree
    const updatedLinktree = await updateLinktree(existingLinktree.id, updateData);
    
    // On-demand revalidation
    revalidatePath('/api/linktrees');
    revalidatePath(`/api/linktrees/${existingLinktree.id}`);
    revalidatePath(`/api/linktrees/uid/${uid}`);
    revalidatePath(`/api/public/linktrees/${uid}`);
    revalidatePath(`/api/linktrees/${existingLinktree.id}/links`);
    revalidatePath(`/api/linktrees/${existingLinktree.id}/analytics`);
    
    return NextResponse.json({ 
      data: updatedLinktree,
      message: "Linktree updated successfully",
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Error updating linktree:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update linktree" },
      { status: 500 }
    );
  }
}
