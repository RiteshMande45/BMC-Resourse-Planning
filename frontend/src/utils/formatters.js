/**
 * Formats a number as Indian Rupee (₹) currency.
 * Shows '₹—' if value is null, undefined, or '—'.
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '' || value === '—') {
    return '₹—';
  }
  const num = Number(value);
  if (isNaN(num)) return '₹—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formats a fraction or percentage as string e.g. "75%"
 */
export function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Math.round(Number(value));
  if (isNaN(num)) return '—';
  return `${num}%`;
}

/**
 * Formats hours e.g. "3.5 h"
 */
export function formatHours(value, suffix = 'h') {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';
  return `${num % 1 === 0 ? num : num.toFixed(1)} ${suffix}`.trim();
}

