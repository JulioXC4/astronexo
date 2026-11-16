import { useState } from 'react';
import {
  advanceTurn,
  applyExploration,
  claimStar,
  createMission,
  getMissionResult,
  isValidGameSetup,
  isValidPreBuildGameSetup,
  shouldOfferExploration,
} from '../../game';
import type { GameAction, GameSetup, MissionResult, MissionState, ModuleId } from '../../game';
import { msg, resolveMessage, useI18n } from '../../i18n';
import { playSound } from '../audio';
import { useGuardAudio } from '../space/useGuardAudio';
import { BaseBuilderView } from '../base-builder';
import { ExplorationEvent } from '../exploration';
import { CoopMissionResults } from './CoopMissionResults';
import { CoopMissionView } from './CoopMissionView';
import {
  confirmGroupDecision,
  rotateActivePlayer,
  stageGroupDecision,
  validateLocalCoopConfig,
} from './coop.types';
import type { LocalCoopConfig, PendingGroupDecision } from './coop.types';
import { TurnTransition } from '../space/TurnTransition';
import { TurnSummary } from '../space/TurnSummary';
import { collectTurnSummary, type TurnSummaryData } from '../space/turnSummaryData';
import '../space/space-game.css';
import './coop.css';

export interface CoopSpaceGameProps {
  readonly setup: GameSetup;
  readonly group: LocalCoopConfig;
  readonly onFinish: (result: MissionResult) => void;
}

function cloneGroup(group: LocalCoopConfig): LocalCoopConfig {
  return {
    ...group,
    players: group.players.map((player) => ({ ...player, roles: [...player.roles] })),
  };
}

export function CoopSpaceGame({ setup, group, onFinish }: CoopSpaceGameProps) {
  const { t } = useI18n();
  const groupErrors = validateLocalCoopConfig(group);
  const setupCanBeCompleted = isValidPreBuildGameSetup(setup);
  const initialSetupValid = setup.mode === 'LOCAL_COOP' && isValidGameSetup(setup);
  const [activeGroup, setActiveGroup] = useState<LocalCoopConfig>(() => cloneGroup(group));
  const [mission, setMission] = useState<MissionState | null>(() =>
    groupErrors.length === 0 && initialSetupValid ? createMission(setup) : null);
  const [pendingDecision, setPendingDecision] = useState<PendingGroupDecision | null>(null);
  const [transition, setTransition] = useState<string | null>(null);
  const [exploration, setExploration] = useState<{
    readonly turn: number;
    /** Reloj del turno que acaba de terminar: el que ve la pantalla de salida. */
    readonly clock: string;
    /** Reloj del turno que viene: lo anuncia la transición al volver. */
    readonly nextClock: string;
  } | null>(null);
  const [summary, setSummary] = useState<TurnSummaryData | null>(null);
  const [pendingTransition, setPendingTransition] = useState<string | null>(null);

  // Música, ambiente y avisos de la guardia (no altera el estado de la partida).
  useGuardAudio(mission, setup.destination, !mission ? 'builder'
    : summary || transition ? 'between'
      : exploration ? 'exploration'
        : getMissionResult(mission) ? 'result' : 'play');

  const setupErrors = [
    ...(setup.mode === 'LOCAL_COOP' ? [] : [msg('coopErrors.modeNotCoop')]),
    ...(setupCanBeCompleted ? [] : [msg('coopErrors.invalidSetup')]),
  ];
  if (groupErrors.length > 0 || setupErrors.length > 0) {
    return (
      <main className="coop-error-shell pixel-panel">
        <span className="pixel-kicker">{t('spaceGame.invalidKicker')}</span>
        <h1>{t('spaceGame.invalidTitle')}</h1>
        <ul>
          {[...groupErrors, ...setupErrors].map((error) => (
            <li key={error}>{resolveMessage(error, t)}</li>
          ))}
        </ul>
      </main>
    );
  }

  function startGuard(selectedModules: readonly ModuleId[]) {
    const completedSetup = { ...setup, selectedModules };
    setMission(createMission(completedSetup));
    setPendingDecision(null);
    setTransition(t('coop.transitionBuilt'));
  }

  function requestDecision(action: GameAction) {
    if (!mission || pendingDecision) return;
    setPendingDecision(stageGroupDecision(mission, activeGroup, action));
  }

  function confirmDecision() {
    if (!pendingDecision) return;
    setMission((current) => (current ? confirmGroupDecision(current, pendingDecision) : current));
    setPendingDecision(null);
  }

  function advanceCoopTurn() {
    if (!mission || pendingDecision || !mission.actionTakenThisTurn) return;
    const completedTurn = mission.turn;
    const next = advanceTurn(mission);
    if (next.completedTurns > mission.completedTurns) {
      setActiveGroup((current) => rotateActivePlayer(current));
    }
    setMission(next);
    const clockLabel = next.destination === 'MOON'
      ? t('missionControl.lunarDay', { day: next.clockLabel.match(/\d+/)?.[0] ?? next.turn })
      : next.clockLabel;
    const data = collectTurnSummary(mission, t);
    setSummary(data);
    if (next.outcome !== 'INTERRUPTED') playSound('guardTurnPassed');
    if (shouldOfferExploration(completedTurn, next)) {
      setExploration({ turn: completedTurn, clock: data.clock, nextClock: clockLabel });
      return;
    }
    setPendingTransition(next.outcome === 'IN_PROGRESS' ? clockLabel : t('coop.transitionReport'));
  }

  function retryAsTeam() {
    if (!mission) return;
    setMission(createMission(mission.setup));
    setActiveGroup(cloneGroup(group));
    setPendingDecision(null);
    setTransition(null);
    setSummary(null);
    setPendingTransition(null);
  }

  if (!mission) {
    return <BaseBuilderView destination={setup.destination} onStart={startGuard} />;
  }

  if (summary) {
    return <TurnSummary
      state={mission}
      completedTurn={summary.completedTurn}
      clock={summary.clock}
      delta={mission.lastTurnDelta}
      actionLabel={summary.actionLabel}
      ignoredAlerts={summary.ignoredAlerts}
      continueLabel={t(mission.outcome === 'IN_PROGRESS' ? 'turnSummary.next' : 'turnSummary.report')}
      onContinue={() => {
        setSummary(null);
        if (pendingTransition) { setTransition(pendingTransition); setPendingTransition(null); }
      }}
    />;
  }

  if (exploration) {
    return <ExplorationEvent
      state={mission}
      completedTurn={exploration.turn}
      clock={exploration.clock}
      onDone={(result) => {
        if (result) {
          setMission((current) => (current ? applyExploration(current, result) : current));
          // Quien decidió salir fue quien manejó: al volver, decide la siguiente persona.
          setActiveGroup((current) => rotateActivePlayer(current));
        }
        setTransition(exploration.nextClock);
        setExploration(null);
      }}
    />;
  }

  if (transition) {
    return <TurnTransition label={transition} onContinue={() => setTransition(null)} />;
  }

  const result = getMissionResult(mission);
  if (result) {
    return (
      <CoopMissionResults
        result={result}
        group={activeGroup}
        onRetry={retryAsTeam}
        onFinish={() => onFinish(result)}
      />
    );
  }

  return (
    <CoopMissionView
      state={mission}
      group={activeGroup}
      pendingDecision={pendingDecision}
      onRequestDecision={requestDecision}
      onConfirmDecision={confirmDecision}
      onCancelDecision={() => setPendingDecision(null)}
      onAdvance={advanceCoopTurn}
      onFindStar={(id) => setMission((current) => (current ? claimStar(current, id) : current))}
    />
  );
}
