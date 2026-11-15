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

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

export function resolveTranslation(
  dictionaries: Record<SupportedLanguage, Record<string, any>>,
  language: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>,
): string {
  const activeValue = getNestedValue(dictionaries[language], key);
  const fallbackValue = language === FALLBACK_LANGUAGE ? undefined : getNestedValue(dictionaries[FALLBACK_LANGUAGE], key);
  const value = activeValue ?? fallbackValue;
  return value ? interpolate(value, params) : key;
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
    } catch {
      // ignore
    }
  }, [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return resolveTranslation(dictionaries, language, key, params);
    },
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
  t: (key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(en, key);
    if (!value) return key;
    return interpolate(value, params);
  },
  isDraft: false,
};

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  return context ?? defaultContextValue;
}
