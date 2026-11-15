export type City = 'AREQUIPA' | 'TROMSO';
export type Destination = 'MOON' | 'MARS';
export type GameMode = 'SOLO' | 'LOCAL_COOP';
export type Difficulty = 'CALM' | 'ACTIVE' | 'STORMY';
export type MissionOutcome = 'IN_PROGRESS' | 'COMPLETED' | 'INTERRUPTED';
export type AlertKind =
  | 'PANEL_DAMAGE'
  | 'DUSTY_PANELS'
  | 'OXYGEN_LEAK'
  | 'ENERGY_SHORTAGE'
  | 'RADIATION_RISK'
  | 'GREENHOUSE_STRAIN'
  | 'SCIENCE_OPPORTUNITY'
  | 'MARS_DUST_STORM'
  | 'COMMUNICATION_WINDOW';
export type EarthMissionId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
export type ToolId =
  | 'SPARE_PARTS_KIT'
  | 'EARLY_WARNING'
  | 'GROW_TRAY'
  | 'EXTRA_BATTERY'
  | 'WATER_RECYCLER'
  | 'THERMAL_INSULATION'
  | 'FOLDING_PANELS'
  | 'LIFE_SUPPORT'
  | 'SHELTER_KIT'
  | 'CROP_KIT';
export type SelectedTools = readonly [ToolId, ToolId, ToolId];
export type InterventionId = 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7' | 'G8';
export type InterventionAction =
  | 'REPAIR_PANELS'
  | 'CLEAN_PANELS'
  | 'PATCH_OXYGEN_LEAK'
  | 'RECYCLE_OXYGEN'
  | 'REINFORCE_SHELTER'
  | 'RUN_RESEARCH'
  | 'MANAGE_GREENHOUSE'
  | 'CONSULT_EARTH';
export type ActionType = InterventionAction | 'SKIP_INTERVENTION';
export type ActionChoice =
  | 'MAINTAIN_CROPS'
  | 'SUSPEND_CROPS'
  | 'REGOLITH_SHIELDING'
  | 'SUPPLY_SHIELDING'
  | 'ENERGY_GUIDANCE'
  | 'RADIATION_GUIDANCE'
  | 'LIFE_SUPPORT_GUIDANCE';
export type ModuleId =
  | 'SOLAR_STORAGE'
  | 'REINFORCED_LIFE_SUPPORT'
  | 'STORM_SHELTER'
  | 'GREENHOUSE'
  | 'SCIENCE_LAB';

/**
 * Contexto de clima espacial. `event` es el dato NASA original (DONKI);
 * `rule` es la regla SIMULADA del juego que lo traduce a dificultad educativa.
 * No es una dosis de radiación ni una predicción.
 */
export interface SpaceWeatherContext {
  readonly event: {
    readonly eventId: string;
    readonly eventType: 'CME';
    readonly observedAt: string;
    readonly value: number;
    readonly unit: 'km/s';
    readonly sourceUrl: string;
    readonly status: 'HISTORICAL' | 'UPDATED' | 'FALLBACK';
  };
  readonly rule: {
    readonly ruleId: 'CME_SPEED_BANDS_V1';
    readonly difficulty: Difficulty;
    /** Velocidad (km/s) que activa la banda aplicada. */
    readonly bandFromKmS: number;
  };
}

export interface GameSetup {
  readonly mode: GameMode;
  readonly city: City;
  readonly destination: Destination;
  readonly completedEarthMissions: readonly EarthMissionId[];
  readonly selectedTools: SelectedTools;
  readonly selectedModules: readonly ModuleId[];
  readonly scenarioId: string;
  readonly difficulty: Difficulty;
  /** Evento NASA DONKI que contextualiza la guardia y regla simulada derivada. */
  readonly spaceWeather?: SpaceWeatherContext;
  /** Identidad y decisiones del entrenamiento v3; se conservan en la bitácora espacial. */
  readonly earthProfile?: {
    readonly avatarId: string;
    readonly fictionalName: string;
    readonly trainings: readonly {
      readonly id: string;
      readonly name: string;
      readonly costDescription: string;
      readonly effectOnSpaceMission: string;
    }[];
    readonly outcomes?: readonly TrainingOutcome[];
  };
}

export interface TrainingOutcome {
  readonly missionId: string;
  readonly decision: string;
  readonly resource: 'energy' | 'oxygen' | 'foodSupply';
  readonly cost: number;
  readonly tool: ToolId;
  readonly benefit: string;
  readonly limitation: string;
  readonly explanation: string;
  readonly spaceDelta: ResourceDelta;
}

export interface GameAction {
  readonly type: ActionType;
  readonly targetId?: string;
  readonly choiceId?: ActionChoice;
}

export interface ResourceDelta {
  readonly energy?: number;
  readonly oxygen?: number;
  readonly shield?: number;
  readonly foodSupply?: number;
  readonly radiationExposure?: number;
  readonly scienceProgress?: number;
  readonly solarEfficiency?: number;
}

export interface MissionAlert {
  readonly id: string;
  readonly kind: AlertKind;
  readonly title: string;
  readonly description: string;
  readonly severity: number;
  readonly age: number;
  readonly consequencePreview: string;
}

export interface UnresolvedEvent {
  readonly id: string;
  readonly sourceAlertId: string;
  readonly turn: number;
  readonly summary: string;
  readonly resourceDelta: ResourceDelta;
}

export interface DecisionRecord {
  readonly turn: number;
  readonly action: ActionType;
  readonly alertId?: string;
  readonly summary: string;
  readonly resourceDelta: ResourceDelta;
}

export interface PendingCommunication {
  readonly request: Extract<ActionChoice, `${string}_GUIDANCE`>;
  readonly requestedTurn: number;
  readonly dueTurn: number;
}

export interface EarlyWarningForecast {
  readonly turn: number;
  readonly kind: AlertKind;
  readonly title: string;
}

export interface ModuleOperationRecord {
  readonly turn: number;
  readonly moduleId: ModuleId;
  readonly phase: 'SETUP' | 'TURN' | 'ACTION';
  readonly summary: string;
  readonly cost: ResourceDelta;
  readonly benefit: ResourceDelta;
}

export interface ModuleReportEntry {
  readonly moduleId: ModuleId;
  readonly benefitsProvided: readonly string[];
  readonly resourcesConsumed: ResourceDelta;
  readonly relatedConsequences: readonly string[];
}

export interface ActionFeedback {
  readonly ok: boolean;
  readonly message: string;
  readonly resourceDelta: ResourceDelta;
}

export interface MissionState {
  readonly setup: GameSetup;
  readonly destination: Destination;
  readonly turn: number;
  readonly maxTurns: 5;
  readonly clockLabel: string;
  readonly energy: number;
  readonly oxygen: number;
  readonly shield: number;
  readonly foodSupply: number;
  readonly radiationExposure: number;
  readonly scienceProgress: number;
  readonly solarEfficiency: number;
  readonly greenhouseActive: boolean;
  readonly communicationAvailable: boolean;
  readonly consultationUsed: boolean;
  readonly pendingCommunication: PendingCommunication | null;
  readonly communicationResponse?: string;
  readonly sparePartsCharges: number;
  readonly earlyWarningCharges: number;
  readonly earlyWarningForecast: EarlyWarningForecast | null;
  readonly scenarioSeed: number;
  readonly completedTurns: number;
  readonly activeAlerts: readonly MissionAlert[];
  readonly unresolvedEvents: readonly UnresolvedEvent[];
  readonly selectedTools: SelectedTools;
  readonly selectedModules: readonly ModuleId[];
  readonly actionTakenThisTurn: boolean;
  readonly decisions: readonly DecisionRecord[];
  readonly moduleOperations: readonly ModuleOperationRecord[];
  readonly resolvedAlertCount: number;
  readonly ignoredAlertCount: number;
  readonly outcome: MissionOutcome;
  readonly interruptionCause?: string;
  readonly lastFeedback?: ActionFeedback;
}

export interface ScoreBreakdown {
  readonly crewSafety: number;
  readonly finalResources: number;
  readonly alertPrioritization: number;
  readonly operationalCompletion: number;
  readonly scientificObjective: number;
  readonly difficultyFactor: number;
  readonly total: number;
}

export interface MissionResult {
  readonly outcome: Exclude<MissionOutcome, 'IN_PROGRESS'>;
  readonly turnsReached: number;
  readonly finalState: MissionState;
  readonly score: ScoreBreakdown;
  readonly interruptionCause?: string;
  readonly helpfulDecisions: readonly string[];
  readonly harmfulDecisions: readonly string[];
  readonly causeAndEffect: readonly string[];
  readonly scientificObjectiveAchieved: boolean;
  readonly relevantTools: SelectedTools;
  readonly relevantModules: readonly ModuleId[];
  readonly moduleReport: readonly ModuleReportEntry[];
  readonly configurationConsequences: readonly string[];
}
