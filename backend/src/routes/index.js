const router = require('express').Router();

// ── Home ────────────────────────────────────────────────────
// Matches the existing FastAPI GET / endpoint exactly
router.get('/', (req, res) => {
  res.json({
    message: 'BMC Resource Planning API is running',
    version: '1.0.0',
  });
});

// ── Health check ────────────────────────────────────────────
// Matches the existing FastAPI GET /health endpoint exactly
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BMC Resource Planning API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

// ── Future API routes ────────────────────────────────────────
// Uncomment as they are built.
//
// const authRoutes        = require('./auth');        // login, JWT, roles
// const projectRoutes     = require('./projects');    // projects, allocations
// const employeeRoutes    = require('./employees');   // availability, matching
// const dashboardRoutes   = require('./dashboard');   // owner & manager views
// const hrRoutes          = require('./hr');          // HR & resource requests
// const taskRoutes        = require('./tasks');       // tasks, timesheets, jobs
//
// router.use('/api/auth',        authRoutes);
// router.use('/api/projects',    projectRoutes);
// router.use('/api/employees',   employeeRoutes);
// router.use('/api/dashboard',   dashboardRoutes);
// router.use('/api/hr',          hrRoutes);
// router.use('/api/tasks',       taskRoutes);

module.exports = router;
