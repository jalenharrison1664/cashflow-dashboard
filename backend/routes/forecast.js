const express = require('express');
const { query } = require('express-validator');
const { getForecast } = require('../controllers/forecastController');
const { validate } = require('../middleware/validate');

const router = express.Router();

// GET /api/forecast?days=30
router.get(
  '/',
  [query('days').optional().isInt({ min: 7, max: 90 }).withMessage('days must be between 7 and 90')],
  validate,
  getForecast
);

module.exports = router;
