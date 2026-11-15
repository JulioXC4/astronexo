import { isValidSelectedTools } from '../config';
import type { Destination, SelectedTools, ToolId } from '../types';

export type { Destination, ToolId } from '../types';
export type { ToolDefinition } from '../config';
export { TOOL_CATALOG } from '../config';

/** @deprecated Usa `SelectedTools` desde `src/game`. */
export type Backpack = SelectedTools;
export type TrainingId = 'SOLAR_DETECTIVE' | 'SOLAR_WATCH';
export type MissionStatus = 'PLAYING' | 'SUCCESS' | 'FAILED';

/**
 * Adaptador temporal del flujo terrestre anterior a v3.0.
 * La interfaz pública nueva es `GameSetup` desde `src/game`.
 */
export interface LegacyGameSetup {
  readonly cityId: string;
  readonly avatarId: string;
  readonly fictionalName: string;
  readonly destination: Destination;
  readonly backpack: Backpack;
  readonly completedTraining: readonly TrainingId[];
}

/** @deprecated Alias conservado para no romper EarthFlow/App durante la migración. */
export type GameSetup = LegacyGameSetup;

export interface NasaObservation {
  readonly source: 'POWER' | 'DONKI';
  readonly recordId: string;
  readonly observedAt: string;
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

export interface LegacyMissionAlert {
  readonly id: string;
  readonly kind: string;
  readonly summary: string;
  readonly severity: number;
}

export interface LegacyMissionDecision {
  readonly turn: number;
  readonly alertId: string;
  readonly actionId: string;
  readonly explanation: string;
}

/** Estado de salida legacy: `air` se mantiene solo en este borde de integración. */
export interface LegacyMissionState {
  readonly destination: Destination;
  readonly turn: number;
  readonly maxTurns: number;
  readonly crew: number;
  readonly energy: number;
  readonly air: number;
  readonly shield: number;
  readonly food: number;
  readonly radiationExposure: number;
  readonly scienceProgress: number;
  readonly communications: number;
  readonly faults: readonly string[];
  readonly alerts: readonly LegacyMissionAlert[];
  readonly tools: Backpack;
  readonly history: readonly LegacyMissionDecision[];
  readonly status: MissionStatus;
}

export interface LegacyMissionResult {
  readonly outcome: 'SUCCESS' | 'FAILED' | 'NOT_PLAYED';
  readonly destination: Destination;
  readonly finalState: LegacyMissionState | null;
  readonly explanation: string;
  readonly evidence: readonly NasaObservation[];
}

/** @deprecated Usa `MissionResult` desde `src/game` para código nuevo. */
export type MissionResult = LegacyMissionResult;

/** @deprecated Usa `isValidSelectedTools` desde `src/game`. */
export function isValidBackpack(tools: readonly ToolId[]): tools is Backpack {
  return isValidSelectedTools(tools);
}
