const express = require('express');
const { getStructuredInsights, getAIInsights } = require('../controllers/insightsController');

const router = express.Router();

// GET /api/insights  → structured computed insights (no AI)
router.get('/', getStructuredInsights);

// GET /api/insights/ai  → Gemini-powered natural language insights
router.get('/ai', getAIInsights);

module.exports = router;
