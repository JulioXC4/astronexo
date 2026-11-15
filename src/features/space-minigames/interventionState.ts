import type { GameAction, MissionState } from '../../game';

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
