import type { GameAction, MissionAlert, MissionState } from '../../game';

export type InterventionPanelMode = 'EMPTY' | 'PREVIEW' | 'SKIPPED';

export function getInterventionPanelMode(
  state: Pick<MissionState, 'actionTakenThisTurn' | 'decisions'>,
  selected: GameAction['type'] | null,
): InterventionPanelMode {
  if (state.actionTakenThisTurn && state.decisions.at(-1)?.action === 'SKIP_INTERVENTION') {
    return 'SKIPPED';
  }
  return selected && selected !== 'SKIP_INTERVENTION' ? 'PREVIEW' : 'EMPTY';
}

/** Alertas que justifican la música de alerta y la cortinilla de emergencia (el resto no cambia el ambiente). */
const IMPORTANT_ALERT_KINDS: readonly MissionAlert['kind'][] = [
  'OXYGEN_LEAK', 'RADIATION_RISK', 'MARS_DUST_STORM', 'ENERGY_SHORTAGE',
];

export function isImportantAlert(alert: Pick<MissionAlert, 'kind' | 'severity'>): boolean {
  return IMPORTANT_ALERT_KINDS.includes(alert.kind) || alert.severity >= 3;
}
