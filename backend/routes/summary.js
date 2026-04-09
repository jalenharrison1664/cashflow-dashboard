const express = require('express');
const { getSummary } = require('../controllers/summaryController');

const router = express.Router();

// GET /api/summary
router.get('/', getSummary);

module.exports = router;
