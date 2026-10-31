// ─────────────────────────────────────────────────────────────────────────────
// PRD §4.3  MG-4  → Tasks: title, owner, estimate(hrs), start, due, status
// PRD §4.4  EM-2  → Time entries: hours, note ≥10 chars, source='app'
// PRD §10.2       → note ≥10 chars, hours ≤12, max 2 days back
//
// Depends on:
//   • seed_test_users.js          → test employees exist
//   • seed_from_form.js           → real employees exist
//   • seed_projects_and_allocations.js → projects exist in DB
//
// Run: node src/db/seeds/seed_sample_data.js
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { pool } = require('../../config/database');

// ── helpers ───────────────────────────────────────────────────────────────────
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};
const today    = daysAgo(0);
const day1ago  = daysAgo(1);
const day2ago  = daysAgo(2);
const day7ago  = daysAgo(7);
const day30ago = daysAgo(30);
const inDays   = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

async function run() {
  const client = await pool.connect();
  const report = { tasks: 0, timeEntries: 0 };

  try {
    await client.query('BEGIN');

    // ── 1. Get the manager employee id (Test Manager) ─────────────────────────
    const mgrRes = await client.query(
      `SELECT e.id AS eid, u.id AS uid, u.name
       FROM employees e JOIN users u ON u.id = e.user_id
       WHERE u.email = 'manager@test.com' LIMIT 1`
    );
    if (mgrRes.rows.length === 0) {
      throw new Error('Test Manager not found — run seed_test_users.js first');
    }
    const mgr = mgrRes.rows[0];

    // ── 2. Get the employee id (Test Employee) ────────────────────────────────
    const empRes = await client.query(
      `SELECT e.id AS eid, u.id AS uid, u.name
       FROM employees e JOIN users u ON u.id = e.user_id
       WHERE u.email = 'employee@test.com' LIMIT 1`
    );
    if (empRes.rows.length === 0) {
      throw new Error('Test Employee not found — run seed_test_users.js first');
    }
    const emp = empRes.rows[0];

    // ── 3. Pick 2 projects from DB ────────────────────────────────────────────
    const projRes = await client.query(
      `SELECT id, name FROM projects
       WHERE name IN ('BMC Control-M', 'ElliotAI')
       ORDER BY name`
    );
    if (projRes.rows.length === 0) {
      throw new Error('Projects not found — run seed_projects_and_allocations.js first');
    }
    const projects = projRes.rows;

    console.log('\n── Seeding sample tasks + time entries ─────────────────────');
    console.log(`  Manager    : ${mgr.name}`);
    console.log(`  Employee   : ${emp.name}`);
    console.log(`  Projects   : ${projects.map(p => p.name).join(', ')}\n`);

    // ── 4. Task templates (2 projects × 3 tasks each) ─────────────────────────
    const taskTemplates = {
      'BMC Control-M': [
        {
          title:        'Set up Control-M job monitoring alerts',
          estimate_hrs: 8,
          status:       'done',
          start_date:   day30ago,
          due_date:     day7ago,
          assignee:     emp.eid,
          entries: [
            { date: daysAgo(8), hours: 4.0, note: 'Configured alert thresholds for critical jobs' },
            { date: daysAgo(7), hours: 3.5, note: 'Tested alert pipeline end to end successfully' },
          ]
        },
        {
          title:        'Write migration runbook for Control-M v21 upgrade',
          estimate_hrs: 16,
          status:       'in_progress',
          start_date:   day7ago,
          due_date:     inDays(7),
          assignee:     emp.eid,
          entries: [
            { date: day2ago, hours: 5.0, note: 'Drafted pre-migration checklist and rollback plan' },
            { date: day1ago, hours: 4.5, note: 'Reviewed runbook with team, incorporated feedback' },
            { date: today,   hours: 3.0, note: 'Adding job dependency diagrams to runbook document' },
          ]
        },
        {
          title:        'Fix scheduler lag on batch job queue',
          estimate_hrs: 6,
          status:       'blocked',
          start_date:   day7ago,
          due_date:     inDays(3),
          assignee:     emp.eid,
          blocked_reason: 'Waiting on access to production Control-M server',
          blocked_by_id:  null,
          entries: [
            { date: day2ago, hours: 2.0, note: 'Reproduced lag issue in staging environment' },
          ]
        },
      ],
      'ElliotAI': [
        {
          title:        'Integrate OpenAI embeddings for skill matching',
          estimate_hrs: 12,
          status:       'done',
          start_date:   day30ago,
          due_date:     day7ago,
          assignee:     emp.eid,
          entries: [
            { date: daysAgo(10), hours: 6.0, note: 'Built embedding pipeline using OpenAI text-ada-002' },
            { date: daysAgo(9),  hours: 5.0, note: 'Integrated cosine similarity scoring for skill search' },
          ]
        },
        {
          title:        'Build REST endpoint for candidate skill scoring',
          estimate_hrs: 10,
          status:       'in_progress',
          start_date:   day7ago,
          due_date:     inDays(5),
          assignee:     emp.eid,
          entries: [
            { date: day1ago, hours: 4.0, note: 'Drafted POST /api/skills/score with input validation' },
            { date: today,   hours: 3.5, note: 'Writing unit tests for scoring logic edge cases' },
          ]
        },
        {
          title:        'Evaluate LLM prompt for resource recommendation',
          estimate_hrs: 8,
          status:       'todo',
          start_date:   inDays(1),
          due_date:     inDays(8),
          assignee:     emp.eid,
          entries: [] // not started
        },
      ],
    };

    // ── 5. Also ensure allocations exist for test employee on these projects ───
    for (const proj of projects) {
      await client.query(
        `INSERT INTO allocations
           (employee_id, project_id, role, percent, from_date, to_date, kind)
         VALUES ($1, $2, 'Developer', 60, $3, $4, 'planned')
         ON CONFLICT DO NOTHING`,
        [emp.eid, proj.id, day30ago, inDays(90)]
      );
      // Also add the manager
      await client.query(
        `INSERT INTO allocations
           (employee_id, project_id, role, percent, from_date, to_date, kind)
         VALUES ($1, $2, 'Project Manager', 40, $3, $4, 'planned')
         ON CONFLICT DO NOTHING`,
        [mgr.eid, proj.id, day30ago, inDays(90)]
      );
    }

    // ── 6. Insert tasks + time entries ────────────────────────────────────────
    for (const proj of projects) {
      const templates = taskTemplates[proj.name] || [];
      console.log(`\n── ${proj.name} (${templates.length} tasks):`);

      for (const t of templates) {
        // Insert task
        const taskRes = await client.query(
          `INSERT INTO tasks
             (project_id, title, assignee_id, estimate_hrs, start_date, due_date,
              status, blocked_reason, blocked_by_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id`,
          [
            proj.id,
            t.title,
            t.assignee,
            t.estimate_hrs,
            t.start_date,
            t.due_date,
            t.status,
            t.blocked_reason || null,
            t.blocked_by_id  || null,
          ]
        );
        const taskId = taskRes.rows[0].id;
        report.tasks++;

        const statusIcon =
          t.status === 'done'        ? '✓' :
          t.status === 'in_progress' ? '→' :
          t.status === 'blocked'     ? '⚠' : '○';

        console.log(`  ${statusIcon} [${t.status.padEnd(11)}] ${t.title.substring(0, 50)}`);

        // Insert time entries for this task
        for (const e of t.entries) {
          await client.query(
            `INSERT INTO time_entries
               (task_id, employee_id, work_date, hours, note, source)
             VALUES ($1, $2, $3, $4, $5, 'app')`,
            [taskId, emp.eid, e.date, e.hours, e.note]
          );
          report.timeEntries++;
          console.log(`      ⏱  ${e.date}  ${e.hours}h  — ${e.note.substring(0, 45)}...`);
        }
      }
    }

    // ── 7. Seed timesheet_weeks (for the last 2 weeks) ────────────────────────
    // Week starting Monday (2 weeks ago)
    const getMonday = (offsetWeeks = 0) => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      d.setDate(diff - (offsetWeeks * 7));
      return d.toISOString().split('T')[0];
    };
    const lastWeek    = getMonday(1);
    const currentWeek = getMonday(0);

    for (const weekStart of [lastWeek, currentWeek]) {
      const status = weekStart === lastWeek ? 'approved' : 'draft';
      await client.query(
        `INSERT INTO timesheet_weeks (employee_id, week_start, status, approved_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (employee_id, week_start) DO NOTHING`,
        [emp.eid, weekStart, status, status === 'approved' ? mgr.uid : null]
      );
      console.log(`\n  📅 Timesheet week ${weekStart} → ${status}`);
    }

    await client.query('COMMIT');

    // ── Summary ────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════');
    console.log('🎉  Sample data seeded!');
    console.log(`   Tasks created        : ${report.tasks}`);
    console.log(`   Time entries created : ${report.timeEntries}`);
    console.log('\n  Other can now build dashboards against real rows.');
    console.log('  Test as employee@test.com — tasks, timesheets, allocations all set.\n');

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