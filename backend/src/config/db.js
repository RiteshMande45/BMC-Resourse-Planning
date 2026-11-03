const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bmc_resource_planning'
});

pool.on('connect', () => {
    // Database connected successfully
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool,
    connect: (...args) => pool.connect(...args)
};
