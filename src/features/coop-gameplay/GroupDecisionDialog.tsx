import { getActionCost, getIntervention } from '../../game';
import type { MissionState, ResourceDelta } from '../../game';
import type { LocalPlayer, PendingGroupDecision } from './coop.types';

interface GroupDecisionDialogProps {
  readonly state: MissionState;
  readonly pending: PendingGroupDecision;
  readonly activePlayer: LocalPlayer;
  readonly coordinator?: LocalPlayer;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

function formatDelta(delta: ResourceDelta) {
  const parts = [
    delta.energy ? `${Math.abs(delta.energy)} Energía` : '',
    delta.oxygen ? `${Math.abs(delta.oxygen)} Oxígeno` : '',
    delta.foodSupply ? `${Math.abs(delta.foodSupply)} Comida` : '',
  ].filter(Boolean);
  return parts.join(' + ') || 'Sin costo de recursos';
}

export function GroupDecisionDialog({
  state,
  pending,
  activePlayer,
  coordinator,
  onConfirm,
  onCancel,
}: GroupDecisionDialogProps) {
  const skip = pending.action.type === 'SKIP_INTERVENTION';
  const intervention = skip ? undefined : getIntervention(pending.action.type);
  const cost = getActionCost(state, pending.action);
  const target = state.activeAlerts.find((alert) => alert.id === pending.action.targetId);
  return <div className="coop-dialog-backdrop" role="presentation">
    <section
      className="group-decision-dialog pixel-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-decision-title"
      onKeyDown={(event) => { if (event.key === 'Escape') onCancel(); }}
    >
      <span className="pixel-kicker">ACUERDO DEL GRUPO · SIN TEMPORIZADOR</span>
      <h2 id="group-decision-title">{skip ? '¿Cerrar sin intervenir?' : `¿Ejecutar ${intervention?.label}?`}</h2>
      <p><strong>{activePlayer.alias}</strong> dirige la intervención. {coordinator
        ? <><strong>{coordinator.alias}</strong>, Comandante, coordina la confirmación colectiva.</>
        : <>El responsable rotativo coordina la confirmación colectiva.</>} Ningún rol bloquea una acción necesaria.</p>
      <dl>
        <div><dt>OBJETIVO</dt><dd>{target?.title ?? intervention?.objective ?? 'Asumir las consecuencias de las alertas activas.'}</dd></div>
        <div><dt>COSTO AL CONFIRMAR</dt><dd>{formatDelta(cost)}</dd></div>
        <div><dt>CONSECUENCIA PREVISTA</dt><dd>{skip
          ? state.activeAlerts.map((alert) => alert.consequencePreview).join(' · ') || 'No hay alertas activas.'
          : intervention?.benefit}</dd></div>
      </dl>
      <p className="group-decision-dialog__notice">Todavía no se consumió ningún recurso ni se registró una acción.</p>
      <footer>
        <button type="button" className="pixel-button" autoFocus onClick={onCancel}>VOLVER A CONVERSAR</button>
        <button type="button" className="pixel-button pixel-button--primary" onClick={onConfirm}>CONFIRMAR ACUERDO</button>
      </footer>
    </section>
  </div>;
}
