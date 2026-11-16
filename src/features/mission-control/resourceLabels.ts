import type { ResourceDelta } from '../../game';

/** Nombre visible de cada recurso, compartido por el rack, las alertas y los informes. */
export const RESOURCE_LABELS: Readonly<Record<string, string>> = {
  energy: 'missionControl.energy',
  oxygen: 'missionControl.oxygen',
  shield: 'missionControl.shield',
  foodSupply: 'missionControl.food',
  scienceProgress: 'missionControl.scienceGoal',
  radiationExposure: 'common.radiation',
  solarEfficiency: 'missionControl.telemetry.solar',
};

export interface ReadableChange {
  readonly key: string;
  readonly labelKey: string;
  readonly value: number;
}

/**
 * Convierte un ResourceDelta en una lista legible y ordenada: primero lo que
 * más duele. Sirve para que el costo de no actuar se vea con número, no con
 * una frase cualitativa.
 */
export function readableChanges(delta: ResourceDelta | undefined): readonly ReadableChange[] {
  if (!delta) return [];
  return Object.entries(delta)
    .filter(([, value]) => typeof value === 'number' && value !== 0)
    .map(([key, value]) => ({ key, labelKey: RESOURCE_LABELS[key] ?? key, value: value as number }))
    .sort((a, b) => a.value - b.value);
}

export function formatChange(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}
