const pool = require('../config/db');

/**
 * Compute a cash flow forecast using linear regression on historical daily net values.
 * Falls back to moving average if insufficient data.
 * @param {number} days - number of future days to forecast
 */
const computeForecast = async (days = 30) => {
  const { rows } = await pool.query(`
    SELECT date, SUM(income) AS income, SUM(expenses) AS expenses, SUM(net) AS net
    FROM transactions
    WHERE date >= NOW() - INTERVAL '90 days'
    GROUP BY date
    ORDER BY date ASC
  `);

  if (rows.length < 3) {
    return { forecast: [], method: 'insufficient_data', message: 'Upload more data for forecasting' };
  }

  const historicalNet = rows.map((r) => parseFloat(r.net));
  const historicalIncome = rows.map((r) => parseFloat(r.income));
  const historicalExpenses = rows.map((r) => parseFloat(r.expenses));

  const method = rows.length >= 14 ? 'linear_regression' : 'moving_average';

  let forecastNet, forecastIncome, forecastExpenses;

  if (method === 'linear_regression') {
    forecastNet = linearRegressionForecast(historicalNet, days);
    forecastIncome = linearRegressionForecast(historicalIncome, days);
    forecastExpenses = linearRegressionForecast(historicalExpenses, days);
  } else {
    forecastNet = movingAverageForecast(historicalNet, days);
    forecastIncome = movingAverageForecast(historicalIncome, days);
    forecastExpenses = movingAverageForecast(historicalExpenses, days);
  }

  const lastDate = new Date(rows[rows.length - 1].date);

  const forecast = forecastNet.map((netVal, i) => {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i + 1);
    return {
      date: forecastDate.toISOString().split('T')[0],
      income: Math.max(0, parseFloat(forecastIncome[i].toFixed(2))),
      expenses: Math.max(0, parseFloat(forecastExpenses[i].toFixed(2))),
      net: parseFloat(netVal.toFixed(2)),
      predicted: true,
    };
  });

  return { forecast, method, historicalDays: rows.length };
};

/**
 * Simple linear regression: fit a line on historical values, then project forward.
 */
const linearRegressionForecast = (values, forecastDays) => {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  values.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });

  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;

  return Array.from({ length: forecastDays }, (_, i) => slope * (n + i) + intercept);
};

/**
 * Simple moving average using the last 7 values.
 */
const movingAverageForecast = (values, forecastDays, window = 7) => {
  const recent = values.slice(-window);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  return Array.from({ length: forecastDays }, () => avg);
};

module.exports = { computeForecast };
