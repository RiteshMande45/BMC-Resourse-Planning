// ─────────────────────────────────────────────────────────────
// Reads skills form xlsx → creates users + employees + skills
// Run: node src/db/seeds/seed_from_form.js
// ─────────────────────────────────────────────────────────────
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const XLSX     = require('xlsx');
const { pool } = require('../../config/database');

const XLSX_PATH = 'C:\\Users\\abhij\\OneDrive\\Desktop\\skills_form.xlsx';

// ── Skill normalization ────────────────────────────────────────
const NORMALIZE = {
  'javascript':             'JavaScript',
  'typescript':             'TypeScript',
  'sql / database':         'SQL',
  'sql':                    'SQL',
  'qa / software testing':  'QA Testing',
  'other':                  null,
  'c':                      'C',
  'c++':                    'C++',
};

const CATEGORY = {
  'Python':             'Backend',
  'Java':               'Backend',
  'JavaScript':         'Frontend',
  'TypeScript':         'Frontend',
  'React':              'Frontend',
  'SQL':                'Database',
  'MySQL':              'Database',
  'PostgreSQL':         'Database',
  'MongoDB':            'Database',
  'Oracle':             'Database',
  'SQLite':             'Database',
  'Firebase':           'Database',
  'AI/ML':              'AI/ML',
  'Deep Learning':      'AI/ML',
  'Data Analytics':     'Analytics',
  'QA Testing':         'QA',
  'Manual Testing':     'QA',
  'Automation Testing': 'QA',
  'DevOps':             'DevOps',
  'Technical Support':  'Support',
  'UI/UX Design':       'Design',
  'C':                  'Systems',
  'C++':                'Systems',
};

function norm(raw) {
  const t = raw.trim();
  return NORMALIZE.hasOwnProperty(t.toLowerCase())
    ? NORMALIZE[t.toLowerCase()]
    : t;
}

function parseSkills(csv) {
  if (!csv) return [];
  return csv.split(',')
    .map(s => norm(s.trim()))
    .filter(s => s && s.length > 0 && s.length < 60);
}

function mapRole(empType) {
  const v = String(empType).toLowerCase();
  if (v.includes('intern')) return 'employee';
  return 'employee';
}

function mapType(empType) {
  const v = String(empType).toLowerCase();
  if (v.includes('intern')) return 'intern';
  return 'employee';
}

async function run() {
  // 1. Load Excel
  let wb;
  try {
    wb = XLSX.readFile(XLSX_PATH);
  } catch (e) {
    console.error('✗ Cannot open:', XLSX_PATH);
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(
    wb.Sheets[wb.SheetNames[0]], { defval: '' }
  );

  // Print columns so we can verify email column is present
  if (rows.length > 0) {
    const cols = Object.keys(rows[0]);
    const hasEmail = cols.some(c => c.toLowerCase().includes('email'));
    console.log('\n✓ Columns found:', cols.slice(0, 6).join(', '), '...');
    console.log(hasEmail
      ? '✓ Email column detected — will use real emails'
      : '⚠ No email column — will use placeholder emails'
    );
  }

  // 2. De-duplicate — keep most recent per name
  const deduped = new Map();
  for (const r of rows) {
    const name = String(r['Full Name'] || '').trim();
    if (name) deduped.set(name, r);
  }
  console.log(`✓ ${rows.length} responses → ${deduped.size} unique people\n`);

  const client = await pool.connect();
  const report = { users: 0, skipped: 0, skills: 0, empSkills: 0, certs: 0 };
  const noEmail = [];

  try {
    await client.query('BEGIN');

    for (const [name, row] of deduped.entries()) {

      // ── Read all fields ──────────────────────────────────────
      const rawEmail    = String(row['Email Address'] || '').trim().toLowerCase();
      const empTypeRaw  = String(row[' Are you currently an employee or an intern?'] || '').trim();
      const designation = String(row['What is your current Designation?'] || '').trim();
      const team        = String(row['Department / Team'] || '').trim();
      const avail       = String(row['Current Availability'] || '').trim();
      const primSkills  = String(row['Primary Technical Skills?'] || '');
      const languages   = String(row['Programming Languages Known?'] || '');
      const databases   = String(row['Database Knowledge'] || '');
      const certsRaw    = String(row['Courses or Certifications Completed'] || '');

      // ── Use real email or placeholder ────────────────────────
      let email = rawEmail;
      if (!email) {
        email = name.toLowerCase()
          .replace(/\s+/g, '.')
          .replace(/[^a-z0-9.]/g, '')
          + '@bmc.placeholder';
        noEmail.push(name);
      }

      const role = mapRole(empTypeRaw);
      const type = mapType(empTypeRaw);

      // ── Upsert user ──────────────────────────────────────────
      const uRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, 'placeholder_hash', $3)
         ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name, role = EXCLUDED.role
         RETURNING id`,
        [name, email, role]
      );
      const userId = uRes.rows[0].id;

      // ── Upsert employee ──────────────────────────────────────
      const empCheck = await client.query(
        `SELECT id FROM employees WHERE user_id = $1`, [userId]
      );
      let empId;
      if (empCheck.rows.length === 0) {
        const eRes = await client.query(
          `INSERT INTO employees (user_id, type, designation, weekly_hours, joined_on)
           VALUES ($1, $2, $3, 40, CURRENT_DATE)
           RETURNING id`,
          [userId, type, designation || team || 'Employee']
        );
        empId = eRes.rows[0].id;
        report.users++;
      } else {
        empId = empCheck.rows[0].id;
        report.skipped++;
      }

      const emailDisplay = rawEmail || '(placeholder)';
      console.log(`  ✓ ${name.padEnd(28)} | ${emailDisplay.padEnd(35)} | ${avail}`);

      // ── Skills ───────────────────────────────────────────────
      const skillSet    = new Set([
        ...parseSkills(primSkills),
        ...parseSkills(languages),
        ...parseSkills(databases),
      ]);
      const primaryList = parseSkills(primSkills);

      for (const skillName of skillSet) {
        const category = CATEGORY[skillName] || 'General';
        const level    = primaryList.includes(skillName) ? 3 : 2;

        const sRes = await client.query(
          `INSERT INTO skills (name, category)
           VALUES ($1, $2)
           ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category
           RETURNING id`,
          [skillName, category]
        );

        await client.query(
          `INSERT INTO employee_skills (employee_id, skill_id, level)
           VALUES ($1, $2, $3)
           ON CONFLICT (employee_id, skill_id) DO UPDATE SET level = EXCLUDED.level`,
          [empId, sRes.rows[0].id, level]
        );
        report.skills++;
        report.empSkills++;
      }

      // ── Certificates ─────────────────────────────────────────
      if (certsRaw.trim()) {
        const certLines = certsRaw
          .split('\n')
          .map(c => c.replace(/^\d+[\.\)]\s*/, '').trim())
          .filter(c => c.length > 3);

        for (const title of certLines) {
          await client.query(
            `INSERT INTO certificates (employee_id, title, status)
             VALUES ($1, $2, 'self_reported')
             ON CONFLICT DO NOTHING`,
            [empId, title.substring(0, 200)]
          );
          report.certs++;
        }
      }
    }

    await client.query('COMMIT');

    console.log('\n══════════════════════════════════════════════');
    console.log('🎉 Import complete!');
    console.log(`   Employees created    : ${report.users}`);
    console.log(`   Already existed      : ${report.skipped}`);
    console.log(`   Skills linked        : ${report.empSkills}`);
    console.log(`   Certificates added   : ${report.certs}`);

    if (noEmail.length > 0) {
      console.log(`\n⚠️  ${noEmail.length} people had no email in sheet (placeholder used):`);
      noEmail.forEach(n => console.log(`   • ${n}`));
    } else {
      console.log('\n✅ All employees have real emails — no placeholders needed!');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n✗ Failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();