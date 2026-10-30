require('dotenv').config();

const app = require('./app');
const { validateEnv } = require('./config/env');
const { pool } = require('./config/database');

// Warn about any missing environment variables before starting
validateEnv();

const PORT = process.env.PORT || 8000;

async function start() {
  // Test the database connection (non-fatal — app still starts without DB)
  try {
    await pool.query('SELECT 1');
    console.log('✓ PostgreSQL connection established');
  } catch (err) {
    console.warn('⚠  Database not reachable:', err.message);
    console.warn('   Set DATABASE_URL in your .env file to connect');
  }

  app.listen(PORT, () => {
    console.log(`\n✓ BMC Resource Planning API running`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

start();
