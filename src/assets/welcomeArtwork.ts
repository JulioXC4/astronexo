import type { SupportedLanguage } from '../i18n/types';

/** The title and subtitle are part of each supplied transparent PNG. */
export const welcomeLogos = {
  en: '/assets/ui/welcome/logo-en.webp',
  es: '/assets/ui/welcome/logo-es.webp',
  qu: '/assets/ui/welcome/logo-qu.webp',
  no: '/assets/ui/welcome/logo-no.webp',
} satisfies Record<SupportedLanguage, string>;

export const welcomeLanguageCards = {
  en: '/assets/ui/welcome/language-en.webp',
  es: '/assets/ui/welcome/language-es.webp',
  qu: '/assets/ui/welcome/language-qu.webp',
  no: '/assets/ui/welcome/language-no.webp',
} satisfies Record<SupportedLanguage, string>;
