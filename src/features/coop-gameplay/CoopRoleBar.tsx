import { useI18n } from '../../i18n';
import { ROLE_LABELS } from './coop.types';
import type { LocalCoopConfig } from './coop.types';

interface CoopRoleBarProps { readonly group: LocalCoopConfig }

export function CoopRoleBar({ group }: CoopRoleBarProps) {
  const { t } = useI18n();

  return (
    <header className="coop-role-bar pixel-panel" aria-label={t('a11y.coopRoles')}>
      <div className="coop-role-bar__title">
        <span className="pixel-kicker">{t('coop.kicker')}</span>
        <strong>{group.teamAlias}</strong>
        <small>{t('coop.talkFreely')}</small>
      </div>
      <ol>
        {group.players.map((player, index) => {
          const active = index === group.activePlayerIndex;
          const roleNames = player.roles.map((role) => t(`coop.roles.${role}`) || ROLE_LABELS[role]).join(' · ');
          return (
            <li className={active ? 'coop-player coop-player--active' : 'coop-player'} key={player.id}>
              <span>{index + 1}</span>
              <div>
                <strong>{player.alias}</strong>
                <small>{roleNames}</small>
              </div>
              <em>{active ? t('coop.leadsTurn') : t('coop.supportsTeam')}</em>
            </li>
          );
        })}
      </ol>
    </header>
  );
}
