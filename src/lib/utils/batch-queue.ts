/**
 * Batch queue for analytics inserts
 * Reduces database load by batching multiple inserts together
 */

import { query } from "@/lib/database/client";

interface ViewRecord {
  linktree_id: string;
  ip_address: string;
  session_id: string | null;
  viewed_at: string;
}

interface ClickRecord {
  link_id: string;
  linktree_id: string;
  ip_address: string;
  session_id: string | null;
  clicked_at: string;
}

class BatchQueue<T extends ViewRecord | ClickRecord> {
  private queue: T[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly maxBatchSize: number;
  private readonly flushIntervalMs: number;
  private readonly insertFn: (items: T[]) => Promise<void>;
  private isProcessing = false;

  constructor(
    insertFn: (items: T[]) => Promise<void>,
    maxBatchSize = 1000, // Increased to 1000 for maximum batching efficiency
    flushIntervalMs = 3600000 // Increased to 1 hour (3600s) to minimize database calls for free tier
  ) {
    this.insertFn = insertFn;
    this.maxBatchSize = maxBatchSize;
    this.flushIntervalMs = flushIntervalMs;
    this.startFlushInterval();
  }

  add(item: T): void {
    this.queue.push(item);
    
    // Flush immediately if batch size reached - fire and forget (background operation)
    if (this.queue.length >= this.maxBatchSize) {
      this.flush().catch(() => {
        // Silently fail - will retry on next flush or interval
      });
    }
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      // Flush queue periodically to ensure data is written to database
      if (this.queue.length > 0) {
        this.flush().catch((error) => {
          // Only log non-ignorable errors (foreign key and duplicate errors are expected)
          const isIgnorableError = 
            error && 
            typeof error === 'object' && 
            'code' in error && 
            (String(error.code).includes('23505') || String(error.code).includes('23503'));
          
          if (!isIgnorableError) {
            console.error('Auto-flush error:', error);
          }
        });
      }
    }, this.flushIntervalMs);
  }

  async flush(): Promise<void> {
    // Only flush if queue exists, has data, and is not currently processing
    if (this.isProcessing || !this.queue || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const itemsToInsert = [...this.queue];
    this.queue = [];

    // Early return if no items to insert
    if (itemsToInsert.length === 0) {
      this.isProcessing = false;
      return;
    }

    try {
      // Wait for insert to complete - this ensures data is in database
      await this.insertFn(itemsToInsert);
    } catch (error) {
      // Check if error is a duplicate constraint violation (23505) or foreign key constraint (23503)
      // 23503 = foreign key constraint violation (linktree/link was deleted)
      // 23505 = unique constraint violation (duplicate entry)
      const isIgnorableError = 
        error && 
        typeof error === 'object' && 
        'code' in error && 
        (String(error.code).includes('23505') || String(error.code).includes('23503'));
      
      // Only retry non-ignorable errors (foreign key and duplicate errors are expected)
      if (!isIgnorableError) {
        console.error('Batch insert error:', error);
        
        // Put items back for retry (limit to prevent memory issues)
        const maxQueueSize = 2000;
        if (this.queue.length < maxQueueSize) {
          this.queue.unshift(...itemsToInsert);
        } else {
          console.error('Queue too large, items will be retried on next flush');
          this.queue.unshift(...itemsToInsert.slice(0, 1000));
        }
        
        // Re-throw error so caller knows flush failed
        throw error;
      }
      // Silently ignore foreign key and duplicate errors - these are expected when items are deleted
    } finally {
      this.isProcessing = false;
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    // Flush remaining items - note: can't await in destroy, but flush will handle errors
    if (this.queue.length > 0) {
      this.flush().catch(() => {
        // Log but don't block shutdown
      });
    }
  }
}

// Global queues (singleton pattern)
let viewQueue: BatchQueue<ViewRecord> | null = null;
let clickQueue: BatchQueue<ClickRecord> | null = null;

export async function initializeQueues() {
  if (typeof window !== 'undefined') return; // Client-side, skip

  // Initialize view queue with optimized batch size and interval
  if (!viewQueue) {
    viewQueue = new BatchQueue<ViewRecord>(
      async (items) => {
        // Only insert if items exist and are not null/empty
        if (!items || items.length === 0) return;
        
        // Validate all items before inserting to database
        const validItems = items.filter(item => 
          item && 
          item.linktree_id && 
          item.linktree_id.trim() && 
          item.ip_address && 
          item.ip_address.trim()
        );
        
        if (validItems.length === 0) return;
        
        // Bulk insert to database using PostgreSQL
        try {
          // Build VALUES clause for bulk insert
          const values: unknown[] = [];
          const placeholders: string[] = [];
          let paramIndex = 1;

          for (const item of validItems) {
            placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            values.push(
              item.linktree_id,
              item.ip_address,
              item.session_id || null,
              item.viewed_at
            );
          }

          await query(
            `INSERT INTO page_views (linktree_id, ip_address, session_id, viewed_at)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT DO NOTHING`,
            values
          );
        } catch (error: unknown) {
          // Ignore duplicate errors (23505) and foreign key constraint errors (23503)
          // 23503 = foreign key violation (linktree was deleted)
          // 23505 = unique constraint violation (duplicate entry)
          const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
          if (!errorCode.includes('23505') && !errorCode.includes('23503')) {
            throw error;
          }
        }
      },
      1000, // Optimized batch size: 1000 items per insert
      3600000 // Optimized interval: 1 hour (3600s)
    );
  }

  // Initialize click queue with optimized batch size and interval
  if (!clickQueue) {
    clickQueue = new BatchQueue<ClickRecord>(
      async (items) => {
        // Only insert if items exist and are not null/empty
        if (!items || items.length === 0) return;
        
        // Validate all items before inserting
        const validItems = items.filter(item => 
          item && 
          item.link_id && 
          item.link_id.trim() && 
          item.linktree_id && 
          item.linktree_id.trim() && 
          item.ip_address && 
          item.ip_address.trim()
        );
        
        if (validItems.length === 0) return;
        
        // Bulk insert to database using PostgreSQL
        try {
          // Build VALUES clause for bulk insert
          const values: unknown[] = [];
          const placeholders: string[] = [];
          let paramIndex = 1;

          for (const item of validItems) {
            placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            values.push(
              item.link_id,
              item.linktree_id,
              item.ip_address,
              item.session_id || null,
              item.clicked_at
            );
          }

          await query(
            `INSERT INTO link_clicks (link_id, linktree_id, ip_address, session_id, clicked_at)
             VALUES ${placeholders.join(', ')}
             ON CONFLICT DO NOTHING`,
            values
          );
        } catch (error: unknown) {
          // Ignore duplicate errors (23505) and foreign key constraint errors (23503)
          // 23503 = foreign key violation (link/linktree was deleted)
          // 23505 = unique constraint violation (duplicate entry)
          const errorCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
          if (!errorCode.includes('23505') && !errorCode.includes('23503')) {
            throw error;
          }
        }
      },
      1000, // Optimized batch size: 1000 items per insert
      3600000 // Optimized interval: 1 hour (3600s)
    );
  }
}

export async function addView(view: ViewRecord): Promise<void> {
  // Validate data before adding - skip if null/empty
  if (!view || !view.linktree_id || !view.linktree_id.trim() || !view.ip_address || !view.ip_address.trim()) {
    return; // Skip invalid data to reduce API calls
  }
  
  if (!viewQueue) {
    await initializeQueues();
  }
  
  if (viewQueue) {
    viewQueue.add(view);
  }
}

export async function addClick(click: ClickRecord): Promise<void> {
  // Validate data before adding - skip if null/empty
  if (!click || !click.link_id || !click.link_id.trim() || !click.linktree_id || !click.linktree_id.trim() || !click.ip_address || !click.ip_address.trim()) {
    return; // Skip invalid data to reduce API calls
  }
  
  if (!clickQueue) {
    await initializeQueues();
  }
  
  if (clickQueue) {
    clickQueue.add(click);
  }
}

// Flush queues on server shutdown to prevent data loss
if (typeof process !== 'undefined') {
  const flushAll = async () => {
    if (viewQueue) {
      await viewQueue.flush();
      viewQueue.destroy();
    }
    if (clickQueue) {
      await clickQueue.flush();
      clickQueue.destroy();
    }
  };

  process.on('SIGTERM', async () => {
    await flushAll();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    await flushAll();
    process.exit(0);
  });
  process.on('beforeExit', async () => {
    await flushAll();
  });
}

// Export function to manually flush all queues (for admin refresh)
// This ensures all queued data is written to the database before returning
export async function flushAllQueues(): Promise<void> {
  if (typeof window !== 'undefined') return; // Client-side, skip
  
  try {
    await initializeQueues();
  } catch (initError) {
    console.error("Error initializing queues:", initError);
    throw new Error(`Failed to initialize queues: ${initError instanceof Error ? initError.message : String(initError)}`);
  }
  
  // Flush both queues and wait for all inserts to complete
  const flushPromises: Promise<void>[] = [];
  
  if (viewQueue) {
    flushPromises.push(viewQueue.flush());
  }
  
  if (clickQueue) {
    flushPromises.push(clickQueue.flush());
  }
  
  // Wait for all flushes to complete
  // If any flush fails, Promise.all will reject with the first error
  if (flushPromises.length > 0) {
    try {
      await Promise.all(flushPromises);
    } catch (error) {
      console.error("Error flushing queues:", error);
      throw error;
    }
  }
}

// Initialize queues on module load
if (typeof window === 'undefined') {
  initializeQueues().catch(() => {});
}
