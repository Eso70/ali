import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public", "images", "upload");

/**
 * Serve uploaded images from the file system
 * This is needed because Next.js in production doesn't serve files
 * added to public/ after build time
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const imagePath = pathArray.join("/");
    
    // Security: Prevent directory traversal attacks
    if (imagePath.includes("..") || imagePath.includes("~") || imagePath.startsWith("/")) {
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 }
      );
    }

    // Construct full file path
    const filePath = join(UPLOAD_DIR, imagePath);

    // Verify file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Verify file is within the upload directory (prevent directory traversal)
    const normalizedFilePath = filePath.replace(/\\/g, "/");
    const normalizedUploadDir = UPLOAD_DIR.replace(/\\/g, "/");
    if (!normalizedFilePath.startsWith(normalizedUploadDir)) {
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Determine content type from file extension
    const extension = imagePath.split(".").pop()?.toLowerCase();
    const contentType = getContentType(extension || "");

    // Return image with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}

/**
 * Get MIME type from file extension
 */
function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    bmp: "image/bmp",
  };

  return contentTypes[extension] || "application/octet-stream";
}
