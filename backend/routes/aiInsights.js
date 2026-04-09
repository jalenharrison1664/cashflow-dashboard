const express = require('express');
const { getAIInsights } = require('../controllers/insightsController');

const router = express.Router();

// GET /api/ai-insights
router.get('/', getAIInsights);

module.exports = router;
