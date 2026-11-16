import { msg } from '../../i18n/message';
import { applyAction } from '../../game';
import type { GameAction, MissionState } from '../../game';

export type PlayerRole = 'COMMANDER' | 'ENERGY' | 'OXYGEN' | 'PROTECTION' | 'CROPS';

export interface LocalPlayer {
  readonly id: string;
  readonly alias: string;
  readonly roles: readonly PlayerRole[];
}

export interface LocalCoopConfig {
  readonly teamAlias: string;
  readonly players: readonly LocalPlayer[];
  readonly activePlayerIndex: number;
}

export interface PendingGroupDecision {
  readonly action: GameAction;
  readonly requestedByPlayerId: string;
  readonly turn: number;
  readonly decisionCount: number;
}

export const ROLE_LABELS: Readonly<Record<PlayerRole, string>> = {
  COMMANDER: 'Comandante',
  ENERGY: 'Energía',
  OXYGEN: 'Oxígeno',
  PROTECTION: 'Escudo',
  CROPS: 'Botánico',
};

export function rolesForPlayerCount(count: number): readonly PlayerRole[] {
  if (count === 3) return ['ENERGY', 'OXYGEN', 'PROTECTION'];
  if (count === 4) return ['ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER'];
  if (count === 5) return ['ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER', 'CROPS'];
  return [];
}

export function createLocalCoopConfig(
  teamAlias: string,
  aliases: readonly string[],
  activePlayerIndex = 0,
): LocalCoopConfig {
  const roles = rolesForPlayerCount(aliases.length);
  return {
    teamAlias,
    activePlayerIndex,
    players: aliases.map((alias, index) => ({
      id: `LOCAL-${index + 1}`,
      alias,
      roles: roles[index] ? [roles[index]] : [],
    })),
  };
}

export function validateLocalCoopConfig(group: LocalCoopConfig): readonly string[] {
  const errors: string[] = [];
  if (group.players.length < 3 || group.players.length > 5) {
    errors.push(msg('coopErrors.groupSize'));
  }
  const ids = group.players.map((player) => player.id.trim());
  if (ids.some((id) => id.length === 0) || new Set(ids).size !== ids.length) {
    errors.push(msg('coopErrors.playerIds'));
  }
  if (!group.teamAlias.trim()) errors.push(msg('coopErrors.teamName'));
  if (group.activePlayerIndex < 0 || group.activePlayerIndex >= group.players.length) {
    errors.push(msg('coopErrors.activePlayer'));
  }
  const expectedRoles = rolesForPlayerCount(group.players.length);
  const assignedRoles = group.players.flatMap((player) => player.roles);
  if (expectedRoles.length > 0 && (
    assignedRoles.length !== expectedRoles.length
    || expectedRoles.some((role) => assignedRoles.filter((assigned) => assigned === role).length !== 1)
    || assignedRoles.some((role) => !expectedRoles.includes(role))
    || group.players.some((player, index) =>
      player.roles.length !== 1 || player.roles[0] !== expectedRoles[index])
  )) {
    errors.push(msg('coopErrors.roles'));
  }
  return errors;
}

export function rotateActivePlayer(group: LocalCoopConfig): LocalCoopConfig {
  if (group.players.length === 0) return group;
  return {
    ...group,
    activePlayerIndex: (group.activePlayerIndex + 1) % group.players.length,
  };
}

export function showsFoodAsPrimary(group: Pick<LocalCoopConfig, 'players'>) {
  return group.players.length === 5;
}

export function stageGroupDecision(
  state: MissionState,
  group: LocalCoopConfig,
  action: GameAction,
): PendingGroupDecision | null {
  const activePlayer = group.players[group.activePlayerIndex];
  if (!activePlayer || state.actionTakenThisTurn || state.outcome !== 'IN_PROGRESS') return null;
  return {
    action,
    requestedByPlayerId: activePlayer.id,
    turn: state.turn,
    decisionCount: state.decisions.length,
  };
}

export function confirmGroupDecision(state: MissionState, pending: PendingGroupDecision): MissionState {
  if (
    state.turn !== pending.turn
    || state.decisions.length !== pending.decisionCount
    || state.actionTakenThisTurn
  ) return state;
  return applyAction(state, pending.action);
}
