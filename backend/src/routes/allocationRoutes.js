const express = require('express');
const router = express.Router();
const { getAllocations, createAllocation, deleteAllocation } = require('../controllers/allocationController');

router.get('/', getAllocations);
router.post('/', createAllocation);
router.delete('/:id', deleteAllocation);

module.exports = router;
