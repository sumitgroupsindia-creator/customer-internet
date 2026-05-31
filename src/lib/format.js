/**
 * Sumit Net — front-end formatting helpers
 */

export const formatINR = (n) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Days remaining until `expiry` (positive = future, 0 = today, negative = past). */
export const daysLeft = (expiry) => {
  if (!expiry) return null;
  const ms = new Date(expiry).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

/** Returns severity bucket for given days-left number. */
export const expirySeverity = (days) => {
  if (days === null || days === undefined) return 'unknown';
  if (days < 0) return 'expired';
  if (days <= 2) return 'critical';
  if (days <= 7) return 'warning';
  return 'healthy';
};

export const severityClasses = {
  healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  expired: 'bg-red-100 text-red-800 border-red-300',
  unknown: 'bg-gray-50 text-gray-600 border-gray-200',
};
