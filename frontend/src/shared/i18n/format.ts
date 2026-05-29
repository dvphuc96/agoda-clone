import type { Locale } from './types';

export function formatVndForLocale(price: string | number | null | undefined, locale: Locale) {
  const value = Number(price ?? 0);
  if (!Number.isFinite(value) || value <= 0) return locale === 'vi' ? 'Liên hệ' : 'Contact';

  return new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
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

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function statusLabel(status: string | null | undefined, labels: Record<string, string>) {
  if (!status) return '';
  return labels[status] || status;
}
