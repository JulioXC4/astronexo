export type City = 'AREQUIPA' | 'TROMSO';
export type Destination = 'MOON' | 'MARS';
export type GameMode = 'SOLO' | 'LOCAL_COOP';
export type Difficulty = 'CALM' | 'ACTIVE' | 'STORMY';
export type MissionOutcome = 'IN_PROGRESS' | 'COMPLETED' | 'INTERRUPTED';
export type AlertKind = 'PANEL_DAMAGE' | 'OXYGEN_LEAK';
export type ModuleId =
  | 'SOLAR_STORAGE'
  | 'REINFORCED_LIFE_SUPPORT'
  | 'STORM_SHELTER'
  | 'GREENHOUSE'
  | 'SCIENCE_LAB';

export interface GameSetup {
  readonly mode: GameMode;
  readonly city: City;
  readonly destination: Destination;
  readonly selectedTools: readonly string[];
  readonly selectedModules: readonly ModuleId[];
  readonly scenarioId: string;
  readonly difficulty: Difficulty;
}

export type GameAction =
  | { readonly type: 'REPAIR_PANELS'; readonly targetId?: string }
  | { readonly type: 'PATCH_OXYGEN_LEAK'; readonly targetId?: string }
  | { readonly type: 'SKIP_INTERVENTION' };

export interface ResourceDelta {
  readonly energy?: number;
  readonly oxygen?: number;
  readonly shield?: number;
  readonly foodSupply?: number;
  readonly radiationExposure?: number;
  readonly scienceProgress?: number;
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
  readonly action: GameAction['type'];
  readonly alertId?: string;
  readonly summary: string;
  readonly resourceDelta: ResourceDelta;
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
  readonly communicationAvailable: boolean;
  readonly activeAlerts: readonly MissionAlert[];
  readonly unresolvedEvents: readonly UnresolvedEvent[];
  readonly selectedTools: readonly string[];
  readonly selectedModules: readonly ModuleId[];
  readonly actionTakenThisTurn: boolean;
  readonly decisions: readonly DecisionRecord[];
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
  readonly objectiveCompletion: number;
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
  readonly relevantTools: readonly string[];
  readonly relevantModules: readonly ModuleId[];
}
