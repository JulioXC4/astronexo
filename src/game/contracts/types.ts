export type Destination = 'MOON' | 'MARS';
export type ToolId = 'FOLDING_PANELS' | 'LIFE_SUPPORT' | 'SHELTER_KIT' | 'CROP_KIT';
export type Backpack = readonly [ToolId, ToolId, ToolId];
export type TrainingId = 'SOLAR_DETECTIVE' | 'SOLAR_WATCH';
export type MissionStatus = 'PLAYING' | 'SUCCESS' | 'FAILED';

export interface ToolDefinition {
  readonly id: ToolId;
  readonly label: string;
}

export const TOOL_CATALOG: readonly ToolDefinition[] = [
  { id: 'FOLDING_PANELS', label: 'Paneles plegables' },
  { id: 'LIFE_SUPPORT', label: 'Kit de soporte vital' },
  { id: 'SHELTER_KIT', label: 'Kit de refugio' },
  { id: 'CROP_KIT', label: 'Kit de cultivos' },
] as const;

export interface GameSetup {
  readonly cityId: string;
  readonly avatarId: string;
  readonly fictionalName: string;
  readonly destination: Destination;
  readonly backpack: Backpack;
  readonly completedTraining: readonly TrainingId[];
}

export interface NasaObservation {
  readonly source: 'POWER' | 'DONKI';
  readonly recordId: string;
  readonly observedAt: string; // ISO date or datetime from source
  readonly parameter: string;
  readonly value: number | string;
  readonly unit: string;
  readonly sourceUrl: string;
  readonly coordinates?: { readonly latitude: number; readonly longitude: number };
}

export interface NasaDataset {
  readonly validation: 'PENDING' | 'VERIFIED';
  readonly observations: readonly NasaObservation[];
  readonly note?: string;
}

export interface MissionAlert {
  readonly id: string;
  readonly kind: string;
  readonly summary: string;
  readonly severity: number;
}

export interface MissionDecision {
  readonly turn: number;
  readonly alertId: string;
  readonly actionId: string;
  readonly explanation: string;
}

export interface MissionState {
  readonly destination: Destination;
  readonly turn: number;
  readonly maxTurns: number;
  readonly crew: number;
  readonly energy: number;
  readonly air: number;
  readonly shield: number; // Preparación del refugio; no campo de fuerza.
  readonly food: number;
  readonly radiationExposure: number;
  readonly scienceProgress: number;
  readonly communications: number;
  readonly faults: readonly string[];
  readonly alerts: readonly MissionAlert[];
  readonly tools: Backpack;
  readonly history: readonly MissionDecision[];
  readonly status: MissionStatus;
}

export interface MissionResult {
  readonly outcome: 'SUCCESS' | 'FAILED' | 'NOT_PLAYED';
  readonly destination: Destination;
  readonly finalState: MissionState | null;
  readonly explanation: string;
  readonly evidence: readonly NasaObservation[];
}

export function isValidBackpack(tools: readonly ToolId[]): tools is Backpack {
  const catalogIds = new Set<ToolId>(TOOL_CATALOG.map((tool) => tool.id));
  return tools.length === 3 && new Set(tools).size === 3 && tools.every((tool) => catalogIds.has(tool));
}
