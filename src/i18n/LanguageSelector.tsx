import { useI18n } from './I18nContext';
import { playSound } from '../features/audio/sound';
import { SUPPORTED_LANGUAGES, type LanguageInfo, type SupportedLanguage } from './types';
import { welcomeLanguageCards } from '../assets/welcomeArtwork';
import './language-selector.css';

export interface LanguageSelectorProps {
  readonly variant?: 'welcome' | 'hud' | 'compact';
  readonly className?: string;
  readonly showDraftNotice?: boolean;
  /** Muestra solo el código del idioma, sin banderas ni emojis (HUD de juego). */
  readonly plain?: boolean;
}

export function LanguageSelector({
  variant = 'hud',
  className = '',
  showDraftNotice = true,
  plain = false,
}: LanguageSelectorProps) {
  const { language, setLanguage, languageInfo, t } = useI18n();

  /** La nota de borrador se escribe en el idioma que el jugador tiene activo, no en el del borrador. */
  const draftNoticeFor = (lang: LanguageInfo) => t('languageSelector.draftNotice', { variety: lang.varietyLabel ?? lang.name });

  const handleSelect = (code: SupportedLanguage) => {
    if (code !== language) playSound('languageChange');
    setLanguage(code);
  };

  if (variant === 'welcome') {
    return (
      <div
        className={`lang-selector-welcome ${className}`}
        role="region"
        aria-label={t('languageSelector.selectAriaLabel')}
      >
        <span className="lang-selector-label" id="lang-select-welcome-label">
          {t('languageSelector.label')}
        </span>
        <div
          className="lang-options-grid"
          role="radiogroup"
          aria-labelledby="lang-select-welcome-label"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`lang-option-card ${isSelected ? 'selected' : ''}`}
                aria-label={`${lang.nativeName} (${lang.name})${lang.isDraft ? ` — ${draftNoticeFor(lang)}` : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <img src={welcomeLanguageCards[lang.code]} alt="" draggable={false} />
              </button>
            );
          })}
        </div>

        {showDraftNotice && languageInfo.isDraft && languageInfo.draftNotice && (
          <p className="lang-draft-banner" role="status">
            ⚠️ {draftNoticeFor(languageInfo)}
          </p>
        )}
      </div>
    );
  }

  // HUD / Compact variant
  return (
    <div
      className={`lang-selector-hud ${className}`}
      role="region"
      aria-label={t('languageSelector.selectAriaLabel')}
    >
      <div className="lang-hud-pill-group" role="group">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              className={`lang-hud-pill ${isSelected ? 'active' : ''}`}
              aria-pressed={isSelected}
              title={`${lang.nativeName} (${lang.name})${lang.isDraft ? ' - ' + draftNoticeFor(lang) : ''}`}
              onClick={() => handleSelect(lang.code)}
            >
              {!plain && (
                <span className="lang-hud-flag" aria-hidden="true">
                  {lang.flag}
                </span>
              )}
              <span className="lang-hud-code">{lang.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
      {showDraftNotice && languageInfo.isDraft && (
        <span
          className="lang-hud-draft-dot"
          title={draftNoticeFor(languageInfo)}
          aria-label={draftNoticeFor(languageInfo)}
        >
          {plain ? t('a11y.draftBadge') : `⚠️ ${t('a11y.draftBadge')}`}
        </span>
      )}
    </div>
  );
}
