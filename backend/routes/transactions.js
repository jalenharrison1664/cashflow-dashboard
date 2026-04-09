const express = require('express');
const { query } = require('express-validator');
const { getTransactions } = require('../controllers/transactionController');
const { validate } = require('../middleware/validate');

const router = express.Router();

// GET /api/transactions?limit=100&offset=0&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('limit must be 1–1000'),
    query('offset').optional().isInt({ min: 0 }).withMessage('offset must be >= 0'),
    query('start').optional().isDate().withMessage('start must be a valid date'),
    query('end').optional().isDate().withMessage('end must be a valid date'),
  ],
  validate,
  getTransactions
);

module.exports = router;
