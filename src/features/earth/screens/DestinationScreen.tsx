import { useState } from 'react';
import { ArrowLeft, ArrowRight, Planet, RocketLaunch, CheckCircle, Info } from '@phosphor-icons/react';
import type { Destination } from '../../../game/contracts';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface DestinationScreenProps {
  readonly initialDestination: Destination;
  readonly onSelectDestination: (dest: Destination) => void;
  readonly onBack: () => void;
}

export function DestinationScreen({ initialDestination, onSelectDestination, onBack }: DestinationScreenProps) {
  const { t } = useI18n();
  const [selectedDest, setSelectedDest] = useState<Destination>(initialDestination || 'MOON');
  const [showFlightSpecs, setShowFlightSpecs] = useState(false);

  const moonSelected = selectedDest === 'MOON';
  const marsSelected = selectedDest === 'MARS';

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1.2rem' }}>
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Planet weight="fill" color="#f6c15b" />
          <span>{t('destinations.stepIndicator')}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '68rem', padding: '1.4rem' }}>
        <div style={{ marginBottom: '1.2rem' }}>
          <h1 className="earth-card__title" style={{ fontSize: '1.75rem', margin: 0 }}>
            <RocketLaunch color="#f6c15b" weight="fill" />
            <span>{t('destinations.title')}</span>
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#9bc0e4', fontSize: '0.95rem' }}>
            {t('destinations.subtitle')}
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TARJETAS PANORÁMICAS: MISIÓN LUNAR & MISIÓN MARCIANA         */}
        {/* ------------------------------------------------------------- */}
        <div className="destination-pixel-grid" role="radiogroup" aria-label={t('destinations.title')}>

          {/* DESTINO 1: MISIÓN LUNAR */}
          <div
            role="radio"
            aria-checked={moonSelected}
            tabIndex={0}
            className={`destination-card destination-pixel-card destination-pixel-card--moon ${moonSelected ? 'destination-pixel-card--selected' : ''}`}
            onClick={() => setSelectedDest('MOON')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedDest('MOON');
              }
            }}
          >
            <div className="destination-pixel-card__banner">
              <img
                src="/assets/space/backgrounds/moon-base-builder.jpg"
                alt="Paisaje de la superficie lunar con base de investigación y cielo estrellado"
              />
              <div className="destination-pixel-card__overlay" />
              <div className="academy-card__badge-tag" style={{ background: '#356377', color: '#e5f6fd' }}>
                <Planet weight="fill" size={16} />
                <span>{t('destinations.moon.tag')}</span>
              </div>
              {moonSelected && (
                <div className="academy-card__selected-pill">
                  <CheckCircle weight="fill" size={16} />
                  <span>{t('common.selected')}</span>
                </div>
              )}
            </div>

            <div className="destination-pixel-card__body">
              <div className="destination-pixel-card__header-row">
                <h2 className="destination-pixel-card__name">
                  <span>{t('destinations.moon.name')}</span>
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#7cb5c8', fontWeight: 700 }}>
                  {t('destinations.moon.missionObjective')}
                </span>
              </div>

              <div className="destination-pixel-card__features">
                <div className="destination-feature-item">
                  <span> <strong>{t('destinations.gravityLabel')}:</strong> {t('destinations.moon.gravity')}</span>
                </div>
                <div className="destination-feature-item">
                  <span> <strong>{t('destinations.atmosphereLabel')}:</strong> {t('destinations.moon.atmosphere')}</span>
                </div>
                <div className="destination-feature-item">
                  <span>⏳ <strong>{t('destinations.challengeLabel')}:</strong> {t('destinations.moon.challenge')}</span>
                </div>
              </div>

              <p style={{ margin: '0.4rem 0 0 0', color: '#b9d4ec', fontSize: '0.84rem', lineHeight: '1.4' }}>
                {t('destinations.moon.cycle')}
              </p>
            </div>
          </div>

          {/* DESTINO 2: MISIÓN MARCIANA */}
          <div
            role="radio"
            aria-checked={marsSelected}
            tabIndex={0}
            className={`destination-card destination-pixel-card destination-pixel-card--mars ${marsSelected ? 'destination-pixel-card--selected' : ''}`}
            onClick={() => setSelectedDest('MARS')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedDest('MARS');
              }
            }}
          >
            <div className="destination-pixel-card__banner">
              <img
                src="/assets/space/backgrounds/mars-base-builder.jpg"
                alt="Paisaje de la superficie marciana rojiza con formaciones rocosas y base científica"
              />
              <div className="destination-pixel-card__overlay" />
              <div className="academy-card__badge-tag" style={{ background: '#a03e13', color: '#ffe9dc' }}>
                {/* Esfera marciana roja astronómicamente fiel, NO Saturno */}
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#ff7a29' }} />
                <span>{t('destinations.mars.tag')}</span>
              </div>
              {marsSelected && (
                <div className="academy-card__selected-pill" style={{ background: '#d35400' }}>
                  <CheckCircle weight="fill" size={16} />
                  <span>{t('common.selected')}</span>
                </div>
              )}
            </div>

            <div className="destination-pixel-card__body">
              <div className="destination-pixel-card__header-row">
                <h2 className="destination-pixel-card__name">
                  <span>{t('destinations.mars.name')}</span>
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#ff9d5c', fontWeight: 700 }}>
                  {t('destinations.mars.missionObjective')}
                </span>
              </div>

              <div className="destination-pixel-card__features">
                <div className="destination-feature-item">
                  <span> <strong>{t('destinations.gravityLabel')}:</strong> {t('destinations.mars.gravity')}</span>
                </div>
                <div className="destination-feature-item">
                  <span> <strong>{t('destinations.atmosphereLabel')}:</strong> {t('destinations.mars.atmosphere')}</span>
                </div>
                <div className="destination-feature-item">
                  <span> <strong>{t('destinations.challengeLabel')}:</strong> {t('destinations.mars.challenge')}</span>
                </div>
              </div>

              <p style={{ margin: '0.4rem 0 0 0', color: '#e8cbb6', fontSize: '0.84rem', lineHeight: '1.4' }}>
                {t('destinations.mars.cycle')}
              </p>
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* FICHA TÉCNICA DE VIAJE DESPLEGABLE                           */}
        {/* ------------------------------------------------------------- */}
        <button
          type="button"
          className="academy-telemetry-toggle"
          onClick={() => setShowFlightSpecs((prev) => !prev)}
          aria-expanded={showFlightSpecs}
        >
          <Info size={18} weight="bold" />
          <span>{showFlightSpecs ? t('destinations.hideDetails') : t('destinations.viewDetails')}</span>
        </button>

        {showFlightSpecs && (
          <div style={{
            background: '#0e1c2c',
            border: '2px solid #28476a',
            borderRadius: '0.9rem',
            padding: '1rem',
            margin: '0.8rem 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
            gap: '1rem',
          }}>
            <div style={{ borderLeft: '3px solid #7cb5c8', paddingLeft: '0.8rem' }}>
              <strong style={{ color: '#7cb5c8', display: 'block', fontSize: '0.95rem' }}>
                {t('destinations.moon.name')} ({t('destinations.travelTime')})
              </strong>
              <span style={{ fontSize: '0.88rem', color: '#c7def2' }}>
                {t('destinations.moon.travelDuration')} · {t('destinations.moon.distance')}
              </span>
            </div>
            <div style={{ borderLeft: '3px solid #ff7a29', paddingLeft: '0.8rem' }}>
              <strong style={{ color: '#ff9d5c', display: 'block', fontSize: '0.95rem' }}>
                {t('destinations.mars.name')} ({t('destinations.travelTime')})
              </strong>
              <span style={{ fontSize: '0.88rem', color: '#ffd6bf' }}>
                {t('destinations.mars.travelDuration')} · {t('destinations.mars.distance')}
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BOTÓN DE ACCIÓN                                               */}
        {/* ------------------------------------------------------------- */}
        <div style={{ marginTop: '1.4rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="pixel-btn pixel-btn--primary"
            style={{ fontSize: '1.2rem', padding: '0.9rem 2.2rem' }}
            onClick={() => onSelectDestination(selectedDest)}
          >
            <span>{t('destinations.confirmDestination', { dest: selectedDest === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name') })}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
