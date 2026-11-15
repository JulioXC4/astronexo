import { useState } from 'react';
import { ArrowLeft, ArrowRight, Planet, RocketLaunch, CheckCircle } from '@phosphor-icons/react';
import type { Destination } from '../../../game/contracts';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface DestinationScreenProps {
  readonly cityName: string;
  readonly initialDestination: Destination;
  readonly onSelectDestination: (dest: Destination) => void;
  readonly onBack: () => void;
}

export function DestinationScreen({ cityName, initialDestination, onSelectDestination, onBack }: DestinationScreenProps) {
  const { t } = useI18n();
  const [selectedDest, setSelectedDest] = useState<Destination>(initialDestination || 'MOON');

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('destinations.back', { city: cityName })}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Planet weight="fill" color="#f6c15b" />
          <span>{t('destinations.stepIndicator')}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '58rem', padding: '1.2rem' }}>
        <h1 className="earth-card__title" style={{ fontSize: '1.6rem' }}>
          <RocketLaunch color="#f6c15b" weight="fill" />
          <span>{t('destinations.title')}</span>
        </h1>
        <p className="earth-card__subtitle">
          {t('destinations.subtitle', { city: cityName })}
        </p>

        <div className="destination-grid" role="radiogroup">
          {/* Opción Luna: Primera Luz */}
          <div
            role="radio"
            aria-checked={selectedDest === 'MOON'}
            tabIndex={0}
            className={`destination-card ${selectedDest === 'MOON' ? 'destination-card--selected' : ''}`}
            onClick={() => setSelectedDest('MOON')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedDest('MOON');
              }
            }}
          >
            <span className="destination-card__tag">{t('common.active')}</span>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌕</div>
              <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
                {t('destinations.moon.name')}
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#7cb5c8', fontWeight: 700 }}>
                {t('destinations.moon.missionObjective')}
              </span>
              <ul style={{ margin: '0.8rem 0', paddingLeft: '1.2rem', color: '#c3d8ee', fontSize: '0.85rem', lineHeight: '1.5' }}>
                <li><strong>{t('destinations.gravityLabel')}:</strong> {t('destinations.moon.gravity')}</li>
                <li><strong>{t('destinations.atmosphereLabel')}:</strong> {t('destinations.moon.atmosphere')}</li>
                <li><strong>{t('destinations.challengeLabel')}:</strong> {t('destinations.moon.challenge')}</li>
                <li><strong>{t('destinations.travelTime')}:</strong> {t('destinations.moon.travelDuration')} ({t('destinations.moon.distance')})</li>
              </ul>
            </div>
            {selectedDest === 'MOON' && (
              <div style={{ color: '#66bb6a', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" /> {t('common.selected')}
              </div>
            )}
          </div>

          {/* Opción Marte: Horizonte Rojo */}
          <div
            role="radio"
            aria-checked={selectedDest === 'MARS'}
            tabIndex={0}
            className={`destination-card ${selectedDest === 'MARS' ? 'destination-card--selected' : ''}`}
            onClick={() => setSelectedDest('MARS')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedDest('MARS');
              }
            }}
          >
            <span className="destination-card__tag destination-card__tag--soon">{t('destinations.mars.name')}</span>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🪐</div>
              <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
                {t('destinations.mars.name')}
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#ffb74d', fontWeight: 700 }}>
                {t('destinations.mars.missionObjective')}
              </span>
              <ul style={{ margin: '0.8rem 0', paddingLeft: '1.2rem', color: '#c3d8ee', fontSize: '0.85rem', lineHeight: '1.5' }}>
                <li><strong>{t('destinations.gravityLabel')}:</strong> {t('destinations.mars.gravity')}</li>
                <li><strong>{t('destinations.atmosphereLabel')}:</strong> {t('destinations.mars.atmosphere')}</li>
                <li><strong>{t('destinations.challengeLabel')}:</strong> {t('destinations.mars.challenge')}</li>
                <li><strong>{t('destinations.travelTime')}:</strong> {t('destinations.mars.travelDuration')} ({t('destinations.mars.distance')})</li>
              </ul>
            </div>
            {selectedDest === 'MARS' && (
              <div style={{ color: '#ffb74d', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" /> {t('common.selected')}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
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
