import { ArrowRight, GlobeHemisphereWest, Sparkle } from '@phosphor-icons/react';
import type { MissionResult } from '../../../game';
import { resolveMessage, useI18n } from '../../../i18n';
import { SceneScreen, SCENE_BACKGROUNDS } from './SceneScreen';
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
    <SceneScreen background={SCENE_BACKGROUNDS.academy}>
      <main className="earth-card" style={{ maxWidth: '48rem', textAlign: 'center' }}>
        <h1 className="earth-card__title" style={{ justifyContent: 'center' }}>
          <GlobeHemisphereWest color="#f6c15b" weight="fill" />
          <span>{isSuccess ? t('return.successTitle') : t('return.interruptedTitle')}</span>
        </h1>
        <p className="earth-card__subtitle">
          {isSuccess ? t('return.successSub') : t('return.interruptedSub')}
        </p>

        <div className="scene-box scene-box--hero">
          <h2 style={{ fontSize: '1.9rem' }}>
            {isSuccess ? t('return.welcomeHome') : t('return.emergencyReturn')}
          </h2>
          <p>{t('return.crewMember', { name: astronautName })}</p>
          <div className="scene-box" style={{ maxWidth: '32rem', margin: '1.1rem auto 0' }}>
            <span className="scene-kicker">{t('return.flightLogTitle')}</span>
            <p>{isSuccess ? t('return.successLog') : (result.interruptionCause ? resolveMessage(result.interruptionCause, t) : t('return.interruptedLog'))}</p>
          </div>
        </div>

        <div className="scene-actions">
          <button type="button" className="earth-action-btn" onClick={onProceedToNextAdventure}>
            <Sparkle weight="fill" />
            <span>{t('return.viewAnalysis')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </SceneScreen>
  );
}
