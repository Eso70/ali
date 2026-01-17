import { z } from "zod";
import { isTemplateKey, type TemplateKey } from "@/lib/templates/config";
// Template system is now fully dynamic using template_config

// Platform validation
const PLATFORMS = [
  "whatsapp",
  "telegram",
  "viber",
  "phone",
  "email",
  "website",
  "facebook",
  "instagram",
  "twitter",
  "x",
  "youtube",
  "tiktok",
  "linkedin",
  "snapchat",
  "discord",
] as const;

// Background color validation - must match CreateLinktreeModal BACKGROUND_COLORS
const BACKGROUND_COLORS = [
  "#6366f1", // old default indigo (kept for backward compatibility)
  "#eab308", // default yellow gradient (matching logo)
  "#1e40af", // blue
  "#7c3aed", // purple
  "#166534", // green
  "#854d0e", // yellow
  "#c2410c", // orange
  "#9f1239", // pink/rose
  "#164e63", // cyan
  "#312e81", // indigo
  "#134e4a", // teal
  "#854d0e", // yellow
  "#064e3b", // emerald
  "#4c1d95", // violet
  "#701a75", // fuchsia
  // Solid colors
  "#ffffff", // pure-white
  "#000000", // pure-black
  // Black gradients
  "#0a0a0a", // black-gray
  "#0d0d0d", // black-charcoal
  "#0f0f0f", // black-midnight
  "#0c0c0c", // black-purple
  "#0b0b0b", // black-red
  "#0e0e0e", // black-green
  "#0a0a0f", // black-indigo
  "#0a0f0f", // black-teal
  "#0f0a0f", // black-violet
  "#0f0a1f", // black-fuchsia
  "#0a1f1f", // black-cyan
  "#0a0a1a", // black-slate
  "#0a0a2a", // black-zinc
  "#0a0a3a", // black-stone
  "#0a0a4a", // black-neutral
  "#0a0a5f", // black-blue
  "#0f0a0a", // black-amber
  "#0f0a1a", // black-rose
  "#0a0f0a", // black-emerald
  // White and light gradients
  "#f3f4f6", // white
  "#e5e7eb", // light-gray
  "#d1d5db", // silver
  // Grey gradients
  "#4b5563", // gray
  "#1f2937", // dark-gray
  "#111827", // charcoal
  // Additional color variations
  "#0284c7", // sky-blue
  "#65a30d", // lime
  "#d97706", // amber
  "#475569", // slate
  "#52525b", // zinc
  "#57534e", // stone
  "#525252", // neutral
  // More gradient variations
  "#0891b2", // ocean
  "#f97316", // sunset
  "#15803d", // forest
  "#a855f7", // lavender
  "#1e293b", // midnight
  // Special gradient colors
  "#ff6f61", // coral-sunset
  "#0ea5e9", // aurora
  "#14b8a6", // mint-glow
  "#9333ea", // royal-bloom
  "#f472b6", // blush-gold
  "#38bdf8", // ice-drift
] as const;

// URL validation regex patterns
const URL_PATTERNS = {
  // WhatsApp: https://wa.me/9647502471667 or https://wa.me/9647502471667?text=... (with or without +, with or without query params)
  whatsapp: /^https?:\/\/(wa\.me|api\.whatsapp\.com)\/\+?\d{10,15}(\?.*)?$/i,
  // Telegram: https://t.me/username or https://t.me/username?start=... (with or without query params)
  telegram: /^https?:\/\/(t\.me|telegram\.me)\/[\w@]+(\?.*)?$/i,
  // Viber: viber://chat?number=9647502471667 or viber://chat?number=9647502471667&text=... (with or without +, with or without additional params)
  viber: /^viber:\/\/chat\?number=\+?\d{10,15}(&.*)?$/i,
  phone: /^tel:\+?\d{10,15}$/i,
  email: /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i,
  website: /^https?:\/\/.+/i,
  // Facebook: Support all link types (profile, page, event, group, watch, marketplace, etc.) and all domains
  // Examples: /username, /pagename, /events/EVENT_ID, /groups/GROUP_ID, /watch/?v=VIDEO_ID, /marketplace, fb.com/username, m.facebook.com
  facebook: /^https?:\/\/(www\.|m\.)?(facebook\.com|fb\.com)\/.+$/i,
  // Instagram: Support all link types (profile, post, reel, story, tv, etc.) with query parameters and all domains
  // Examples: /username/, /p/POST_ID/, /reel/REEL_ID/, /stories/USERNAME/STORY_ID/, /tv/VIDEO_ID/, instagram.com, www.instagram.com
  instagram: /^https?:\/\/(www\.)?instagram\.com\/.+$/i,
  // X (Twitter): Support all link types (profile, tweet, status, hashtag, etc.) and all domains
  // Examples: /username, /username/status/TWEET_ID, /i/web/status/TWEET_ID, /hashtag/HASHTAG, twitter.com and x.com
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+$/i,
  x: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+$/i,
  // YouTube: Support all link types (channel, video, playlist, shorts, etc.) and all domains
  // Examples: /c/channelname, /@handle, /channel/CHANNEL_ID, /watch?v=VIDEO_ID, /playlist?list=ID, /shorts/VIDEO_ID, youtu.be/VIDEO_ID, m.youtube.com
  youtube: /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/i,
  // TikTok: Support all link types (video, profile, user, etc.) and all domains
  // Examples: /@username, /@username/video/VIDEO_ID, vm.tiktok.com/CODE, vt.tiktok.com/CODE, m.tiktok.com
  tiktok: /^https?:\/\/(www\.|m\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/.+$/i,
  // LinkedIn: Support all link types (profile, company, post, feed, school, group, etc.) and all domains
  // Examples: /in/username, /company/companyname, /feed/update/urn:li:activity:ID, /school/schoolname, /groups/GROUP_ID, www.linkedin.com
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
  // Snapchat: Support all link types (add, t/, p/, stories/, spotlight/, etc.) and all domains
  // Examples: /add/username, /t/CODE, /p/PROFILE_ID, /stories/USERNAME, /spotlight/SPOTLIGHT_ID, snapchat.com, www.snapchat.com
  snapchat: /^https?:\/\/(www\.)?snapchat\.com\/.+$/i,
  discord: /^https?:\/\/discord\.com\/users\/\d+$/i,
};

// Link metadata schema
export const linkMetadataSchema = z.object({
  display_name: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  default_message: z.string().max(500).optional(),
  metadata: z.union([
    z.record(z.string(), z.unknown()),
    z.null(),
    z.undefined(),
  ]).optional(),
});

// Single link schema
export const linkSchema = z.object({
  platform: z.enum(PLATFORMS),
  url: z.string().min(1).max(2048),
  display_order: z.number().int().min(0),
  display_name: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  default_message: z.string().max(500).optional().nullable(),
  metadata: z.union([
    z.record(z.string(), z.unknown()),
    z.null(),
    z.undefined(),
  ]).optional().nullable(),
});

const templateKeySchema = z.string().refine((value): value is TemplateKey => isTemplateKey(value), {
  message: "Invalid template selection",
});

// Linktree base schema
const linktreeBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
  subtitle: z
    .string()
    .max(200, "Subtitle must be 200 characters or less")
    .optional()
    .nullable(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .trim(),
  image: z
    .union([
      z.string(),
      z.null(),
      z.undefined(),
    ])
    .refine(
      (val) => {
        if (!val || val === null || val === undefined) return true;
        // Accept various URL formats
        return (
          val.startsWith("http://") ||
          val.startsWith("https://") ||
          val.startsWith("/") ||
          val.startsWith("data:image/") ||
          val.includes("supabase.co/storage")
        );
      },
      {
        message: "Image must be a valid URL, relative path, data URL, or Supabase storage URL",
      }
    )
    .optional()
    .nullable(),
  background_color: z.enum(BACKGROUND_COLORS),
  expire_date: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .refine(
      (date) => !date || new Date(date) > new Date(),
      "Expire date must be in the future"
    ),
  footer_text: z.string().max(200).optional().nullable(),
  footer_phone: z
    .string()
    .max(20)
    .regex(/^\+?\d{10,15}$/, "Phone must be a valid phone number")
    .optional()
    .nullable(),
  footer_hidden: z.boolean().optional().default(false),
  template_config: z.record(z.string(), z.unknown()).optional().nullable(),
});

// Create linktree schema
export const createLinktreeSchema = linktreeBaseSchema.extend({
  platforms: z
    .array(z.enum(PLATFORMS))
    .min(1, "At least one platform is required"),
  links: z
    .record(z.string().min(1), z.array(z.string().url().min(1).max(2048)))
    .refine((links) => Object.keys(links).length > 0, {
      message: "At least one link is required",
    }),
  linkMetadata: z
    .record(
      z.string(),
      z.array(linkMetadataSchema)
    )
    .optional(),
});

// Update linktree schema (all fields optional except validation)
// Note: expire_date validation is relaxed for updates - we allow past dates to update expired linktrees
export const updateLinktreeSchema = linktreeBaseSchema.partial().extend({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim()
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .trim()
    .optional(),
  background_color: z.enum(BACKGROUND_COLORS).optional(),
  template_key: templateKeySchema.optional(),
  // For updates, allow past dates (expired linktrees can be updated)
  expire_date: z
    .string()
    .datetime()
    .optional()
    .nullable(),
});

// Batch links update schema
export const batchLinksUpdateSchema = z.object({
  deleteIds: z.array(z.string().uuid()).default([]),
  createLinks: z.array(
    linkSchema.extend({
      linktree_id: z.string().uuid(),
    })
  ).default([]),
});

// Edit data response schema (lenient for reading data)
export const editDataResponseSchema = z.object({
  linktree: z.object({
    id: z.string().min(1), // Allow non-UUID strings for flexibility
    name: z.string().min(1),
    subtitle: z.string().nullable().optional(),
    seo_name: z.string().min(1),
    uid: z.string().min(1),
    image: z.string().nullable().optional(),
    background_color: z.string().min(1),
    expire_date: z.string().nullable().optional(),
    footer_text: z.string().nullable().optional(),
    footer_phone: z.string().nullable().optional(),
    template_config: z.record(z.string(), z.unknown()).nullable().optional(),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  }),
  links: z.array(
    z.object({
      id: z.string().min(1), // Allow non-UUID strings for flexibility
      platform: z.string().min(1),
      url: z.string().min(1),
      display_name: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      default_message: z.string().nullable().optional(),
      display_order: z.number().int().min(0),
      metadata: z.union([
        z.record(z.string(), z.unknown()),
        z.null(),
        z.undefined(),
      ]).optional(),
    })
  ),
});

// URL validation helper
export function validatePlatformUrl(platform: string, url: string): boolean {
  // Validate inputs
  if (!platform || typeof platform !== "string" || platform.trim().length === 0) {
    return false;
  }
  
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return false;
  }
  
  const pattern = URL_PATTERNS[platform as keyof typeof URL_PATTERNS];
  if (!pattern) {
    return true; // Unknown platform, allow any URL format
  }
  return pattern.test(url);
}

// Sanitize string input
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters
}

// Sanitize slug
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphen
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

// Type exports
export type CreateLinktreeInput = z.infer<typeof createLinktreeSchema>;
export type UpdateLinktreeInput = z.infer<typeof updateLinktreeSchema>;
export type BatchLinksUpdateInput = z.infer<typeof batchLinksUpdateSchema>;
export type EditDataResponse = z.infer<typeof editDataResponseSchema>;
export type LinkMetadata = z.infer<typeof linkMetadataSchema>;
export type Link = z.infer<typeof linkSchema>;

