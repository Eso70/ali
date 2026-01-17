/**
 * Local File System Storage
 * Images are stored in public/images/upload/ directory
 * Next.js serves files from the public directory automatically
 */

import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public", "images", "upload");

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Upload an image to local file system
 * @param file - File object or Blob
 * @param path - Storage path (e.g., "linktrees/filename.jpg")
 * @returns Public URL path of the uploaded image
 */
export async function uploadImage(
  file: File | Blob,
  path: string
): Promise<{ url: string; path: string }> {
  await ensureUploadDir();

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create full file path
  const filePath = join(UPLOAD_DIR, path);
  const fileDir = join(filePath, "..");
  
  // Ensure directory exists
  if (!existsSync(fileDir)) {
    await mkdir(fileDir, { recursive: true });
  }

  // Write file to disk
  await writeFile(filePath, buffer);

  // Return public URL path (Next.js serves from /public)
  const publicPath = `/images/upload/${path}`;

  return {
    url: publicPath,
    path: publicPath,
  };
}

/**
 * Delete an image from local file system
 * @param path - Storage path to delete (e.g., "linktrees/filename.jpg")
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    // Remove /images/upload/ prefix if present
    const cleanPath = path.replace(/^\/images\/upload\//, "");
    const filePath = join(UPLOAD_DIR, cleanPath);
    
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get public URL for an image
 * @param path - Storage path (can be full path or relative)
 * @returns Public URL path
 */
export function getImageUrl(path: string): string {
  // If path already starts with /images/upload/, return as is
  if (path.startsWith("/images/upload/")) {
    return path;
  }
  
  // If path starts with /, assume it's already a public path
  if (path.startsWith("/")) {
    return path;
  }
  
  // Otherwise, prepend /images/upload/
  return `/images/upload/${path}`;
}

/**
 * Generate a unique filename for upload
 * @param originalFilename - Original filename
 * @param linktreeId - Linktree ID (optional)
 * @returns Unique filename with timestamp
 */
export function generateImageFilename(
  originalFilename: string,
  linktreeId?: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalFilename.split(".").pop() || "jpg";
  const baseName = originalFilename.split(".").slice(0, -1).join(".") || "image";
  const sanitizedBaseName = baseName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  
  const filename = `${sanitizedBaseName}-${timestamp}-${random}.${extension}`;
  
  if (linktreeId) {
    return `linktrees/${linktreeId}/${filename}`;
  }
  
  return filename;
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
}
