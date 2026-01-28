import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllLinktrees, createLinktree } from "@/lib/supabase/queries";
import { getSession } from "@/lib/auth/get-session";
import { normalizeTemplateConfig } from "@/lib/templates/config";
// Template system is now fully dynamic using template_config

// Cache for 30 days (2592000 seconds)
export const revalidate = 2592000;

// GET /api/linktrees - Get all linktrees (admin only)
export async function GET() {
  try {
    // Check admin session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const linktrees = await getAllLinktrees(true); // Include analytics
    return NextResponse.json(
      { data: linktrees },
      {
        headers: {
          // Cache for 30 days with stale-while-revalidate for better performance
          'Cache-Control': 'private, s-maxage=2592000, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching linktrees:", error);
    return NextResponse.json(
      { error: "Failed to fetch linktrees" },
      { status: 500 }
    );
  }
}

// POST /api/linktrees - Create a new linktree (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      subtitle,
      slug,
      image,
      background_color,
      footer_text,
      footer_phone,
      footer_hidden,
      platforms,
      links,
      linkMetadata,
      template_key,
      templateKey,
      template_config,
    } = body;

    // Validate required fields
    if (!name || !slug || !background_color) {
      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!slug) missingFields.push("slug");
      if (!background_color) missingFields.push("background_color");
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate links
    if (!links || Object.keys(links).length === 0) {
      console.error("No links provided");
      return NextResponse.json(
        { error: "At least one link is required" },
        { status: 400 }
      );
    }

    try {
      const baseTemplateConfig =
        template_config && typeof template_config === "object" && !Array.isArray(template_config)
          ? (template_config as Record<string, unknown>)
          : null;
      const normalizedTemplateConfig = normalizeTemplateConfig(
        typeof templateKey === "string"
          ? templateKey
          : typeof template_key === "string"
            ? template_key
            : undefined,
        baseTemplateConfig
      );

      const linktree = await createLinktree({
        name,
        subtitle,
        slug,
        image,
        background_color,
        template_config: normalizedTemplateConfig,
        footer_text,
        footer_phone,
        footer_hidden: footer_hidden ?? false,
        platforms: platforms || [],
        links: links || {},
        linkMetadata: linkMetadata || undefined,
      });

      // On-demand revalidation
      revalidatePath('/api/linktrees');
      revalidatePath(`/api/linktrees/${linktree.id}`);
      revalidatePath(`/api/linktrees/uid/${linktree.uid}`);
      revalidatePath(`/api/public/linktrees/${linktree.uid}`);

      return NextResponse.json({ data: linktree }, { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    } catch (dbError) {
      console.error("Database error creating linktree:", dbError);
      
      // Extract more detailed error information
      let errorMessage = "Database error occurred";
      if (dbError instanceof Error) {
        errorMessage = dbError.message;
        // Check for common database errors
        if (dbError.message.includes('duplicate') || dbError.message.includes('unique')) {
          if (dbError.message.includes('seo_name') || dbError.message.includes('slug')) {
            errorMessage = "A linktree with this slug already exists. Please choose a different slug.";
          } else if (dbError.message.includes('uid')) {
            errorMessage = "Failed to generate unique identifier. Please try again.";
          }
        }
      }
      
      // Log full error details for debugging
      console.error("Full error details:", JSON.stringify(dbError, Object.getOwnPropertyNames(dbError)));
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? (dbError instanceof Error ? dbError.stack : String(dbError)) : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating linktree:", error);
    
    // Log full error details for debugging
    console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create linktree",
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

