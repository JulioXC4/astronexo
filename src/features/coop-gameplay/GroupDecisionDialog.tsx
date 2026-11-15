import { getActionCost, getIntervention } from '../../game';
import type { MissionState, ResourceDelta } from '../../game';
import { useI18n } from '../../i18n';
import type { LocalPlayer, PendingGroupDecision } from './coop.types';

interface GroupDecisionDialogProps {
  readonly state: MissionState;
  readonly pending: PendingGroupDecision;
  readonly activePlayer: LocalPlayer;
  readonly coordinator?: LocalPlayer;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

function formatDelta(delta: ResourceDelta, t: (k: string) => string) {
  const parts = [
    delta.energy ? `${Math.abs(delta.energy)} ${t('hud.energy') || 'Energía'}` : '',
    delta.oxygen ? `${Math.abs(delta.oxygen)} ${t('hud.oxygen') || 'Oxígeno'}` : '',
    delta.foodSupply ? `${Math.abs(delta.foodSupply)} ${t('hud.food') || 'Comida'}` : '',
  ].filter(Boolean);
  return parts.join(' + ') || t('coop.noCost');
}

export function GroupDecisionDialog({
  state,
  pending,
  activePlayer,
  coordinator,
  onConfirm,
  onCancel,
}: GroupDecisionDialogProps) {
  const { t } = useI18n();
  const skip = pending.action.type === 'SKIP_INTERVENTION';
  const intervention = skip ? undefined : getIntervention(pending.action.type);
  const cost = getActionCost(state, pending.action);
  const target = state.activeAlerts.find((alert) => alert.id === pending.action.targetId);

  const title = skip
    ? t('coop.skipInterventionTitle')
    : t('coop.executeInterventionTitle', { label: intervention?.label ?? '' });

  return (
    <div className="coop-dialog-backdrop" role="presentation">
      <section
        className="group-decision-dialog pixel-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-decision-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onCancel();
        }}
      >
        <span className="pixel-kicker">{t('coop.dialogKicker')}</span>
        <h2 id="group-decision-title">{title}</h2>
        <p>
          {t('coop.directsAction', { name: activePlayer.alias })}{' '}
          {coordinator
            ? t('coop.commanderCoordinates', { name: coordinator.alias })
            : t('coop.rotativeCoordinates')}{' '}
          {t('coop.noRoleBlocks')}
        </p>
        <dl>
          <div>
            <dt>{t('coop.target')}</dt>
            <dd>{target?.title ?? intervention?.objective ?? 'Asumir las consecuencias de las alertas activas.'}</dd>
          </div>
          <div>
            <dt>{t('coop.costOnConfirm')}</dt>
            <dd>{formatDelta(cost, t)}</dd>
          </div>
          <div>
            <dt>{t('coop.expectedConsequence')}</dt>
            <dd>
              {skip
                ? state.activeAlerts.map((alert) => alert.consequencePreview).join(' · ') || t('coop.noAlertsActive')
                : intervention?.benefit}
            </dd>
          </div>
        </dl>
        <p className="group-decision-dialog__notice">{t('coop.noResourceConsumedYet')}</p>
        <footer>
          <button type="button" className="pixel-button" autoFocus onClick={onCancel}>
            {t('coop.backToDiscussion')}
          </button>
          <button type="button" className="pixel-button pixel-button--primary" onClick={onConfirm}>
            {t('coop.confirmAgreement')}
          </button>
        </footer>
      </section>
    </div>
  );
}