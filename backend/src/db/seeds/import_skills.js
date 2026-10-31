// ─────────────────────────────────────────────────────────────
// import_skills.js
// Reads: Employee Information & Skills — Responses (xlsx)
// Inserts: skills, employee_skills, certificates
// Run: node src/db/seeds/import_skills.js
// ─────────────────────────────────────────────────────────────
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const XLSX   = require('xlsx');
const path   = require('path');
const { pool } = require('../../config/database');

// ⬇ CHANGE THIS to where you saved the downloaded Google Sheet
const XLSX_PATH = 'C:\\Users\\abhij\\OneDrive\\Desktop\\skills_form.xlsx';

// ── Skill normalization — fixes casing + duplicates in the form
const SKILL_NORMALIZE = {
  'javascript':        'JavaScript',
  'typescript':        'TypeScript',
  'sql / database':    'SQL',
  'sql':               'SQL',
  'qa / software testing': 'QA Testing',
  'other':             null,   // skip generic "Other"
  'c':                 'C',
  'c++':               'C++',
};

// ── Category mapping for each skill
const SKILL_CATEGORY = {
  'Python':             'Backend',
  'Java':               'Backend',
  'JavaScript':         'Frontend',
  'TypeScript':         'Frontend',
  'React':              'Frontend',
  'Node.js':            'Backend',
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

function normalizeSkill(raw) {
  const trimmed = raw.trim();
  const lower   = trimmed.toLowerCase();
  if (SKILL_NORMALIZE.hasOwnProperty(lower)) return SKILL_NORMALIZE[lower];
  return trimmed;  // keep original casing if not in map
}

function parseSkills(commaSeparated) {
  if (!commaSeparated) return [];
  return commaSeparated
    .split(',')
    .map(s => normalizeSkill(s.trim()))
    .filter(s => s !== null && s.length > 0 && s.length < 60);
}

// Map availability string → allocation percent (rough estimate)
function availabilityNote(val) {
  if (!val) return '';
  const v = val.toLowerCase();
  if (v.includes('fully allocated')) return '0% free';
  if (v.includes('partially'))       return '~50% free';
  if (v.includes('available'))       return '100% free';
  return val;
}

async function importSkills() {
  // 1. Read Excel file
  let workbook;
  try {
    workbook = XLSX.readFile(XLSX_PATH);
  } catch (err) {
    console.error('✗ Cannot open file:', XLSX_PATH);
    console.error('  Download the Google Sheet → File → Download → Excel (.xlsx)');
    console.error('  Save as skills_form.xlsx on your Desktop');
    process.exit(1);
  }

  const ws   = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  console.log(`✓ Loaded ${rows.length} form responses`);

  // 2. De-duplicate — keep most recent row per person name
  const deduped = new Map();
  for (const row of rows) {
    const name = String(row['Full Name'] || '').trim();
    if (!name) continue;
    // Later rows overwrite earlier ones → keeps most recent
    deduped.set(name, row);
  }
  console.log(`✓ After de-duplicate: ${deduped.size} unique people`);

  // Log duplicates found
  if (rows.length !== deduped.size) {
    const nameCount = {};
    for (const row of rows) {
      const n = String(row['Full Name'] || '').trim();
      nameCount[n] = (nameCount[n] || 0) + 1;
    }
    for (const [n, c] of Object.entries(nameCount)) {
      if (c > 1) console.log(`  ⚠ Duplicate: "${n}" had ${c} responses — kept most recent`);
    }
  }

  const client = await pool.connect();
  const unmatched = [];
  let skillsInserted = 0, empSkillsInserted = 0, certsInserted = 0;

  try {
    await client.query('BEGIN');

    // 3. Load existing users from DB (for name matching)
    const usersRes = await client.query(`
      SELECT u.id as user_id, u.name, e.id as emp_id
      FROM users u
      JOIN employees e ON e.user_id = u.id
    `);

    // Build lookup: lowercase name → { user_id, emp_id }
    const userMap = {};
    for (const u of usersRes.rows) {
      userMap[u.name.toLowerCase().trim()] = u;
    }

    // 4. Process each person
    for (const [name, row] of deduped.entries()) {
      // Try to match to existing user by name
      let matched = userMap[name.toLowerCase()];

      // Fuzzy: try first name only if full name fails
      if (!matched) {
        const firstName = name.split(' ')[0].toLowerCase();
        matched = Object.values(userMap).find(u =>
          u.name.toLowerCase().startsWith(firstName)
        );
        if (matched) {
          console.log(`  ~ Fuzzy match: "${name}" → "${matched.name}"`);
        }
      }

      const empType    = String(row[' Are you currently an employee or an intern?'] || '').trim();
      const desig      = String(row['What is your current Designation?'] || '').trim();
      const avail      = String(row['Current Availability'] || '').trim();
      const primSkills = String(row['Primary Technical Skills?'] || '');
      const languages  = String(row['Programming Languages Known?'] || '');
      const databases  = String(row['Database Knowledge'] || '');
      const certs      = String(row['Courses or Certifications Completed'] || '');

      if (!matched) {
        unmatched.push({ name, empType, desig, avail: availabilityNote(avail) });
        console.log(`  ✗ No DB match for: "${name}" (${empType} — ${desig}) — will need manual email entry`);
        continue;
      }

      const empId = matched.emp_id;
      console.log(`\n  ✓ ${name.padEnd(28)} | ${avail}`);

      // 5. Build skill list (primary + languages + databases)
      const skillSet = new Set([
        ...parseSkills(primSkills),
        ...parseSkills(languages),
        ...parseSkills(databases),
      ]);

      for (const skillName of skillSet) {
        // Upsert into skills table
        const category = SKILL_CATEGORY[skillName] || 'General';
        const skillRes = await client.query(
          `INSERT INTO skills (name, category)
           VALUES ($1, $2)
           ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category
           RETURNING id`,
          [skillName, category]
        );
        const skillId = skillRes.rows[0].id;

        // Is this a primary skill? level 3; else level 2
        const isPrimary = parseSkills(primSkills).includes(skillName);
        const level     = isPrimary ? 3 : 2;

        await client.query(
          `INSERT INTO employee_skills (employee_id, skill_id, level, years)
           VALUES ($1, $2, $3, NULL)
           ON CONFLICT (employee_id, skill_id) DO UPDATE SET level = EXCLUDED.level`,
          [empId, skillId, level]
        );

        console.log(`     + ${skillName.padEnd(22)} (${category}, level ${level})`);
        skillsInserted++;
        empSkillsInserted++;
      }

      // 6. Insert certifications
      if (certs && certs.trim()) {
        const certLines = certs.split('\n').filter(c => c.trim().length > 3);
        for (const certTitle of certLines) {
          await client.query(
            `INSERT INTO certificates (employee_id, title, status)
             VALUES ($1, $2, 'self_reported')
             ON CONFLICT DO NOTHING`,
            [empId, certTitle.trim().substring(0, 200)]
          );
          certsInserted++;
        }
        console.log(`     📜 ${certLines.length} certificate(s) added`);
      }
    }

    await client.query('COMMIT');

    // 7. Summary
    console.log('\n══════════════════════════════════════════');
    console.log('🎉 Skills import complete!');
    console.log(`   Skills inserted/updated : ${skillsInserted}`);
    console.log(`   Employee-skill links     : ${empSkillsInserted}`);
    console.log(`   Certificates added       : ${certsInserted}`);

    if (unmatched.length > 0) {
      console.log(`\n⚠️  ${unmatched.length} people NOT matched to DB (add their emails first):`);
      for (const u of unmatched) {
        console.log(`   • ${u.name.padEnd(28)} | ${u.empType} | ${u.avail}`);
      }
      console.log('\n  → Run seed_test_users.js first OR add them via import_resources.js');
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n✗ Import failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

importSkills();