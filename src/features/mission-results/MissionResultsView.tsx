import { ALL_TOOL_CATALOG, MODULE_CATALOG } from '../../game';
import type { MissionResult } from '../../game';

interface MissionResultsViewProps {
  readonly result: MissionResult;
  readonly onRetry: () => void;
  readonly onFinish: () => void;
}

export function MissionResultsView({ result, onRetry, onFinish }: MissionResultsViewProps) {
  const completed = result.outcome === 'COMPLETED';
  const scientificIncomplete = !completed
    && result.turnsReached === result.finalState.maxTurns
    && !result.scientificObjectiveAchieved;
  const { finalState, score } = result;
  const toolLabels = result.relevantTools.map((toolId) =>
    ALL_TOOL_CATALOG.find((tool) => tool.id === toolId)?.label ?? toolId);
  return <main className="results-shell">
    <section className={`results-banner pixel-panel ${completed ? 'results-banner--success' : 'results-banner--failed'}`}>
      <span className="pixel-kicker">P13 · FIN DE GUARDIA</span>
      <h1>{completed ? 'MISIÓN COMPLETADA' : scientificIncomplete ? 'MISIÓN INCOMPLETA' : 'MISIÓN INTERRUMPIDA'}</h1>
      <p>{completed
        ? 'La tripulación sostuvo la base y alcanzó el objetivo científico.'
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

    <section className="module-report pixel-panel">
      <div className="section-heading">
        <div><span className="pixel-kicker">CONFIGURACIÓN P10 → P14</span><h2>Módulos construidos</h2></div>
        <strong>{result.relevantModules.length}/3</strong>
      </div>
      <div className="module-report-grid">
        {result.moduleReport.map((entry) => {
          const module = MODULE_CATALOG.find((candidate) => candidate.id === entry.moduleId);
          const costs = [
            entry.resourcesConsumed.energy ? `${Math.abs(entry.resourcesConsumed.energy)} Energía` : '',
            entry.resourcesConsumed.oxygen ? `${Math.abs(entry.resourcesConsumed.oxygen)} Oxígeno` : '',
            entry.resourcesConsumed.foodSupply ? `${Math.abs(entry.resourcesConsumed.foodSupply)} Alimentos` : '',
          ].filter(Boolean);
          return <article key={entry.moduleId}>
            <span className="module-report__icon" aria-hidden="true">{module?.icon}</span>
            <h3>{module?.name ?? entry.moduleId}</h3>
            <p><strong>Consumo real:</strong> {costs.length ? costs.join(' · ') : 'Sin consumo operativo registrado'}</p>
            <strong>Beneficios con evidencia</strong>
            {entry.benefitsProvided.length
              ? <ul>{entry.benefitsProvided.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
              : <p>No se activó un beneficio medible durante esta guardia.</p>}
            {entry.relatedConsequences.length > 0 && <><strong>Consecuencias relacionadas</strong><ul>{entry.relatedConsequences.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></>}
          </article>;
        })}
      </div>
    </section>

    <section className="decision-report pixel-panel">
      <div>
        <h2>Configuración y consecuencias</h2>
        {result.configurationConsequences.length
          ? <ul>{result.configurationConsequences.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          : <p>No hubo consecuencias del historial vinculadas a módulos.</p>}
      </div>
      <div>
        <h2>Lectura educativa</h2>
        <p>Los valores son parámetros del modelo educativo. El informe solo atribuye beneficios registrados por el motor.</p>
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
