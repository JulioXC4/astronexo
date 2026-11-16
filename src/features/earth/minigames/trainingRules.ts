import type { QualityTier } from '../../../game';
import { calculateTrainingCost } from '../trainingOutcome';

/**
 * Reglas de los minijuegos de entrenamiento terrestre.
 *
 * Antes cada juego llevaba su regla mezclada con 300 líneas de JSX con estilos
 * en línea. Aquí quedan solas, sin pantalla, para poder probarlas. Los números
 * son los mismos que tenían los juegos: lo que cambia es cómo se juegan.
 */

/** Costo 1 = lo hiciste muy bien; costo 2 = sirve, pero gastaste más. */
export function tierFromCost(cost: number): QualityTier {
  return cost <= 1 ? 'excellent' : 'good';
}

// ============================================================== Huerto (Veggie)
export type WaterDose = 'LOW' | 'MID' | 'HIGH';

export interface VeggieState {
  /** Luz roja, 30 a 90 %. La azul es lo que falta para 100. */
  readonly red: number;
  readonly water: WaterDose;
}

export const VEGGIE = { redMin: 30, redMax: 90, redOptimum: [65, 75] as const, waterBudgetLiters: 40 } as const;
export const WATER_LITERS: Readonly<Record<WaterDose, number>> = { LOW: 15, MID: 35, HIGH: 65 };

export function veggieGrowth(s: VeggieState): number {
  const redOk = s.red >= 65 && s.red <= 75;
  const blue = 100 - s.red;
  const blueOk = blue >= 25 && blue <= 35;
  return (redOk ? 50 : 25) + (blueOk ? 30 : 15) + (s.water === 'MID' ? 20 : s.water === 'HIGH' ? 10 : 5);
}

export function veggieDone(s: VeggieState): boolean {
  return veggieGrowth(s) >= 90 && s.water === 'MID';
}

export const veggieCost = (s: VeggieState) => calculateTrainingCost('VEGGIE_LAB', s.red);

// ============================================================== Invernadero ártico
export type LedMode = 'LOW' | 'NORMAL' | 'BOOST';

export interface ArcticState {
  /** Flujo de calor geotérmico, 10 a 90 %. */
  readonly flow: number;
  readonly insulated: boolean;
  readonly led: LedMode;
}

export const ARCTIC = { flowMin: 10, flowMax: 90, outsideC: -15, comfortC: [18, 24] as const, maxFlow: 65 } as const;

export function arcticTemperature(s: ArcticState): number {
  const ambient = s.insulated ? 22 : 8;
  const fromFlow = Math.round(s.flow * 0.28);
  const fromLeds = s.led === 'BOOST' ? 4 : s.led === 'NORMAL' ? 2 : 0;
  return ARCTIC.outsideC + ambient + fromFlow + fromLeds;
}

export function arcticDone(s: ArcticState): boolean {
  const temp = arcticTemperature(s);
  return temp >= 18 && temp <= 24 && s.insulated && s.flow <= ARCTIC.maxFlow;
}

export const arcticCost = (s: ArcticState) => calculateTrainingCost('ARCTIC_GREENHOUSE', s.flow);

// ============================================================== Reserva polar
export interface PolarState {
  /** Baterías en cada lugar. Siempre suman 10; cada una vale 10 %. */
  readonly heat: number;
  readonly crops: number;
  readonly radio: number;
}

export const POLAR = { tokens: 10, minHeat: 5, minCrops: 2, minRadio: 1 } as const;
export const POLAR_START: PolarState = { heat: 4, crops: 3, radio: 3 };

export function polarDone(s: PolarState): boolean {
  return s.heat + s.crops + s.radio === POLAR.tokens
    && s.heat >= POLAR.minHeat && s.crops >= POLAR.minCrops && s.radio >= POLAR.minRadio;
}

export const polarCost = (s: PolarState) => calculateTrainingCost('DARK_MONTHS_RESERVE', s.heat * 10);

/** Mueve una batería de un lugar a otro. Nunca deja un lugar en negativo. */
export function moveToken(s: PolarState, from: keyof PolarState, to: keyof PolarState): PolarState {
  if (from === to || s[from] <= 0) return s;
  return { ...s, [from]: s[from] - 1, [to]: s[to] + 1 };
}

// ============================================================== Cámara de altura
export interface AltitudeState {
  /** Presión de la cámara, 50 a 100 kPa. */
  readonly kpa: number;
  readonly seals: readonly [boolean, boolean, boolean];
}

export const ALTITUDE = { kpaMin: 50, kpaMax: 100, safe: [70, 82] as const, hypoxiaBelow: 70, overpressureAbove: 85 } as const;

export function sealsClosed(s: AltitudeState): number {
  return s.seals.filter(Boolean).length;
}

/** Gas de prueba gastado: 30 % base, más por presión alta y por cada fuga. */
export function altitudeGas(s: AltitudeState): number {
  return 30 + Math.round((s.kpa - 50) * 0.6) + (sealsClosed(s) < 3 ? 20 : 0);
}

export function altitudeDone(s: AltitudeState): boolean {
  return s.kpa >= 70 && s.kpa <= 82 && sealsClosed(s) === 3 && altitudeGas(s) <= 65;
}

export const altitudeCost = (s: AltitudeState) => calculateTrainingCost('ALTITUDE_ACCLIMATIZATION', altitudeGas(s));

// ============================================================== Soporte vital (ECLSS)
export interface EclssState {
  /** Potencia de la máquina de aire, 150 a 550 W. */
  readonly watts: number;
  readonly scrubber: boolean;
  /** Agua reciclada, 50 a 98 %. */
  readonly recycle: number;
}

export const ECLSS = { wattsMin: 150, wattsMax: 550, recycleMin: 50, recycleMax: 98, powerLimit: 450 } as const;

export function eclssOxygen(s: EclssState): number {
  return Number((18.0 + (s.watts / 100) * 0.9).toFixed(1));
}
export const eclssCo2 = (s: EclssState) => (s.scrubber ? 0.04 : 1.85);
export function eclssTotalPower(s: EclssState): number {
  return s.watts + (s.scrubber ? 45 : 0) + Math.round(s.recycle * 0.5);
}

export function eclssDone(s: EclssState): boolean {
  const o2 = eclssOxygen(s);
  return o2 >= 20.4 && o2 <= 21.8 && eclssCo2(s) <= 0.1 && eclssTotalPower(s) <= ECLSS.powerLimit && s.recycle >= 80;
}

export const eclssCost = (s: EclssState) => calculateTrainingCost('ECLSS_TRAINING', eclssTotalPower(s));

// ============================================================== Nubes y soles
/** Reserva sugerida = promedio de lo que cada día pierde respecto al mejor día. */
export function recommendedReserve(values: readonly number[]): number {
  const best = Math.max(...values);
  if (!(best > 0)) return 100;
  const shortfall = values.reduce((sum, value) => sum + (1 - value / best), 0) / values.length;
  return Math.round(shortfall * 100);
}

export const reserveMismatch = (reserve: number, values: readonly number[]) =>
  Math.abs(reserve - recommendedReserve(values));

export const cloudsDone = (reserve: number, values: readonly number[]) => reserveMismatch(reserve, values) <= 25;
export const cloudsCost = (reserve: number, values: readonly number[]) =>
  calculateTrainingCost('CLOUDS_SUNS', reserveMismatch(reserve, values));

/**
 * Pista de «frío / caliente» sin decir el número: solo hacia dónde corregir.
 * Antes, al fallar, el juego revelaba la respuesta («los datos piden cerca de 31 %»).
 */
export type ReserveHint = 'TOO_LITTLE' | 'TOO_MUCH' | 'RIGHT';
export function reserveHint(reserve: number, values: readonly number[]): ReserveHint {
  const diff = reserve - recommendedReserve(values);
  if (Math.abs(diff) <= 10) return 'RIGHT';
  return diff < 0 ? 'TOO_LITTLE' : 'TOO_MUCH';
}
