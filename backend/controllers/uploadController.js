const fs = require('fs');
const { parseCSV } = require('../utils/csvParser');
const { insertTransactions } = require('../services/transactionService');
const { createError } = require('../middleware/errorHandler');

const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) throw createError('No file uploaded', 400);

    const filePath = req.file.path;
    console.log(`[Upload] Received: ${req.file.originalname} (${req.file.size} bytes)`);

    const rows = await parseCSV(filePath);

    if (rows.length === 0) {
      fs.unlink(filePath, () => {});
      throw createError('CSV has no valid rows. Ensure date is YYYY-MM-DD and income/expenses are numbers.', 400);
    }

    console.log(`[Upload] Inserting ${rows.length} rows into database...`);
    const inserted = await insertTransactions(rows);
    console.log(`[Upload] ✅ ${inserted} transaction(s) saved.`);

    // Clean up uploaded file after processing
    fs.unlink(filePath, () => {});

    res.status(201).json({
      success: true,
      message: `${inserted} transaction(s) imported successfully`,
      count: inserted,
    });
  } catch (err) {
    console.error('[Upload] ❌ Error:', err.message);
    next(err);
  }
};

module.exports = { uploadCSV };
