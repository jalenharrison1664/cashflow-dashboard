const { computeStructuredInsights } = require('../services/insightsService');
const { generateAIInsights } = require('../services/aiService');

const getStructuredInsights = async (req, res, next) => {
  try {
    const insights = await computeStructuredInsights();
    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
};

const getAIInsights = async (req, res, next) => {
  try {
    const structured = await computeStructuredInsights();
    const aiResponse = await generateAIInsights(structured);
    res.json({ success: true, data: aiResponse });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStructuredInsights, getAIInsights };
