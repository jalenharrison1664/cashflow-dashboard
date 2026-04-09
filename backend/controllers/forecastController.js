const { computeForecast } = require('../services/forecastService');

const getForecast = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const forecast = await computeForecast(days);
    res.json({ success: true, data: forecast });
  } catch (err) {
    next(err);
  }
};

module.exports = { getForecast };
