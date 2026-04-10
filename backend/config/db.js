const { Pool } = require('pg');

// Supabase and most remote PostgreSQL providers require SSL.
// Skip SSL only for explicit local connections.
const isLocalDb =
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('localhost') ||
  process.env.DATABASE_URL.includes('127.0.0.1');

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set — check backend/.env');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL client connected');
});

// Log pool errors but do NOT exit — the pool will attempt to recover.
pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

module.exports = pool;
