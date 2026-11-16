import { clampResource } from '../rules';
import type { ExplorationResult, MissionState } from '../types';

/** La salida aparece después de estos turnos (1 a 5) y de ningún otro. */
export const EXPLORATION_AFTER_TURNS: readonly number[] = [2, 4];

/**
 * Cuánto cuentan los puntos de una salida para la meta de Ciencia.
 *
 * DECISIÓN DE BALANCE (no viene de la especificación de JD, a revisar con él):
 * una salida puede dar 60 o más puntos de hallazgos, y la meta de Ciencia de la
 * guardia es 50. Si se sumaran tal cual, una sola salida ganaría la partida.
 * Por eso se convierten: un punto de hallazgo vale 1/4 de punto de Ciencia, con
 * tope por salida. Así explorar ayuda a llegar a la meta sin reemplazar al
 * trabajo del laboratorio.
 */
export const EXPLORATION_SCIENCE_DIVISOR = 4;
export const EXPLORATION_SCIENCE_CAP = 20;

export function explorationScience(points: number): number {
  return Math.min(EXPLORATION_SCIENCE_CAP, Math.round(points / EXPLORATION_SCIENCE_DIVISOR));
}

/**
 * ¿Toca ofrecer la salida? Solo tras los turnos 2 y 4, y nunca si la guardia
 * ya terminó porque una barra llegó a 0 (entonces se va directo al regreso).
 */
export function shouldOfferExploration(completedTurn: number, next: Pick<MissionState, 'outcome'>): boolean {
  return EXPLORATION_AFTER_TURNS.includes(completedTurn) && next.outcome === 'IN_PROGRESS';
}

/**
 * Escribe en el estado de la guardia lo que dejó la salida: las tres barras que
 * se movieron, la Ciencia ganada, la colección y el registro de salidas.
 */
export function applyExploration(state: MissionState, result: ExplorationResult): MissionState {
  const gained = explorationScience(result.points);
  // Cada pieza entra una vez en la colección: «Basalto ×4» son cuatro entradas.
  const entries = result.findings.flatMap(({ index, pieces }) => Array.from({ length: pieces }, () => index));

  return {
    ...state,
    energy: clampResource(result.after.energy),
    oxygen: clampResource(result.after.oxygen),
    shield: clampResource(result.after.shield),
    scienceProgress: clampResource(state.scienceProgress + gained),
    explorationPoints: state.explorationPoints + result.points,
    collection: [...state.collection, ...entries],
    explorations: [...state.explorations, {
      afterTurn: result.afterTurn,
      minutes: result.minutes,
      pieces: entries.length,
      mode: result.mode,
      rescued: result.rescued,
    }],
    // La salida no es una decisión de la guardia: no gasta la acción del turno.
  };
}
