import { ROLE_LABELS } from './coop.types';
import type { LocalCoopConfig } from './coop.types';

interface CoopRoleBarProps { readonly group: LocalCoopConfig }

export function CoopRoleBar({ group }: CoopRoleBarProps) {
  return <header className="coop-role-bar pixel-panel" aria-label="Integrantes y roles del equipo">
    <div className="coop-role-bar__title">
      <span className="pixel-kicker">E6 · TURNO COOPERATIVO</span>
      <strong>{group.teamAlias}</strong>
      <small>Conversen sin límite de tiempo antes de confirmar.</small>
    </div>
    <ol>
      {group.players.map((player, index) => {
        const active = index === group.activePlayerIndex;
        return <li className={active ? 'coop-player coop-player--active' : 'coop-player'} key={player.id}>
          <span>{index + 1}</span>
          <div><strong>{player.alias}</strong><small>{player.roles.map((role) => ROLE_LABELS[role]).join(' · ')}</small></div>
          <em>{active ? 'DIRIGE ESTE TURNO' : 'APOYA AL EQUIPO'}</em>
        </li>;
      })}
    </ol>
  </header>;
}
