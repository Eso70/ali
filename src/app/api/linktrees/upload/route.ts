import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { uploadImage, generateImageFilename, validateImageFile } from "@/lib/supabase/storage";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate image file
    const validation = validateImageFile(file, 0.5); // 500KB limit
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid image file" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = generateImageFilename(file.name);
    const path = folder ? `${folder}/${filename}` : filename;

    // Upload image
    const { url } = await uploadImage(file, path);

    return NextResponse.json({ url }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    );
  }
}

