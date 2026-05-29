import type { Locale } from './types';

const currencyCache = new Map<string, Intl.NumberFormat>();
const dateCache = new Map<string, Intl.DateTimeFormat>();

function getCurrencyFormatter(locale: Locale) {
  const key = locale === 'vi' ? 'vi-VN' : 'en-US';
  let fmt = currencyCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(key, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });
    currencyCache.set(key, fmt);
  }
  return fmt;
}

function getDateFormatter(locale: Locale) {
  const key = locale === 'vi' ? 'vi-VN' : 'en-US';
  let fmt = dateCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(key, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    dateCache.set(key, fmt);
  }
  return fmt;
}

export function formatVndForLocale(price: string | number | null | undefined, locale: Locale) {
  const value = Number(price ?? 0);
  if (!Number.isFinite(value) || value <= 0) return locale === 'vi' ? 'Liên hệ' : 'Contact';

  return getCurrencyFormatter(locale).format(value);
}

export function formatDateForLocale(value: string | null | undefined, locale: Locale) {
  if (!value) return '';
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return value;
  if (
    dateOnlyMatch &&
    (date.getFullYear() !== Number(dateOnlyMatch[1]) ||
      date.getMonth() !== Number(dateOnlyMatch[2]) - 1 ||
      date.getDate() !== Number(dateOnlyMatch[3]))
  ) {
    return value;
  }

  return getDateFormatter(locale).format(date);
}

function statusLabel(status: string | null | undefined, labels: Record<string, string>) {
  if (!status) return '';
  return labels[status] || status;
}
