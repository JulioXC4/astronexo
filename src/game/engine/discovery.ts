import { clampResource } from '../rules';
import type { MissionState } from '../types';

/** Puntos de Ciencia que da cada estrella dorada escondida (maqueta JD v11.0). */
export const STAR_SCIENCE = 3;

/**
 * El niño tocó la estrella dorada de un minijuego de la guardia. Cada minijuego
 * esconde una y solo se cobra una vez: volver a abrirlo no da puntos de nuevo.
 */
export function claimStar(state: MissionState, interventionId: string): MissionState {
  if (state.starsFound.includes(interventionId)) return state;
  return {
    ...state,
    scienceProgress: clampResource(state.scienceProgress + STAR_SCIENCE),
    starsFound: [...state.starsFound, interventionId],
  };
}
