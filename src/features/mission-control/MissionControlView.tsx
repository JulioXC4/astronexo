import type { GameAction, MissionState } from '../../game';
import { InterventionDock } from '../space-minigames';
import { AlertCard } from './AlertCard';
import { ResourceBar } from './ResourceBar';
import { ModuleCameras } from './ModuleCameras';
import { useI18n, LanguageSelector } from '../../i18n';

interface MissionControlViewProps {
  readonly state: MissionState;
  readonly onAction: (action: GameAction) => void;
  readonly onAdvance: () => void;
  readonly onRequestConfirmation?: (action: GameAction) => void;
  readonly groupDecisionPending?: boolean;
  readonly showFoodAsPrimary?: boolean;
}

export function MissionControlView({
  state,
  onAction,
  onAdvance,
  onRequestConfirmation,
  groupDecisionPending = false,
  showFoodAsPrimary = false,
}: MissionControlViewProps) {
  const { t } = useI18n();
  const destinationLabel = state.destination === 'MOON' ? t('destinations.moon.name').toUpperCase() : t('destinations.mars.name').toUpperCase();
  const communicationLabel = state.pendingCommunication
    ? t('missionControl.communication.pending')
    : state.communicationResponse
      ? t('missionControl.communication.received')
      : state.consultationUsed
        ? t('missionControl.communication.used')
        : t('common.online');
  const clockLabel = state.destination === 'MOON'
    ? t('missionControl.lunarDay', { day: state.clockLabel.match(/\d+/)?.[0] ?? state.turn })
    : state.clockLabel;
  return <main className="mission-shell">
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '0.6rem' }}>
      <LanguageSelector variant="hud" />
    </div>
    <header className="mission-header pixel-panel">
      <div>
        <span className="pixel-kicker">{t('missionControl.headerKicker')}</span>
        <h1>{t('missionControl.guardTitle', { destination: destinationLabel })}</h1>
      </div>
      <div className="mission-clock" aria-label={t('missionControl.turnIndicator', { current: state.turn, total: state.maxTurns })}>
        <span>{t('missionControl.turnIndicator', { current: state.turn, total: state.maxTurns })}</span>
        <strong>{clockLabel}</strong>
      </div>
    </header>

    <section className={`resource-rack pixel-panel ${showFoodAsPrimary ? 'resource-rack--four' : ''}`} aria-label={t('missionControl.resourceRackAria')}>
      <ResourceBar label={t('missionControl.energy')} value={state.energy} tone="energy" />
      <ResourceBar label={t('missionControl.oxygen')} value={state.oxygen} tone="oxygen" />
      <ResourceBar label={t('missionControl.shield')} value={state.shield} tone="shield" />
      {showFoodAsPrimary && <ResourceBar label={t('missionControl.food')} value={state.foodSupply} tone="food" />}
    </section>

    {state.earlyWarningForecast && state.turn < state.earlyWarningForecast.turn && <aside className="early-warning pixel-panel" role="status">
      <strong>{t('missionControl.earlyWarningTitle')}</strong>
      <span>{t(`alerts.${state.earlyWarningForecast.kind}.title`)}</span>
      <small>{t('missionControl.earlyWarningSub')}</small>
    </aside>}

    <div className="mission-grid">
      <section className="base-monitor pixel-panel" aria-labelledby="base-title">
        <div className="section-heading">
          <div>
            <span className="pixel-kicker">{t('missionControl.cameraKicker')}</span>
            <h2 id="base-title">{t('missionControl.baseTitle')}</h2>
          </div>
          <span className="status-light">{t('common.online')}</span>
        </div>
        <div className={`base-scene base-scene--${state.destination.toLowerCase()}`}>
          <span className="base-scene__stars" aria-hidden="true">· + · + ·</span>
          <div className="pixel-base" aria-label={t('missionControl.baseSceneAria', { destination: destinationLabel })}>
            <div className="pixel-base__dish" />
            <div className="pixel-base__hub">BASE</div>
            <div className="pixel-base__solar" />
          </div>
          <small>{t('missionControl.activeModulesCount', { destination: destinationLabel, count: state.selectedModules.length })}</small>
        </div>
        <dl className="telemetry-grid">
          <div><dt>{t('common.radiation')}</dt><dd>{state.radiationExposure}/100</dd></div>
          <div><dt>{t('common.science')}</dt><dd>{state.scienceProgress}/100</dd></div>
          {!showFoodAsPrimary && <div><dt>{t('common.food')}</dt><dd>{state.foodSupply}/100</dd></div>}
          <div><dt>{t('common.solarEfficiency')}</dt><dd>{state.solarEfficiency}/100</dd></div>
          <div><dt>{t('missionControl.telemetry.greenhouse')}</dt><dd>{state.greenhouseActive ? t('common.active') : t('common.suspended')}</dd></div>
          <div><dt>{t('missionControl.telemetry.earthLink')}</dt><dd>{communicationLabel}</dd></div>
        </dl>
      </section>

      <section className="alerts-monitor pixel-panel" aria-labelledby="alerts-title">
        <div className="section-heading">
          <div>
            <span className="pixel-kicker">{t('missionControl.alertsKicker')}</span>
            <h2 id="alerts-title">{t('missionControl.alertsTitle')}</h2>
          </div>
          <strong>{state.activeAlerts.length}/2</strong>
        </div>
        <div className="alert-stack">
          {state.activeAlerts.length > 0
            ? state.activeAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
            : <p className="empty-signal">{t('missionControl.noAlerts')}</p>}
        </div>
      </section>
    </div>

    <ModuleCameras state={state} />

    <details className="tool-status pixel-panel">
      <summary>{t('missionControl.toolDrawerSummary')}</summary>
      <ul>{state.selectedTools.map((toolId, index) => <li key={`${toolId}-${index}`}>
        <strong>{t(`tools.${toolId}.label`)}</strong>
        <span>{t(`tools.${toolId}.benefit`)}</span>
        {toolId === 'SPARE_PARTS_KIT' && <em>{t(state.sparePartsCharges > 0 ? 'missionControl.toolAvailable' : 'missionControl.toolConsumed')}</em>}
      </li>)}</ul>
    </details>

    <InterventionDock
      key={state.turn}
      state={state}
      onAction={onAction}
      onRequestConfirmation={onRequestConfirmation}
      groupDecisionPending={groupDecisionPending}
    />

    {state.lastFeedback && <aside className="mission-feedback" role="status">
      <strong>{t('missionControl.feedbackTitle')}</strong> · {state.lastFeedback.message}
    </aside>}

    <footer className="turn-controls pixel-panel">
      <p>{state.actionTakenThisTurn
        ? t('missionControl.turnControlsReady')
        : t('missionControl.turnControlsPrompt')}</p>
      <button
        className="pixel-button pixel-button--primary"
        disabled={!state.actionTakenThisTurn}
        onClick={onAdvance}
      >
        {t(state.turn === state.maxTurns ? 'missionControl.closeGuard' : 'missionControl.endTurn')}
      </button>
    </footer>
  </main>;
}
