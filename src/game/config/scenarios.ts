import type { AlertKind, Destination } from '../types';

/** Fixtures educativos simulados. El orden se rota de forma determinista con scenarioId. */
export const H2_EVENT_SCHEDULE: Readonly<Record<Destination, readonly (readonly AlertKind[])[]>> = {
  MOON: [
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['DUSTY_PANELS', 'ENERGY_SHORTAGE', 'SCIENCE_OPPORTUNITY'],
    ['RADIATION_RISK', 'COMMUNICATION_WINDOW', 'SCIENCE_OPPORTUNITY'],
    ['GREENHOUSE_STRAIN', 'PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['RADIATION_RISK', 'ENERGY_SHORTAGE', 'SCIENCE_OPPORTUNITY'],
  ],
  MARS: [
    ['DUSTY_PANELS', 'OXYGEN_LEAK'],
    ['MARS_DUST_STORM', 'ENERGY_SHORTAGE', 'PANEL_DAMAGE'],
    ['SCIENCE_OPPORTUNITY', 'COMMUNICATION_WINDOW', 'OXYGEN_LEAK'],
    ['GREENHOUSE_STRAIN', 'DUSTY_PANELS', 'RADIATION_RISK'],
    ['MARS_DUST_STORM', 'RADIATION_RISK', 'SCIENCE_OPPORTUNITY'],
  ],
};

export function scenarioSeedFromId(scenarioId: string) {
  let hash = 2166136261;
  for (const character of scenarioId) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
