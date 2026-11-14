import type { AlertKind, Destination } from '../types';

export const H1_ALERT_SCHEDULE: Readonly<Record<Destination, readonly (readonly AlertKind[])[]>> = {
  MOON: [
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
  ],
  MARS: [
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
    ['PANEL_DAMAGE', 'OXYGEN_LEAK'],
  ],
};
