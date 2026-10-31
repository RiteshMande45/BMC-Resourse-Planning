// ─────────────────────────────────────────────────────────────
// Reads TWO sources
//
//   src/db/seeds/data/seed_config.json  ← projects + team map + availability %
//   skills_form.xlsx                    ← who is on which team + their availability
//
// PRD §3  → projects list
// PRD §12.1 → availability converts: Fully=100%, Partial=60%, Available=40%
//
// Run: node src/db/seeds/seed_projects_and_allocations.js
// ─────────────────────────────────────────────────────────────
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const XLSX     = require('xlsx');
const path     = require('path');
const fs       = require('fs');
const { pool } = require('../../config/database');

// ── Read both sources ──────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, 'data', 'seed_config.json');
const XLSX_PATH   = 'C:\\Users\\abhij\\OneDrive\\Desktop\\skills_form.xlsx';

// Load config
let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  console.log(`\n✓ Config loaded`);
  console.log(`  Projects    : ${config.projects.length}`);
  console.log(`  Team map    : ${Object.keys(config.team_to_project).length} teams`);
  console.log(`  Availability: ${Object.keys(config.availability).length - 1} rules + default`);
} catch (e) {
  console.error('✗ Cannot read seed_config.json:', e.message);
  process.exit(1);
}

// Load skills form
let formRows = [];
try {
  const wb = XLSX.readFile(XLSX_PATH);
  formRows  = XLSX.utils.sheet_to_json(
    wb.Sheets[wb.SheetNames[0]], { defval: '' }
  );
  console.log(`✓ Skills form loaded: ${formRows.length} responses`);
} catch (e) {
  console.error('✗ Cannot read skills_form.xlsx:', XLSX_PATH);
  process.exit(1);
}

// ── Helpers that read from config — no values hardcoded ────────
function getAvailPercent(availString) {
  // Look up in config, fall back to "default" key
  const matched = Object.keys(config.availability).find(
    key => availString.toLowerCase().includes(key.toLowerCase())
  );
  return matched
    ? config.availability[matched]
    : config.availability['default'];
}

function getProjectForTeam(teamString) {
  // Exact match first, then partial
  if (config.team_to_project[teamString]) {
    return config.team_to_project[teamString];
  }
  const lower = teamString.toLowerCase();
  const found = Object.keys(config.team_to_project).find(
    key => lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)
  );
  return found ? config.team_to_project[found] : null;
}

async function run() {
  // De-duplicate form by name (keep most recent)
  const deduped = new Map();
  for (const row of formRows) {
    const name = String(row['Full Name'] || '').trim();
    if (name) deduped.set(name, row);
  }
  console.log(`✓ Unique people in form: ${deduped.size}\n`);

  const client = await pool.connect();
  const report = { clients: 0, projects: 0, allocations: 0, unmatched: [] };

  try {
    await client.query('BEGIN');

    // ── 1. Get manager for projects (placeholder) ──────────────
    const mgrRes = await client.query(
      `SELECT u.id AS uid, e.id AS eid
       FROM users u JOIN employees e ON e.user_id = u.id
       WHERE u.role = 'manager' LIMIT 1`
    );
    const managerUid = mgrRes.rows[0]?.uid || null;
    const managerEid = mgrRes.rows[0]?.eid || null;

    // ── 2. Upsert clients from config ──────────────────────────
    const uniqueClients = [...new Set(config.projects.map(p => p.client))];
    const clientIds     = {};

    for (const clientName of uniqueClients) {
      const res = await client.query(
        `INSERT INTO clients (name, contact_name, contact_email)
         VALUES ($1, 'TBD', 'tbd@placeholder.com')
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [clientName]
      );
      if (res.rows.length > 0) {
        clientIds[clientName] = res.rows[0].id;
        report.clients++;
      } else {
        const ex = await client.query(
          `SELECT id FROM clients WHERE name = $1`, [clientName]
        );
        clientIds[clientName] = ex.rows[0].id;
      }
    }
    console.log(`── Clients ─────────────────────────────────────`);
    uniqueClients.forEach(c =>
      console.log(`  ✓ ${c}`)
    );

    // ── 3. Upsert projects from config ─────────────────────────
    const projectIds = {};
    console.log(`\n── Projects ────────────────────────────────────`);

    for (const p of config.projects) {
      const res = await client.query(
        `INSERT INTO projects
           (client_id, name, domain, status, start_date, due_date,
            budget, manager_id, created_by)
         VALUES ($1, $2, $3, 'active', CURRENT_DATE, '2025-12-31',
                 0, $4, $5)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [clientIds[p.client], p.name, p.domain, managerEid, managerUid]
      );

      if (res.rows.length > 0) {
        projectIds[p.name] = res.rows[0].id;
        report.projects++;
        console.log(`  ✓ ${p.name.padEnd(22)} | ${p.domain} | ${p.client}`);
      } else {
        const ex = await client.query(
          `SELECT id FROM projects WHERE name = $1`, [p.name]
        );
        if (ex.rows.length > 0) {
          projectIds[p.name] = ex.rows[0].id;
          console.log(`  ~ ${p.name} (already exists)`);
        }
      }
    }

    // ── 4. Create allocations — reads from xlsx ────────────────
    console.log(`\n── Allocations (from skills form) ──────────────`);

    for (const [name, row] of deduped.entries()) {
      const team    = String(row['Department / Team']    || '').trim();
      const avail   = String(row['Current Availability'] || '').trim();

      // Look up percent and project from config
      const percent  = getAvailPercent(avail);
      const projName = getProjectForTeam(team);

      if (!projName) {
        report.unmatched.push({ name, team, avail });
        console.log(`  ⚠ No project mapping for team: "${team}" (${name})`);
        continue;
      }

      const projId = projectIds[projName];
      if (!projId) {
        console.log(`  ⚠ Project not in DB: "${projName}" (${name})`);
        continue;
      }

      // Get employee from DB
      const empRes = await client.query(
        `SELECT e.id FROM employees e
         JOIN users u ON u.id = e.user_id
         WHERE u.name = $1`,
        [name]
      );

      if (empRes.rows.length === 0) {
        console.log(`  ✗ Employee not in DB: "${name}"`);
        continue;
      }

      const empId = empRes.rows[0].id;

      await client.query(
        `INSERT INTO allocations
           (employee_id, project_id, role, percent, from_date, to_date, kind)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, '2027-12-31', 'planned')
         ON CONFLICT DO NOTHING`,
        [empId, projId, 'Team Member', percent]
      );

      console.log(
        `  ✓ ${name.padEnd(28)} | ${projName.padEnd(22)} | ${String(percent).padStart(3)}%  (${avail})`
      );
      report.allocations++;
    }

    await client.query('COMMIT');

    // ── Summary ────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════');
    console.log('🎉 Done!');
    console.log(`   Clients created    : ${report.clients}`);
    console.log(`   Projects created   : ${report.projects}`);
    console.log(`   Allocations created: ${report.allocations}`);

    if (report.unmatched.length > 0) {
      console.log(`\n⚠️  ${report.unmatched.length} teams not in team_to_project map:`);
      report.unmatched.forEach(u =>
        console.log(`   • ${u.name.padEnd(28)} | team: "${u.team}"`)
      );
      console.log('\n  → Add them to src/db/seeds/data/seed_config.json → team_to_project');
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