const pool = require('../config/db');

/**
 * Bulk insert parsed CSV rows into the transactions table.
 * @param {Array<{date, income, expenses}>} rows
 * @returns {number} count of inserted rows
 */
const insertTransactions = async (rows) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let count = 0;
    for (const row of rows) {
      await client.query(
        `INSERT INTO transactions (date, income, expenses, source)
         VALUES ($1, $2, $3, 'csv_upload')`,
        [row.date, row.income, row.expenses]
      );
      count++;
    }

    await client.query('COMMIT');
    return count;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Fetch transactions with optional date range and pagination.
 */
const fetchTransactions = async ({ limit = 200, offset = 0, start, end } = {}) => {
  let query = `SELECT id, date, income, expenses, net, created_at FROM transactions`;
  const params = [];

  if (start && end) {
    params.push(start, end);
    query += ` WHERE date BETWEEN $1 AND $2`;
  } else if (start) {
    params.push(start);
    query += ` WHERE date >= $1`;
  } else if (end) {
    params.push(end);
    query += ` WHERE date <= $1`;
  }

  query += ` ORDER BY date ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  return rows;
};

/**
 * Fetch the last N days of daily aggregated data.
 */
const fetchRecentDays = async (days = 60) => {
  const { rows } = await pool.query(
    `SELECT date, SUM(income) AS income, SUM(expenses) AS expenses, SUM(net) AS net
     FROM transactions
     WHERE date >= NOW() - INTERVAL '${days} days'
     GROUP BY date
     ORDER BY date ASC`
  );
  return rows;
};

module.exports = { insertTransactions, fetchTransactions, fetchRecentDays };
