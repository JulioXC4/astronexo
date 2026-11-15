export type SupportedLanguage = 'en' | 'es' | 'qu' | 'no';

export interface LanguageInfo {
  readonly code: SupportedLanguage;
  readonly name: string;
  readonly nativeName: string;
  readonly flag: string;
  readonly isDraft: boolean;
  readonly varietyLabel?: string;
  readonly draftNotice?: string;
}

export const SUPPORTED_LANGUAGES: readonly LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isDraft: false,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isDraft: false,
  },
  {
    code: 'qu',
    name: 'Quechua',
    nativeName: 'Runasimi (Qhichwa)',
    flag: '🏔️',
    isDraft: true,
    varietyLabel: 'Quechua Sureño (Chanka / Collao)',
    draftNotice: 'Borrador pedagógico de Quechua Sureño · Pendiente de validación lingüística nativa',
  },
  {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk (Bokmål)',
    flag: '🇳🇴',
    isDraft: true,
    varietyLabel: 'Norsk Bokmål',
    draftNotice: 'Pedagogisk utkast i Norsk Bokmål · Venter på endelig språklig kvalitetssikring',
  },
] as const;

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';
export const STORAGE_KEY = 'astronexo_lang_v3';

export type TranslationDictionary = Record<string, any>;

export interface I18nContextValue {
  readonly language: SupportedLanguage;
  readonly languageInfo: LanguageInfo;
  readonly setLanguage: (lang: SupportedLanguage) => void;
  readonly t: (key: string, params?: Record<string, string | number>) => string;
  readonly isDraft: boolean;
}
