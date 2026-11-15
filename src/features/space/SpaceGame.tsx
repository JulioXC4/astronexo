import { useState } from 'react';
import type { MissionResult as LegacyMissionResult, SpaceGameProps } from '../../game/contracts';
import {
  advanceTurn,
  applyAction,
  createLegacyDemoMission,
  getMissionResult,
  LEGACY_DEMO_SCENARIO_ID,
} from '../../game';
import type {
  GameAction,
  GameSetup as MissionSetup,
  MissionResult,
  MissionState,
  ModuleId,
} from '../../game';
import { BaseBuilderView } from '../base-builder';
import { MissionControlView } from '../mission-control';
import { MissionResultsView } from '../mission-results';
import './space-game.css';

function adaptSetup(setup: SpaceGameProps['setup']): MissionSetup {
  return {
    mode: 'SOLO',
    city: setup.cityId.toUpperCase() === 'TROMSO' ? 'TROMSO' : 'AREQUIPA',
    destination: setup.destination,
    completedEarthMissions: [],
    selectedTools: [...setup.backpack],
    selectedModules: [],
    scenarioId: LEGACY_DEMO_SCENARIO_ID,
    difficulty: 'CALM',
  };
}

function adaptLegacyResult(
  result: MissionResult,
  setup: SpaceGameProps['setup'],
  evidence: SpaceGameProps['nasaData']['observations'],
): LegacyMissionResult {
  const state = result.finalState;
  return {
    outcome: result.outcome === 'COMPLETED' ? 'SUCCESS' : 'FAILED',
    destination: state.destination,
    finalState: {
      destination: state.destination,
      turn: state.turn,
      maxTurns: state.maxTurns,
      crew: 1,
      energy: state.energy,
      air: state.oxygen,
      shield: state.shield,
      food: state.foodSupply,
      radiationExposure: state.radiationExposure,
      scienceProgress: state.scienceProgress,
      communications: state.communicationAvailable ? 1 : 0,
      faults: state.unresolvedEvents.map((event) => event.summary),
      alerts: state.activeAlerts.map((alert) => ({
        id: alert.id,
        kind: alert.kind,
        summary: alert.title,
        severity: alert.severity,
      })),
      tools: setup.backpack,
      history: state.decisions.map((decision) => ({
        turn: decision.turn,
        alertId: decision.alertId ?? 'NO_ALERT',
        actionId: decision.action,
        explanation: decision.summary,
      })),
      status: result.outcome === 'COMPLETED' ? 'SUCCESS' : 'FAILED',
    },
    explanation: result.outcome === 'COMPLETED'
      ? `Guardia completada con ${result.score.total} puntos.`
      : `Guardia interrumpida: ${result.interruptionCause ?? 'causa no registrada'}`,
    evidence,
  };
}

export function SpaceGame({ setup, nasaData, onFinish }: SpaceGameProps) {
  const missionSetup = adaptSetup(setup);
  const [mission, setMission] = useState<MissionState | null>(null);
  const [transition, setTransition] = useState<string | null>(null);

  function startGuard(selectedModules: readonly ModuleId[]) {
    setMission(createLegacyDemoMission({ ...missionSetup, selectedModules }));
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
    setMission(createLegacyDemoMission(mission.setup));
    setTransition(null);
  }

  if (!mission) {
    return <BaseBuilderView destination={missionSetup.destination} onStart={startGuard} />;
  }

  if (transition) {
    return <main className="turn-transition" role="dialog" aria-modal="true" aria-label="Cambio de turno">
      <span>TRANSMISIÓN DE CONTROL</span>
      <strong>{transition}</strong>
      <div className="turn-transition__line" aria-hidden="true" />
      <button className="pixel-button pixel-button--primary" onClick={() => setTransition(null)}>
        CONTINUAR
      </button>
    </main>;
  }

  const result = getMissionResult(mission);
  if (result) {
    return <MissionResultsView
      result={result}
      onRetry={retry}
      onFinish={() => onFinish(adaptLegacyResult(result, setup, nasaData.observations))}
    />;
  }

  return <MissionControlView state={mission} onAction={handleAction} onAdvance={handleAdvance} />;
}
