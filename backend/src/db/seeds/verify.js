require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { pool } = require('../../config/database');

async function verify() {
  const checks = [
    { label: 'Users',           q: 'SELECT COUNT(*) FROM users' },
    { label: 'Employees',       q: 'SELECT COUNT(*) FROM employees' },
    { label: 'Skills',          q: 'SELECT COUNT(*) FROM skills' },
    { label: 'Employee Skills', q: 'SELECT COUNT(*) FROM employee_skills' },
    { label: 'Projects',        q: 'SELECT COUNT(*) FROM projects' },
    { label: 'Clients',         q: 'SELECT COUNT(*) FROM clients' },
  ];

  console.log('\n── Database Verification ──────────────────');
  for (const c of checks) {
    const res = await pool.query(c.q);
    console.log(`  ${c.label.padEnd(20)} → ${res.rows[0].count} rows`);
  }

  // Test: can we retrieve an employee with their skills?
  const empRes = await pool.query(`
    SELECT u.name, u.role, e.designation, s.name as skill, es.level
    FROM employees e
    JOIN users u ON u.id = e.user_id
    LEFT JOIN employee_skills es ON es.employee_id = e.id
    LEFT JOIN skills s ON s.id = es.skill_id
    ORDER BY u.name
    LIMIT 10
  `);
  console.log('\n── Sample: Employees + Skills ─────────────');
  empRes.rows.forEach(r =>
    console.log(`  ${r.name.padEnd(18)} | ${(r.skill || 'no skill').padEnd(20)} | Level ${r.level || '-'}`)
  );

  console.log('\n✓ Verification complete!\n');
  await pool.end();
}

verify();