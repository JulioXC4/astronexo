import type { ActionChoice, Destination } from '../../game';

export type Direction = 'N' | 'E' | 'S' | 'W';
export type CircuitShape = 'STRAIGHT' | 'CORNER' | 'JUNCTION';
export interface CircuitTileState {
  readonly shape: CircuitShape;
  readonly rotation: number;
  readonly damaged: boolean;
}

export const PANEL_CIRCUIT_START: readonly CircuitTileState[] = [
  { shape: 'STRAIGHT', rotation: 1, damaged: true },
  { shape: 'CORNER', rotation: 0, damaged: false },
  { shape: 'JUNCTION', rotation: 0, damaged: true },
  { shape: 'CORNER', rotation: 0, damaged: true },
];

const DIRECTIONS: readonly Direction[] = ['N', 'E', 'S', 'W'];
const BASE_CONNECTIONS: Readonly<Record<CircuitShape, readonly Direction[]>> = {
  STRAIGHT: ['E', 'W'],
  CORNER: ['N', 'E'],
  JUNCTION: ['N', 'E', 'W'],
};
const OPPOSITE: Readonly<Record<Direction, Direction>> = { N: 'S', E: 'W', S: 'N', W: 'E' };
const NEIGHBOR: Readonly<Record<number, Partial<Record<Direction, number>>>> = {
  0: { E: 1, S: 2 }, 1: { W: 0, S: 3 }, 2: { N: 0, E: 3 }, 3: { N: 1, W: 2 },
};

export function circuitConnections(tile: CircuitTileState): readonly Direction[] {
  const turns = ((tile.rotation % 4) + 4) % 4;
  return BASE_CONNECTIONS[tile.shape].map((direction) => DIRECTIONS[(DIRECTIONS.indexOf(direction) + turns) % 4]);
}

export function isPanelCircuitComplete(tiles: readonly CircuitTileState[]) {
  if (tiles.length !== 4 || tiles[0].damaged || !circuitConnections(tiles[0]).includes('W')) return false;
  const visited = new Set<number>();
  const queue = [0];
  while (queue.length) {
    const index = queue.shift()!;
    if (visited.has(index) || tiles[index].damaged) continue;
    visited.add(index);
    const connections = circuitConnections(tiles[index]);
    if (index === 3 && connections.includes('E')) return true;
    for (const direction of connections) {
      const next = NEIGHBOR[index][direction];
      if (next !== undefined && !tiles[next].damaged && circuitConnections(tiles[next]).includes(OPPOSITE[direction])) queue.push(next);
    }
  }
  return false;
}

export const PANEL_DUST_START = [3, 2, 3, 3, 2, 3] as const;

/**
 * Variación del puzle entre turnos y partidas.
 *
 * Antes no había ni un `Math.random` en los minijuegos: la misma avería del
 * turno 1 reaparecía idéntica en el turno 4 y en todas las partidas. Aquí la
 * variación es *determinista* a partir de la semilla del escenario, así que el
 * juego cambia para el niño pero sigue siendo reproducible en las pruebas.
 */
const PANEL_DUST_VARIANTS: readonly (readonly number[])[] = [
  PANEL_DUST_START,
  [2, 3, 3, 2, 3, 3],
  [3, 3, 2, 3, 3, 2],
  [2, 2, 3, 3, 3, 3],
];

/** Cualquier reparto es resoluble: limpiar las celdas 2 y 5 cubre las seis. */
export function panelDustForSeed(seed: number): readonly number[] {
  return PANEL_DUST_VARIANTS[Math.abs(Math.trunc(seed)) % PANEL_DUST_VARIANTS.length];
}

/** Qué compartimento pierde aire esta vez (antes siempre era el mismo). */
export function leakingCompartmentForSeed(seed: number): number {
  return Math.abs(Math.trunc(seed)) % 3;
}
const CLEANER_COVERAGE: Readonly<Record<number, readonly number[]>> = {
  0: [0, 1, 3], 1: [0, 1, 2, 4], 2: [1, 2, 5], 3: [0, 3, 4], 4: [1, 3, 4, 5], 5: [2, 4, 5],
};

export function applyCleaner(dust: readonly number[], cell: number) {
  const covered = CLEANER_COVERAGE[cell] ?? [];
  return dust.map((level, index) => covered.includes(index) ? 0 : level);
}

export function solarCapturePercent(dust: readonly number[]) {
  const maximum = Math.max(1, dust.length * 3);
  return Math.round((1 - dust.reduce((sum, level) => sum + level, 0) / maximum) * 100);
}

export function isOxygenLeakResolved(isolatedCompartment: number | null, leakingCompartment: number, patches: readonly boolean[]) {
  return isolatedCompartment === leakingCompartment && patches.length === 2 && patches.every(Boolean);
}

export type EclssNode = 'WATER' | 'POWER' | 'ELECTROLYZER_WATER' | 'ELECTROLYZER_POWER' | 'ELECTROLYZER_OXYGEN' | 'TANK';
export const ECLSS_REQUIRED_CONNECTIONS = [
  'WATER>ELECTROLYZER_WATER', 'POWER>ELECTROLYZER_POWER', 'ELECTROLYZER_OXYGEN>TANK',
] as const;

export function eclssConnectionKey(from: EclssNode, to: EclssNode) {
  return `${from}>${to}`;
}

export function isEclssComplete(connections: ReadonlySet<string>) {
  return ECLSS_REQUIRED_CONNECTIONS.every((connection) => connections.has(connection));
}

export type ShelterMaterial = Extract<ActionChoice, 'REGOLITH_SHIELDING' | 'SUPPLY_SHIELDING'>;
export const SHELTER_PRIORITY_ZONES = [0, 2] as const;

export function isShelterProtected(coveredZones: readonly number[]) {
  return new Set(coveredZones).size === 3 && SHELTER_PRIORITY_ZONES.every((zone) => coveredZones.includes(zone));
}

export type ScienceSampleId = 'BASALT' | 'ANORTHOSITE' | 'MARS_SEDIMENTARY' | 'REGOLITH';
export type ScienceInstrumentId = 'ANALYZER' | 'MAGNIFIER' | 'GRAIN_IMAGER';
export type ScienceClassId = 'VOLCANIC_ROCK' | 'HIGHLAND_ROCK' | 'LAYERED_MATERIAL' | 'LOOSE_MATERIAL';
export interface ScienceRound {
  readonly sample: ScienceSampleId;
  readonly instrument: ScienceInstrumentId;
  readonly classification: ScienceClassId;
}

export function scienceSamples(destination: Destination): readonly ScienceRound[] {
  return destination === 'MOON'
    ? [
        { sample: 'BASALT', instrument: 'ANALYZER', classification: 'VOLCANIC_ROCK' },
        { sample: 'ANORTHOSITE', instrument: 'MAGNIFIER', classification: 'HIGHLAND_ROCK' },
        { sample: 'REGOLITH', instrument: 'GRAIN_IMAGER', classification: 'LOOSE_MATERIAL' },
      ]
    : [
        { sample: 'BASALT', instrument: 'ANALYZER', classification: 'VOLCANIC_ROCK' },
        { sample: 'MARS_SEDIMENTARY', instrument: 'GRAIN_IMAGER', classification: 'LAYERED_MATERIAL' },
        { sample: 'REGOLITH', instrument: 'MAGNIFIER', classification: 'LOOSE_MATERIAL' },
      ];
}

export function isScienceObservationValid(round: ScienceRound, instrument: ScienceInstrumentId) {
  return round.instrument === instrument;
}

export function isScienceClassificationValid(round: ScienceRound, classification: ScienceClassId) {
  return round.classification === classification;
}

/**
 * Cuál de las tres bandejas tiene la planta ya crecida (y no necesita luz de más).
 * Antes cualquier par de bandejas valía: no había respuesta incorrecta.
 */
export function greenhouseMatureTray(seed: number): number {
  return Math.abs(Math.trunc(seed)) % 3;
}

/** Las dos luces van a las plantas pequeñas: la crecida puede esperar. */
export function isGreenhouseLightingReady(litTrays: ReadonlySet<number>, matureTray = 1) {
  return litTrays.size === 2 && !litTrays.has(matureTray) && [...litTrays].every((index) => index >= 0 && index < 3);
}

export type GuidanceChoice = Extract<ActionChoice, `${string}_GUIDANCE`>;
export interface CommunicationProblem {
  readonly choice: GuidanceChoice;
  readonly relevantFacts: readonly string[];
  readonly distractors: readonly string[];
}

export const COMMUNICATION_PROBLEMS: Readonly<Record<GuidanceChoice, CommunicationProblem>> = {
  ENERGY_GUIDANCE: {
    choice: 'ENERGY_GUIDANCE', relevantFacts: ['ENERGY_LEVEL', 'SOLAR_EFFICIENCY'], distractors: ['CREW_MENU'],
  },
  RADIATION_GUIDANCE: {
    choice: 'RADIATION_GUIDANCE', relevantFacts: ['SHIELD_LEVEL', 'RADIATION_ALERT'], distractors: ['PLANT_HEIGHT'],
  },
  LIFE_SUPPORT_GUIDANCE: {
    choice: 'LIFE_SUPPORT_GUIDANCE', relevantFacts: ['OXYGEN_LEVEL', 'FOOD_LEVEL'], distractors: ['ROVER_COLOR'],
  },
};

export function isCommunicationMessageRelevant(choice: GuidanceChoice, selectedFacts: readonly string[]) {
  const required = COMMUNICATION_PROBLEMS[choice].relevantFacts;
  return selectedFacts.length === 2 && required.every((fact) => selectedFacts.includes(fact));
}
