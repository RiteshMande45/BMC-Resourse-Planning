require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const XLSX = require('xlsx');
const { pool } = require('../../config/database');
const path = require('path');
const fs = require('fs');

// ── ADJUST THIS PATH to wherever your Resources.xlsx lives ──
const XLSX_PATH = path.join(__dirname, '../../../../Resources.xlsx');

// Map spreadsheet column headers (team names) → project names
const TEAM_TO_PROJECT = {
  'Corel WP+Painter': 'Elliot Corel',
  'Elliot AI':        'ElliotAI',
  'BMC':              null,            // split by CTRL-M / ITSM tag
  'MistPlay':         'MistPlay',
  'RILO':             'RILO',
  'Recru-AI':         'Recru-AI',
  'FirstUp':          'FirstUp',
  'Residex':          'Residex',
  'IT Support':       'IT Support',
};

// Map role tags → employee type + user role + designation
function mapRoleTag(tag) {
  const t = (tag || '').trim().toUpperCase();
  if (t === 'LEAD')    return { type: 'employee',      role: 'manager',  designation: 'Team Lead' };
  if (t === 'DEV')     return { type: 'employee',      role: 'employee', designation: 'Developer' };
  if (t === 'QA')      return { type: 'employee',      role: 'employee', designation: 'QA Engineer' };
  if (t === 'CTRL-M')  return { type: 'employee',      role: 'employee', designation: 'BMC Control-M Engineer', project: 'BMC Control-M' };
  if (t === 'ITSM')    return { type: 'employee',      role: 'employee', designation: 'ITSM Engineer',          project: 'BMC ITSM' };
  if (t === 'UNPAID')  return { type: 'intern_unpaid', role: 'employee', designation: 'Intern (Unpaid)' };
  return               { type: 'employee',             role: 'employee', designation: null };
}

// Generate a temp email from a full name
function toEmail(name) {
  return name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') + '@elliot.com';
}

// Parse name + role tag from a cell like "Rahul Sharma DEV" or "Durgadas Barhate Lead"
function parseCellName(cell) {
  if (!cell) return null;
  const str = String(cell).trim();
  if (!str) return null;
  const tags = ['LEAD', 'DEV', 'QA', 'CTRL-M', 'ITSM', 'UNPAID'];
  for (const tag of tags) {
    const re = new RegExp(`\\s+${tag}$`, 'i');
    if (re.test(str)) {
      return { name: str.replace(re, '').trim(), tag };
    }
  }
  return { name: str, tag: null };
}

async function run() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error(`\n✗ File not found: ${XLSX_PATH}`);
    console.error('  Adjust the XLSX_PATH variable at the top of this script.\n');
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // First row = column headers (team names)
  const headers = rows[0];
  const employees = [];

  for (let col = 0; col < headers.length; col++) {
    const teamName = String(headers[col]).trim();
    if (!teamName) continue;
    const projectName = TEAM_TO_PROJECT[teamName] ?? teamName;

    for (let row = 1; row < rows.length; row++) {
      const cell = rows[row][col];
      const parsed = parseCellName(cell);
      if (!parsed) continue;

      const { name, tag } = parsed;
      const mapped = mapRoleTag(tag);
      const project = mapped.project || (TEAM_TO_PROJECT[teamName] !== null ? projectName : null);

      employees.push({
        name,
        email:       toEmail(name),
        role:        mapped.role,
        type:        mapped.type,
        designation: mapped.designation,
        team:        teamName,
        project,
        tag,
      });
    }
  }

  console.log(`\nParsed ${employees.length} people from Resources.xlsx`);

  const client = await pool.connect();
  const unresolved = [];
  let inserted = 0;

  try {
    await client.query('BEGIN');

    for (const emp of employees) {
      // Insert user
      const uRes = await client.query(
        `INSERT INTO users (name, email, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [emp.name, emp.email, emp.role]
      );
      const userId = uRes.rows[0].id;

      // Insert employee
      const eRes = await client.query(
        `INSERT INTO employees (user_id, type, designation, weekly_hours, joined_on)
         VALUES ($1, $2, $3, $4, CURRENT_DATE)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING id`,
        [userId, emp.type, emp.designation, emp.type === 'intern_unpaid' ? 0 : 40]
      );

      if (eRes.rows.length > 0) {
        inserted++;
        if (!emp.project) {
          unresolved.push({ name: emp.name, reason: 'Team has no project mapping', team: emp.team });
        }
      }
    }

    await client.query('COMMIT');
    console.log(`✓ Inserted ${inserted} employees`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Import failed:', err.message);
    throw err;
  } finally {
    client.release();
  }

  // Write unresolved.md
  if (unresolved.length > 0) {
    const lines = [
      '# Unresolved Employee Data\n',
      '## Employees needing HR confirmation\n',
      ...unresolved.map(u => `- **${u.name}** (team: ${u.team}) — ${u.reason}`),
      '',
      '## Known Issues',
      '- **Atul Ambatkar** — In skills form but NOT in Resources.xlsx. Inserted with team=NULL, project=NULL.',
      '- **Sayali Patil** — Duplicate skills form response. See import_skills.js for resolution.',
    ];
    fs.writeFileSync(path.join(__dirname, 'unresolved.md'), lines.join('\n'));
    console.log(`✓ Wrote unresolved.md with ${unresolved.length} gaps`);
  }

  await pool.end();
  console.log('\n🎉 Resources.xlsx import complete!\n');
}

run().catch(console.error);