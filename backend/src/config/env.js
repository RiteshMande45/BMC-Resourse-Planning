// Required in production; warn-only in development so the server still starts
const REQUIRED_IN_PROD = ['DATABASE_URL', 'JWT_SECRET'];
const WARN_ALWAYS     = ['DATABASE_URL'];

function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';

  const missing = isProd
    ? REQUIRED_IN_PROD.filter((k) => !process.env[k])
    : WARN_ALWAYS.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    const msg = `Missing env vars: ${missing.join(', ')}`;
    if (isProd) {
      console.error(`✗ ${msg}`);
      process.exit(1);
    } else {
      console.warn(`⚠  ${msg}`);
      console.warn('   Copy .env.example → .env and fill in values');
    }
  }
}

module.exports = { validateEnv };
