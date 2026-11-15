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
            Balance de la Misión {result.finalState.destination === 'MOON' ? 'Lunar' : 'Marciana'}
          </span>
          <p style={{ margin: '0.4rem 0 0 0', color: '#d9e7f5', fontSize: '0.95rem' }}>
            {result.outcome === 'COMPLETED' ? 'Objetivo científico alcanzado.' : result.interruptionCause ?? 'La misión se interrumpió.'}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7cb5c8', fontSize: '0.85rem' }}>
            Entrenamientos aplicados a la guardia: <strong>{result.finalState.setup.earthProfile?.trainings.length ?? 0}</strong>.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '1rem' }}>
          <div className="city-card" style={{ cursor: 'pointer' }} onClick={onReplay}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎒</div>
            <h3 style={{ fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
              Nueva Estrategia
            </h3>
            <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.88rem', lineHeight: '1.4' }}>
              Reintenta la misión completando tres entrenamientos para observar cómo cambian tus herramientas y opciones.
            </p>
            <div style={{ marginTop: '0.8rem', color: '#f6c15b', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowCounterClockwise weight="bold" /> {t('results.playAgainBtn')}
            </div>
          </div>

          <div className="city-card" style={{ cursor: 'pointer' }} onClick={onOpenLearn}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
            <h3 style={{ fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
              {t('learn.title')}
            </h3>
            <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.88rem', lineHeight: '1.4' }}>
              {t('learn.subtitle')}
            </p>
            <div style={{ marginTop: '0.8rem', color: '#f6c15b', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BookOpen weight="bold" /> Ver Enciclopedia
            </div>
          </div>

          <div className="city-card" style={{ cursor: 'pointer' }} onClick={onOpenStation}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏫</div>
            <h3 style={{ fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
              {t('welcome.stationMode')}
            </h3>
            <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.88rem', lineHeight: '1.4' }}>
              Explora la maqueta de 4 roles diseñada para jugar en equipo y en aulas escolares.
            </p>
            <div style={{ marginTop: '0.8rem', color: '#f6c15b', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <UsersThree weight="bold" /> Ver Maqueta Aula
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
