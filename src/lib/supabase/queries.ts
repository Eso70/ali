import { query, transaction } from "@/lib/database/client";
import { deleteImage } from "@/lib/supabase/storage";
// Template system is now fully dynamic using template_config

// Retry utility with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if it's a timeout or connection error
      const isTimeoutError = 
        error instanceof Error && (
          error.message.includes('timeout') ||
          error.message.includes('TIMEOUT') ||
          error.message.includes('Connect Timeout') ||
          error.message.includes('fetch failed')
        );
      
      // Only retry on timeout/connection errors
      if (isTimeoutError && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not a timeout error or max retries reached, throw
      throw error;
    }
  }
  
  throw lastError;
}

// Custom alphabet for UID: only lowercase letters, numbers, and hyphens (matches database constraint)
const uidAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";

// Simple UID generator using crypto API
const generateUid = (length: number = 21): string => {
  let result = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += uidAlphabet[randomValues[i] % uidAlphabet.length];
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      result += uidAlphabet[Math.floor(Math.random() * uidAlphabet.length)];
    }
  }
  return result;
};

// ============================================
// TYPES
// ============================================

/**
 * Get default message for messaging platforms
 */
function getDefaultMessageForPlatform(
  platform: string,
  customMessage?: string
): string | null {
  // If custom message provided, use it
  if (customMessage) {
    return customMessage;
  }

  // Default message for messaging platforms
  const messagingPlatforms = ["whatsapp", "telegram", "viber"];
  if (messagingPlatforms.includes(platform)) {
    return "";
  }

  return null;
}

export interface Linktree {
  id: string;
  name: string;
  subtitle?: string;
  seo_name: string;
  uid: string;
  image?: string;
  background_color: string;
  template_config?: Record<string, unknown> | null;
  footer_text?: string;
  footer_phone?: string;
  footer_hidden?: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
  analytics?: {
    unique_views: number;
    unique_clicks: number;
  };
}

export interface Link {
  id: string;
  linktree_id: string;
  platform: string;
  url: string;
  display_name?: string | null;
  description?: string | null;
  default_message?: string | null;
  display_order: number;
  click_count: number;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface LinkMetadata {
  display_name?: string;
  default_message?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateLinktreeData {
  name: string;
  subtitle?: string;
  slug: string;
  image?: string | null;
  background_color: string;
  template_config?: Record<string, unknown> | null;
  footer_text?: string;
  footer_phone?: string;
  footer_hidden?: boolean;
  platforms: string[];
  links: Record<string, string[]>; // platform -> urls[]
  linkMetadata?: Record<string, LinkMetadata[]>; // platform -> metadata[] (optional, parallel to links)
}

export interface UpdateLinktreeData {
  name?: string;
  subtitle?: string;
  slug?: string;
  image?: string | null;
  background_color?: string;
  template_config?: Record<string, unknown> | null;
  footer_text?: string;
  footer_phone?: string;
  footer_hidden?: boolean;
}

// ============================================
// LINKTREE QUERIES
// ============================================

/**
 * Get all linktrees (admin only)
 * When includeAnalytics is true, fetches analytics directly from page_views and link_clicks tables
 * Never uses denormalized total_views/total_clicks from linktrees table
 */
export async function getAllLinktrees(_includeAnalytics = false): Promise<Linktree[]> {
  const result = await query<Linktree>(
    `SELECT id, name, subtitle, seo_name, uid, image, background_color, template_config,
     footer_text, footer_phone, footer_hidden, status, created_at, updated_at
     FROM linktrees
     ORDER BY created_at DESC`
  );

  return result.rows || [];
}

/**
 * Get linktree by ID (admin only)
 * Note: total_views and total_clicks are set to 0 - use analytics queries for accurate data
 */
export async function getLinktreeById(id: string): Promise<Linktree | null> {
  const result = await query<Linktree>(
    `SELECT id, name, subtitle, seo_name, uid, image, background_color, template_config,
     footer_text, footer_phone, footer_hidden, status, created_at, updated_at
     FROM linktrees
     WHERE id = $1`,
    [id]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Get linktree by UID (public)
 * Note: total_views and total_clicks are set to 0 - use analytics queries for accurate data
 */
export async function getLinktreeByUid(uid: string): Promise<Linktree | null> {
  const result = await query<Linktree>(
    `SELECT id, name, subtitle, seo_name, uid, image, background_color, template_config,
     footer_text, footer_phone, footer_hidden, status, created_at, updated_at
     FROM linktrees
     WHERE uid = $1`,
    [uid]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const linktree = result.rows[0];

  return linktree;
}

/**
 * Get linktree by SEO name (public)
 * Note: total_views and total_clicks are set to 0 - use analytics queries for accurate data
 */
export async function getLinktreeBySeoName(seoName: string): Promise<Linktree | null> {
  const result = await query<Linktree>(
    `SELECT id, name, subtitle, seo_name, uid, image, background_color, template_config, created_at, updated_at
     FROM linktrees
     WHERE seo_name = $1`,
    [seoName]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const linktree = result.rows[0];

  return linktree;
}

/**
 * Create a new linktree
 */
export async function createLinktree(data: CreateLinktreeData): Promise<Linktree> {
  // Generate unique UID using custom alphabet (lowercase only, matches database constraint)
  // Check if UID already exists, regenerate if needed
  let uid: string | undefined;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    uid = generateUid(); // Generate 21-character lowercase ID (e.g., "alsdkhfi234509")
    const existingResult = await query<{ id: string }>(
      "SELECT id FROM linktrees WHERE uid = $1",
      [uid]
    );
    
    if (!existingResult.rows || existingResult.rows.length === 0) {
      break; // UID is unique
    }
    
    attempts++;
    uid = undefined; // Reset for next iteration
  }
  
  if (!uid || attempts >= maxAttempts) {
    throw new Error("Failed to generate unique identifier after multiple attempts");
  }

  const status = 'Active';

  // Use transaction for atomicity
  return await transaction(async (client) => {
    // Insert linktree
    const linktreeResult = await client.query<Linktree>(
      `INSERT INTO linktrees (
        name, subtitle, seo_name, uid, image, background_color, template_config,
        footer_text, footer_phone, footer_hidden, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, subtitle, seo_name, uid, image, background_color,
                template_config, footer_text, footer_phone, status, created_at, updated_at`,
      [
        data.name,
        data.subtitle || "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە",
        data.slug,
        uid,
        data.image || null,
        data.background_color,
        JSON.stringify(data.template_config || {}),
        data.footer_text || null,
        data.footer_phone || null,
        data.footer_hidden ?? false,
        status,
      ]
    );

    if (!linktreeResult.rows || linktreeResult.rows.length === 0) {
      throw new Error("Failed to create linktree");
    }

    const linktree = linktreeResult.rows[0];

    // Handle error codes
    try {
      // Create links
      if (data.links && Object.keys(data.links).length > 0) {
        const linksToInsert: Array<{
          linktree_id: string;
          platform: string;
          url: string;
          display_name?: string | null;
          description?: string | null;
          default_message?: string | null;
          metadata?: Record<string, unknown>;
          display_order: number;
          click_count?: number;
        }> = [];

        let displayOrder = 0;
        for (const [platform, urls] of Object.entries(data.links)) {
          if (!Array.isArray(urls) || urls.length === 0) {
            continue;
          }
          
          const metadataArray = data.linkMetadata?.[platform] || [];
          
          urls.forEach((url, index) => {
            if (!url || typeof url !== 'string' || url.trim().length === 0) {
              return;
            }
            
            const metadata = metadataArray[index] || {};
            const defaultMessage = getDefaultMessageForPlatform(platform, metadata.default_message);
            
            linksToInsert.push({
              linktree_id: linktree.id,
              platform: platform,
              url: url.trim(),
              display_name: metadata.display_name || null,
              default_message: defaultMessage,
              metadata: metadata.metadata || {},
              display_order: displayOrder++,
              click_count: 0,
            });
          });
        }

        if (linksToInsert.length > 0) {
          // Bulk insert links
          for (const link of linksToInsert) {
            await client.query(
              `INSERT INTO links (
                linktree_id, platform, url, display_name, description, default_message,
                display_order, click_count, metadata
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                link.linktree_id,
                link.platform,
                link.url,
                link.display_name,
                link.description || null,
                link.default_message,
                link.display_order,
                link.click_count || 0,
                JSON.stringify(link.metadata || {}),
              ]
            );
          }
        } else {
          // Rollback if no valid links
          throw new Error("No valid links provided - all links were empty");
        }
      } else {
        // Rollback if no links provided
        throw new Error("No links provided");
      }
    } catch (error: unknown) {
      // Transaction will rollback automatically
      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.message.includes('23505')) { // Unique constraint violation
          if (error.message.includes('seo_name')) {
            throw new Error(`A linktree with slug "${data.slug}" already exists. Please choose a different slug.`);
          } else if (error.message.includes('uid')) {
            throw new Error("Failed to generate unique identifier. Please try again.");
          }
        } else if (error.message.includes('23514')) { // Check constraint violation
          throw new Error(`Validation error: ${error.message}`);
        }
      }
      throw error;
    }

    // Parse JSON fields
    if (typeof linktree.template_config === 'string') {
      linktree.template_config = JSON.parse(linktree.template_config);
    }

    return linktree;
  });
}

/**
 * Update a linktree
 */
export async function updateLinktree(
  id: string,
  data: UpdateLinktreeData
): Promise<Linktree> {
  // If updating image (including setting to null), get the old image path first to delete it later
  let oldImagePath: string | null = null;
  if (data.image !== undefined) {
    const existingResult = await query<{ image: string | null }>(
      "SELECT image FROM linktrees WHERE id = $1",
      [id]
    );
    if (existingResult.rows.length > 0) {
      oldImagePath = existingResult.rows[0]?.image || null;
    }
  }

  // Build UPDATE query dynamically
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updateFields.push(`name = $${paramIndex++}::varchar`);
    updateValues.push(data.name);
  }
  if (data.subtitle !== undefined) {
    updateFields.push(`subtitle = $${paramIndex++}::text`);
    updateValues.push(data.subtitle || "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە");
  }
  if (data.slug !== undefined) {
    updateFields.push(`seo_name = $${paramIndex++}::varchar`);
    updateValues.push(data.slug);
  }
  if (data.image !== undefined) {
    updateFields.push(`image = $${paramIndex++}::text`);
    updateValues.push(data.image ?? null);
  }
  if (data.background_color !== undefined) {
    updateFields.push(`background_color = $${paramIndex++}::varchar`);
    updateValues.push(data.background_color);
  }
  if (data.template_config !== undefined) {
    updateFields.push(`template_config = $${paramIndex++}::jsonb`);
    updateValues.push(JSON.stringify(data.template_config || {}));
  }
  if (data.footer_text !== undefined) {
    updateFields.push(`footer_text = $${paramIndex++}::text`);
    updateValues.push(data.footer_text ?? null);
  }
  if (data.footer_phone !== undefined) {
    updateFields.push(`footer_phone = $${paramIndex++}::text`);
    updateValues.push(data.footer_phone ?? null);
  }
  if (data.footer_hidden !== undefined) {
    updateFields.push(`footer_hidden = $${paramIndex++}::boolean`);
    updateValues.push(data.footer_hidden);
  }

  if (updateFields.length === 0) {
    // No fields to update, just return existing
    const existing = await getLinktreeById(id);
    if (!existing) {
      throw new Error("Linktree not found");
    }
    return existing;
  }

  // Add updated_at timestamp
  updateFields.push(`updated_at = NOW()`);
  
  // Add WHERE clause parameter
  updateValues.push(id);

  const result = await query<Linktree>(
    `UPDATE linktrees
     SET ${updateFields.join(', ')}
     WHERE id = $${paramIndex}::uuid
     RETURNING id, name, subtitle, seo_name, uid, image, background_color,
               template_config, footer_text, footer_phone, footer_hidden,
               status, created_at, updated_at`,
    updateValues
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error("Failed to update linktree");
  }

  const linktree = result.rows[0];
  
  // Images are never deleted to prevent broken image links
  // Old images are kept in storage even when new images are uploaded
  // This ensures images are never broken or removed
  
  // Parse JSON fields
  if (typeof linktree.template_config === 'string') {
    linktree.template_config = JSON.parse(linktree.template_config);
  }

  return linktree;
}

/**
 * Delete a linktree (cascades to links)
 * Images are preserved in storage to prevent broken image links
 */
export async function deleteLinktree(id: string): Promise<void> {
  // Verify linktree exists before deletion
  const linktreeResult = await query<{ id: string }>(
    "SELECT id FROM linktrees WHERE id = $1",
    [id]
  );

  if (linktreeResult.rows.length === 0) {
    throw new Error("Linktree not found");
  }

  // Images are never deleted to prevent broken image links
  // Images remain in storage even when linktrees are deleted
  // This ensures images are never broken or removed

  // Delete the linktree from database (cascades to links)
  const result = await query(
    "DELETE FROM linktrees WHERE id = $1",
    [id]
  );

  // Check if any row was deleted
  if (result.rowCount === 0) {
    throw new Error("Linktree not found");
  }
}


// ============================================
// LINK QUERIES
// ============================================

/**
 * Get all links for a linktree
 */
export async function getLinksByLinktreeId(linktreeId: string): Promise<Link[]> {
  return retryWithBackoff(async () => {
    const result = await query<Link>(
      `SELECT id, linktree_id, platform, url, display_name, description, default_message, 
       display_order, click_count, metadata, created_at, updated_at
       FROM links
       WHERE linktree_id = $1
       ORDER BY display_order ASC`,
      [linktreeId]
    );

    return result.rows || [];
  });
}


/**
 * Get linktree with links in a single optimized query (public)
 * This combines getLinktreeByUid + getLinksByLinktreeUid into one database call
 * Note: total_views and total_clicks are set to 0 - use analytics queries for accurate data
 */
/**
 * Get linktree ID by UID (optimized - only fetches ID)
 * Used for view tracking where we only need the ID
 */
// Cache for UID to ID mapping (reduces database queries)
const uidToIdCache = new Map<string, { id: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours cache (increased from 1 hour - UID to ID mapping rarely changes)

export async function getLinktreeIdByUid(uid: string): Promise<string | null> {
  // Check cache first
  const cached = uidToIdCache.get(uid);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.id;
  }

  const result = await query<{ id: string }>(
    "SELECT id FROM linktrees WHERE uid = $1",
    [uid]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  // Cache the result
  uidToIdCache.set(uid, { id: row.id, timestamp: Date.now() });

  // Limit cache size (keep last 1000 entries)
  if (uidToIdCache.size > 1000) {
    const firstKey = uidToIdCache.keys().next().value;
    if (firstKey) {
      uidToIdCache.delete(firstKey);
    }
  }

  return row.id;
}

export async function getLinktreeWithLinksByUid(uid: string): Promise<{ linktree: Linktree | null; links: Link[] }> {
  // Get linktree
  const linktreeResult = await query<Linktree>(
    `SELECT id, name, subtitle, seo_name, uid, image, background_color, template_config,
     footer_text, footer_phone, footer_hidden, status, created_at, updated_at
     FROM linktrees
     WHERE uid = $1`,
    [uid]
  );

  if (!linktreeResult.rows || linktreeResult.rows.length === 0) {
    return { linktree: null, links: [] };
  }

  const linktree = linktreeResult.rows[0];

  // Get links
  const linksResult = await query<Link>(
    `SELECT id, linktree_id, platform, url, display_name, description, default_message,
     display_order, click_count, metadata, created_at, updated_at
     FROM links
     WHERE linktree_id = $1
     ORDER BY display_order ASC`,
    [linktree.id]
  );

  const links = linksResult.rows || [];

  // Parse JSON fields
  if (typeof linktree.template_config === 'string') {
    linktree.template_config = JSON.parse(linktree.template_config);
  }

  links.forEach(link => {
    if (typeof link.metadata === 'string') {
      link.metadata = JSON.parse(link.metadata);
    }
  });

  return {
    linktree,
    links,
  };
}

/**
 * Create a new link
 */
export async function createLink(
  linktreeId: string,
  platform: string,
  url: string,
  displayOrder?: number,
  displayName?: string | null,
  description?: string | null,
  defaultMessage?: string | null,
  metadata?: Record<string, unknown> | null
): Promise<Link> {
  // Get next display order if not provided
  let order = displayOrder;
  if (order === undefined) {
    const maxOrderResult = await query<{ get_next_display_order: number }>(
      "SELECT get_next_display_order($1) as get_next_display_order",
      [linktreeId]
    );
    order = maxOrderResult.rows[0]?.get_next_display_order || 0;
  }

  // Get default message for messaging platforms if not provided
  const messagingPlatforms = ["whatsapp", "telegram", "viber"];
  const finalDefaultMessage = defaultMessage || (messagingPlatforms.includes(platform) ? "" : null);

  const result = await query<Link>(
    `INSERT INTO links (linktree_id, platform, url, display_name, description, default_message, display_order, click_count, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
     RETURNING id, linktree_id, platform, url, display_name, description, default_message, display_order, click_count, metadata, created_at, updated_at`,
    [
      linktreeId,
      platform,
      url,
      displayName || null,
      description || null,
      finalDefaultMessage,
      order,
      0,
      JSON.stringify(metadata || {}),
    ]
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error("Failed to create link");
  }

  const link = result.rows[0];
  
  // Parse JSON fields
  if (typeof link.metadata === 'string') {
    link.metadata = JSON.parse(link.metadata);
  }

  return link;
}

/**
 * Update a link
 */
export async function updateLink(
  id: string,
  data: {
    platform?: string;
    url?: string;
    display_name?: string | null;
    description?: string | null;
    default_message?: string | null;
    display_order?: number;
    metadata?: Record<string, unknown> | null;
  }
): Promise<Link> {
  // Build UPDATE query dynamically
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];
  let paramIndex = 1;

  if (data.platform !== undefined) {
    updateFields.push(`platform = $${paramIndex++}`);
    updateValues.push(data.platform);
  }
  if (data.url !== undefined) {
    updateFields.push(`url = $${paramIndex++}`);
    updateValues.push(data.url);
  }
  if (data.display_name !== undefined) {
    updateFields.push(`display_name = $${paramIndex++}`);
    updateValues.push(data.display_name);
  }
  if (data.description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`);
    updateValues.push(data.description);
  }
  if (data.default_message !== undefined) {
    updateFields.push(`default_message = $${paramIndex++}`);
    updateValues.push(data.default_message);
  }
  if (data.display_order !== undefined) {
    updateFields.push(`display_order = $${paramIndex++}`);
    updateValues.push(data.display_order);
  }
  if (data.metadata !== undefined) {
    updateFields.push(`metadata = $${paramIndex++}::jsonb`);
    updateValues.push(JSON.stringify(data.metadata || {}));
  }

  if (updateFields.length === 0) {
    // No fields to update, just return existing
    const existingResult = await query<Link>(
      `SELECT id, linktree_id, platform, url, display_name, description, default_message,
       display_order, click_count, metadata, created_at, updated_at
       FROM links WHERE id = $1`,
      [id]
    );
    if (!existingResult.rows || existingResult.rows.length === 0) {
      throw new Error("Link not found");
    }
    const link = existingResult.rows[0];
    if (typeof link.metadata === 'string') {
      link.metadata = JSON.parse(link.metadata);
    }
    return link;
  }

  // Add updated_at timestamp
  updateFields.push(`updated_at = NOW()`);
  
  // Add WHERE clause parameter
  updateValues.push(id);
  paramIndex++;

  const result = await query<Link>(
    `UPDATE links 
     SET ${updateFields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, linktree_id, platform, url, display_name, description, default_message,
               display_order, click_count, metadata, created_at, updated_at`,
    updateValues
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error("Failed to update link");
  }

  const link = result.rows[0];
  
  // Parse JSON fields
  if (typeof link.metadata === 'string') {
    link.metadata = JSON.parse(link.metadata);
  }

  return link;
}

/**
 * Delete a link
 */
export async function deleteLink(id: string): Promise<void> {
  const result = await query(
    "DELETE FROM links WHERE id = $1",
    [id]
  );

  // Check if any row was deleted
  if (result.rowCount === 0) {
    throw new Error("Link not found");
  }
}

/**
 * Batch delete links by IDs (optimized for performance)
 */
export async function batchDeleteLinks(linkIds: string[]): Promise<void> {
  if (linkIds.length === 0) return;
  
  // Validate and filter out invalid UUIDs to prevent PostgreSQL errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validLinkIds = linkIds.filter(id => id && uuidRegex.test(id));
  
  if (validLinkIds.length === 0) return;
  
  // Use PostgreSQL array parameter
  const result = await query(
    "DELETE FROM links WHERE id = ANY($1::uuid[])",
    [validLinkIds]
  );

  if (result.rowCount === 0) {
    throw new Error("No links found to delete");
  }
}

/**
 * Delete all links for a linktree (safety function to prevent duplicates)
 */
export async function deleteAllLinksForLinktree(linktreeId: string): Promise<void> {
  // Validate UUID format to prevent PostgreSQL errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!linktreeId || !uuidRegex.test(linktreeId)) {
    throw new Error("Invalid linktree ID format");
  }
  
  await query(
    "DELETE FROM links WHERE linktree_id = $1",
    [linktreeId]
  );
}

/**
 * Batch create links (optimized for performance)
 */
export async function batchCreateLinks(
  links: Array<{
    linktree_id: string;
    platform: string;
    url: string;
    display_order: number;
    display_name?: string | null;
    description?: string | null;
    default_message?: string | null;
    metadata?: Record<string, unknown>;
  }>
): Promise<Link[]> {
  if (links.length === 0) return [];
  
  // Get default messages for messaging platforms
  const messagingPlatforms = ["whatsapp", "telegram", "viber"];
  const linksToInsert = links.map(link => ({
    ...link,
    default_message: link.default_message || (messagingPlatforms.includes(link.platform) ? "" : null),
    metadata: link.metadata || {},
  }));

  // Bulk insert using VALUES clause
  const values: unknown[] = [];
  const placeholders: string[] = [];
  let paramIndex = 1;

  for (const link of linksToInsert) {
    placeholders.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}::jsonb)`
    );
    values.push(
      link.linktree_id,
      link.platform,
      link.url,
      link.display_name || null,
      link.description || null,
      link.default_message || null,
      link.display_order,
      0, // click_count
      JSON.stringify(link.metadata || {})
    );
  }

  const result = await query<Link>(
    `INSERT INTO links (linktree_id, platform, url, display_name, description, default_message, display_order, click_count, metadata)
     VALUES ${placeholders.join(', ')}
     RETURNING id, linktree_id, platform, url, display_name, description, default_message, display_order, click_count, metadata, created_at, updated_at`,
    values
  );

  // Parse JSON fields
  result.rows.forEach(link => {
    if (typeof link.metadata === 'string') {
      link.metadata = JSON.parse(link.metadata);
    }
  });

  return result.rows || [];
}

/**
 * Reorder links (for drag and drop)
 */
export async function reorderLinks(
  linktreeId: string,
  linkIds: string[]
): Promise<void> {
  // Call PostgreSQL function
  await query(
    "SELECT reorder_links($1, $2::uuid[])",
    [linktreeId, linkIds]
  );
}

/**
 * Increment click count for a link
 */

// ============================================
// ANALYTICS QUERIES
// ============================================

export interface PageView {
  id: string;
  linktree_id: string;
  ip_address: string;
  viewed_at: string;
  session_id?: string;
}

export interface LinkClick {
  id: string;
  link_id: string;
  linktree_id: string;
  ip_address: string;
  clicked_at: string;
  session_id?: string;
  platform?: string;
  display_name?: string;
}

export interface AnalyticsSummary {
  unique_views: number;
  unique_clicks: number;
  views_by_device: Record<string, number>;
  clicks_by_device: Record<string, number>;
  clicks_by_platform: Record<string, number>;
  views_by_referer: Record<string, number>;
  clicks_by_referer: Record<string, number>;
  views_by_os: Record<string, number>;
  clicks_by_os: Record<string, number>;
  top_clicked_links: Array<{
    link_id: string;
    platform: string;
    display_name?: string;
    click_count: number;
    recent_clicks?: Array<{
      ip_address: string;
      city?: string;
      clicked_at: string;
    }>;
  }>;
  recent_views: Array<{
    ip_address: string;
    viewed_at: string;
  }>;
  recent_clicks: Array<{
    ip_address: string;
    platform?: string;
    clicked_at: string;
  }>;
}

/**
 * Get analytics data for a linktree
 */
export async function getLinktreeAnalytics(linktreeId: string): Promise<AnalyticsSummary> {
  // Execute all independent queries in parallel for better performance
  // These queries don't depend on each other, so they can run simultaneously
  const [
    analyticsStatsResult,
    breakdownsResult,
    pageViewsResult,
    linkClicksResult,
    linksResult,
  ] = await Promise.all([
    query<{ unique_views: number; unique_clicks: number }>(
      "SELECT * FROM get_linktree_analytics_optimized($1)",
      [linktreeId]
    ),
    query<{
      views_by_device: Record<string, number>;
      clicks_by_device: Record<string, number>;
      clicks_by_platform: Record<string, number>;
      views_by_referer: Record<string, number>;
      clicks_by_referer: Record<string, number>;
      views_by_os: Record<string, number>;
      clicks_by_os: Record<string, number>;
    }>(
      "SELECT * FROM get_linktree_breakdowns_optimized($1)",
      [linktreeId]
    ),
    query<PageView>(
      `SELECT id, ip_address, viewed_at, session_id
       FROM page_views
       WHERE linktree_id = $1
       ORDER BY viewed_at DESC`,
      [linktreeId]
    ),
    query<LinkClick & { platform: string; display_name?: string }>(
      `SELECT 
        lc.id,
        lc.link_id,
        lc.linktree_id,
        lc.ip_address,
        lc.clicked_at,
        lc.session_id,
        l.platform,
        l.display_name
       FROM link_clicks lc
       INNER JOIN links l ON lc.link_id = l.id
       WHERE lc.linktree_id = $1
       ORDER BY lc.clicked_at DESC`,
      [linktreeId]
    ),
    query<{ id: string; platform: string; display_name?: string | null; click_count: number }>(
      `SELECT id, platform, display_name, click_count
       FROM links
       WHERE linktree_id = $1`,
      [linktreeId]
    ),
  ]);

  const stats = analyticsStatsResult.rows && analyticsStatsResult.rows.length > 0 ? analyticsStatsResult.rows[0] : null;
  const uniqueViews = stats ? Number(stats.unique_views) || 0 : 0;
  const uniqueClicks = stats ? Number(stats.unique_clicks) || 0 : 0;
  
  const views = (pageViewsResult.rows || []) as PageView[];
  const clicks = (linkClicksResult.rows || []).map(click => ({
    id: click.id,
    link_id: click.link_id,
    linktree_id: click.linktree_id,
    ip_address: click.ip_address,
    clicked_at: click.clicked_at,
    session_id: click.session_id,
    platform: click.platform,
    display_name: click.display_name,
  })) as Array<LinkClick & { platform: string; display_name?: string }>;
  
  const linksData = (linksResult.rows || []) as Array<{ id: string; platform: string; display_name?: string | null; click_count: number }>;

  const breakdown = breakdownsResult.rows && breakdownsResult.rows.length > 0 ? breakdownsResult.rows[0] : null;
  
  const viewsByDevice: Record<string, number> = breakdown?.views_by_device ? (breakdown.views_by_device as Record<string, number>) : {};
  const clicksByDevice: Record<string, number> = breakdown?.clicks_by_device ? (breakdown.clicks_by_device as Record<string, number>) : {};
  const clicksByPlatform: Record<string, number> = breakdown?.clicks_by_platform ? (breakdown.clicks_by_platform as Record<string, number>) : {};
  const viewsByReferer: Record<string, number> = breakdown?.views_by_referer ? (breakdown.views_by_referer as Record<string, number>) : {};
  const clicksByReferer: Record<string, number> = breakdown?.clicks_by_referer ? (breakdown.clicks_by_referer as Record<string, number>) : {};
  const viewsByOs: Record<string, number> = breakdown?.views_by_os ? (breakdown.views_by_os as Record<string, number>) : {};
  const clicksByOs: Record<string, number> = breakdown?.clicks_by_os ? (breakdown.clicks_by_os as Record<string, number>) : {};
  
  
  const linkClickCounts: Record<string, number> = {};
  for (const click of clicks) {
    if (click.link_id) {
      linkClickCounts[click.link_id] = (linkClickCounts[click.link_id] || 0) + 1;
    }
  }
  
  const linkMetadata: Record<string, { platform: string; display_name?: string }> = {};
  for (const link of linksData) {
    linkMetadata[link.id] = {
      platform: link.platform,
      display_name: link.display_name || undefined,
    };
  }

  const recentViews = views.map(v => ({
    ip_address: v.ip_address,
    viewed_at: v.viewed_at,
  }));

  const recentClicks = clicks.map(c => ({
    ip_address: c.ip_address,
    platform: c.platform || undefined,
    clicked_at: c.clicked_at,
  }));
  
  const topClickedLinks = Object.entries(linkClickCounts)
    .map(([link_id, count]) => {
      const metadata = linkMetadata[link_id] || { platform: 'Unknown', display_name: undefined };
      
      const linkRecentClicks = clicks
        .filter(c => c.link_id === link_id)
        .sort((a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
        .slice(0, 5)
        .map(c => ({
          ip_address: c.ip_address,
          clicked_at: c.clicked_at,
        }));
      
      return {
        link_id,
        platform: metadata.platform,
        display_name: metadata.display_name,
        click_count: count,
        recent_clicks: linkRecentClicks.length > 0 ? linkRecentClicks : undefined,
      };
    })
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 10);

  return {
    unique_views: uniqueViews, // From optimized database function (100% accurate)
    unique_clicks: uniqueClicks, // From optimized database function (100% accurate)
    views_by_device: viewsByDevice,
    clicks_by_device: clicksByDevice,
    clicks_by_platform: clicksByPlatform,
    views_by_referer: viewsByReferer,
    clicks_by_referer: clicksByReferer,
    views_by_os: viewsByOs,
    clicks_by_os: clicksByOs,
    top_clicked_links: topClickedLinks,
    recent_views: recentViews,
    recent_clicks: recentClicks,
  };
}

/**
 * Get analytics summaries for all linktrees
 * ALWAYS fetches directly from page_views and link_clicks tables - NEVER uses denormalized fields
 * Uses optimized database aggregation for maximum performance and 100% accuracy
 * Uses database-level COUNT and COUNT(DISTINCT) instead of fetching all records
 * 
 * This ensures the admin table always shows accurate totals from the source tables
 */
export async function getAllLinktreesAnalytics(): Promise<Record<string, {
  unique_views: number;
  unique_clicks: number;
}>> {
  // Use optimized database function (efficient, uses COUNT(DISTINCT) at database level)
  // This is much faster than fetching all records and processing in memory
  try {
    const result = await query<{
      linktree_id: string;
      unique_views: number;
      unique_clicks: number;
    }>("SELECT * FROM get_all_linktrees_analytics_optimized()");

    if (!result.rows || result.rows.length === 0) {
      return {};
    }

    const analytics: Record<string, {
      unique_views: number;
      unique_clicks: number;
    }> = {};

    for (const row of result.rows) {
      if (row && row.linktree_id) {
        analytics[row.linktree_id] = {
          unique_views: Number(row.unique_views) || 0,
          unique_clicks: Number(row.unique_clicks) || 0,
        };
      }
    }
    
    return analytics;
  } catch (error) {
    // Log error details safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in getAllLinktreesAnalytics:", errorMessage);
    // Return empty analytics instead of using heavy fallback (prevents timeout)
    return {};
  }
}

