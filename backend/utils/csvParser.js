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
    let skipped = 0;
    let settled = false;

    const parser = parse({
      columns: true,          // first row as headers
      skip_empty_lines: true,
      trim: true,
    });

    const safeReject = (err) => {
      if (settled) return;
      settled = true;
      parser.destroy();
      reject(err);
    };

    fs.createReadStream(filePath)
      .pipe(parser)
      .on('headers', (headers) => {
        const lower = headers.map((h) => h.toLowerCase());
        const missing = REQUIRED_COLUMNS.filter((col) => !lower.includes(col));
        if (missing.length > 0) {
          safeReject(createError(`CSV missing required columns: ${missing.join(', ')}. Got: ${headers.join(', ')}`, 400));
        }
      })
      .on('data', (row) => {
        const normalized = normalizeKeys(row);
        const parsed = validateRow(normalized);
        if (parsed) {
          results.push(parsed);
        } else {
          skipped++;
        }
      })
      .on('error', (err) => safeReject(createError(`CSV parse error: ${err.message}`, 400)))
      .on('end', () => {
        if (settled) return;
        settled = true;
        if (skipped > 0) {
          console.warn(`[CSV] Skipped ${skipped} invalid row(s) (bad date or non-numeric values).`);
        }
        console.log(`[CSV] Parsed ${results.length} valid row(s).`);
        resolve(results);
      });
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
