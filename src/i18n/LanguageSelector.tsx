import { useI18n } from './I18nContext';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './types';
import './language-selector.css';

export interface LanguageSelectorProps {
  readonly variant?: 'welcome' | 'hud' | 'compact';
  readonly className?: string;
  readonly showDraftNotice?: boolean;
}

export function LanguageSelector({
  variant = 'hud',
  className = '',
  showDraftNotice = true,
}: LanguageSelectorProps) {
  const { language, setLanguage, languageInfo, t } = useI18n();

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const previousKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!nextKey && !previousKey) return;
    event.preventDefault();
    const offset = nextKey ? 1 : -1;
    const next = SUPPORTED_LANGUAGES[(index + offset + SUPPORTED_LANGUAGES.length) % SUPPORTED_LANGUAGES.length];
    handleSelect(next.code);
    requestAnimationFrame(() => document.getElementById(`lang-option-${next.code}`)?.focus());
  };

  if (variant === 'welcome') {
    return (
      <div
        className={`lang-selector-welcome ${className}`}
        role="region"
        aria-label={t('languageSelector.ariaLabel')}
      >
        <span className="lang-selector-label" id="lang-select-welcome-label">
          🌐 {t('languageSelector.label')}
        </span>
        <div
          className="lang-options-grid"
          role="radiogroup"
          aria-labelledby="lang-select-welcome-label"
        >
          {SUPPORTED_LANGUAGES.map((lang, index) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                id={`lang-option-${lang.code}`}
                role="radio"
                aria-checked={isSelected}
                aria-label={t('languageSelector.currentLanguage', { lang: lang.nativeName })}
                tabIndex={isSelected ? 0 : -1}
                className={`lang-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(lang.code)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
              >
                <span className="lang-flag" aria-hidden="true">
                  {lang.flag}
                </span>
                <span className="lang-names">
                  <strong className="lang-native">{lang.nativeName}</strong>
                  <span className="lang-english">{lang.name}</span>
                </span>
                {lang.isDraft && (
                    <span className="lang-draft-badge" title={t('languageSelector.draftNotice', { variety: lang.varietyLabel ?? lang.nativeName })}>
                    {t('languageSelector.draftLabel')}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {showDraftNotice && languageInfo.isDraft && languageInfo.draftNotice && (
          <p className="lang-draft-banner" role="status">
            ⚠️ {t('languageSelector.draftNotice', { variety: languageInfo.varietyLabel ?? languageInfo.nativeName })}
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
      aria-label={t('languageSelector.ariaLabel')}
    >
      <div className="lang-hud-pill-group" role="group" aria-label={t('languageSelector.selectHint')}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              className={`lang-hud-pill ${isSelected ? 'active' : ''}`}
              aria-pressed={isSelected}
              aria-label={t('languageSelector.currentLanguage', { lang: lang.nativeName })}
              title={lang.isDraft ? t('languageSelector.draftNotice', { variety: lang.varietyLabel ?? lang.nativeName }) : t('languageSelector.currentLanguage', { lang: lang.nativeName })}
              onClick={() => handleSelect(lang.code)}
            >
              <span className="lang-hud-flag" aria-hidden="true">
                {lang.flag}
              </span>
              <span className="lang-hud-code">{lang.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
      {showDraftNotice && languageInfo.isDraft && (
        <span
          className="lang-hud-draft-dot"
          title={t('languageSelector.draftNotice', { variety: languageInfo.varietyLabel ?? languageInfo.nativeName })}
          aria-label={t('languageSelector.draftNotice', { variety: languageInfo.varietyLabel ?? languageInfo.nativeName })}
        >
          ⚠️ {t('languageSelector.draftLabel')}
        </span>
      )}
    </div>
  );
}
