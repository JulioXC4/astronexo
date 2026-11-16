import { useState } from 'react';
import { ArrowLeft, ArrowRight, UserCircle, Sparkle, CheckCircle } from '@phosphor-icons/react';
import { AVATAR_OPTIONS, SUGGESTED_CALLSIGNS, type AvatarOption } from '../../../data/avatars';
import { useI18n, LanguageSelector } from '../../../i18n';
import { useScreenRadio } from '../../radio';
import './earth.css';

interface AvatarScreenProps {
  readonly cityName: string;
  readonly destination: string;
  readonly initialAvatarId: string;
  readonly initialFictionalName: string;
  readonly onConfirmProfile: (avatar: AvatarOption, fictionalName: string) => void;
  readonly onBack: () => void;
}

const AVATAR_SPRITES: Record<string, string> = {
  ALBA: '/assets/pixel-art/cadet-alba.png',
  LEO: '/assets/pixel-art/commander-leo.png',
  AURORA: '/assets/pixel-art/officer-aurora.png',
  NICO: '/assets/pixel-art/engineer-nico.png',
};

const AVATAR_ACCENTS: Record<string, string> = {
  ALBA: '#4ec3d9',
  LEO: '#5bbd78',
  AURORA: '#bd92d0',
  NICO: '#f6c15b',
};

export function AvatarScreen({
  cityName,
  destination,
  initialAvatarId,
  initialFictionalName,
  onConfirmProfile,
  onBack,
}: AvatarScreenProps) {
  const { t } = useI18n();
  useScreenRadio([{ speaker: 'CHISPA', text: t('radio.avatar') }]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatarId || AVATAR_OPTIONS[0].id);
  const [callsign, setCallsign] = useState(initialFictionalName || SUGGESTED_CALLSIGNS[0]);

  const selectedAvatar = AVATAR_OPTIONS.find((a) => a.id === selectedAvatarId) ?? AVATAR_OPTIONS[0];

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const finalName = callsign.trim() || t('avatars.defaultCallsign');
    onConfirmProfile(selectedAvatar, finalName);
  }

  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');
  const selectedAvatarName = t(`avatars.profiles.${selectedAvatar.id}.name`);

  return (
    <div className="earth-screen earth-screen--fit" style={{ padding: '0.8rem 1.2rem' }}>
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <UserCircle weight="fill" color="#f6c15b" />
          <span>{t('avatars.stepIndicator', { city: cityName, destination: destName })}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '68rem', padding: 'clamp(0.7rem, 2vh, 1.4rem)' }}>
        <div style={{ marginBottom: 'clamp(0.5rem, 1.5vh, 1.2rem)' }}>
          <h1 className="earth-card__title" style={{ fontSize: '1.75rem', margin: 0 }}>
            <UserCircle color="#f6c15b" weight="fill" />
            <span>{t('avatars.title')}</span>
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#9bc0e4', fontSize: '0.95rem' }}>
            {t('avatars.subtitle', { city: cityName, destination: destName })}
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* GRID DE SELECCIÓN DE HÉROE (CHARACTER SELECT)                 */}
        {/* ------------------------------------------------------------- */}
        <div className="avatar-pixel-grid" role="radiogroup" aria-label={t('avatars.title')}>
          {AVATAR_OPTIONS.map((avatar) => {
            const isSelected = avatar.id === selectedAvatarId;
            const name = t(`avatars.profiles.${avatar.id}.name`);
            const role = t(`avatars.profiles.${avatar.id}.role`);
            const bio = t(`avatars.profiles.${avatar.id}.desc`);
            const spritePath = AVATAR_SPRITES[avatar.id];
            const accent = AVATAR_ACCENTS[avatar.id] || '#f6c15b';

            return (
              <div
                key={avatar.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`avatar-pixel-card ${isSelected ? 'avatar-pixel-card--selected' : ''}`}
                style={isSelected ? { borderColor: accent, boxShadow: `0 0 0 3px ${accent}44, 0 8px 0 #091421` } : undefined}
                onClick={() => setSelectedAvatarId(avatar.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setSelectedAvatarId(avatar.id);
                  }
                }}
              >
                {isSelected && (
                  <div
                    className="academy-card__selected-pill"
                    style={{ top: '0.6rem', right: '0.6rem', background: accent, color: '#101d2d' }}
                  >
                    <CheckCircle weight="fill" size={14} />
                    <span>{t('common.selected')}</span>
                  </div>
                )}

                <div className="avatar-pixel-card__sprite-frame">
                  <img
                    src={spritePath}
                    alt={name}
                    className="avatar-pixel-card__sprite"
                  />
                </div>

                <h2 className="avatar-pixel-card__name" style={isSelected ? { color: accent } : undefined}>
                  {name}
                </h2>
                <span className="avatar-pixel-card__role" style={{ color: isSelected ? '#ffffff' : '#8daecf' }}>
                  {role}
                </span>
                <p className="avatar-pixel-card__desc">
                  {bio}
                </p>
              </div>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TERMINAL DE INDICATIVO DE MISIÓN (CALLSIGN)                   */}
        {/* ------------------------------------------------------------- */}
        <form onSubmit={handleSubmit} className="callsign-terminal">
          <label htmlFor="callsign-input-pixel" className="callsign-terminal__label">
            {t('avatars.callsignLabel')}
          </label>
          <input
            id="callsign-input-pixel"
            type="text"
            className="callsign-terminal__input"
            maxLength={26}
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder={t('avatars.callsignPlaceholder')}
          />

          <div style={{ marginTop: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#97b7d8', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Sparkle weight="fill" color="#f6c15b" />
              <span>{t('avatars.callsignSuggestions')}</span>
            </span>
            <div className="callsign-suggestions" style={{ marginTop: '0.5rem' }}>
              {SUGGESTED_CALLSIGNS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  className="callsign-chip"
                  style={callsign === sug ? { background: '#f6c15b', color: '#101d2d', fontWeight: 700 } : undefined}
                  onClick={() => setCallsign(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* ------------------------------------------------------------- */}
        {/* BOTÓN DE CONFIRMACIÓN                                         */}
        {/* ------------------------------------------------------------- */}
        <div style={{ marginTop: '1.4rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="pixel-btn pixel-btn--primary"
            style={{ fontSize: '1.2rem', padding: '0.9rem 2.2rem' }}
            onClick={() => handleSubmit()}
          >
            <span>{t('avatars.confirmAvatar', { name: selectedAvatarName })}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
