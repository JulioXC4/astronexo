import { useEffect, useRef, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { INTERVENTIONS, getActionCost } from '../../game';
import type {
  ActionChoice,
  GameAction,
  InterventionAction,
  MissionState,
  ResourceDelta,
} from '../../game';
import { interventionAssets } from '../../assets/interventionAssets';
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
  readonly focusedAlertId?: string | null;
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

function formatCost(cost: ResourceDelta, t: Translate) {
  const parts = [];
  if (cost.energy) parts.push(`${Math.abs(cost.energy)} ${t('hud.energy')}`);
  if (cost.oxygen) parts.push(`${Math.abs(cost.oxygen)} ${t('hud.oxygen')}`);
  if (cost.foodSupply) parts.push(`${Math.abs(cost.foodSupply)} ${t('hud.food')}`);
  return parts.join(' + ') || t('interventions.noCost');
}

export function InterventionDock({
  state,
  onAction,
  onRequestConfirmation,
  groupDecisionPending = false,
  focusedAlertId,
}: InterventionDockProps) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<InterventionAction | null>(null);
  const [skipSelected, setSkipSelected] = useState(false);
  const [choiceId, setChoiceId] = useState<ActionChoice | undefined>();
  const [interactionReady, setInteractionReady] = useState(false);
  const actionLock = useRef(false);
  const requestLock = useRef(false);
  const panelMode = getInterventionPanelMode(state, selected);
  const intervention = INTERVENTIONS.find((item) => item.action === selected);
  const focusedAlert = state.activeAlerts.find((alert) => alert.id === focusedAlertId);
  const orderedInterventions = [...INTERVENTIONS].sort((left, right) => {
    if (!focusedAlert) return 0;
    const leftRelated = left.resolves.includes(focusedAlert.kind) ? 1 : 0;
    const rightRelated = right.resolves.includes(focusedAlert.kind) ? 1 : 0;
    return rightRelated - leftRelated;
  });
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

  useEffect(() => {
    if (!state.actionTakenThisTurn) return;
    setMenuOpen(false);
    setSelected(null);
    setSkipSelected(false);
    setChoiceId(undefined);
    setInteractionReady(false);
  }, [state.actionTakenThisTurn]);

  function unavailableReason(action: InterventionAction) {
    const item = INTERVENTIONS.find((candidate) => candidate.action === action);
    if (!item) return t('interventions.unavailable.generic');
    if (item.requiresAlert && !state.activeAlerts.some((alert) => item.resolves.includes(alert.kind))) {
      return t('interventions.unavailable.needsAlert');
    }
    if (action === 'CONSULT_EARTH') {
      if (state.consultationUsed) return t('interventions.unavailable.consultationUsed');
      if (!state.communicationAvailable) return t('interventions.unavailable.earthLinkOffline');
      if (state.destination === 'MARS' && state.turn === state.maxTurns) return t('interventions.unavailable.responseTooLate');
    }
    if (action === 'RECYCLE_OXYGEN' && state.oxygen >= 100) return t('interventions.unavailable.oxygenFull');
    if (action === 'REINFORCE_SHELTER' && state.shield >= 100) return t('interventions.unavailable.shieldFull');
    if (action === 'RUN_RESEARCH' && state.scienceProgress >= 100) return t('interventions.unavailable.scienceFull');
    return null;
  }

  function choose(action: InterventionAction) {
    setMenuOpen(false);
    setSelected(action);
    setSkipSelected(false);
    setChoiceId(undefined);
    setInteractionReady(false);
  }

  function closeOverlay() {
    if (groupDecisionPending) return;
    setSelected(null);
    setSkipSelected(false);
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
    setSelected(null);
    setMenuOpen(false);
  }

  function chooseSkip() {
    setMenuOpen(false);
    setSelected(null);
    setSkipSelected(true);
    setChoiceId(undefined);
    setInteractionReady(false);
  }

  function confirmSkip() {
    if (actionLock.current || requestLock.current) return;
    if (onRequestConfirmation) {
      requestLock.current = true;
      onRequestConfirmation({ type: 'SKIP_INTERVENTION' });
      return;
    }
    actionLock.current = true;
    onAction({ type: 'SKIP_INTERVENTION' });
    setSkipSelected(false);
    setMenuOpen(false);
  }

  return <section className="intervention-dock" aria-labelledby="intervention-title">
    <button
      type="button"
      className="intervention-menu-trigger pixel-button"
      aria-expanded={menuOpen}
      aria-controls="intervention-menu"
      disabled={state.actionTakenThisTurn || groupDecisionPending}
      onClick={() => setMenuOpen((open) => !open)}
    >
      <span id="intervention-title">{t('interventions.openMenu')}</span>
      <small>{focusedAlert ? t(`alerts.${focusedAlert.kind}.title`) : t('interventions.selectPrompt')}</small>
      <strong className={state.actionTakenThisTurn ? 'status-light' : 'status-light status-light--warning'}>
        {t(state.actionTakenThisTurn ? 'interventions.statusRecorded' : 'interventions.statusPending')}
      </strong>
    </button>

    {menuOpen && <>
      <button
        type="button"
        className="intervention-menu-scrim"
        aria-label={t('common.close')}
        onClick={() => setMenuOpen(false)}
      />
      <div id="intervention-menu" className="intervention-menu" role="dialog" aria-modal="false" aria-label={t('interventions.title')}>
        <header>
          <div>
            <h2>{t('interventions.title')}</h2>
            <p>{focusedAlert ? t(`alerts.${focusedAlert.kind}.title`) : t('interventions.selectPrompt')}</p>
          </div>
          <button type="button" className="intervention-close" onClick={() => setMenuOpen(false)} aria-label={t('common.close')}>
            <X weight="bold" aria-hidden="true" />
          </button>
        </header>
        <div className="intervention-list">
      {orderedInterventions.map((item) => {
        const blockedReason = unavailableReason(item.action);
        const asset = interventionAssets[item.id][0];
        const related = focusedAlert ? item.resolves.includes(focusedAlert.kind) : false;
        const targetId = state.activeAlerts.find((alert) => item.resolves.includes(alert.kind))?.id;
        const actualCost = getActionCost(state, { type: item.action, targetId });
        return <button
          type="button"
          key={item.id}
          className={`intervention-option ${related ? 'intervention-option--recommended' : ''}`}
          disabled={state.actionTakenThisTurn || groupDecisionPending || blockedReason !== null}
          aria-label={`${t(`interventions.items.${item.id}.label`)}. ${blockedReason ?? t('interventions.baseCost', { cost: formatCost(actualCost, t) })}`}
          title={blockedReason ?? t('interventions.baseCost', { cost: formatCost(actualCost, t) })}
          onClick={() => choose(item.action)}
        >
          <img src={asset.path} alt="" />
          <span className="intervention-option__label">
            <strong>{t(`interventions.items.${item.id}.label`)}</strong>
            {related && <em>{t('interventions.relatedToAlert')}</em>}
          </span>
          <small>{formatCost(actualCost, t)}</small>
        </button>;
      })}
      <button
        type="button"
        className="intervention-option intervention-option--skip"
        disabled={state.actionTakenThisTurn || groupDecisionPending}
        onClick={chooseSkip}
      >
        <span aria-hidden="true">—</span>
        <span className="intervention-option__label"><strong>{t('interventions.noIntervention')}</strong></span>
        <small>{t('interventions.noCost')}</small>
      </button>
        </div>
      </div>
    </>}

    {skipSelected && <div className="intervention-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeOverlay();
    }}>
      <section
        className="intervention-console intervention-console--compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-intervention-dialog-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') closeOverlay();
        }}
      >
        <header className="intervention-console__header">
          <div>
            <span>{t('interventions.previewKicker', { id: '' })}</span>
            <h3 id="skip-intervention-dialog-title">{t('interventions.noIntervention')}</h3>
          </div>
          <button type="button" className="intervention-close" onClick={closeOverlay} aria-label={t('common.close')}>
            <X weight="bold" aria-hidden="true" />
          </button>
        </header>
        <div className="intervention-brief intervention-brief--single">
          <p>{t('interventions.noInterventionDesc')}</p>
        </div>
        <div className="cost-preview">
          <div><span>{t('interventions.realCost')}</span><strong>{t('interventions.noCost')}</strong></div>
          <div><span>{t('interventions.benefit')}</span><strong>{t('interventions.skippedDesc')}</strong></div>
        </div>
        <footer className="intervention-console__actions">
          <button type="button" className="pixel-button" onClick={closeOverlay}>{t('common.back')}</button>
          <button type="button" className="pixel-button pixel-button--confirm" disabled={groupDecisionPending} onClick={confirmSkip}>
            {t(onRequestConfirmation ? 'interventions.requestAgreement' : 'interventions.confirmAction')}
          </button>
        </footer>
      </section>
    </div>}

    {selected && intervention && <div className="intervention-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeOverlay();
    }}>
      <section
        className="intervention-console"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intervention-dialog-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') closeOverlay();
        }}
      >
        <header className="intervention-console__header">
          <div>
            <span>{t('interventions.previewKicker', { id: '' })}</span>
            <h3 id="intervention-dialog-title">{t(`interventions.items.${intervention.id}.label`)}</h3>
          </div>
          <button type="button" className="intervention-close" onClick={closeOverlay} aria-label={t('common.close')}>
            <X weight="bold" aria-hidden="true" />
          </button>
        </header>
        <div className="intervention-brief">
          <p>{t(`interventions.items.${intervention.id}.objective`)}</p>
          <p><strong>{t('interventions.instruction')}:</strong> {t(`interventions.items.${intervention.id}.instructions`)}</p>
        </div>
        <div className="cost-preview">
          <div><span>{t('interventions.realCost')}</span><strong>{formatCost(cost, t)}</strong></div>
          <div><span>{t('interventions.benefit')}</span><strong>{t(`interventions.items.${intervention.id}.benefit`)}</strong></div>
        </div>
        {panelMode === 'SKIPPED' ? <div className="console-placeholder"><p>{t('interventions.skippedDesc')}</p></div> : <>
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
          {!canPay && <p className="error-copy">{t('interventions.insufficientResources')}</p>}
          <footer className="intervention-console__actions">
            <button type="button" className="pixel-button" onClick={closeOverlay}>{t('common.back')}</button>
            <button
              type="button"
              className="pixel-button pixel-button--confirm"
              disabled={!interactionReady || !canPay || state.actionTakenThisTurn || groupDecisionPending}
              onClick={confirm}
            >{t(onRequestConfirmation ? 'interventions.requestAgreement' : 'interventions.confirmAction')}</button>
          </footer>
        </>}
      </section>
    </div>}
  </section>;
}
