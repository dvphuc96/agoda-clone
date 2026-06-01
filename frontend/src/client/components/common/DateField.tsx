import { CalendarDays } from 'lucide-react';
import { useRef } from 'react';
import { formatDateForLocale } from '../../../shared/i18n/format';
import type { Locale } from '../../../shared/i18n/types';

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  min?: string;
  locale: Locale;
  required?: boolean;
  onChange: (value: string) => void;
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nextDateString(value: string): string {
  if (!value) return todayDateString();
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return todayDateString();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function DateField({ id, label, value, min, locale, required, onChange }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    }
  };

  return (
    <button
      type="button"
      onClick={openPicker}
      className="relative block w-full rounded-md border border-border bg-white px-4 py-3 text-left transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
    >
      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
        <CalendarDays className="size-3.5 text-primary" />
        {label}
      </span>
      <span className={`mt-1 block text-sm font-semibold ${value ? 'text-text' : 'text-text-secondary'}`}>
        {value ? formatDateForLocale(value, locale) : label}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value}
        min={min}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute bottom-2 left-4 h-px w-px opacity-0"
        tabIndex={-1}
      />
    </button>
  );
}
