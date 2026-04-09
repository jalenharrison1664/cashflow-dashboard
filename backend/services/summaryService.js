const pool = require('../config/db');

/**
 * Compute high-level financial KPIs from all stored transactions.
 */
const computeSummary = async () => {
  // Totals
  const totalsResult = await pool.query(`
    SELECT
      COALESCE(SUM(income), 0)   AS total_revenue,
      COALESCE(SUM(expenses), 0) AS total_expenses,
      COALESCE(SUM(net), 0)      AS net_cash_flow
    FROM transactions
  `);

  // Period comparison: current 30 days vs previous 30 days
  const periodResult = await pool.query(`
    SELECT
      SUM(CASE WHEN date >= NOW() - INTERVAL '30 days' THEN income   ELSE 0 END) AS curr_revenue,
      SUM(CASE WHEN date >= NOW() - INTERVAL '30 days' THEN expenses ELSE 0 END) AS curr_expenses,
      SUM(CASE WHEN date BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days' THEN income   ELSE 0 END) AS prev_revenue,
      SUM(CASE WHEN date BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days' THEN expenses ELSE 0 END) AS prev_expenses
    FROM transactions
  `);

  // Average daily expense for runway calculation
  const avgResult = await pool.query(`
    SELECT COALESCE(AVG(daily_exp), 0) AS avg_daily_expense
    FROM (
      SELECT date, SUM(expenses) AS daily_exp
      FROM transactions
      WHERE date >= NOW() - INTERVAL '30 days'
      GROUP BY date
    ) sub
  `);

  const totals = totalsResult.rows[0];
  const period = periodResult.rows[0];
  const avgDaily = parseFloat(avgResult.rows[0].avg_daily_expense) || 0;
  const currentBalance = parseFloat(totals.net_cash_flow);

  const runway = avgDaily > 0 ? Math.max(0, Math.floor(currentBalance / avgDaily)) : null;

  const pctChange = (curr, prev) => {
    if (parseFloat(prev) === 0) return null;
    return parseFloat(((curr - prev) / Math.abs(prev)) * 100).toFixed(1);
  };

  return {
    totalRevenue: parseFloat(totals.total_revenue),
    totalExpenses: parseFloat(totals.total_expenses),
    netCashFlow: parseFloat(totals.net_cash_flow),
    cashRunway: runway,
    avgDailyExpense: avgDaily,
    periodComparison: {
      revenueChange: pctChange(period.curr_revenue, period.prev_revenue),
      expensesChange: pctChange(period.curr_expenses, period.prev_expenses),
    },
  };
};

module.exports = { computeSummary };
