/**
 * Format a number as USD currency string.
 */
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

/**
 * Format a decimal as a percentage string with sign.
 */
const formatPercent = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${parseFloat(value).toFixed(1)}%`;
};

/**
 * Add N calendar days to a Date object and return a new Date.
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

module.exports = { formatCurrency, formatPercent, addDays };
