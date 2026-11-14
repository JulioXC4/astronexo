import type { GameAction, MissionState } from '../../game';
import { InterventionDock } from '../space-minigames';
import { AlertCard } from './AlertCard';
import { ResourceBar } from './ResourceBar';

interface MissionControlViewProps {
  readonly state: MissionState;
  readonly onAction: (action: GameAction) => void;
  readonly onAdvance: () => void;
}

export function MissionControlView({ state, onAction, onAdvance }: MissionControlViewProps) {
  const destinationLabel = state.destination === 'MOON' ? 'LUNA' : 'MARTE';
  const communicationLabel = state.pendingCommunication
    ? 'RESPUESTA EN TRÁNSITO'
    : state.communicationResponse
      ? 'RESPUESTA RECIBIDA'
      : state.consultationUsed
        ? 'CONSULTA USADA'
        : 'LISTO';
  return <main className="mission-shell">
    <header className="mission-header pixel-panel">
      <div>
        <span className="pixel-kicker">CONTROL DE MISIÓN · ESCENARIO EDUCATIVO SIMULADO H2</span>
        <h1>Guardia en {destinationLabel}</h1>
      </div>
      <div className="mission-clock" aria-label={`Turno ${state.turn} de ${state.maxTurns}`}>
        <span>TURNO {state.turn}/{state.maxTurns}</span>
        <strong>{state.clockLabel}</strong>
      </div>
    </header>

    <section className="resource-rack pixel-panel" aria-label="Recursos principales">
      <ResourceBar label="ENERGÍA" value={state.energy} tone="energy" />
      <ResourceBar label="OXÍGENO" value={state.oxygen} tone="oxygen" />
      <ResourceBar label="ESCUDO" value={state.shield} tone="shield" />
    </section>

    <div className="mission-grid">
      <section className="base-monitor pixel-panel" aria-labelledby="base-title">
        <div className="section-heading">
          <div>
            <span className="pixel-kicker">CÁMARA 01</span>
            <h2 id="base-title">Base espacial</h2>
          </div>
          <span className="status-light">EN LÍNEA</span>
        </div>
        <div className={`base-scene base-scene--${state.destination.toLowerCase()}`}>
          <span className="base-scene__stars" aria-hidden="true">· + · + ·</span>
          <div className="pixel-base" aria-label="Placeholder pixel art de la base espacial">
            <div className="pixel-base__dish" />
            <div className="pixel-base__hub">BASE</div>
            <div className="pixel-base__solar" />
          </div>
          <small>PLACEHOLDER CSS · SUSTITUIR POR SPRITE EXPORTADO</small>
        </div>
        <dl className="telemetry-grid">
          <div><dt>Exposición</dt><dd>{state.radiationExposure}/100</dd></div>
          <div><dt>Ciencia</dt><dd>{state.scienceProgress}/100</dd></div>
          <div><dt>Alimentos</dt><dd>{state.foodSupply}/100</dd></div>
          <div><dt>Solar</dt><dd>{state.solarEfficiency}/100</dd></div>
          <div><dt>Invernadero</dt><dd>{state.greenhouseActive ? 'ACTIVO' : 'SUSPENDIDO'}</dd></div>
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

    <InterventionDock key={state.turn} state={state} onAction={onAction} />

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
