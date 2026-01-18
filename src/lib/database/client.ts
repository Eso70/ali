/**
 * PostgreSQL Database Client
 * Direct PostgreSQL connection using connection pooling
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Create connection pool for better performance
let pool: Pool | null = null;

/**
 * Get database connection pool
 * Uses connection pooling for better performance and connection management
 */
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'alinetwork',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      // Connection pool settings
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 60000, // Return an error after 60 seconds if connection cannot be established
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Execute a database query
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  queryText: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  try {
    const result = await pool.query<T>(queryText, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * IMPORTANT: Always release the client when done!
 * @returns Pool client
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Execute a transaction
 * @param callback - Function that receives a client and performs queries
 * @returns Result from callback
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close all database connections
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
