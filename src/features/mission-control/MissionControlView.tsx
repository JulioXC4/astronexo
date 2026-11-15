import { ALL_TOOL_CATALOG, getToolBenefit } from '../../game';
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
    ? 'RESPUESTA EN TRÁNSITO'
    : state.communicationResponse
      ? 'RESPUESTA RECIBIDA'
      : state.consultationUsed
        ? 'CONSULTA USADA'
        : t('common.online');
  return <main className="mission-shell">
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '0.6rem' }}>
      <LanguageSelector variant="hud" />
    </div>
    <header className="mission-header pixel-panel">
      <div>
        <span className="pixel-kicker">CONTROL DE MISIÓN · SIMULACIÓN EDUCATIVA</span>
        <h1>Guardia en {destinationLabel}</h1>
      </div>
      <div className="mission-clock" aria-label={`Turno ${state.turn} de ${state.maxTurns}`}>
        <span>{t('missionControl.turnIndicator', { current: state.turn, total: state.maxTurns })}</span>
        <strong>{state.clockLabel}</strong>
      </div>
    </header>

    <section className={`resource-rack pixel-panel ${showFoodAsPrimary ? 'resource-rack--four' : ''}`} aria-label="Recursos principales">
      <ResourceBar label="ENERGÍA" value={state.energy} tone="energy" />
      <ResourceBar label="OXÍGENO" value={state.oxygen} tone="oxygen" />
      <ResourceBar label="ESCUDO" value={state.shield} tone="shield" />
      {showFoodAsPrimary && <ResourceBar label="COMIDA" value={state.foodSupply} tone="food" />}
    </section>

    {state.earlyWarningForecast && state.turn < state.earlyWarningForecast.turn && <aside className="early-warning pixel-panel" role="status">
      <strong>ALERTA TEMPRANA · PRÓXIMO TURNO</strong>
      <span>{state.earlyWarningForecast.title}</span>
      <small>Anticipa el riesgo; no reduce sus consecuencias si se ignora.</small>
    </aside>}

    <div className="mission-grid">
      <section className="base-monitor pixel-panel" aria-labelledby="base-title">
        <div className="section-heading">
          <div>
            <span className="pixel-kicker">CÁMARA 01</span>
            <h2 id="base-title">Base espacial</h2>
          </div>
          <span className="status-light">{t('common.online')}</span>
        </div>
        <div className={`base-scene base-scene--${state.destination.toLowerCase()}`}>
          <span className="base-scene__stars" aria-hidden="true">· + · + ·</span>
          <div className="pixel-base" aria-label={`Base espacial en ${destinationLabel}`}>
            <div className="pixel-base__dish" />
            <div className="pixel-base__hub">BASE</div>
            <div className="pixel-base__solar" />
          </div>
          <small>BASE {destinationLabel} · {state.selectedModules.length} MÓDULOS OPERATIVOS</small>
        </div>
        <dl className="telemetry-grid">
          <div><dt>{t('common.radiation')}</dt><dd>{state.radiationExposure}/100</dd></div>
          <div><dt>{t('common.science')}</dt><dd>{state.scienceProgress}/100</dd></div>
          {!showFoodAsPrimary && <div><dt>{t('common.food')}</dt><dd>{state.foodSupply}/100</dd></div>}
          <div><dt>{t('common.solarEfficiency')}</dt><dd>{state.solarEfficiency}/100</dd></div>
          <div><dt>Invernadero</dt><dd>{state.greenhouseActive ? t('common.active') : t('common.suspended')}</dd></div>
          <div><dt>Enlace Tierra</dt><dd>{communicationLabel}</dd></div>
        </dl>
      </section>

      <section className="alerts-monitor pixel-panel" aria-labelledby="alerts-title">
        <div className="section-heading">
          <div>
            <span className="pixel-kicker">SISTEMAS</span>
            <h2 id="alerts-title">Alertas activas</h2>
          </div>
          <strong>{state.activeAlerts.length}/2</strong>
        </div>
        <div className="alert-stack">
          {state.activeAlerts.length > 0
            ? state.activeAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
            : <p className="empty-signal">Sin alertas activas.</p>}
        </div>
      </section>
    </div>

    <ModuleCameras state={state} />

    <details className="tool-status pixel-panel">
      <summary>BENEFICIOS DE HERRAMIENTAS · VER ESTADO</summary>
      <ul>{state.selectedTools.map((toolId, index) => <li key={`${toolId}-${index}`}>
        <strong>{ALL_TOOL_CATALOG.find((tool) => tool.id === toolId)?.label ?? toolId}</strong>
        <span>{getToolBenefit(toolId)}</span>
        {toolId === 'SPARE_PARTS_KIT' && <em>{state.sparePartsCharges > 0 ? t('common.available') : 'Consumido'}</em>}
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
      <strong>RESULTADO</strong> · {state.lastFeedback.message}
    </aside>}

    <footer className="turn-controls pixel-panel">
      <p>{state.actionTakenThisTurn
        ? 'Decisión registrada. Revisa el tablero y finaliza el turno.'
        : 'Elige una intervención principal o decide asumir las consecuencias.'}</p>
      <button
        className="pixel-button pixel-button--primary"
        disabled={!state.actionTakenThisTurn}
        onClick={onAdvance}
      >
        {state.turn === state.maxTurns ? 'CERRAR GUARDIA' : 'FINALIZAR TURNO'}
      </button>
    </footer>
  </main>;
}
