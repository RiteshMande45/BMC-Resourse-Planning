const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/login', authController.login);

router.get('/dashboard/owner', authenticateToken, authorizeRoles('Owner'), (req, res) => {
  res.json({ message: 'Owner Portfolio Overview', user: req.user });
});

router.get('/dashboard/manager', authenticateToken, authorizeRoles('Manager', 'Manager / Team Lead'), (req, res) => {
  res.json({ message: 'Manager Plan & Allocate Dashboard', user: req.user });
});

router.get('/dashboard/employee', authenticateToken, authorizeRoles('Employee'), (req, res) => {
  res.json({ message: 'Employee My Work & Tasks Dashboard', user: req.user });
});

router.get('/dashboard/sales', authenticateToken, authorizeRoles('Sales'), (req, res) => {
  res.json({ message: 'Sales Projects & Revenue Dashboard', user: req.user });
});

router.get('/dashboard/hr', authenticateToken, authorizeRoles('HR'), (req, res) => {
  res.json({ message: 'HR People & Leave Management Dashboard', user: req.user });
});

module.exports = router;
