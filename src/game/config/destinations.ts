import type { Destination, Difficulty } from '../types';

export interface DestinationConfig {
  readonly clockLabels: readonly [string, string, string, string, string];
  readonly solarProduction: readonly [number, number, number, number, number];
  readonly baseEnergyUse: number;
  readonly baseOxygenUse: number;
  readonly baseFoodUse: number;
  readonly radiationPerTurn: number;
  readonly communicationDelayTurns: number;
}

export const DESTINATION_CONFIG: Readonly<Record<Destination, DestinationConfig>> = {
  MOON: {
    clockLabels: ['Día lunar 2', 'Día lunar 6', 'Día lunar 10', 'Día lunar 14', 'Día lunar 15'],
    solarProduction: [10, 8, 6, 3, 1],
    baseEnergyUse: 8,
    baseOxygenUse: 3,
    baseFoodUse: 4,
    radiationPerTurn: 5,
    communicationDelayTurns: 0,
  },
  MARS: {
    clockLabels: ['14:00 LMST', '15:00 LMST', '16:00 LMST', '17:00 LMST', '18:00 LMST'],
    solarProduction: [8, 7, 6, 4, 3],
    baseEnergyUse: 8,
    baseOxygenUse: 3,
    baseFoodUse: 4,
    radiationPerTurn: 4,
    communicationDelayTurns: 1,
  },
};

export const DIFFICULTY_SCORE_FACTOR: Readonly<Record<Difficulty, number>> = {
  CALM: 1,
  ACTIVE: 1.08,
  STORMY: 1.15,
};

export const INITIAL_RESOURCES = {
  energy: 64,
  oxygen: 78,
  shield: 60,
  foodSupply: 72,
  radiationExposure: 0,
  scienceProgress: 0,
} as const;
