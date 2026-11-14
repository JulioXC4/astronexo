import {
  DESTINATION_CONFIG,
  DIFFICULTY_SCORE_FACTOR,
  H1_ALERT_SCHEDULE,
  INITIAL_RESOURCES,
  getIntervention,
} from '../config';
import { applyResourceDelta, canAfford, clampResource } from '../rules';
import type {
  AlertKind,
  GameAction,
  GameSetup,
  MissionAlert,
  MissionResult,
  MissionState,
  ResourceDelta,
  ScoreBreakdown,
  UnresolvedEvent,
} from '../types';

const MAX_TURNS = 5 as const;

const ALERT_COPY: Readonly<Record<AlertKind, Omit<MissionAlert, 'id' | 'severity' | 'age'>>> = {
  PANEL_DAMAGE: {
    kind: 'PANEL_DAMAGE',
    title: 'Panel solar dañado',
    description: 'Una unión del arreglo solar perdió contacto.',
    consequencePreview: 'Si se ignora, la pérdida de energía aumenta cada turno.',
  },
  OXYGEN_LEAK: {
    kind: 'OXYGEN_LEAK',
    title: 'Fuga de oxígeno',
    description: 'El circuito de soporte vital registra una fuga pequeña.',
    consequencePreview: 'Si se ignora, la pérdida de oxígeno aumenta cada turno.',
  },
};

function createAlert(kind: AlertKind, turn: number): MissionAlert {
  return {
    ...ALERT_COPY[kind],
    id: `${kind}-T${turn}`,
    severity: 1,
    age: 0,
  };
}

function fillTurnAlerts(
  destination: GameSetup['destination'],
  turn: number,
  carried: readonly MissionAlert[],
): readonly MissionAlert[] {
  const alerts = [...carried];
  const kinds = new Set(alerts.map((alert) => alert.kind));
  for (const kind of H1_ALERT_SCHEDULE[destination][turn - 1] ?? []) {
    if (alerts.length >= 2) break;
    if (!kinds.has(kind)) {
      alerts.push(createAlert(kind, turn));
      kinds.add(kind);
    }
  }
  return alerts;
}

export function createMission(setup: GameSetup): MissionState {
  const config = DESTINATION_CONFIG[setup.destination];
  return {
    setup: {
      ...setup,
      selectedTools: [...setup.selectedTools],
      selectedModules: [...setup.selectedModules],
    },
    destination: setup.destination,
    turn: 1,
    maxTurns: MAX_TURNS,
    clockLabel: config.clockLabels[0],
    ...INITIAL_RESOURCES,
    communicationAvailable: setup.destination === 'MOON',
    activeAlerts: fillTurnAlerts(setup.destination, 1, []),
    unresolvedEvents: [],
    selectedTools: [...setup.selectedTools],
    selectedModules: [...setup.selectedModules],
    actionTakenThisTurn: false,
    decisions: [],
    resolvedAlertCount: 0,
    ignoredAlertCount: 0,
    outcome: 'IN_PROGRESS',
  };
}

export function applyAction(state: MissionState, action: GameAction): MissionState {
  if (state.outcome !== 'IN_PROGRESS' || state.actionTakenThisTurn) return state;

  if (action.type === 'SKIP_INTERVENTION') {
    return {
      ...state,
      actionTakenThisTurn: true,
      decisions: [...state.decisions, {
        turn: state.turn,
        action: action.type,
        summary: 'La tripulación cerró el turno sin una intervención principal.',
        resourceDelta: {},
      }],
      lastFeedback: {
        ok: true,
        message: 'Turno preparado sin intervención. Las alertas activas tendrán consecuencias.',
        resourceDelta: {},
      },
    };
  }

  const intervention = getIntervention(action.type);
  if (!intervention) return state;
  const alert = state.activeAlerts.find((candidate) =>
    candidate.kind === intervention.resolves
    && (!action.targetId || candidate.id === action.targetId));
  if (!alert || !canAfford(state, intervention.cost)) return state;

  const paidState = applyResourceDelta(state, intervention.cost);
  return {
    ...paidState,
    activeAlerts: state.activeAlerts.filter((candidate) => candidate.id !== alert.id),
    actionTakenThisTurn: true,
    decisions: [...state.decisions, {
      turn: state.turn,
      action: action.type,
      alertId: alert.id,
      summary: `${intervention.label}: ${alert.title} resuelta.`,
      resourceDelta: intervention.cost,
    }],
    resolvedAlertCount: state.resolvedAlertCount + 1,
    lastFeedback: {
      ok: true,
      message: `${alert.title} resuelta. ${intervention.benefit}`,
      resourceDelta: intervention.cost,
    },
  };
}

function alertConsequence(alert: MissionAlert): ResourceDelta {
  if (alert.kind === 'PANEL_DAMAGE') {
    return { energy: -(5 + alert.severity * 2) };
  }
  return { oxygen: -(8 + alert.severity * 3) };
}

function consequenceSummary(alert: MissionAlert) {
  return alert.kind === 'PANEL_DAMAGE'
    ? `El panel dañado redujo la energía (nivel ${alert.severity}).`
    : `La fuga redujo el oxígeno (nivel ${alert.severity}).`;
}

function interruptionCause(state: MissionState): string | undefined {
  if (state.oxygen <= 0) return 'El oxígeno llegó a cero por fugas o consumo acumulado.';
  if (state.energy <= 0) return 'La energía llegó a cero y la base no pudo continuar la guardia.';
  if (state.foodSupply <= 0) return 'Los suministros alimentarios se agotaron.';
  if (state.radiationExposure >= 100) return 'La exposición radiológica simulada alcanzó el límite de seguridad.';
  return undefined;
}

export function advanceTurn(state: MissionState): MissionState {
  if (state.outcome !== 'IN_PROGRESS') return state;

  const config = DESTINATION_CONFIG[state.destination];
  const unresolvedEvents: UnresolvedEvent[] = state.activeAlerts.map((alert) => ({
    id: `UNRESOLVED-${alert.id}-T${state.turn}`,
    sourceAlertId: alert.id,
    turn: state.turn,
    summary: consequenceSummary(alert),
    resourceDelta: alertConsequence(alert),
  }));
  const ignoredDelta = unresolvedEvents.reduce<ResourceDelta>((total, event) => ({
    energy: (total.energy ?? 0) + (event.resourceDelta.energy ?? 0),
    oxygen: (total.oxygen ?? 0) + (event.resourceDelta.oxygen ?? 0),
  }), {});
  const radiationGain = Math.max(0, config.radiationPerTurn - state.shield * 0.06);
  const operationsDelta: ResourceDelta = {
    energy: config.solarProduction[state.turn - 1] - config.baseEnergyUse,
    oxygen: -config.baseOxygenUse,
    foodSupply: -config.baseFoodUse,
    radiationExposure: radiationGain,
  };
  const afterAlerts = applyResourceDelta(state, ignoredDelta);
  const afterOperations = applyResourceDelta(afterAlerts, operationsDelta);
  const withHistory: MissionState = {
    ...afterOperations,
    unresolvedEvents: [...state.unresolvedEvents, ...unresolvedEvents],
    ignoredAlertCount: state.ignoredAlertCount + state.activeAlerts.length,
    lastFeedback: undefined,
  };
  const cause = interruptionCause(withHistory);
  if (cause) {
    return { ...withHistory, outcome: 'INTERRUPTED', interruptionCause: cause };
  }
  if (state.turn === MAX_TURNS) {
    return { ...withHistory, outcome: 'COMPLETED' };
  }

  const nextTurn = state.turn + 1;
  const carried = state.activeAlerts.map((alert) => ({
    ...alert,
    age: alert.age + 1,
    severity: Math.min(5, alert.severity + 1),
  }));
  return {
    ...withHistory,
    turn: nextTurn,
    clockLabel: config.clockLabels[nextTurn - 1],
    activeAlerts: fillTurnAlerts(state.destination, nextTurn, carried),
    actionTakenThisTurn: false,
    communicationAvailable: state.destination === 'MOON',
  };
}

function calculateScore(state: MissionState): ScoreBreakdown {
  const crewSafety = clampResource((state.oxygen + state.shield + (100 - state.radiationExposure)) / 3);
  const finalResources = clampResource((state.energy + state.oxygen + state.foodSupply) / 3);
  const alertAttempts = state.resolvedAlertCount + state.ignoredAlertCount;
  const alertPrioritization = alertAttempts === 0
    ? 100
    : clampResource((state.resolvedAlertCount / alertAttempts) * 100);
  const objectiveCompletion = state.outcome === 'COMPLETED'
    ? 100
    : clampResource((state.turn / state.maxTurns) * 60);
  const difficultyFactor = DIFFICULTY_SCORE_FACTOR[state.setup.difficulty];
  const base = (crewSafety + finalResources + alertPrioritization + objectiveCompletion) / 4;
  return {
    crewSafety,
    finalResources,
    alertPrioritization,
    objectiveCompletion,
    difficultyFactor,
    total: clampResource(base * difficultyFactor),
  };
}

export function getMissionResult(state: MissionState): MissionResult | null {
  if (state.outcome === 'IN_PROGRESS') return null;
  return {
    outcome: state.outcome,
    turnsReached: state.turn,
    finalState: state,
    score: calculateScore(state),
    interruptionCause: state.interruptionCause,
    helpfulDecisions: state.decisions
      .filter((decision) => decision.alertId)
      .map((decision) => decision.summary),
    harmfulDecisions: state.unresolvedEvents.slice(-4).map((event) => event.summary),
    relevantTools: [...state.selectedTools],
    relevantModules: [...state.selectedModules],
  };
}
