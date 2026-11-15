import type { MissionState, ResourceDelta } from '../types';

/**
 * Umbral por debajo del cual una barra se muestra en rojo (maqueta JD v8.3).
 * El color nunca va solo: la interfaz acompaña con un rótulo de texto.
 */
export const RESOURCE_LOW_THRESHOLD = 25;

/** Nivel de una barra, para pintarla y rotularla sin depender solo del color. */
export type ResourceLevel = 'ok' | 'low' | 'critical';

export function resourceLevel(value: number): ResourceLevel {
  if (value <= 10) return 'critical';
  if (value < RESOURCE_LOW_THRESHOLD) return 'low';
  return 'ok';
}

export function clampResource(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function applyResourceDelta(state: MissionState, delta: ResourceDelta): MissionState {
  return {
    ...state,
    energy: clampResource(state.energy + (delta.energy ?? 0)),
    oxygen: clampResource(state.oxygen + (delta.oxygen ?? 0)),
    shield: clampResource(state.shield + (delta.shield ?? 0)),
    foodSupply: clampResource(state.foodSupply + (delta.foodSupply ?? 0)),
    radiationExposure: clampResource(state.radiationExposure + (delta.radiationExposure ?? 0)),
    scienceProgress: clampResource(state.scienceProgress + (delta.scienceProgress ?? 0)),
    solarEfficiency: clampResource(state.solarEfficiency + (delta.solarEfficiency ?? 0)),
  };
}

export function canAfford(state: MissionState, delta: ResourceDelta) {
  return state.energy + (delta.energy ?? 0) >= 0
    && state.oxygen + (delta.oxygen ?? 0) >= 0
    && state.shield + (delta.shield ?? 0) >= 0
    && state.foodSupply + (delta.foodSupply ?? 0) >= 0;
}
