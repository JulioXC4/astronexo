import type { AlertKind, GameAction, ResourceDelta } from '../types';

export interface InterventionConfig {
  readonly id: 'G1' | 'G3';
  readonly action: Extract<GameAction, { type: 'REPAIR_PANELS' | 'PATCH_OXYGEN_LEAK' }>['type'];
  readonly label: string;
  readonly objective: string;
  readonly instructions: string;
  readonly resolves: AlertKind;
  readonly cost: ResourceDelta;
  readonly benefit: string;
}

export const INTERVENTIONS: readonly InterventionConfig[] = [
  {
    id: 'G1',
    action: 'REPAIR_PANELS',
    label: 'Reparar paneles',
    objective: 'Recupera el arreglo solar antes de que baje la energía.',
    instructions: 'Arrastra la celda al panel o usa la alternativa accesible.',
    resolves: 'PANEL_DAMAGE',
    cost: { energy: -5 },
    benefit: 'Detiene la pérdida de energía de esta alerta.',
  },
  {
    id: 'G3',
    action: 'PATCH_OXYGEN_LEAK',
    label: 'Parchar fuga',
    objective: 'Sella la fuga del circuito de oxígeno.',
    instructions: 'Toca los tres puntos de fuga o usa la alternativa accesible.',
    resolves: 'OXYGEN_LEAK',
    cost: { energy: -4 },
    benefit: 'Detiene la pérdida de oxígeno de esta alerta.',
  },
] as const;

export function getIntervention(action: GameAction['type']) {
  return INTERVENTIONS.find((intervention) => intervention.action === action);
}
