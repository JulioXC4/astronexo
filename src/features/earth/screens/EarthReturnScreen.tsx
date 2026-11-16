import { ArrowRight, GlobeHemisphereWest, Sparkle } from '@phosphor-icons/react';
import type { MissionResult } from '../../../game';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface EarthReturnScreenProps {
  readonly result: MissionResult;
  readonly astronautName: string;
  readonly onProceedToNextAdventure: () => void;
}

export function EarthReturnScreen({ result, astronautName, onProceedToNextAdventure }: EarthReturnScreenProps) {
  const { t } = useI18n();
  const isSuccess = result.outcome === 'COMPLETED';

  return (
    <div className="earth-screen">
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '48rem', marginBottom: '0.6rem' }}>
        <LanguageSelector variant="hud" />
      </div>
      <main className="earth-card" style={{ maxWidth: '48rem', textAlign: 'center' }}>
        <h1 className="earth-card__title" style={{ justifyContent: 'center' }}>
          <GlobeHemisphereWest color="#f6c15b" weight="fill" />
          <span>{isSuccess ? t('return.successTitle') : t('return.interruptedTitle')}</span>
        </h1>
        <p className="earth-card__subtitle">
          {isSuccess
            ? t('return.successSub')
            : t('return.interruptedSub')}
        </p>

        <div style={{
          background: 'radial-gradient(circle at 50% 40%, #1e4570 0%, #0d1e33 100%)',
          border: '2px solid #366091',
          borderRadius: '1.2rem',
          padding: '2.5rem 1.5rem',
          margin: '1.5rem 0',
          position: 'relative'
        }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}> </div>
          <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
            {isSuccess ? t('return.welcomeHome') : t('return.emergencyReturn')}
          </h2>
          <p style={{ color: '#bed5ed', fontSize: '1rem', marginTop: '0.4rem' }}>
            {t('return.crewMember', { name: astronautName })}
          </p>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid #3a5c86',
            borderRadius: '0.8rem',
            padding: '1rem',
            maxWidth: '32rem',
            margin: '1.2rem auto 0 auto',
            textAlign: 'left'
          }}>
            <p style={{ margin: 0, color: '#f6c15b', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              {t('return.flightLogTitle')}
            </p>
            <p style={{ margin: '0.3rem 0 0 0', color: '#e6f0fa', fontSize: '0.92rem', lineHeight: '1.4' }}>
              {isSuccess ? t('return.successLog') : (result.interruptionCause ?? t('return.interruptedLog'))}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={onProceedToNextAdventure}
          >
            <Sparkle weight="fill" />
            <span>{t('return.viewAnalysis')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
