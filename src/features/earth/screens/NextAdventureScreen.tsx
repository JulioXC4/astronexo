import { ArrowRight, ArrowCounterClockwise, BookOpen, UsersThree, RocketLaunch, Sparkle } from '@phosphor-icons/react';
import type { MissionResult } from '../../../game';
import { resolveMessage, useI18n } from '../../../i18n';
import { SceneScreen, SCENE_BACKGROUNDS } from './SceneScreen';
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
  const destName = result.finalState.destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');
  return (
    <SceneScreen background={SCENE_BACKGROUNDS.academy}>
      <main className="earth-card" style={{ maxWidth: '52rem' }}>
        <h1 className="earth-card__title">
          <RocketLaunch color="#f6c15b" weight="fill" />
          <span>{t('nextAdventure.title')}</span>
        </h1>
        <p className="earth-card__subtitle">{t('nextAdventure.subtitle')}</p>

        <div className="scene-box">
          <span className="scene-kicker">{t('nextAdventure.balanceTitle', { destination: destName })}</span>
          <p>
            {result.outcome === 'COMPLETED'
              ? t('nextAdventure.balanceSuccess')
              : result.interruptionCause ? resolveMessage(result.interruptionCause, t) : t('return.interruptedLog')}
          </p>
          <p className="scene-note">
            {t('nextAdventure.trainingsApplied', { count: result.finalState.setup.earthProfile?.trainings.length ?? 0 })}
          </p>
        </div>

        <div className="scene-grid">
          <button type="button" className="scene-card" onClick={onReplay}>
            <h3>{t('nextAdventure.newStrategyTitle')}</h3>
            <p>{t('nextAdventure.newStrategyDesc')}</p>
            <span className="scene-card__cta"><ArrowCounterClockwise weight="bold" aria-hidden="true" /> {t('nextAdventure.newStrategyAction')}</span>
          </button>
          <button type="button" className="scene-card" onClick={onOpenLearn}>
            <h3>{t('learn.title')}</h3>
            <p>{t('learn.subtitle')}</p>
            <span className="scene-card__cta"><BookOpen weight="bold" aria-hidden="true" /> {t('nextAdventure.learnAction')}</span>
          </button>
          <button type="button" className="scene-card" onClick={onOpenStation}>
            <h3>{t('nextAdventure.stationTitle')}</h3>
            <p>{t('nextAdventure.stationDesc')}</p>
            <span className="scene-card__cta"><UsersThree weight="bold" aria-hidden="true" /> {t('nextAdventure.stationAction')}</span>
          </button>
        </div>

        <div className="scene-actions scene-actions--between">
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
    </SceneScreen>
  );
}
