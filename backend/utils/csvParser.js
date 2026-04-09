const fs = require('fs');
const { parse } = require('csv-parse');
const { createError } = require('../middleware/errorHandler');

const REQUIRED_COLUMNS = ['date', 'income', 'expenses'];

/**
 * Parse a CSV file and return an array of validated transaction objects.
 * Expected columns: date, income, expenses
 * @param {string} filePath - absolute path to the uploaded CSV
 * @returns {Promise<Array<{date, income, expenses}>>}
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true,          // first row as headers
          skip_empty_lines: true,
          trim: true,
        })
      )
      .on('headers', (headers) => {
        const lower = headers.map((h) => h.toLowerCase());
        const missing = REQUIRED_COLUMNS.filter((col) => !lower.includes(col));
        if (missing.length > 0) {
          reject(createError(`CSV missing required columns: ${missing.join(', ')}`, 400));
        }
      })
      .on('data', (row) => {
        const normalized = normalizeKeys(row);
        const parsed = validateRow(normalized);
        if (parsed) results.push(parsed);
      })
      .on('error', (err) => reject(createError(`CSV parse error: ${err.message}`, 400)))
      .on('end', () => resolve(results));
  });
};

/**
 * Lowercase all object keys for case-insensitive column matching.
 */
const normalizeKeys = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase().trim(), v]));

/**
 * Validate and sanitize a single CSV row.
 * Returns null if the row is invalid (to skip silently).
 */
const validateRow = (row) => {
  const date = new Date(row.date);
  if (isNaN(date.getTime())) return null;

  const income = parseFloat(row.income);
  const expenses = parseFloat(row.expenses);
  if (isNaN(income) || isNaN(expenses)) return null;

  return {
    date: date.toISOString().split('T')[0], // normalize to YYYY-MM-DD
    income: Math.max(0, income),
    expenses: Math.max(0, expenses),
  };
};

module.exports = { parseCSV };
