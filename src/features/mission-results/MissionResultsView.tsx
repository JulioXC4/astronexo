import { MODULE_CATALOG, SCIENCE_TARGET } from '../../game';
import type { MissionResult } from '../../game';
import { useI18n, LanguageSelector } from '../../i18n';

interface MissionResultsViewProps {
  readonly result: MissionResult;
  readonly onRetry: () => void;
  readonly onFinish: () => void;
}

export function MissionResultsView({ result, onRetry, onFinish }: MissionResultsViewProps) {
  const { t } = useI18n();
  const completed = result.outcome === 'COMPLETED';
  const scientificIncomplete = !completed
    && result.turnsReached === result.finalState.maxTurns
    && !result.scientificObjectiveAchieved;
  const { finalState, score } = result;
  const toolLabels = result.relevantTools.map((toolId) => t(`tools.${toolId}.label`));
  const resultDescription = completed
    ? t('results.completedDesc')
    : scientificIncomplete
      ? t('results.scientificIncompleteDesc', { progress: finalState.scienceProgress, target: SCIENCE_TARGET })
      : t('results.interruptedDesc');
  return <main className="results-shell">
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '0.6rem' }}>
      <LanguageSelector variant="hud" />
    </div>
    <section className={`results-banner pixel-panel ${completed ? 'results-banner--success' : 'results-banner--failed'}`}>
      <span className="pixel-kicker">{t('results.bannerKicker')}</span>
      {result.finalState.setup.earthProfile && <p>{result.finalState.setup.earthProfile.fictionalName}</p>}
      <h1>{completed ? t('results.victoryTitle') : scientificIncomplete ? t('results.incomplete') : t('results.partialTitle')}</h1>
      <p>{resultDescription}</p>
      <div className="score-total"><span>{t('results.scoreLabel')}</span><strong>{score.total}</strong><small>/100</small></div>
    </section>

    <div className="results-grid">
      <section className="pixel-panel">
        <span className="pixel-kicker">P14 · {t('results.finalReportTitle').toUpperCase()}</span>
        <h2>{t('results.finalStateTitle')}</h2>
        <dl className="report-stats">
          <div><dt>{t('results.turns')}</dt><dd>{result.turnsReached}/{finalState.maxTurns}</dd></div>
          <div><dt>{t('common.energy')}</dt><dd>{finalState.energy}</dd></div>
          <div><dt>{t('common.oxygen')}</dt><dd>{finalState.oxygen}</dd></div>
          <div><dt>{t('common.shield')}</dt><dd>{finalState.shield}</dd></div>
          <div><dt>{t('common.food')}</dt><dd>{finalState.foodSupply}</dd></div>
          <div><dt>{t('common.radiation')}</dt><dd>{finalState.radiationExposure}</dd></div>
          <div><dt>{t('common.science')}</dt><dd>{finalState.scienceProgress}</dd></div>
          <div><dt>{t('common.solarEfficiency')}</dt><dd>{finalState.solarEfficiency}</dd></div>
        </dl>
      </section>
      <section className="pixel-panel">
        <span className="pixel-kicker">{t('results.scoreBreakdownTitle')}</span>
        <h2>{t('results.scoreLabel')}</h2>
        <ul className="score-list">
          <li><span>{t('results.crewSafety')}</span><strong>{score.crewSafety}</strong></li>
          <li><span>{t('results.finalResources')}</span><strong>{score.finalResources}</strong></li>
          <li><span>{t('results.alertPrioritization')}</span><strong>{score.alertPrioritization}</strong></li>
          <li><span>{t('results.operationalCompletion')}</span><strong>{score.operationalCompletion}</strong></li>
          <li><span>{t('results.scientificObjective')}</span><strong>{score.scientificObjective}</strong></li>
          <li><span>{t('results.difficultyFactor')}</span><strong>×{score.difficultyFactor}</strong></li>
        </ul>
      </section>
    </div>

    <section className="decision-report pixel-panel">
      <div>
        <h2>{t('results.interventionsTitle')}</h2>
        {result.helpfulDecisions.length
          ? <ul>{result.helpfulDecisions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          : <p>{t('results.noInterventions')}</p>}
      </div>
      <div>
        <h2>{t('results.consequencesTitle')}</h2>
        {result.harmfulDecisions.length
          ? <ul>{result.harmfulDecisions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          : <p>{t('results.noConsequences')}</p>}
      </div>
    </section>

    <section className="module-report pixel-panel">
      <div className="section-heading">
        <div><span className="pixel-kicker">{t('results.moduleConfigKicker')}</span><h2>{t('results.modulesBuiltTitle')}</h2></div>
        <strong>{result.relevantModules.length}/3</strong>
      </div>
      <div className="module-report-grid">
        {result.moduleReport.map((entry) => {
          const module = MODULE_CATALOG.find((candidate) => candidate.id === entry.moduleId);
          const costs = [
            entry.resourcesConsumed.energy ? `${Math.abs(entry.resourcesConsumed.energy)} ${t('hud.energy')}` : '',
            entry.resourcesConsumed.oxygen ? `${Math.abs(entry.resourcesConsumed.oxygen)} ${t('hud.oxygen')}` : '',
            entry.resourcesConsumed.foodSupply ? `${Math.abs(entry.resourcesConsumed.foodSupply)} ${t('hud.food')}` : '',
          ].filter(Boolean);
          return <article key={entry.moduleId}>
            <span className="module-report__icon" aria-hidden="true">{module?.icon}</span>
            <h3>{t(`baseBuilder.modules.${entry.moduleId}.name`)}</h3>
            <p><strong>{t('results.actualConsumption')}:</strong> {costs.length ? costs.join(' · ') : t('results.noOperationalConsumption')}</p>
            <strong>{t('results.evidenceBenefits')}</strong>
            {entry.benefitsProvided.length
              ? <ul>{entry.benefitsProvided.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
              : <p>{t('results.noMeasuredBenefit')}</p>}
            {entry.relatedConsequences.length > 0 && <><strong>{t('results.relatedConsequences')}</strong><ul>{entry.relatedConsequences.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></>}
          </article>;
        })}
      </div>
    </section>

    <section className="decision-report pixel-panel">
      <div>
        <h2>{t('results.configConsequencesTitle')}</h2>
        {result.configurationConsequences.length
          ? <ul>{result.configurationConsequences.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          : <p>{t('results.noModuleConsequences')}</p>}
      </div>
      <div>
        <h2>{t('results.educationalNoteTitle')}</h2>
        <p>{t('results.educationalNoteDesc')}</p>
      </div>
    </section>

    <section className="decision-report pixel-panel">
      <div>
        <h2>{t('results.causeAndEffectTitle')}</h2>
        {result.causeAndEffect.length
          ? <ul>{result.causeAndEffect.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
          : <p>{t('results.noAdditionalRelations')}</p>}
      </div>
      <div>
        <h2>{t('results.objectiveAndLinkTitle')}</h2>
        <p>{t('results.scientificObjStatus', { status: t(result.scientificObjectiveAchieved ? 'results.achieved' : 'results.pending') })}</p>
        <p>{finalState.communicationResponse ?? t('results.noConsultationReceived')}</p>
        <p>{t('results.toolsUsed', { tools: toolLabels.join(' · ') })}</p>
      </div>
    </section>

    <footer className="results-actions">
      <button className="pixel-button" onClick={onRetry}>{t('results.retry')}</button>
      <button className="pixel-button pixel-button--primary" onClick={onFinish}>{t('results.submitReport')}</button>
    </footer>
  </main>;
}
