const pool = require('../config/db');

/**
 * Compute structured financial insights from raw transaction data.
 * This structured object is later sent to Gemini for natural language generation.
 */
const computeStructuredInsights = async () => {
  // Weekly comparison: this week vs last week
  const weeklyResult = await pool.query(`
    SELECT
      SUM(CASE WHEN date >= NOW() - INTERVAL '7 days'  THEN income   ELSE 0 END) AS curr_week_revenue,
      SUM(CASE WHEN date >= NOW() - INTERVAL '7 days'  THEN expenses ELSE 0 END) AS curr_week_expenses,
      SUM(CASE WHEN date BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days' THEN income   ELSE 0 END) AS prev_week_revenue,
      SUM(CASE WHEN date BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days' THEN expenses ELSE 0 END) AS prev_week_expenses
    FROM transactions
  `);

  // Monthly totals
  const monthlyResult = await pool.query(`
    SELECT
      SUM(CASE WHEN date >= NOW() - INTERVAL '30 days' THEN income   ELSE 0 END) AS curr_month_revenue,
      SUM(CASE WHEN date >= NOW() - INTERVAL '30 days' THEN expenses ELSE 0 END) AS curr_month_expenses,
      COALESCE(SUM(net), 0) AS total_net
    FROM transactions
  `);

  // Avg daily expense & runway
  const avgResult = await pool.query(`
    SELECT COALESCE(AVG(daily_exp), 0) AS avg_daily_expense
    FROM (
      SELECT date, SUM(expenses) AS daily_exp
      FROM transactions
      WHERE date >= NOW() - INTERVAL '30 days'
      GROUP BY date
    ) sub
  `);

  // Detect expense spikes: days where expenses > 2x the 30-day average
  const spikesResult = await pool.query(`
    WITH avg_exp AS (
      SELECT AVG(daily_exp) AS avg_val
      FROM (SELECT date, SUM(expenses) AS daily_exp FROM transactions GROUP BY date) s
    )
    SELECT t.date, SUM(t.expenses) AS daily_expenses
    FROM transactions t, avg_exp
    WHERE t.date >= NOW() - INTERVAL '30 days'
    GROUP BY t.date, avg_exp.avg_val
    HAVING SUM(t.expenses) > avg_exp.avg_val * 2
    ORDER BY t.date DESC
    LIMIT 5
  `);

  // Revenue trend: slope direction over last 14 days
  const trendResult = await pool.query(`
    SELECT date, SUM(income) AS daily_income
    FROM transactions
    WHERE date >= NOW() - INTERVAL '14 days'
    GROUP BY date
    ORDER BY date ASC
  `);

  const w = weeklyResult.rows[0];
  const m = monthlyResult.rows[0];
  const avgDaily = parseFloat(avgResult.rows[0].avg_daily_expense) || 0;
  const totalNet = parseFloat(m.total_net);
  const runway = avgDaily > 0 ? Math.max(0, Math.floor(totalNet / avgDaily)) : null;

  const pct = (curr, prev) => {
    if (parseFloat(prev) === 0) return 0;
    return parseFloat(((curr - prev) / Math.abs(prev)) * 100).toFixed(1);
  };

  const revenueTrend = computeTrendDirection(trendResult.rows.map((r) => parseFloat(r.daily_income)));

  return {
    weekly: {
      revenueChange: pct(w.curr_week_revenue, w.prev_week_revenue),
      expensesChange: pct(w.curr_week_expenses, w.prev_week_expenses),
      currRevenue: parseFloat(w.curr_week_revenue),
      currExpenses: parseFloat(w.curr_week_expenses),
    },
    monthly: {
      revenue: parseFloat(m.curr_month_revenue),
      expenses: parseFloat(m.curr_month_expenses),
      net: totalNet,
    },
    cashRunway: runway,
    avgDailyExpense: avgDaily,
    revenueTrend,
    expenseSpikes: spikesResult.rows.map((r) => ({
      date: r.date,
      amount: parseFloat(r.daily_expenses),
    })),
    isNegativeCashFlow: totalNet < 0,
  };
};

/**
 * Returns 'increasing', 'decreasing', or 'stable' based on a simple linear slope.
 */
const computeTrendDirection = (values) => {
  if (values.length < 2) return 'stable';
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
  if (slope > 50) return 'increasing';
  if (slope < -50) return 'decreasing';
  return 'stable';
};

module.exports = { computeStructuredInsights };
