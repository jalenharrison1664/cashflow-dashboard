const { fetchTransactions } = require('../services/transactionService');

const getTransactions = async (req, res, next) => {
  try {
    const { limit = 200, offset = 0, start, end } = req.query;
    const data = await fetchTransactions({ limit: Number(limit), offset: Number(offset), start, end });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions };
