import { ALL_TOOL_CATALOG } from '../../game';
import type { MissionResult } from '../../game';

interface MissionResultsViewProps {
  readonly result: MissionResult;
  readonly onRetry: () => void;
  readonly onFinish: () => void;
}

export function MissionResultsView({ result, onRetry, onFinish }: MissionResultsViewProps) {
  const completed = result.outcome === 'COMPLETED';
  const { finalState, score } = result;
  const toolLabels = result.relevantTools.map((toolId) =>
    ALL_TOOL_CATALOG.find((tool) => tool.id === toolId)?.label ?? toolId);
  return <main className="results-shell">
    <section className={`results-banner pixel-panel ${completed ? 'results-banner--success' : 'results-banner--failed'}`}>
      <span className="pixel-kicker">P13 · FIN DE GUARDIA</span>
      <h1>{completed ? 'MISIÓN COMPLETADA' : 'MISIÓN INTERRUMPIDA'}</h1>
      <p>{completed
        ? 'La tripulación sostuvo la base durante los cinco turnos.'
        : result.interruptionCause}</p>
      <div className="score-total"><span>PUNTUACIÓN</span><strong>{score.total}</strong><small>/100</small></div>
    </section>

    <div className="results-grid">
      <section className="pixel-panel">
        <span className="pixel-kicker">P14 · INFORME</span>
        <h2>Estado final</h2>
        <dl className="report-stats">
          <div><dt>Turnos</dt><dd>{result.turnsReached}/{finalState.maxTurns}</dd></div>
          <div><dt>Energía</dt><dd>{finalState.energy}</dd></div>
          <div><dt>Oxígeno</dt><dd>{finalState.oxygen}</dd></div>
          <div><dt>Escudo</dt><dd>{finalState.shield}</dd></div>
          <div><dt>Alimentos</dt><dd>{finalState.foodSupply}</dd></div>
          <div><dt>Exposición</dt><dd>{finalState.radiationExposure}</dd></div>
          <div><dt>Ciencia</dt><dd>{finalState.scienceProgress}</dd></div>
          <div><dt>Eficiencia solar</dt><dd>{finalState.solarEfficiency}</dd></div>
        </dl>
      </section>
      <section className="pixel-panel">
        <span className="pixel-kicker">DESGLOSE DE JUEGO</span>
        <h2>Puntuación</h2>
        <ul className="score-list">
          <li><span>Seguridad de la tripulación</span><strong>{score.crewSafety}</strong></li>
          <li><span>Recursos finales</span><strong>{score.finalResources}</strong></li>
          <li><span>Priorización de alertas</span><strong>{score.alertPrioritization}</strong></li>
          <li><span>Guardia operativa</span><strong>{score.operationalCompletion}</strong></li>
          <li><span>Objetivo científico</span><strong>{score.scientificObjective}</strong></li>
          <li><span>Factor de dificultad</span><strong>×{score.difficultyFactor}</strong></li>
        </ul>
      </section>
    </div>

    <section className="decision-report pixel-panel">
      <div>
        <h2>Decisiones que ayudaron</h2>
        {result.helpfulDecisions.length
          ? <ul>{result.helpfulDecisions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          : <p>No se resolvieron alertas en esta guardia.</p>}
      </div>
      <div>
        <h2>Consecuencias acumuladas</h2>
        {result.harmfulDecisions.length
          ? <ul>{result.harmfulDecisions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          : <p>No quedaron consecuencias pendientes.</p>}
      </div>
    </section>

    <section className="decision-report pixel-panel">
      <div>
        <h2>Causa y efecto</h2>
        {result.causeAndEffect.length
          ? <ul>{result.causeAndEffect.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          : <p>Sin relaciones adicionales registradas.</p>}
      </div>
      <div>
        <h2>Objetivo y enlace</h2>
        <p>Objetivo científico: <strong>{result.scientificObjectiveAchieved ? 'COMPLETADO' : 'PENDIENTE'}</strong></p>
        <p>{finalState.communicationResponse ?? 'No se recibió una consulta a Tierra.'}</p>
        <p><strong>Herramientas:</strong> {toolLabels.join(' · ')}</p>
      </div>
    </section>

    <footer className="results-actions">
      <button className="pixel-button" onClick={onRetry}>REINTENTAR MISIÓN</button>
      <button className="pixel-button pixel-button--primary" onClick={onFinish}>ENTREGAR INFORME</button>
    </footer>
  </main>;
}
