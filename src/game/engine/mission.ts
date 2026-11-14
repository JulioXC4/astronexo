import {
  DESTINATION_CONFIG,
  DIFFICULTY_SCORE_FACTOR,
  EVENT_CONFIG,
  H2_EVENT_SCHEDULE,
  INITIAL_RESOURCES,
  SCIENCE_TARGET,
  getIntervention,
  scenarioSeedFromId,
} from '../config';
import { applyResourceDelta, canAfford, clampResource } from '../rules';
import type {
  ActionChoice,
  AlertKind,
  GameAction,
  GameSetup,
  InterventionAction,
  MissionAlert,
  MissionResult,
  MissionState,
  ResourceDelta,
  ScoreBreakdown,
  SelectedTools,
  ToolId,
  UnresolvedEvent,
} from '../types';

const MAX_TURNS = 5 as const;
const GUIDANCE_RESPONSES: Readonly<Record<Extract<ActionChoice, `${string}_GUIDANCE`>, string>> = {
  ENERGY_GUIDANCE: 'Respuesta simulada: prioriza recuperar eficiencia solar antes de consumir reservas.',
  RADIATION_GUIDANCE: 'Respuesta simulada: refuerza el refugio; la exposición acumulada no se reinicia.',
  LIFE_SUPPORT_GUIDANCE: 'Respuesta simulada: atiende fugas antes de activar ciclos de recuperación.',
};

function cloneTools(tools: SelectedTools): SelectedTools {
  return [tools[0], tools[1], tools[2]];
}

function hasTool(state: Pick<MissionState, 'selectedTools'>, ...ids: readonly ToolId[]) {
  return ids.some((id) => state.selectedTools.includes(id));
}

function sumDeltas(deltas: readonly ResourceDelta[]): ResourceDelta {
  return deltas.reduce<ResourceDelta>((total, delta) => ({
    energy: (total.energy ?? 0) + (delta.energy ?? 0),
    oxygen: (total.oxygen ?? 0) + (delta.oxygen ?? 0),
    shield: (total.shield ?? 0) + (delta.shield ?? 0),
    foodSupply: (total.foodSupply ?? 0) + (delta.foodSupply ?? 0),
    radiationExposure: (total.radiationExposure ?? 0) + (delta.radiationExposure ?? 0),
    scienceProgress: (total.scienceProgress ?? 0) + (delta.scienceProgress ?? 0),
    solarEfficiency: (total.solarEfficiency ?? 0) + (delta.solarEfficiency ?? 0),
  }), {});
}

function scaleDelta(delta: ResourceDelta, factor: number): ResourceDelta {
  const scale = (value: number | undefined) => value === undefined ? undefined : Math.round(value * factor);
  return {
    energy: scale(delta.energy),
    oxygen: scale(delta.oxygen),
    shield: scale(delta.shield),
    foodSupply: scale(delta.foodSupply),
    radiationExposure: scale(delta.radiationExposure),
    scienceProgress: scale(delta.scienceProgress),
    solarEfficiency: scale(delta.solarEfficiency),
  };
}

function initialToolDelta(tools: SelectedTools): ResourceDelta {
  const deltas = tools.map<ResourceDelta>((tool) => {
    switch (tool) {
      case 'EXTRA_BATTERY': return { energy: 18 };
      case 'GROW_TRAY': return { foodSupply: 14 };
      case 'WATER_RECYCLER': return { oxygen: 8, foodSupply: 6 };
      case 'THERMAL_INSULATION': return { shield: 15 };
      case 'FOLDING_PANELS': return { energy: 8 };
      case 'LIFE_SUPPORT': return { oxygen: 8 };
      case 'SHELTER_KIT': return { shield: 8 };
      case 'CROP_KIT': return { foodSupply: 8 };
      default: return {};
    }
  });
  return sumDeltas(deltas);
}

function createAlert(kind: AlertKind, turn: number, seed: number): MissionAlert {
  const event = EVENT_CONFIG[kind];
  return {
    id: `${kind}-T${turn}-S${seed % 10000}`,
    kind,
    title: event.title,
    description: event.description,
    consequencePreview: event.consequencePreview,
    severity: 1,
    age: 0,
  };
}

function rotatedCandidates(kinds: readonly AlertKind[], turn: number, seed: number) {
  if (kinds.length < 2) return [...kinds];
  const offset = (seed + turn) % kinds.length;
  return [...kinds.slice(offset), ...kinds.slice(0, offset)];
}

function fillTurnAlerts(
  destination: GameSetup['destination'],
  turn: number,
  carried: readonly MissionAlert[],
  seed: number,
  consultationUsed: boolean,
): readonly MissionAlert[] {
  const alerts = [...carried];
  const kinds = new Set(alerts.map((alert) => alert.kind));
  const candidates = rotatedCandidates(H2_EVENT_SCHEDULE[destination][turn - 1] ?? [], turn, seed);
  for (const kind of candidates) {
    if (alerts.length >= 2) break;
    if (consultationUsed && kind === 'COMMUNICATION_WINDOW') continue;
    if (!EVENT_CONFIG[kind].destinations.includes(destination) || kinds.has(kind)) continue;
    alerts.push(createAlert(kind, turn, seed));
    kinds.add(kind);
  }
  return alerts;
}

export function createMission(setup: GameSetup): MissionState {
  const config = DESTINATION_CONFIG[setup.destination];
  const selectedTools = cloneTools(setup.selectedTools);
  const scenarioSeed = scenarioSeedFromId(setup.scenarioId);
  const baseState: MissionState = {
    setup: {
      ...setup,
      completedEarthMissions: [...setup.completedEarthMissions],
      selectedTools,
      selectedModules: [...setup.selectedModules],
    },
    destination: setup.destination,
    turn: 1,
    completedTurns: 0,
    maxTurns: MAX_TURNS,
    clockLabel: config.clockLabels[0],
    ...INITIAL_RESOURCES,
    greenhouseActive: true,
    communicationAvailable: true,
    consultationUsed: false,
    pendingCommunication: null,
    earlyWarningCharges: selectedTools.includes('EARLY_WARNING') ? 1 : 0,
    scenarioSeed,
    activeAlerts: fillTurnAlerts(setup.destination, 1, [], scenarioSeed, false),
    unresolvedEvents: [],
    selectedTools,
    selectedModules: [...setup.selectedModules],
    actionTakenThisTurn: false,
    decisions: [],
    resolvedAlertCount: 0,
    ignoredAlertCount: 0,
    outcome: 'IN_PROGRESS',
  };
  return applyResourceDelta(baseState, initialToolDelta(selectedTools));
}

export function getActionCost(state: MissionState, action: GameAction): ResourceDelta {
  if (action.type === 'SKIP_INTERVENTION') return {};
  const intervention = getIntervention(action.type);
  if (!intervention) return {};
  if (action.type === 'MANAGE_GREENHOUSE' && action.choiceId === 'SUSPEND_CROPS') return {};
  if (action.type === 'REPAIR_PANELS' && hasTool(state, 'SPARE_PARTS_KIT')) {
    return { ...intervention.cost, energy: -3 };
  }
  return intervention.cost;
}

function getActionEffect(state: MissionState, action: GameAction): ResourceDelta {
  if (action.type === 'SKIP_INTERVENTION') return {};
  const intervention = getIntervention(action.type);
  if (!intervention) return {};
  if (action.type === 'RECYCLE_OXYGEN' && hasTool(state, 'WATER_RECYCLER')) {
    return { ...intervention.effect, oxygen: 25 };
  }
  if (action.type === 'MANAGE_GREENHOUSE') {
    if (action.choiceId === 'SUSPEND_CROPS') return { energy: 5, foodSupply: -5 };
    const foodBonus = hasTool(state, 'GROW_TRAY', 'CROP_KIT') ? 4 : 0;
    return { foodSupply: 16 + foodBonus };
  }
  return intervention.effect;
}

function findMatchingAlert(state: MissionState, action: GameAction) {
  if (action.type === 'SKIP_INTERVENTION') return undefined;
  const intervention = getIntervention(action.type);
  if (!intervention) return undefined;
  return state.activeAlerts.find((alert) =>
    intervention.resolves.includes(alert.kind)
    && (!action.targetId || alert.id === action.targetId));
}

function isGuidanceChoice(choice: ActionChoice | undefined): choice is Extract<ActionChoice, `${string}_GUIDANCE`> {
  return choice === 'ENERGY_GUIDANCE'
    || choice === 'RADIATION_GUIDANCE'
    || choice === 'LIFE_SUPPORT_GUIDANCE';
}

function actionAllowed(state: MissionState, action: GameAction) {
  if (action.type === 'SKIP_INTERVENTION') return true;
  const intervention = getIntervention(action.type);
  if (!intervention) return false;
  const matchingAlert = findMatchingAlert(state, action);
  if (intervention.requiresAlert && !matchingAlert) return false;
  if (action.type === 'RECYCLE_OXYGEN' && state.oxygen >= 100) return false;
  if (action.type === 'REINFORCE_SHELTER' && state.shield >= 100) return false;
  if (action.type === 'RUN_RESEARCH' && state.scienceProgress >= 100) return false;
  if (action.type === 'MANAGE_GREENHOUSE'
    && action.choiceId !== 'MAINTAIN_CROPS'
    && action.choiceId !== 'SUSPEND_CROPS') return false;
  if (action.type === 'CONSULT_EARTH') {
    if (!isGuidanceChoice(action.choiceId) || state.consultationUsed || !state.communicationAvailable) return false;
    if (state.destination === 'MARS' && state.turn === state.maxTurns) return false;
  }
  return canAfford(state, getActionCost(state, action));
}

function actionSummary(action: GameAction, alert: MissionAlert | undefined, response?: string) {
  if (action.type === 'MANAGE_GREENHOUSE') {
    return action.choiceId === 'SUSPEND_CROPS'
      ? 'Invernadero suspendido: se ahorró energía a cambio de alimento.'
      : 'Invernadero mantenido: se invirtió energía para recuperar alimento.';
  }
  if (action.type === 'CONSULT_EARTH') {
    return response ?? 'Consulta enviada a la Tierra; respuesta pendiente para el siguiente turno.';
  }
  const intervention = action.type === 'SKIP_INTERVENTION' ? undefined : getIntervention(action.type);
  return `${intervention?.label ?? action.type}${alert ? `: ${alert.title} atendida.` : ' completada.'}`;
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
  if (!actionAllowed(state, action)) return state;

  const intervention = getIntervention(action.type as InterventionAction);
  if (!intervention) return state;
  const alert = findMatchingAlert(state, action);
  const cost = getActionCost(state, action);
  const effect = getActionEffect(state, action);
  const changed = applyResourceDelta(applyResourceDelta(state, cost), effect);
  const guidance = isGuidanceChoice(action.choiceId) ? action.choiceId : undefined;
  const immediateResponse = action.type === 'CONSULT_EARTH' && state.destination === 'MOON' && guidance
    ? GUIDANCE_RESPONSES[guidance]
    : undefined;
  const pendingCommunication = action.type === 'CONSULT_EARTH' && state.destination === 'MARS' && guidance
    ? { request: guidance, requestedTurn: state.turn, dueTurn: state.turn + 1 }
    : state.pendingCommunication;
  const summary = actionSummary(action, alert, immediateResponse);

  return {
    ...changed,
    activeAlerts: alert
      ? state.activeAlerts.filter((candidate) => candidate.id !== alert.id)
      : state.activeAlerts,
    greenhouseActive: action.type === 'MANAGE_GREENHOUSE'
      ? action.choiceId === 'MAINTAIN_CROPS'
      : state.greenhouseActive,
    consultationUsed: action.type === 'CONSULT_EARTH' ? true : state.consultationUsed,
    communicationAvailable: action.type === 'CONSULT_EARTH' ? false : state.communicationAvailable,
    communicationResponse: immediateResponse ?? state.communicationResponse,
    pendingCommunication,
    actionTakenThisTurn: true,
    decisions: [...state.decisions, {
      turn: state.turn,
      action: action.type,
      alertId: alert?.id,
      summary,
      resourceDelta: sumDeltas([cost, effect]),
    }],
    resolvedAlertCount: state.resolvedAlertCount + (alert ? 1 : 0),
    lastFeedback: { ok: true, message: summary, resourceDelta: sumDeltas([cost, effect]) },
  };
}

function alertConsequence(alert: MissionAlert): ResourceDelta {
  const config = EVENT_CONFIG[alert.kind];
  const escalations = Math.max(0, alert.severity - 1);
  return sumDeltas([config.baseConsequence, scaleDelta(config.escalation, escalations)]);
}

function interruptionCause(state: MissionState): string | undefined {
  if (state.oxygen <= 0) return 'El oxígeno llegó a cero por fugas o consumo acumulado.';
  if (state.energy <= 0) return 'La energía llegó a cero y la base no pudo continuar la guardia.';
  if (state.foodSupply <= 0) return 'Los suministros alimentarios se agotaron.';
  if (state.radiationExposure >= 100) return 'La exposición radiológica simulada alcanzó el límite de seguridad.';
  return undefined;
}

function operationalDelta(state: MissionState): ResourceDelta {
  const config = DESTINATION_CONFIG[state.destination];
  const solarGain = Math.round(config.solarProduction[state.turn - 1] * state.solarEfficiency / 100);
  const waterRecycler = hasTool(state, 'WATER_RECYCLER');
  const lifeSupport = hasTool(state, 'LIFE_SUPPORT');
  const insulated = hasTool(state, 'THERMAL_INSULATION', 'SHELTER_KIT');
  const radiationGain = Math.max(
    0,
    config.radiationPerTurn - state.shield * 0.05 - (insulated ? 1 : 0),
  );
  return {
    energy: solarGain - config.baseEnergyUse,
    oxygen: -Math.max(1, config.baseOxygenUse - (waterRecycler || lifeSupport ? 1 : 0)),
    foodSupply: -Math.max(1, config.baseFoodUse - (waterRecycler ? 1 : 0)),
    radiationExposure: radiationGain,
  };
}

export function advanceTurn(state: MissionState): MissionState {
  if (state.outcome !== 'IN_PROGRESS' || !state.actionTakenThisTurn) return state;

  const earlyWarningUsed = state.earlyWarningCharges > 0 && state.activeAlerts.length > 0;
  const unresolvedEvents: UnresolvedEvent[] = state.activeAlerts.map((alert, index) => {
    const protectedByWarning = earlyWarningUsed && index === 0;
    const resourceDelta = protectedByWarning
      ? scaleDelta(alertConsequence(alert), 0.5)
      : alertConsequence(alert);
    return {
      id: `UNRESOLVED-${alert.id}-T${state.turn}`,
      sourceAlertId: alert.id,
      turn: state.turn,
      summary: `${alert.title} aplicó consecuencias de nivel ${alert.severity}${protectedByWarning ? ' reducidas por Alerta temprana' : ''}.`,
      resourceDelta,
    };
  });
  const afterAlerts = applyResourceDelta(state, sumDeltas(unresolvedEvents.map((event) => event.resourceDelta)));
  const afterOperations = applyResourceDelta(afterAlerts, operationalDelta(afterAlerts));
  const completedTurns = state.completedTurns + 1;
  const nextTurn = state.turn + 1;
  const communicationArrived = state.pendingCommunication !== null
    && state.pendingCommunication.dueTurn <= nextTurn;
  const communicationResponse = communicationArrived && state.pendingCommunication
    ? GUIDANCE_RESPONSES[state.pendingCommunication.request]
    : state.communicationResponse;
  const withHistory: MissionState = {
    ...afterOperations,
    completedTurns,
    unresolvedEvents: [...state.unresolvedEvents, ...unresolvedEvents],
    ignoredAlertCount: state.ignoredAlertCount + state.activeAlerts.length,
    earlyWarningCharges: earlyWarningUsed ? state.earlyWarningCharges - 1 : state.earlyWarningCharges,
    pendingCommunication: communicationArrived ? null : state.pendingCommunication,
    communicationResponse,
    lastFeedback: communicationArrived && communicationResponse
      ? { ok: true, message: communicationResponse, resourceDelta: {} }
      : undefined,
  };
  const cause = interruptionCause(withHistory);
  if (cause) return { ...withHistory, outcome: 'INTERRUPTED', interruptionCause: cause };
  if (state.turn === MAX_TURNS) return { ...withHistory, outcome: 'COMPLETED' };

  const carried = state.activeAlerts.map((alert) => ({
    ...alert,
    age: alert.age + 1,
    severity: Math.min(5, alert.severity + 1),
  }));
  return {
    ...withHistory,
    turn: nextTurn,
    clockLabel: DESTINATION_CONFIG[state.destination].clockLabels[nextTurn - 1],
    activeAlerts: fillTurnAlerts(
      state.destination,
      nextTurn,
      carried,
      state.scenarioSeed,
      state.consultationUsed,
    ),
    actionTakenThisTurn: false,
  };
}

function calculateScore(state: MissionState): ScoreBreakdown {
  const crewSafety = clampResource(
    (state.oxygen + state.shield + state.foodSupply + (100 - state.radiationExposure)) / 4,
  );
  const finalResources = clampResource((state.energy + state.oxygen + state.foodSupply) / 3);
  const alertAttempts = state.resolvedAlertCount + state.ignoredAlertCount;
  const alertPrioritization = alertAttempts === 0
    ? 100
    : clampResource((state.resolvedAlertCount / alertAttempts) * 100);
  const operationalCompletion = clampResource((state.completedTurns / state.maxTurns) * 100);
  const scientificObjective = state.scienceProgress >= SCIENCE_TARGET ? 100 : 0;
  const difficultyFactor = DIFFICULTY_SCORE_FACTOR[state.setup.difficulty];
  const base = (crewSafety + finalResources + alertPrioritization + scientificObjective) / 4;
  return {
    crewSafety,
    finalResources,
    alertPrioritization,
    operationalCompletion,
    scientificObjective,
    difficultyFactor,
    total: clampResource(base * difficultyFactor),
  };
}

export function getMissionResult(state: MissionState): MissionResult | null {
  if (state.outcome === 'IN_PROGRESS') return null;
  const helpfulDecisions = state.decisions
    .filter((decision) => decision.action !== 'SKIP_INTERVENTION')
    .map((decision) => decision.summary);
  const harmfulDecisions = state.unresolvedEvents.slice(-8).map((event) => event.summary);
  return {
    outcome: state.outcome,
    turnsReached: state.completedTurns,
    finalState: state,
    score: calculateScore(state),
    interruptionCause: state.interruptionCause,
    helpfulDecisions,
    harmfulDecisions,
    causeAndEffect: [...helpfulDecisions.slice(-4), ...harmfulDecisions.slice(-4)],
    scientificObjectiveAchieved: state.scienceProgress >= SCIENCE_TARGET,
    relevantTools: state.selectedTools,
    relevantModules: [...state.selectedModules],
  };
}
