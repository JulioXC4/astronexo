import type { GameAction, MissionState } from '../../game';
import { MissionControlView } from '../mission-control';
import { CoopRoleBar } from './CoopRoleBar';
import { GroupDecisionDialog } from './GroupDecisionDialog';
import { showsFoodAsPrimary } from './coop.types';
import type { LocalCoopConfig, PendingGroupDecision } from './coop.types';

interface CoopMissionViewProps {
  readonly state: MissionState;
  readonly group: LocalCoopConfig;
  readonly pendingDecision: PendingGroupDecision | null;
  readonly onRequestDecision: (action: GameAction) => void;
  readonly onConfirmDecision: () => void;
  readonly onCancelDecision: () => void;
  readonly onAdvance: () => void;
}

export function CoopMissionView({
  state,
  group,
  pendingDecision,
  onRequestDecision,
  onConfirmDecision,
  onCancelDecision,
  onAdvance,
}: CoopMissionViewProps) {
  const activePlayer = group.players[group.activePlayerIndex];
  const coordinator = group.players.find((player) => player.roles.includes('COMMANDER'));
  return <div className="coop-mission-shell">
    <CoopRoleBar group={group} />
    <MissionControlView
      state={state}
      onAction={() => undefined}
      onAdvance={onAdvance}
      onRequestConfirmation={onRequestDecision}
      groupDecisionPending={pendingDecision !== null}
      showFoodAsPrimary={showsFoodAsPrimary(group)}
    />
    {pendingDecision && activePlayer && <GroupDecisionDialog
      state={state}
      pending={pendingDecision}
      activePlayer={activePlayer}
      coordinator={coordinator}
      onConfirm={onConfirmDecision}
      onCancel={onCancelDecision}
    />}
  </div>;
}
