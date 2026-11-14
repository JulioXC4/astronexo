import { useState } from 'react';
import { ArrowLeft, ArrowRight, UserCircle, Sparkle } from '@phosphor-icons/react';
import { AVATAR_OPTIONS, SUGGESTED_CALLSIGNS, type AvatarOption } from '../../../data/avatars';
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
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatarId || AVATAR_OPTIONS[0].id);
  const [callsign, setCallsign] = useState(initialFictionalName || SUGGESTED_CALLSIGNS[0]);

  const selectedAvatar = AVATAR_OPTIONS.find((a) => a.id === selectedAvatarId) ?? AVATAR_OPTIONS[0];

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const finalName = callsign.trim() || 'Comandante Junior';
    onConfirmProfile(selectedAvatar, finalName);
  }

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Cambiar Destino</span>
        </button>
        <div className="earth-screen__progress-pill">
          <span>Paso 3 de 6 · Perfil del Comandante ({cityName} ➔ {destination === 'MOON' ? 'Luna' : 'Marte'})</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '60rem', padding: '1.2rem' }}>
        <h1 className="earth-card__title" style={{ fontSize: '1.5rem' }}>
          <UserCircle color="#f6c15b" weight="fill" />
          <span>Elige tu Avatar de Expedición</span>
        </h1>
        <p className="earth-card__subtitle">
          Selecciona tu comandante para liderar la expedición desde <strong>{cityName}</strong> hacia <strong>{destination === 'MOON' ? 'la Luna' : 'Marte'}</strong>.
        </p>

        <div className="avatar-grid" role="radiogroup" aria-label="Selecciona tu avatar de astronauta">
          {AVATAR_OPTIONS.map((avatar) => {
            const isSelected = avatar.id === selectedAvatarId;
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
                <div
                  className="avatar-card__icon"
                  style={{ backgroundColor: avatar.badgeColor }}
                  aria-hidden="true"
                >
                  {avatar.iconSymbol}
                </div>
                <h2 className="avatar-card__name">{avatar.name}</h2>
                <span className="avatar-card__role">{avatar.roleTitle}</span>
                <p className="avatar-card__desc">{avatar.description}</p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="callsign-box">
          <label htmlFor="callsign-input-v3" className="callsign-box__label">
            Indicativo o nombre de misión:
          </label>
          <input
            id="callsign-input-v3"
            type="text"
            className="callsign-box__input"
            maxLength={26}
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder="Ejemplo: Comandante Cóndor"
          />
          <div style={{ marginTop: '0.6rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#97b7d8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkle weight="fill" color="#f6c15b" /> Sugerencias de indicativo:
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
            <span>Continuar al Briefing de Misión</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
