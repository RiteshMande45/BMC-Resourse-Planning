// ─────────────────────────────────────────────────────────────
// update_emails.js
// Reads real emails directly from the skills form xlsx
// and updates placeholder emails in the DB automatically.
//
// Run: node src/db/seeds/update_emails.js
// ─────────────────────────────────────────────────────────────
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const XLSX     = require('xlsx');
const { pool } = require('../../config/database');

const XLSX_PATH = 'C:\\Users\\abhij\\OneDrive\\Desktop\\skills_form.xlsx';

async function run() {
  // 1. Read the file
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

  // 2. Extract name + email pairs from sheet
  const people = [];
  for (const row of rows) {
    const name  = String(row['Full Name']      || '').trim();
    const email = String(row['Email Address']  || '').trim().toLowerCase();
    if (name && email) {
      people.push({ name, email });
    }
  }

  console.log(`\n✓ Found ${people.length} people with emails in the sheet`);

  if (people.length === 0) {
    console.log('⚠ No emails found in sheet!');
    console.log('  Make sure "Email Address" column has values in the xlsx file');
    process.exit(0);
  }

  // 3. Update DB
  const client = await pool.connect();
  let updated = 0, skipped = 0, notFound = 0;

  try {
    await client.query('BEGIN');

    for (const { name, email } of people) {
      const res = await client.query(
        `UPDATE users
         SET email = $1, updated_at = NOW()
         WHERE name = $2
         RETURNING id, name, email`,
        [email, name]
      );

      if (res.rows.length > 0) {
        console.log(`  ✓ ${name.padEnd(28)} → ${email}`);
        updated++;
      } else {
        console.log(`  ✗ Not found in DB: "${name}"`);
        notFound++;
      }
    }

    await client.query('COMMIT');
    console.log(`\n🎉 Done!`);
    console.log(`   Updated  : ${updated}`);
    console.log(`   Not found: ${notFound}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();