const fs = require('fs');
const { parseCSV } = require('../utils/csvParser');
const { insertTransactions } = require('../services/transactionService');
const { createError } = require('../middleware/errorHandler');

const uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) throw createError('No file uploaded', 400);

    const filePath = req.file.path;
    const rows = await parseCSV(filePath);

    if (rows.length === 0) throw createError('CSV file is empty or has no valid rows', 400);

    const inserted = await insertTransactions(rows);

    // Clean up uploaded file after processing
    fs.unlink(filePath, () => {});

    res.status(201).json({
      success: true,
      message: `${inserted} transaction(s) imported successfully`,
      count: inserted,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadCSV };
