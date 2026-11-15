import { useState } from 'react';
import { ArrowLeft, ArrowRight, UserCircle, Sparkle } from '@phosphor-icons/react';
import { AVATAR_OPTIONS, SUGGESTED_CALLSIGNS, type AvatarOption } from '../../../data/avatars';
import { CharacterPortrait, type PortraitIdentity } from '../../../visual-kit/CharacterPortrait';
import { getPlayerSkinForAvatarId } from '../../../assets/manifest';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface AvatarScreenProps {
  readonly cityName: string;
  readonly destination: string;
  readonly initialAvatarId: string;
  readonly initialFictionalName: string;
  readonly onConfirmProfile: (avatar: AvatarOption, fictionalName: string) => void;
  readonly onBack: () => void;
}

export function AvatarScreen({ cityName, destination, initialAvatarId, initialFictionalName, onConfirmProfile, onBack }: AvatarScreenProps) {
  const { t } = useI18n();
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
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <span>{t('avatars.stepIndicator', { city: cityName, destination: destName })}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '60rem', padding: '1.2rem' }}>
        <h1 className="earth-card__title" style={{ fontSize: '1.5rem' }}>
          <UserCircle color="#f6c15b" weight="fill" />
          <span>{t('avatars.title')}</span>
        </h1>
        <p className="earth-card__subtitle">
          {t('avatars.subtitle', { city: cityName, destination: destName })}
        </p>

        <div className="avatar-grid" role="radiogroup" aria-label={t('avatars.title')}>
          {AVATAR_OPTIONS.map((avatar) => {
            const isSelected = avatar.id === selectedAvatarId;
            const name = t(`avatars.profiles.${avatar.id}.name`);
            const role = t(`avatars.profiles.${avatar.id}.role`);
            const bio = t(`avatars.profiles.${avatar.id}.desc`);
            const skin = getPlayerSkinForAvatarId(avatar.id);
            return (
              <div
                key={avatar.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`avatar-card ${isSelected ? 'avatar-card--selected' : ''}`}
                onClick={() => setSelectedAvatarId(avatar.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setSelectedAvatarId(avatar.id);
                  }
                }}
              >
                <div className="avatar-card__art" aria-hidden="true">
                  <CharacterPortrait identity={avatar.id as PortraitIdentity} source={skin.path} selected={isSelected} label={name} />
                </div>
                <h2 className="avatar-card__name">{name}</h2>
                <span className="avatar-card__role">{role}</span>
                <p className="avatar-card__desc">{bio}</p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="callsign-box">
          <label htmlFor="callsign-input-v3" className="callsign-box__label">
            {t('avatars.callsignLabel')}
          </label>
          <input
            id="callsign-input-v3"
            type="text"
            className="callsign-box__input"
            maxLength={26}
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder={t('avatars.callsignPlaceholder')}
          />
          <div style={{ marginTop: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#97b7d8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkle weight="fill" color="#f6c15b" /> {t('avatars.callsignSuggestions')}
            </span>
            <div className="callsign-suggestions">
              {SUGGESTED_CALLSIGNS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  className="callsign-chip"
                  onClick={() => setCallsign(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
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
