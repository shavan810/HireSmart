const escapeRegex = (str = '') => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accepts an array or a delimited string and returns a clean, de-duplicated array.
const toList = (value, separator = ',') => {
  if (value === undefined || value === null) return [];
  const arr = Array.isArray(value) ? value : String(value).split(separator);
  return [...new Set(arr.map((v) => String(v).trim()).filter(Boolean))];
};

const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

// First day of the month, `months - 1` months ago (inclusive window of `months` months).
const sinceMonths = (months = 6) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
};

// Turns aggregation rows ({ _id: { y, m }, count }) into a gap-free series for charts.
const monthSeries = (rows, months = 6) => {
  const now = new Date();
  const out = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const found = rows.find((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1);
    out.push({ label: d.toLocaleString('en-US', { month: 'short' }), value: found ? found.count : 0 });
  }
  return out;
};

const groupByMonth = (dateField) => ({
  _id: { y: { $year: `$${dateField}` }, m: { $month: `$${dateField}` } },
  count: { $sum: 1 },
});

module.exports = { escapeRegex, toList, pick, sinceMonths, monthSeries, groupByMonth };
