import type { SupportedLanguage } from '../i18n/types';

/** The title and subtitle are part of each supplied transparent PNG. */
export const welcomeLogos = {
  en: '/assets/ui/welcome/logo-en.png',
  es: '/assets/ui/welcome/logo-es.png',
  qu: '/assets/ui/welcome/logo-qu.png',
  no: '/assets/ui/welcome/logo-no.png',
} satisfies Record<SupportedLanguage, string>;

export const welcomeLanguageCards = {
  en: '/assets/ui/welcome/language-en.png',
  es: '/assets/ui/welcome/language-es.png',
  qu: '/assets/ui/welcome/language-qu.png',
  no: '/assets/ui/welcome/language-no.png',
} satisfies Record<SupportedLanguage, string>;
