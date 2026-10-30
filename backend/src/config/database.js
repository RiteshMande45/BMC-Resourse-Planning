const { Pool } = require('pg');

// pg connection pool — shared across all route handlers
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enable SSL in production (e.g. on Heroku/Render), plain TCP locally
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,                  // max connections in pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000, // error if no connection within 2s
});

// Log unexpected pool errors so they don't crash silently
pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client:', err.message);
});

module.exports = { pool };
