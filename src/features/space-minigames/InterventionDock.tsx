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
import { useI18n } from '../../i18n';

interface InterventionDockProps {
  readonly state: MissionState;
  readonly onAction: (action: GameAction) => void;
  readonly onRequestConfirmation?: (action: GameAction) => void;
  readonly groupDecisionPending?: boolean;
}

function formatCost(cost: ResourceDelta, t: ReturnType<typeof useI18n>['t']) {
  const parts = [];
  if (cost.energy) parts.push(t('interventions.costItem', { amount: Math.abs(cost.energy), resource: t('common.energy') }));
  if (cost.oxygen) parts.push(t('interventions.costItem', { amount: Math.abs(cost.oxygen), resource: t('common.oxygen') }));
  if (cost.foodSupply) parts.push(t('interventions.costItem', { amount: Math.abs(cost.foodSupply), resource: t('common.food') }));
  return parts.join(' + ') || t('interventions.noCost');
}

export function InterventionDock({
  state,
  onAction,
  onRequestConfirmation,
  groupDecisionPending = false,
}: InterventionDockProps) {
  const { t } = useI18n();
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
    if (!item) return t('interventions.blocked.unknown');
    if (item.requiresAlert && !state.activeAlerts.some((alert) => item.resolves.includes(alert.kind))) {
      return t('interventions.blocked.alertRequired');
    }
    if (action === 'CONSULT_EARTH') {
      if (state.consultationUsed) return t('interventions.blocked.consultationUsed');
      if (!state.communicationAvailable) return t('interventions.blocked.earthUnavailable');
      if (state.destination === 'MARS' && state.turn === state.maxTurns) return t('interventions.blocked.replyTooLate');
    }
    if (action === 'RECYCLE_OXYGEN' && state.oxygen >= 100) return t('interventions.blocked.oxygenFull');
    if (action === 'REINFORCE_SHELTER' && state.shield >= 100) return t('interventions.blocked.shieldFull');
    if (action === 'RUN_RESEARCH' && state.scienceProgress >= 100) return t('interventions.blocked.scienceFull');
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
      <span className="pixel-kicker">{t('interventions.kicker')}</span>
      <h2 id="intervention-title">{t('interventions.title')}</h2>
      </div>
      <span className={state.actionTakenThisTurn ? 'status-light' : 'status-light status-light--warning'}>
        {state.actionTakenThisTurn ? t('interventions.statusRecorded') : t('interventions.statusPending')}
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
            <strong>{t(`interventions.items.${item.id}.label`)}</strong>
            <small>{blockedReason ?? t('interventions.baseCost', { cost: formatCost(item.cost, t) })}</small>
          </button>;
        })}
        <button
          type="button"
          className="intervention-option intervention-option--skip"
          disabled={state.actionTakenThisTurn || groupDecisionPending}
          onClick={skip}
        >
          <span>—</span><strong>{t('interventions.noIntervention')}</strong><small>{t('interventions.noInterventionDesc')}</small>
        </button>
      </div>

      <div className="intervention-console">
        {panelMode === 'SKIPPED' ? <div className="console-placeholder">
          <div aria-hidden="true">■</div>
          <p><strong>{t('interventions.skippedRecorded')}</strong></p>
          <p>{t('interventions.skippedDesc')}</p>
        </div> : intervention && selected ? <>
          <span className="pixel-kicker">{t('interventions.previewKicker', { id: intervention.id })}</span>
          <h3>{t(`interventions.items.${intervention.id}.label`)}</h3>
          <p>{t(`interventions.items.${intervention.id}.objective`)}</p>
          <p><strong>{t('interventions.instructionLabel')}</strong> {t(`interventions.items.${intervention.id}.instructions`)}</p>
          <div className="cost-preview">
            <span>{t('interventions.realCost')}</span><strong>{formatCost(cost, t)}</strong>
            <span>{t('interventions.benefit')}</span><strong>{t(`interventions.items.${intervention.id}.benefit`)}</strong>
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
          {!canPay && <p className="error-copy" role="alert">{t('interventions.insufficientResources')}</p>}
          <button
            type="button"
            className="pixel-button pixel-button--confirm"
            disabled={!interactionReady || !canPay || state.actionTakenThisTurn || groupDecisionPending}
            onClick={confirm}
          >{onRequestConfirmation ? t('interventions.requestAgreement') : t('interventions.confirmAction')}</button>
        </> : <div className="console-placeholder">
          <div aria-hidden="true">◀ ▲ ▼ ▶</div>
          <p>{t('interventions.selectPrompt')}</p>
        </div>}
      </div>
    </div>
  </section>;
}
