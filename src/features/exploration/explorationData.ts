import type { FindingKind } from '../../game';

/**
 * Datos de la salida a explorar, copiados de `02_datos-del-evento.json` de JD
 * (maqueta v12.1). Son reglas de prueba del equipo, no datos de la NASA: no se
 * cambian números sin hablar con él.
 */
export const WORLD = {
  width: 3000,
  height: 1800,
  /** 1 «unidad de costo» = 300 px. */
  unit: 300,
  base: { x: 130, y: 900 },
  playerStart: { x: 240, y: 900 },
  /** Se considera que volvió cuando está a menos de esto de la base... */
  returnRadius: 85,
  /** ...habiéndose alejado antes más de esto. */
  leftDistance: 260,
  edgeMargin: 14,
  collisionMargin: 12,
} as const;

export const SPEED = {
  rover: 300,
  foot: 140,
  softTerrain: 0.6,
} as const;

/** Costo por cada unidad de 300 px recorridos. */
export const COST = {
  foot: { energy: 3, oxygen: 3, shield: 1, minutes: 40 },
  /** El rover gasta de SU batería, no de la Energía de la base. */
  rover: { battery: 2, oxygen: 1, shield: 1, minutes: 15 },
  softMultiplier: 2,
} as const;

export const REQUIREMENTS = {
  foot: { energy: 25, oxygen: 25 },
  roverOxygen: 20,
  /** Para un rover con batería B hace falta Energía ≥ B + esto. */
  roverEnergyMargin: 15,
  batteryOptions: [20, 35, 50] as const,
} as const;

export const RESCUE = {
  triggerBelow: 5,
  delaySeconds: 1.5,
  cost: { energy: 10, oxygen: 4, shield: 2 },
  floor: 1,
  extraMinutes: 60,
} as const;

export const COLLECT = {
  reach: 48,
  sample: { energy: 1, oxygen: 1, minutes: 8 },
  look: { oxygen: 1, minutes: 10 },
  points: { sampleFirst: 10, sampleExtra: 3, viewpoint: 5, missionTrace: 5, nasaCuriosity: 15 },
} as const;

/** Piezas por montón, según el índice de la muestra. */
export const PILE_SIZE: Readonly<Record<number, number>> = { 0: 4, 1: 3, 2: 5, 3: 3, 4: 4 };

export type PlaceType = 's' | 'm' | 'r' | 'e';

export interface Place {
  readonly x: number;
  readonly y: number;
  /** Índice en la colección del destino. */
  readonly index: number;
  readonly type: PlaceType;
}

/** Los 11 lugares con hallazgos. Los mismos en la Luna y en Marte; cambia la colección. */
export const PLACES: readonly Place[] = [
  { x: 500, y: 700, index: 0, type: 's' },
  { x: 650, y: 1150, index: 4, type: 's' },
  { x: 1200, y: 500, index: 1, type: 's' },
  { x: 1500, y: 1250, index: 2, type: 's' },
  { x: 2300, y: 800, index: 3, type: 's' },
  { x: 400, y: 450, index: 5, type: 'm' },
  { x: 1900, y: 1550, index: 6, type: 'm' },
  { x: 900, y: 1000, index: 7, type: 'r' },
  { x: 2100, y: 1450, index: 8, type: 'r' },
  { x: 1100, y: 1500, index: 9, type: 'e' },
  { x: 2300, y: 350, index: 10, type: 'e' },
];

export const KIND_BY_TYPE: Readonly<Record<PlaceType, FindingKind>> = {
  s: 'SAMPLE',
  m: 'VIEWPOINT',
  r: 'MISSION_TRACE',
  e: 'NASA_CURIOSITY',
};

export const PIECE_OFFSETS: readonly (readonly [number, number])[] = [
  [-14, -8], [10, -12], [-4, 10], [16, 6], [-20, 8],
];

/** Distancias a las que se dispara cada pista de radio. */
export const RADIO_RANGE = {
  nearPlace: 420,
  goldenStar: 650,
  farFromBase: 500,
  veryFar: 900,
} as const;

/** Un lugar de la colección: nombre y texto viven en i18n (`exploration.collections.*`). */
export const COLLECTION_SIZE = 11;
