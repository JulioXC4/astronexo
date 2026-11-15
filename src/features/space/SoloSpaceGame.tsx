import { useState } from 'react';
import {
  advanceTurn,
  applyAction,
  createMission,
  getMissionResult,
  isValidGameSetup,
  isValidPreBuildGameSetup,
} from '../../game';
import type { GameAction, GameSetup, MissionResult, MissionState, ModuleId } from '../../game';
import { BaseBuilderView } from '../base-builder';
import { MissionControlView } from '../mission-control';
import { MissionResultsView } from '../mission-results';
import { TurnTransition } from './TurnTransition';
import './space-game.css';

export interface SoloSpaceGameProps {
  readonly setup: GameSetup;
  readonly onFinish: (result: MissionResult) => void;
}

export function SoloSpaceGame({ setup, onFinish }: SoloSpaceGameProps) {
  const setupModeValid = setup.mode === 'SOLO';
  const setupCanBeCompleted = setupModeValid && isValidPreBuildGameSetup(setup);
  const initialSetupValid = setupModeValid && isValidGameSetup(setup);
  const [mission, setMission] = useState<MissionState | null>(() =>
    initialSetupValid ? createMission(setup) : null);
  const [transition, setTransition] = useState<string | null>(null);

  if (!setupCanBeCompleted) {
    return <main className="space-entry-error pixel-panel">
      <span className="pixel-kicker">CONFIGURACIÓN INDIVIDUAL INVÁLIDA</span>
      <h1>No se puede iniciar Despegue</h1>
      <p>Revisa modalidad, ciudad, destino, misiones terrestres, herramientas, escenario y dificultad.</p>
    </main>;
  }

  function startGuard(selectedModules: readonly ModuleId[]) {
    const completedSetup = { ...setup, selectedModules };
    setMission(createMission(completedSetup));
    setTransition('Base construida · Guardia lista');
  }

  function handleAction(action: GameAction) {
    setMission((current) => current ? applyAction(current, action) : current);
  }

  function handleAdvance() {
    if (!mission) return;
    const next = advanceTurn(mission);
    setMission(next);
    setTransition(next.outcome === 'IN_PROGRESS' ? next.clockLabel : 'Informe final de guardia');
  }

  function retry() {
    if (!mission) return;
    setMission(createMission(mission.setup));
    setTransition(null);
  }

  if (!mission) return <BaseBuilderView destination={setup.destination} onStart={startGuard} />;
  if (transition) return <TurnTransition label={transition} onContinue={() => setTransition(null)} />;

  const result = getMissionResult(mission);
  if (result) {
    return <MissionResultsView result={result} onRetry={retry} onFinish={() => onFinish(result)} />;
  }

  return <MissionControlView state={mission} onAction={handleAction} onAdvance={handleAdvance} />;
}
