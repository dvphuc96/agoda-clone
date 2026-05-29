import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { en } from './locales/en';
import { vi } from './locales/vi';
import { locales, type Locale, type Messages, type TranslationKey } from './types';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

const messages: Record<Locale, Messages> = { vi, en };
const storageKey = 'gostay_locale';

function isLocale(value: string | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'vi';

  try {
    const stored = window.localStorage.getItem(storageKey);
    return isLocale(stored) ? stored : 'vi';
  } catch {
    return 'vi';
  }
}

function readPath(source: Messages, key: TranslationKey): string {
  const value = key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);

  return typeof value === 'string' ? value : key;
}

function interpolate(text: string, values?: Record<string, string | number>) {
  if (!values) return text;

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    text,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);

    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(storageKey, nextLocale);
    } catch {
      // Ignore storage errors so locale switching still works in memory.
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, values?: Record<string, string | number>) => interpolate(readPath(messages[locale], key), values),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
