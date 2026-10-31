require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { pool } = require('../../config/database');

// Test users — 1 per role, known passwords for other interns
const TEST_USERS = [
  { name: 'Test Owner',    email: 'owner@test.com',    role: 'owner',    designation: 'Business Owner' },
  { name: 'Test Manager',  email: 'manager@test.com',  role: 'manager',  designation: 'Project Manager' },
  { name: 'Test Employee', email: 'employee@test.com', role: 'employee', designation: 'Developer' },
  { name: 'Test Sales',    email: 'sales@test.com',    role: 'sales',    designation: 'Sales Executive' },
  { name: 'Test HR',       email: 'hr@test.com',       role: 'hr',       designation: 'HR Manager' },
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const u of TEST_USERS) {
      const uRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, 'TEST_PLACEHOLDER_HASH', $3)
         ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
         RETURNING id`,
        [u.name, u.email, u.role]
      );
      await client.query(
        `INSERT INTO employees (user_id, type, designation, weekly_hours)
         VALUES ($1, 'employee', $2, 40)
         ON CONFLICT (user_id) DO NOTHING`,
        [uRes.rows[0].id, u.designation]
      );
      console.log(`✓ ${u.email} (${u.role})`);
    }
    await client.query('COMMIT');
    console.log('\n✓ Test users ready — share with other interns');
    console.log('  Password hashes = placeholder; Intern 3 (auth) will set real bcrypt hashes\n');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);