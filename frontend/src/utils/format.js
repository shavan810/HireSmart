export const formatSalary = (job) => {
  const { salaryMin: min, salaryMax: max, currency = 'INR' } = job || {};
  if (!min && !max) return 'Not disclosed';
  const fmt = (n) => {
    if (currency === 'INR') {
      if (n >= 10000000) return `${+(n / 10000000).toFixed(1)}Cr`;
      if (n >= 100000) return `${+(n / 100000).toFixed(1)}L`;
      return `${Math.round(n / 1000)}K`;
    }
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  };
  const symbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] || '';
  if (min && max) return `${symbol}${fmt(min)} - ${symbol}${fmt(max)} / yr`;
  return `${symbol}${fmt(min || max)}${min ? '+' : ''} / yr`;
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const steps = [
    [60, 'minute'],
    [3600, 'hour'],
    [86400, 'day'],
    [604800, 'week'],
    [2629800, 'month'],
    [31557600, 'year'],
  ];
  let unit = steps[0];
  for (const s of steps) if (seconds >= s[0]) unit = s;
  const value = Math.floor(seconds / unit[0]);
  return `${value} ${unit[1]}${value > 1 ? 's' : ''} ago`;
};

export const formatDate = (date, withTime = false) =>
  date
    ? new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
      })
    : '-';

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';

// Pulls the most useful message out of an Axios error.
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || (err?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check your connection.' : err?.message) || fallback;

// Maps API field errors ({ field, message }[]) to { field: message }.
export const getFieldErrors = (err) =>
  (err?.response?.data?.errors || []).reduce((acc, e) => {
    if (e.field && !acc[e.field]) acc[e.field] = e.message;
    return acc;
  }, {});

export const emailRegex = /^\S+@\S+\.\S+$/;
