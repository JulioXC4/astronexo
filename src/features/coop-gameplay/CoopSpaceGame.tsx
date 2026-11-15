import { useState } from 'react';
import {
  advanceTurn,
  createMission,
  getMissionResult,
  isValidGameSetup,
  isValidPreBuildGameSetup,
} from '../../game';
import type { GameAction, GameSetup, MissionResult, MissionState, ModuleId } from '../../game';
import { BaseBuilderView } from '../base-builder';
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
  const groupErrors = validateLocalCoopConfig(group);
  const setupCanBeCompleted = isValidPreBuildGameSetup(setup);
  const initialSetupValid = setup.mode === 'LOCAL_COOP' && isValidGameSetup(setup);
  const [activeGroup, setActiveGroup] = useState<LocalCoopConfig>(() => cloneGroup(group));
  const [mission, setMission] = useState<MissionState | null>(() =>
    groupErrors.length === 0 && initialSetupValid ? createMission(setup) : null);
  const [pendingDecision, setPendingDecision] = useState<PendingGroupDecision | null>(null);
  const [transition, setTransition] = useState<string | null>(null);

  const setupErrors = [
    ...(setup.mode === 'LOCAL_COOP' ? [] : ['GameSetup debe usar mode: LOCAL_COOP.']),
    ...(setupCanBeCompleted ? [] : ['La configuración canónica de misión es inválida.']),
  ];
  if (groupErrors.length > 0 || setupErrors.length > 0) {
    return <main className="coop-error-shell pixel-panel">
      <span className="pixel-kicker">CONFIGURACIÓN COOPERATIVA INVÁLIDA</span>
      <h1>No se puede iniciar la Estación</h1>
      <ul>{[...groupErrors, ...setupErrors].map((error) => <li key={error}>{error}</li>)}</ul>
    </main>;
  }

  function startGuard(selectedModules: readonly ModuleId[]) {
    const completedSetup = { ...setup, selectedModules };
    setMission(createMission(completedSetup));
    setPendingDecision(null);
    setTransition('Base construida · Guardia lista');
  }

  function requestDecision(action: GameAction) {
    if (!mission || pendingDecision) return;
    setPendingDecision(stageGroupDecision(mission, activeGroup, action));
  }

  function confirmDecision() {
    if (!pendingDecision) return;
    setMission((current) => current ? confirmGroupDecision(current, pendingDecision) : current);
    setPendingDecision(null);
  }

  function advanceCoopTurn() {
    if (!mission || pendingDecision || !mission.actionTakenThisTurn) return;
    const next = advanceTurn(mission);
    if (next.completedTurns > mission.completedTurns) {
      setActiveGroup((current) => rotateActivePlayer(current));
    }
    setMission(next);
    setTransition(next.outcome === 'IN_PROGRESS' ? next.clockLabel : 'Informe colectivo de guardia');
  }

  function retryAsTeam() {
    if (!mission) return;
    setMission(createMission(mission.setup));
    setActiveGroup(cloneGroup(group));
    setPendingDecision(null);
    setTransition(null);
  }

  if (!mission) {
    return <BaseBuilderView destination={setup.destination} onStart={startGuard} />;
  }

  if (transition) {
    return <TurnTransition label={transition} onContinue={() => setTransition(null)} />;
  }

  const result = getMissionResult(mission);
  if (result) {
    return <CoopMissionResults
      result={result}
      group={activeGroup}
      onRetry={retryAsTeam}
      onFinish={() => onFinish(result)}
    />;
  }

  return <CoopMissionView
    state={mission}
    group={activeGroup}
    pendingDecision={pendingDecision}
    onRequestDecision={requestDecision}
    onConfirmDecision={confirmDecision}
    onCancelDecision={() => setPendingDecision(null)}
    onAdvance={advanceCoopTurn}
  />;
}
