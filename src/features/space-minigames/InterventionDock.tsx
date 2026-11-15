import { useEffect, useRef, useState } from 'react';
import { INTERVENTIONS, getActionCost } from '../../game';
import type {
  ActionChoice,
  GameAction,
  InterventionAction,
  MissionState,
  ResourceDelta,
} from '../../game';
import { InterventionGesture } from './InterventionGesture';
import { OxygenPatchGame } from './OxygenPatchGame';
import { PanelRepairGame } from './PanelRepairGame';
import { getInterventionPanelMode } from './interventionState';

interface InterventionDockProps {
  readonly state: MissionState;
  readonly onAction: (action: GameAction) => void;
  readonly onRequestConfirmation?: (action: GameAction) => void;
  readonly groupDecisionPending?: boolean;
}

function formatCost(cost: ResourceDelta) {
  const parts = [];
  if (cost.energy) parts.push(`${Math.abs(cost.energy)} Energía`);
  if (cost.oxygen) parts.push(`${Math.abs(cost.oxygen)} Oxígeno`);
  if (cost.foodSupply) parts.push(`${Math.abs(cost.foodSupply)} Alimento`);
  return parts.join(' + ') || 'Sin costo de recursos';
}

export function InterventionDock({
  state,
  onAction,
  onRequestConfirmation,
  groupDecisionPending = false,
}: InterventionDockProps) {
  const [selected, setSelected] = useState<InterventionAction | null>(null);
  const [choiceId, setChoiceId] = useState<ActionChoice | undefined>();
  const [interactionReady, setInteractionReady] = useState(false);
  const actionLock = useRef(false);
  const requestLock = useRef(false);
  const panelMode = getInterventionPanelMode(state, selected);
  const intervention = INTERVENTIONS.find((item) => item.action === selected);
  const matchingAlert = intervention
    ? state.activeAlerts.find((alert) => intervention.resolves.includes(alert.kind))
    : undefined;
  const pendingAction: GameAction | null = selected ? {
    type: selected,
    targetId: matchingAlert?.id,
    choiceId,
  } : null;
  const cost = pendingAction ? getActionCost(state, pendingAction) : {};
  const canPay = state.energy + (cost.energy ?? 0) >= 0
    && state.oxygen + (cost.oxygen ?? 0) >= 0;

  useEffect(() => {
    if (!groupDecisionPending) requestLock.current = false;
  }, [groupDecisionPending]);

  function unavailableReason(action: InterventionAction) {
    const item = INTERVENTIONS.find((candidate) => candidate.action === action);
    if (!item) return 'Intervención no disponible.';
    if (item.requiresAlert && !state.activeAlerts.some((alert) => item.resolves.includes(alert.kind))) {
      return 'Necesita una alerta compatible.';
    }
    if (action === 'CONSULT_EARTH') {
      if (state.consultationUsed) return 'La consulta ya fue utilizada.';
      if (!state.communicationAvailable) return 'El enlace con la Tierra no está disponible.';
      if (state.destination === 'MARS' && state.turn === state.maxTurns) return 'La respuesta llegaría después de la guardia.';
    }
    if (action === 'RECYCLE_OXYGEN' && state.oxygen >= 100) return 'El Oxígeno ya está completo.';
    if (action === 'REINFORCE_SHELTER' && state.shield >= 100) return 'El Escudo ya está completo.';
    if (action === 'RUN_RESEARCH' && state.scienceProgress >= 100) return 'El progreso científico ya está completo.';
    return null;
  }

  function choose(action: InterventionAction) {
    setSelected(action);
    setChoiceId(undefined);
    setInteractionReady(false);
  }

  function confirm() {
    if (!pendingAction || !interactionReady || !canPay || actionLock.current || requestLock.current) return;
    if (onRequestConfirmation) {
      requestLock.current = true;
      onRequestConfirmation(pendingAction);
      return;
    }
    actionLock.current = true;
    onAction(pendingAction);
  }

  function skip() {
    if (actionLock.current || requestLock.current) return;
    setSelected(null);
    setChoiceId(undefined);
    setInteractionReady(false);
    if (onRequestConfirmation) {
      requestLock.current = true;
      onRequestConfirmation({ type: 'SKIP_INTERVENTION' });
      return;
    }
    actionLock.current = true;
    onAction({ type: 'SKIP_INTERVENTION' });
  }

  return <section className="intervention-dock pixel-panel" aria-labelledby="intervention-title">
    <div className="section-heading">
      <div>
        <span className="pixel-kicker">P12 · UNA ACCIÓN PRINCIPAL</span>
        <h2 id="intervention-title">Intervenciones G1–G8</h2>
      </div>
      <span className={state.actionTakenThisTurn ? 'status-light' : 'status-light status-light--warning'}>
        {state.actionTakenThisTurn ? 'REGISTRADA' : 'PENDIENTE'}
      </span>
    </div>

    <div className="intervention-layout">
      <div className="intervention-list">
        {INTERVENTIONS.map((item) => {
          const blockedReason = unavailableReason(item.action);
          return <button
            type="button"
            key={item.id}
            className={`intervention-option ${selected === item.action ? 'intervention-option--selected' : ''}`}
            disabled={state.actionTakenThisTurn || groupDecisionPending || blockedReason !== null}
            onClick={() => choose(item.action)}
          >
            <span>{item.id}</span>
            <strong>{item.label}</strong>
            <small>{blockedReason ?? `Costo base: ${formatCost(item.cost)}`}</small>
          </button>;
        })}
        <button
          type="button"
          className="intervention-option intervention-option--skip"
          disabled={state.actionTakenThisTurn || groupDecisionPending}
          onClick={skip}
        >
          <span>—</span><strong>No intervenir</strong><small>Las alertas empeorarán</small>
        </button>
      </div>

      <div className="intervention-console">
        {panelMode === 'SKIPPED' ? <div className="console-placeholder">
          <div aria-hidden="true">■</div>
          <p><strong>NO INTERVENIR REGISTRADO</strong></p>
          <p>Las alertas activas aplicarán sus consecuencias al finalizar el turno.</p>
        </div> : intervention && selected ? <>
          <span className="pixel-kicker">{intervention.id} · VISTA PREVIA</span>
          <h3>{intervention.label}</h3>
          <p>{intervention.objective}</p>
          <p><strong>Instrucción:</strong> {intervention.instructions}</p>
          <div className="cost-preview">
            <span>COSTO REAL</span><strong>{formatCost(cost)}</strong>
            <span>BENEFICIO</span><strong>{intervention.benefit}</strong>
          </div>
          {selected === 'REPAIR_PANELS'
            ? <PanelRepairGame onReadyChange={setInteractionReady} />
            : selected === 'PATCH_OXYGEN_LEAK'
              ? <OxygenPatchGame onReadyChange={setInteractionReady} />
              : <InterventionGesture
                  key={selected}
                  action={selected}
                  onReadyChange={setInteractionReady}
                  onChoiceChange={setChoiceId}
                />}
          {!canPay && <p className="error-copy">Recursos insuficientes para esta acción.</p>}
          <button
            type="button"
            className="pixel-button pixel-button--confirm"
            disabled={!interactionReady || !canPay || state.actionTakenThisTurn || groupDecisionPending}
            onClick={confirm}
          >{onRequestConfirmation ? 'SOLICITAR ACUERDO' : 'CONFIRMAR ACCIÓN'}</button>
        </> : <div className="console-placeholder">
          <div aria-hidden="true">◀ ▲ ▼ ▶</div>
          <p>Selecciona una intervención para ver su costo, objetivo e interacción.</p>
        </div>}
      </div>
    </div>
  </section>;
}
