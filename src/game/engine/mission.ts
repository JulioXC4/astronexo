import {
  DESTINATION_CONFIG,
  DIFFICULTY_SCORE_FACTOR,
  EVENT_CONFIG,
  H2_EVENT_SCHEDULE,
  H2_TOOL_RULES,
  INITIAL_RESOURCES,
  LEGACY_DEMO_SCENARIO_ID,
  SCIENCE_TARGET,
  getInitialModuleDelta,
  getInitialModuleOperations,
  getIntervention,
  getModuleDefinition,
  getModuleTurnOperations,
  MODULE_CATALOG,
  isLegacyDemoSetup,
  isValidGameSetup,
  scenarioSeedFromId,
} from '../config';
import { applyResourceDelta, canAfford, clampResource, scaleEffectByQuality } from '../rules';
import type {
  ActionChoice,
  AlertKind,
  GameAction,
  GameSetup,
  InterventionAction,
  MissionAlert,
  MissionResult,
  MissionState,
  ModuleOperationRecord,
  ModuleReportEntry,
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

function earnedCount(state: Pick<MissionState, 'selectedTools' | 'setup'>, id: ToolId) {
  return state.setup.scenarioId.startsWith('EARTH_V3_')
    ? state.selectedTools.filter((tool) => tool === id).length
    : 0;
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
      case 'EXTRA_BATTERY': return { energy: H2_TOOL_RULES.EXTRA_BATTERY.initialEnergy };
      case 'WATER_RECYCLER': return {
        oxygen: H2_TOOL_RULES.WATER_RECYCLER.initialOxygen,
        foodSupply: H2_TOOL_RULES.WATER_RECYCLER.initialFood,
      };
      case 'FOLDING_PANELS': return { energy: 8 };
      case 'LIFE_SUPPORT': return { oxygen: 8 };
      case 'SHELTER_KIT': return { shield: 8 };
      case 'CROP_KIT': return { foodSupply: 8 };
      default: return {};
    }
  });
  return sumDeltas(deltas);
}

function initialTrainingDelta(setup: GameSetup): ResourceDelta {
  const outcomes = setup.earthProfile?.outcomes ?? [];
  return sumDeltas(outcomes.map((outcome) => outcome.spaceDelta));
}

function earlyWarningForecast(setup: GameSetup, seed: number) {
  if (!setup.selectedTools.includes('EARLY_WARNING')) return null;
  const turn = 1 + H2_TOOL_RULES.EARLY_WARNING.turnsAhead;
  const kind = rotatedCandidates(H2_EVENT_SCHEDULE[setup.destination][turn - 1] ?? [], turn, seed)
    .find((candidate) => EVENT_CONFIG[candidate].destinations.includes(setup.destination));
  return kind ? { turn, kind, title: EVENT_CONFIG[kind].title } : null;
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

function createMissionState(setup: GameSetup, legacyDemo: boolean): MissionState {
  if (legacyDemo ? !isLegacyDemoSetup(setup) : !isValidGameSetup(setup)) {
    throw new Error(legacyDemo
      ? `Configuración legacy inválida: usa ${LEGACY_DEMO_SCENARIO_ID}, tres herramientas antiguas y tres módulos distintos.`
      : 'GameSetup inválido: requiere modo/destino válidos, tres misiones con sus herramientas y tres módulos distintos.');
  }
  const config = DESTINATION_CONFIG[setup.destination];
  const selectedTools = cloneTools(setup.selectedTools);
  const scenarioSeed = scenarioSeedFromId(setup.scenarioId);
  const forecast = earlyWarningForecast(setup, scenarioSeed);
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
    sparePartsCharges: selectedTools.includes('SPARE_PARTS_KIT')
      ? H2_TOOL_RULES.SPARE_PARTS_KIT.charges
      : 0,
    earlyWarningCharges: 0,
    earlyWarningForecast: forecast,
    scenarioSeed,
    activeAlerts: fillTurnAlerts(setup.destination, 1, [], scenarioSeed, false),
    unresolvedEvents: [],
    selectedTools,
    selectedModules: [...setup.selectedModules],
    actionTakenThisTurn: false,
    decisions: [],
    moduleOperations: getInitialModuleOperations(setup.selectedModules),
    resolvedAlertCount: 0,
    ignoredAlertCount: 0,
    outcome: 'IN_PROGRESS',
  };
  return applyResourceDelta(
    applyResourceDelta(baseState, initialToolDelta(selectedTools)),
    sumDeltas([getInitialModuleDelta(setup.selectedModules), initialTrainingDelta(setup)]),
  );
}

export function createMission(setup: GameSetup): MissionState {
  return createMissionState(setup, false);
}

/** Único borde permitido para la demostración H1 mientras Julio migra EarthFlow. */
export function createLegacyDemoMission(setup: GameSetup): MissionState {
  return createMissionState(setup, true);
}

export function getActionCost(state: MissionState, action: GameAction): ResourceDelta {
  if (action.type === 'SKIP_INTERVENTION') return {};
  const intervention = getIntervention(action.type);
  if (!intervention) return {};
  if (action.type === 'MANAGE_GREENHOUSE' && action.choiceId === 'SUSPEND_CROPS') return {};
  if (action.type === 'REINFORCE_SHELTER') {
    if (action.choiceId === 'SUPPLY_SHIELDING') return intervention.choiceCosts?.SUPPLY_SHIELDING ?? intervention.cost;
    return intervention.choiceCosts?.REGOLITH_SHIELDING ?? intervention.cost;
  }
  if (action.type === 'REPAIR_PANELS' && state.sparePartsCharges > 0) {
    return { ...intervention.cost, energy: H2_TOOL_RULES.SPARE_PARTS_KIT.repairEnergyCost };
  }
  return intervention.cost;
}

function getActionEffect(state: MissionState, action: GameAction): ResourceDelta {
  if (action.type === 'SKIP_INTERVENTION') return {};
  const intervention = getIntervention(action.type);
  if (!intervention) return {};
  if (action.type === 'RECYCLE_OXYGEN' && hasTool(state, 'WATER_RECYCLER')) {
    return {
      ...intervention.effect,
      oxygen: (intervention.effect.oxygen ?? 0) + H2_TOOL_RULES.WATER_RECYCLER.recycleOxygenBonus,
    };
  }
  if (action.type === 'PATCH_OXYGEN_LEAK' && earnedCount(state, 'LIFE_SUPPORT')) {
    return { ...intervention.effect, oxygen: (intervention.effect.oxygen ?? 0) + 2 * earnedCount(state, 'LIFE_SUPPORT') };
  }
  if (action.type === 'MANAGE_GREENHOUSE') {
    if (action.choiceId === 'SUSPEND_CROPS') return {};
    const foodBonus = earnedCount(state, 'CROP_KIT')
      ? H2_TOOL_RULES.GROW_TRAY.greenhouseFoodBonus * earnedCount(state, 'CROP_KIT')
      : hasTool(state, 'GROW_TRAY', 'CROP_KIT') ? H2_TOOL_RULES.GROW_TRAY.greenhouseFoodBonus : 0;
    return { foodSupply: 16 + foodBonus };
  }
  if (action.type === 'RUN_RESEARCH') {
    const researchBonus = state.selectedModules.includes('SCIENCE_LAB')
      ? (getModuleDefinition('SCIENCE_LAB')?.researchBonus ?? 0)
      : 0;
    return {
      ...intervention.effect,
      scienceProgress: (intervention.effect.scienceProgress ?? 0) + researchBonus,
    };
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
  if (action.type === 'REINFORCE_SHELTER'
    && action.choiceId !== 'REGOLITH_SHIELDING'
    && action.choiceId !== 'SUPPLY_SHIELDING') return false;
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
  if (action.type === 'REINFORCE_SHELTER') {
    const material = action.choiceId === 'SUPPLY_SHIELDING'
      ? 'contenedores de suministros; parte de las reservas quedó inmovilizada como protección'
      : 'regolito local';
    return `Refugio reforzado con ${material}${alert ? `: ${alert.title} atendida.` : '.'}`;
  }
  if (action.type === 'MANAGE_GREENHOUSE') {
    return action.choiceId === 'SUSPEND_CROPS'
      ? 'Invernadero suspendido: no produce alimento ni consume energía en los siguientes turnos.'
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
  // El desempeño en el minijuego escala el beneficio, nunca el costo:
  // hacerlo bien rinde más, hacerlo a medias rinde menos.
  const effect = scaleEffectByQuality(getActionEffect(state, action), action.quality);
  const changed = applyResourceDelta(applyResourceDelta(state, cost), effect);
  const guidance = isGuidanceChoice(action.choiceId) ? action.choiceId : undefined;
  const immediateResponse = action.type === 'CONSULT_EARTH' && state.destination === 'MOON' && guidance
    ? GUIDANCE_RESPONSES[guidance]
    : undefined;
  const pendingCommunication = action.type === 'CONSULT_EARTH' && state.destination === 'MARS' && guidance
    ? { request: guidance, requestedTurn: state.turn, dueTurn: state.turn + 1 }
    : state.pendingCommunication;
  const summary = actionSummary(action, alert, immediateResponse);
  const sparePartsUsed = action.type === 'REPAIR_PANELS' && state.sparePartsCharges > 0;
  const labUsed = action.type === 'RUN_RESEARCH' && state.selectedModules.includes('SCIENCE_LAB');
  const moduleOperation: ModuleOperationRecord | undefined = labUsed ? {
    turn: state.turn,
    moduleId: 'SCIENCE_LAB',
    phase: 'ACTION',
    summary: 'Laboratorio: mejoró el procesamiento de la muestra en 10 puntos de Ciencia.',
    cost: {},
    benefit: { scienceProgress: getModuleDefinition('SCIENCE_LAB')?.researchBonus ?? 0 },
  } : undefined;
  const recordedSummary = `${summary}${sparePartsUsed
    ? ' El Kit de repuestos cubrió toda la Energía de esta reparación.'
    : ''}${labUsed ? ' El Laboratorio mejoró el resultado científico.' : ''}`;

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
    sparePartsCharges: sparePartsUsed ? state.sparePartsCharges - 1 : state.sparePartsCharges,
    actionTakenThisTurn: true,
    decisions: [...state.decisions, {
      turn: state.turn,
      action: action.type,
      alertId: alert?.id,
      summary: recordedSummary,
      resourceDelta: sumDeltas([cost, effect]),
    }],
    moduleOperations: moduleOperation
      ? [...state.moduleOperations, moduleOperation]
      : state.moduleOperations,
    resolvedAlertCount: state.resolvedAlertCount + (alert ? 1 : 0),
    lastFeedback: { ok: true, message: recordedSummary, resourceDelta: sumDeltas([cost, effect]) },
  };
}

function alertConsequence(alert: MissionAlert): ResourceDelta {
  const config = EVENT_CONFIG[alert.kind];
  const escalations = Math.max(0, alert.severity - 1);
  return sumDeltas([config.baseConsequence, scaleDelta(config.escalation, escalations)]);
}

/**
 * Lo que costará esta alerta si el turno termina sin atenderla.
 * La interfaz lo muestra antes de confirmar («Si no: −8 Oxígeno»), para que la
 * comparación entre actuar y no actuar tenga números en los dos lados.
 */
export function projectAlertConsequence(alert: MissionAlert): ResourceDelta {
  return alertConsequence(alert);
}

/** Diferencia entre dos estados, para mostrar «Último cambio» al cerrar el turno. */
function diffResources(before: MissionState, after: MissionState): ResourceDelta {
  const delta: Record<string, number> = {};
  const keys = ['energy', 'oxygen', 'shield', 'foodSupply', 'scienceProgress', 'radiationExposure'] as const;
  for (const key of keys) {
    const change = after[key] - before[key];
    if (change !== 0) delta[key] = change;
  }
  return delta as ResourceDelta;
}

/**
 * Por qué terminó antes la guardia. Se redacta como récord, no como castigo:
 * la tripulación vuelve a la Tierra, nadie «muere» (decisión del equipo, JD §14).
 */
function interruptionCause(state: MissionState): string | undefined {
  if (state.oxygen <= 0) return 'Se acabó el oxígeno. La tripulación volvió a la Tierra antes de tiempo, sana y salva.';
  if (state.energy <= 0) return 'Se acabó la energía. La tripulación volvió a la Tierra antes de tiempo, sana y salva.';
  if (state.foodSupply <= 0) return 'Se acabó la comida. La tripulación volvió a la Tierra antes de tiempo, sana y salva.';
  if (state.radiationExposure >= 100) return 'La radiación llegó al límite seguro. La tripulación volvió a la Tierra antes de tiempo, sana y salva.';
  return undefined;
}

function solarGenerationForTurn(state: MissionState) {
  const config = DESTINATION_CONFIG[state.destination];
  const foldingBonus = 1 + earnedCount(state, 'FOLDING_PANELS') * 0.2;
  return Math.round(config.solarProduction[state.turn - 1] * state.solarEfficiency * foldingBonus / 100);
}

function operationalDelta(state: MissionState, solarGain: number): ResourceDelta {
  const config = DESTINATION_CONFIG[state.destination];
  const waterRecycler = hasTool(state, 'WATER_RECYCLER');
  const lifeSupport = hasTool(state, 'LIFE_SUPPORT');
  const insulated = hasTool(state, 'THERMAL_INSULATION');
  const thermalEnergySaving = insulated ? H2_TOOL_RULES.THERMAL_INSULATION.energySaving : 0;
  const greenhouseEnergyUse = state.greenhouseActive ? 2 : 0;
  const greenhouseFoodSupport = state.greenhouseActive ? 2 : 0;
  const radiationGain = Math.max(
    0,
    config.radiationPerTurn - state.shield * 0.05 - earnedCount(state, 'SHELTER_KIT') * 2,
  );
  return {
    energy: solarGain - config.baseEnergyUse + thermalEnergySaving - greenhouseEnergyUse,
    oxygen: -Math.max(1, config.baseOxygenUse - (
      waterRecycler ? H2_TOOL_RULES.WATER_RECYCLER.consumptionSaving : lifeSupport ? Math.max(1, earnedCount(state, 'LIFE_SUPPORT')) : 0
    )),
    foodSupply: -Math.max(1, config.baseFoodUse - (
      waterRecycler ? H2_TOOL_RULES.WATER_RECYCLER.consumptionSaving : 0
    ) - greenhouseFoodSupport),
    radiationExposure: radiationGain,
  };
}

export function advanceTurn(state: MissionState): MissionState {
  if (state.outcome !== 'IN_PROGRESS' || !state.actionTakenThisTurn) return state;

  const unresolvedEvents: UnresolvedEvent[] = state.activeAlerts.map((alert) => {
    const resourceDelta = alertConsequence(alert);
    return {
      id: `UNRESOLVED-${alert.id}-T${state.turn}`,
      sourceAlertId: alert.id,
      turn: state.turn,
      summary: `${alert.title} aplicó consecuencias de nivel ${alert.severity}.`,
      resourceDelta,
    };
  });
  const afterAlerts = applyResourceDelta(state, sumDeltas(unresolvedEvents.map((event) => event.resourceDelta)));
  const solarGeneration = solarGenerationForTurn(afterAlerts);
  const baseOperations = operationalDelta(afterAlerts, solarGeneration);
  const moduleOperations = getModuleTurnOperations(
    afterAlerts,
    Math.max(0, baseOperations.radiationExposure ?? 0),
    solarGeneration,
  );
  const moduleDelta = sumDeltas(
    moduleOperations.flatMap((operation) => [operation.cost, operation.benefit]),
  );
  const afterOperations = applyResourceDelta(afterAlerts, sumDeltas([baseOperations, moduleDelta]));
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
    moduleOperations: [...state.moduleOperations, ...moduleOperations],
    pendingCommunication: communicationArrived ? null : state.pendingCommunication,
    communicationResponse,
    lastTurnDelta: diffResources(state, afterOperations),
    lastFeedback: communicationArrived && communicationResponse
      ? { ok: true, message: communicationResponse, resourceDelta: {} }
      : undefined,
  };
  const cause = interruptionCause(withHistory);
  if (cause) return { ...withHistory, outcome: 'INTERRUPTED', interruptionCause: cause };
  if (state.turn === MAX_TURNS) {
    if (withHistory.scienceProgress >= SCIENCE_TARGET) {
      return { ...withHistory, outcome: 'COMPLETED' };
    }
    return {
      ...withHistory,
      outcome: 'INTERRUPTED',
      interruptionCause: `Completaste los cinco turnos. Te faltó ciencia para la meta: llegaste a ${withHistory.scienceProgress} de ${SCIENCE_TARGET}.`,
    };
  }

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

function hasNonZeroDelta(delta: ResourceDelta) {
  return Object.values(delta).some((value) => value !== undefined && value !== 0);
}

function buildModuleReport(state: MissionState): readonly ModuleReportEntry[] {
  return state.selectedModules.map((moduleId) => {
    const definition = getModuleDefinition(moduleId);
    const operations = state.moduleOperations.filter((operation) => operation.moduleId === moduleId);
    const benefitsProvided = [...new Set(
      operations.filter((operation) => hasNonZeroDelta(operation.benefit))
        .map((operation) => operation.summary),
    )];
    const relatedConsequences = state.unresolvedEvents
      .filter((event) => definition?.affectedBy.some((kind) => event.sourceAlertId.startsWith(kind)))
      .map((event) => event.summary);
    return {
      moduleId,
      benefitsProvided,
      resourcesConsumed: sumDeltas(operations.map((operation) => operation.cost)),
      relatedConsequences,
    };
  });
}

function buildConfigurationConsequences(state: MissionState) {
  const trainings = state.setup.earthProfile?.trainings.map((training) =>
    `${training.name}: ${training.effectOnSpaceMission} Costo terrestre: ${training.costDescription}`) ?? [];
  const outcomes = state.setup.earthProfile?.outcomes?.map((outcome) =>
    `${outcome.missionId}: ${outcome.explanation} Herramienta: ${outcome.tool}. Beneficio: ${outcome.benefit}`) ?? [];
  return [...trainings, ...outcomes, ...state.unresolvedEvents.flatMap((event) => {
    const related = MODULE_CATALOG.filter((module) =>
      module.affectedBy.some((kind) => event.sourceAlertId.startsWith(kind)));
    return related.map((module) => `${event.summary} Configuración relacionada: ${module.name} ${
      state.selectedModules.includes(module.id) ? 'construido' : 'no construido'
    }.`);
  })];
}

function buildBarConsequences(state: MissionState): readonly string[] {
  const initial = createMissionState(state.setup, isLegacyDemoSetup(state.setup));
  return ([
    ['energy', 'Energía'],
    ['oxygen', 'Oxígeno'],
    ['shield', 'Escudo'],
  ] as const).map(([key, label]) => {
    const actionDelta = state.decisions.reduce((total, decision) => total + (decision.resourceDelta[key] ?? 0), 0);
    const alertDelta = state.unresolvedEvents.reduce((total, event) => total + (event.resourceDelta[key] ?? 0), 0);
    const moduleDelta = state.moduleOperations.reduce((total, operation) =>
      total + (operation.phase === 'SETUP' ? 0 : (operation.cost[key] ?? 0) + (operation.benefit[key] ?? 0)), 0);
    const detail = [
      actionDelta && `decisiones ${actionDelta > 0 ? '+' : ''}${actionDelta}`,
      alertDelta && `alertas ignoradas ${alertDelta > 0 ? '+' : ''}${alertDelta}`,
      moduleDelta && `módulos ${moduleDelta > 0 ? '+' : ''}${moduleDelta}`,
    ].filter(Boolean).join('; ');
    return `${label}: ${initial[key]} → ${state[key]}. ${detail || 'Sin cambio directo registrado.'} El balance incluye producción y consumo por turno y límites de la barra.`;
  });
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
    causeAndEffect: [...buildBarConsequences(state), ...helpfulDecisions.slice(-2), ...harmfulDecisions.slice(-2)],
    scientificObjectiveAchieved: state.scienceProgress >= SCIENCE_TARGET,
    relevantTools: state.selectedTools,
    relevantModules: [...state.selectedModules],
    moduleReport: buildModuleReport(state),
    configurationConsequences: buildConfigurationConsequences(state),
  };
}
