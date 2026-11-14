import { useRef, useState } from 'react';
import { INTERVENTIONS } from '../../game';
import type { GameAction, MissionState } from '../../game';
import { OxygenPatchGame } from './OxygenPatchGame';
import { PanelRepairGame } from './PanelRepairGame';

interface InterventionDockProps {
  readonly state: MissionState;
  readonly onAction: (action: GameAction) => void;
}

type PlayableAction = 'REPAIR_PANELS' | 'PATCH_OXYGEN_LEAK';

function formatCost(energy: number | undefined, oxygen: number | undefined) {
  const parts = [];
  if (energy) parts.push(`${Math.abs(energy)} Energía`);
  if (oxygen) parts.push(`${Math.abs(oxygen)} Oxígeno`);
  return parts.join(' + ') || 'Sin costo';
}

export function InterventionDock({ state, onAction }: InterventionDockProps) {
  const [selected, setSelected] = useState<PlayableAction | null>(null);
  const [interactionReady, setInteractionReady] = useState(false);
  const actionLock = useRef(false);
  const intervention = INTERVENTIONS.find((item) => item.action === selected);
  const matchingAlert = intervention
    ? state.activeAlerts.find((alert) => alert.kind === intervention.resolves)
    : undefined;
  const energyCost = Math.abs(intervention?.cost.energy ?? 0);
  const canPay = state.energy >= energyCost;

  function choose(action: PlayableAction) {
    setSelected(action);
    setInteractionReady(false);
  }

  function confirm() {
    if (!selected || !matchingAlert || !interactionReady || !canPay || actionLock.current) return;
    actionLock.current = true;
    onAction({ type: selected, targetId: matchingAlert.id });
  }

  function skip() {
    if (actionLock.current) return;
    actionLock.current = true;
    onAction({ type: 'SKIP_INTERVENTION' });
  }

  return <section className="intervention-dock pixel-panel" aria-labelledby="intervention-title">
    <div className="section-heading">
      <div>
        <span className="pixel-kicker">P12 · UNA ACCIÓN PRINCIPAL</span>
        <h2 id="intervention-title">Intervenciones</h2>
      </div>
      <span className={state.actionTakenThisTurn ? 'status-light' : 'status-light status-light--warning'}>
        {state.actionTakenThisTurn ? 'REGISTRADA' : 'PENDIENTE'}
      </span>
    </div>

    <div className="intervention-layout">
      <div className="intervention-list">
        {INTERVENTIONS.map((item) => {
          const available = state.activeAlerts.some((alert) => alert.kind === item.resolves);
          return <button
            type="button"
            key={item.id}
            className={`intervention-option ${selected === item.action ? 'intervention-option--selected' : ''}`}
            disabled={state.actionTakenThisTurn || !available}
            onClick={() => choose(item.action)}
          >
            <span>{item.id}</span>
            <strong>{item.label}</strong>
            <small>Costo: {formatCost(item.cost.energy, item.cost.oxygen)}</small>
          </button>;
        })}
        <button
          type="button"
          className="intervention-option intervention-option--skip"
          disabled={state.actionTakenThisTurn}
          onClick={skip}
        >
          <span>—</span><strong>No intervenir</strong><small>Las alertas empeorarán</small>
        </button>
      </div>

      <div className="intervention-console">
        {intervention ? <>
          <span className="pixel-kicker">{intervention.id} · VISTA PREVIA</span>
          <h3>{intervention.label}</h3>
          <p>{intervention.objective}</p>
          <p><strong>Instrucción:</strong> {intervention.instructions}</p>
          <div className="cost-preview">
            <span>COSTO</span><strong>{formatCost(intervention.cost.energy, intervention.cost.oxygen)}</strong>
            <span>BENEFICIO</span><strong>{intervention.benefit}</strong>
          </div>
          {selected === 'REPAIR_PANELS'
            ? <PanelRepairGame onReadyChange={setInteractionReady} />
            : <OxygenPatchGame onReadyChange={setInteractionReady} />}
          {!canPay && <p className="error-copy">Energía insuficiente para esta acción.</p>}
          <button
            type="button"
            className="pixel-button pixel-button--confirm"
            disabled={!interactionReady || !matchingAlert || !canPay || state.actionTakenThisTurn}
            onClick={confirm}
          >CONFIRMAR ACCIÓN</button>
        </> : <div className="console-placeholder">
          <div aria-hidden="true">◀ ▲ ▼ ▶</div>
          <p>Selecciona una intervención para ver su costo, objetivo e interacción.</p>
        </div>}
      </div>
    </div>
  </section>;
}
