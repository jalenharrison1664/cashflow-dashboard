const { computeSummary } = require('../services/summaryService');

const getSummary = async (req, res, next) => {
  try {
    const summary = await computeSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
