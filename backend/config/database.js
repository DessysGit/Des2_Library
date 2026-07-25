/**
 * Database Configuration
 * 
 * This file handles:
 * - PostgreSQL connection pool setup with dual connection strategy
 * - Connection testing with retry logic
 * - Database table creation using direct connection
 * - Error handling for database operations
 */

const { Pool } = require('pg');
const knex = require('knex');
const { isProduction } = require('./environment');
const knexfile = require('../../knexfile');

const knexEnv = isProduction ? 'production' : (process.env.NODE_ENV === 'test' ? 'test' : 'development');
const dbKnex = knex(knexfile[knexEnv]);

// Import logger
let logger;
try {
  logger = require('./logger');
} catch (error) {
  // Fallback to console if logger not available
  logger = {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.log
  };
}

// ============================================
// DATABASE CONNECTION POOLS
// ============================================

/**
 * Main pool for regular queries (uses pooler for better performance)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

/**
 * Direct connection pool for DDL operations (CREATE TABLE, ALTER, etc.)
 * Supabase pooler has limitations with long-running operations
 */
const directPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
  statement_timeout: 60000,  // 60 seconds for DDL operations
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

/**
 * Handle unexpected database errors
 */
pool.on("error", (err) => {
  logger.error('Database pool error', { error: err.message });
});

directPool.on("error", (err) => {
  logger.error('Direct pool error', { error: err.message });
});

// ============================================
// CONNECTION TESTING
// ============================================

async function testConnection() {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query('SELECT NOW()');      
      client.release();
      return true;
    } catch (err) {
      if (client) {
        try { client.release(); } catch (e) { /* ignore */ }
      }
      
      retries++;
      logger.error('Database connection failed', { 
        attempt: retries, 
        maxRetries, 
        error: err.message 
      });
      
      if (retries === maxRetries) {
        throw err;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// ============================================
// TABLE CREATION & MIGRATIONS
// ============================================

async function ensureTables() {
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      logger.info('Running database migrations via Knex...');
      await dbKnex.migrate.latest();
      logger.info('Database migrations completed successfully');
      return;
    } catch (err) {
      retries++;
      logger.error('Database migration failed', { 
        attempt: retries, 
        maxRetries, 
        error: err.message 
      });
      
      if (retries === maxRetries) {
        throw err;
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

/**
 * Close both database pools on application shutdown
 */
async function closePool() {
  try {
    logger.info('Closing database connections');
    await Promise.all([
      pool.end(),
      directPool.end(),
      dbKnex.destroy()
    ]);
    logger.info('Database connections closed successfully');
  } catch (err) {
    logger.error('Error closing database pools', { error: err.message });
  }
}

// Handle process termination
let isShuttingDown = false;

process.on('SIGINT', async () => {
  if (!isShuttingDown) {
    isShuttingDown = true;
    await closePool();
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  if (!isShuttingDown) {
    isShuttingDown = true;
    await closePool();
    process.exit(0);
  }
});

module.exports = {
  pool,
  directPool,
  dbKnex,
  testConnection,
  ensureTables,
  closePool
};
