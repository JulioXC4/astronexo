import { useState } from 'react';
import {
  advanceTurn,
  applyAction,
  applyExploration,
  claimStar,
  createMission,
  getMissionResult,
  isValidGameSetup,
  isValidPreBuildGameSetup,
  shouldOfferExploration,
} from '../../game';
import type { GameAction, GameSetup, MissionResult, MissionState, ModuleId } from '../../game';
import { BaseBuilderView } from '../base-builder';
import { MissionControlView } from '../mission-control';
import { MissionResultsView } from '../mission-results';
import { ExplorationEvent } from '../exploration';
import { TurnTransition } from './TurnTransition';
import { useI18n } from '../../i18n';
import './space-game.css';

export interface SoloSpaceGameProps {
  readonly setup: GameSetup;
  readonly onFinish: (result: MissionResult) => void;
}

export function SoloSpaceGame({ setup, onFinish }: SoloSpaceGameProps) {
  const { t } = useI18n();
  const setupModeValid = setup.mode === 'SOLO';
  const setupCanBeCompleted = setupModeValid && isValidPreBuildGameSetup(setup);
  const initialSetupValid = setupModeValid && isValidGameSetup(setup);
  const [mission, setMission] = useState<MissionState | null>(() =>
    initialSetupValid ? createMission(setup) : null);
  const [transition, setTransition] = useState<string | null>(null);
  // Salida a explorar: ventana opcional tras los turnos 2 y 4.
  const [exploration, setExploration] = useState<{
    readonly turn: number;
    /** Reloj del turno que acaba de terminar: el que ve la pantalla de salida. */
    readonly clock: string;
    /** Reloj del turno que viene: lo anuncia la transición al volver. */
    readonly nextClock: string;
  } | null>(null);

  if (!setupCanBeCompleted) {
    return <main className="space-entry-error pixel-panel">
      <span className="pixel-kicker">{t('spaceGame.invalidKicker')}</span>
      <h1>{t('spaceGame.invalidTitle')}</h1>
      <p>{t('spaceGame.invalidDescription')}</p>
    </main>;
  }

  function startGuard(selectedModules: readonly ModuleId[]) {
    const completedSetup = { ...setup, selectedModules };
    setMission(createMission(completedSetup));
    setTransition(t('spaceGame.baseBuilt'));
  }

  function handleAction(action: GameAction) {
    setMission((current) => current ? applyAction(current, action) : current);
  }

  function handleAdvance() {
    if (!mission) return;
    const completedTurn = mission.turn;
    const next = advanceTurn(mission);
    setMission(next);
    const clockLabel = next.destination === 'MOON'
      ? t('missionControl.lunarDay', { day: next.clockLabel.match(/\d+/)?.[0] ?? next.turn })
      : next.clockLabel;
    if (shouldOfferExploration(completedTurn, next)) {
      const doneClock = mission.destination === 'MOON'
        ? t('missionControl.lunarDay', { day: mission.clockLabel.match(/\d+/)?.[0] ?? completedTurn })
        : mission.clockLabel;
      setExploration({ turn: completedTurn, clock: doneClock, nextClock: clockLabel });
      return;
    }
    setTransition(next.outcome === 'IN_PROGRESS' ? clockLabel : t('spaceGame.finalReport'));
  }

  function retry() {
    if (!mission) return;
    setMission(createMission(mission.setup));
    setTransition(null);
  }

  if (!mission) return <BaseBuilderView destination={setup.destination} onStart={startGuard} />;
  if (exploration) {
    return <ExplorationEvent
      state={mission}
      completedTurn={exploration.turn}
      clock={exploration.clock}
      onDone={(result) => {
        if (result) setMission((current) => current ? applyExploration(current, result) : current);
        setTransition(exploration.nextClock);
        setExploration(null);
      }}
    />;
  }
  if (transition) return <TurnTransition label={transition} onContinue={() => setTransition(null)} />;

  const result = getMissionResult(mission);
  if (result) {
    return <MissionResultsView result={result} onRetry={retry} onFinish={() => onFinish(result)} />;
  }

  return <MissionControlView
    state={mission}
    onAction={handleAction}
    onAdvance={handleAdvance}
    onFindStar={(id) => setMission((current) => current ? claimStar(current, id) : current)}
  />;
}
