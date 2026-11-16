import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  type SupportedLanguage,
  type I18nContextValue,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  STORAGE_KEY,
} from './types';
import { en } from './locales/en';
import { es } from './locales/es';
import { qu } from './locales/qu';
import { no } from './locales/no';

const dictionaries: Record<SupportedLanguage, Record<string, any>> = {
  en,
  es,
  qu,
  no,
};

const I18nContext = createContext<I18nContextValue | null>(null);
const reportedI18nIssues = new Set<string>();

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const parts = path.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

function reportI18nIssue(message: string) {
  const isDevelopment = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ?? false;
  if (!isDevelopment || reportedI18nIssues.has(message)) return;
  reportedI18nIssues.add(message);
  console.warn(`[i18n] ${message}`);
}

function interpolate(
  template: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, placeholder: string) => {
    const value = params?.[placeholder];
    if (value !== undefined) return String(value);
    reportI18nIssue(`Missing interpolation "${placeholder}" for "${key}".`);
    return '';
  }).replace(/\s{2,}/g, ' ').trim();
}

export function translate(
  language: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>,
): string {
  const lookupOrder = [...new Set<SupportedLanguage>([language, FALLBACK_LANGUAGE, 'es'])];
  let value: string | undefined;

  for (const locale of lookupOrder) {
    value = getNestedValue(dictionaries[locale], key);
    if (value) break;
  }

  if (!value) {
    reportI18nIssue(`Missing translation key "${key}".`);
    return language === 'es' ? 'Texto no disponible' : 'Text unavailable';
  }

  return interpolate(value, key, params);
}

function getStoredLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((lang) => lang.code === stored)) {
      return stored as SupportedLanguage;
    }
  } catch {
    // localStorage may be unavailable in some sandboxes
  }
  return DEFAULT_LANGUAGE;
}

export interface I18nProviderProps {
  readonly children: ReactNode;
  readonly initialLanguage?: SupportedLanguage;
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return initialLanguage || getStoredLanguage();
  });

  const languageInfo = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === language) ||
      SUPPORTED_LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE)!
    );
  }, [language]);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = language;
      // El título de la pestaña y la descripción siguen al idioma elegido (la página trae el español por defecto).
      document.title = translate(language, 'appMeta.title');
      document.querySelector('meta[name="description"]')?.setAttribute('content', translate(language, 'appMeta.description'));
    } catch {
      // ignore
    }
  }, [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => translate(language, key, params),
    [language],
  );

  const value = useMemo<I18nContextValue>(() => ({
    language,
    languageInfo,
    setLanguage,
    t,
    isDraft: languageInfo.isDraft,
  }), [language, languageInfo, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const defaultLanguageInfo = SUPPORTED_LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE)!;

const defaultContextValue: I18nContextValue = {
  language: DEFAULT_LANGUAGE,
  languageInfo: defaultLanguageInfo,
  setLanguage: () => {},
  t: (key: string, params?: Record<string, string | number>): string =>
    translate(DEFAULT_LANGUAGE, key, params),
  isDraft: false,
};

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  return context ?? defaultContextValue;
}
