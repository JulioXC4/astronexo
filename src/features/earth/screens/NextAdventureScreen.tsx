import { ArrowRight, ArrowCounterClockwise, BookOpen, UsersThree, RocketLaunch, Sparkle } from '@phosphor-icons/react';
import type { MissionResult } from '../../../game';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface NextAdventureScreenProps {
  readonly result: MissionResult;
  readonly onReplay: () => void;
  readonly onOpenLearn: () => void;
  readonly onOpenStation: () => void;
  readonly onGoHome: () => void;
}

export function NextAdventureScreen({
  result,
  onReplay,
  onOpenLearn,
  onOpenStation,
  onGoHome,
}: NextAdventureScreenProps) {
  const { t } = useI18n();
  return (
    <div className="earth-screen">
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '52rem', marginBottom: '0.6rem' }}>
        <LanguageSelector variant="hud" />
      </div>
      <main className="earth-card" style={{ maxWidth: '52rem' }}>
        <h1 className="earth-card__title">
          <RocketLaunch color="#f6c15b" weight="fill" />
          <span>{t('nextAdventure.title')}</span>
        </h1>
        <p className="earth-card__subtitle">
          {t('nextAdventure.subtitle')}
        </p>

        <div style={{
          background: '#132338',
          border: '1px solid #33557e',
          borderRadius: '1rem',
          padding: '1.2rem',
          marginBottom: '1.5rem'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#f6c15b', fontWeight: 700, textTransform: 'uppercase' }}>
            {t('nextAdventure.balanceTitle', { destination: result.finalState.destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name') })}
          </span>
          <p style={{ margin: '0.4rem 0 0 0', color: '#d9e7f5', fontSize: '0.95rem' }}>
            {result.outcome === 'COMPLETED' ? t('nextAdventure.balanceSuccess') : t('results.interruptedGeneric')}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7cb5c8', fontSize: '0.85rem' }}>
            {t('nextAdventure.trainingsApplied', { count: result.finalState.setup.earthProfile?.trainings.length ?? 0 })}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem' }}>
          <div className="city-card" style={{ cursor: 'pointer' }} onClick={onReplay}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎒</div>
            <h3 style={{ fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
              {t('nextAdventure.newStrategyTitle')}
            </h3>
            <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.88rem', lineHeight: '1.4' }}>
              {t('nextAdventure.newStrategyDesc')}
            </p>
            <div style={{ marginTop: '0.8rem', color: '#f6c15b', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowCounterClockwise weight="bold" /> {t('nextAdventure.newStrategyAction')}
            </div>
          </div>

          <div className="city-card" style={{ cursor: 'pointer' }} onClick={onOpenLearn}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
            <h3 style={{ fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
              {t('nextAdventure.learnTitle')}
            </h3>
            <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.88rem', lineHeight: '1.4' }}>
              {t('nextAdventure.learnDesc')}
            </p>
            <div style={{ marginTop: '0.8rem', color: '#f6c15b', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BookOpen weight="bold" /> {t('nextAdventure.learnAction')}
            </div>
          </div>

          <div className="city-card" style={{ cursor: 'pointer' }} onClick={onOpenStation}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏫</div>
            <h3 style={{ fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
              {t('welcome.stationMode')}
            </h3>
              <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.88rem', lineHeight: '1.4' }}>
              {t('nextAdventure.stationDesc')}
            </p>
            <div style={{ marginTop: '0.8rem', color: '#f6c15b', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <UsersThree weight="bold" /> {t('nextAdventure.stationAction')}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button type="button" className="earth-screen__back-btn" onClick={onGoHome}>
            <span>{t('nextAdventure.goHome')}</span>
          </button>
          <button type="button" className="earth-action-btn" onClick={onReplay}>
            <Sparkle weight="fill" />
            <span>{t('nextAdventure.playAgain')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
