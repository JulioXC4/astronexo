import { EVENT_CONFIG, INTERVENTIONS, MODULE_CATALOG } from '../../game';
import type { MissionResult, ResourceDelta } from '../../game';
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
  const toolLabels = result.relevantTools.map((toolId) => t(`tools.catalog.${toolId}.label`));
  const decisions = finalState.decisions.filter((decision) => decision.action !== 'SKIP_INTERVENTION');
  const unresolvedEvents = finalState.unresolvedEvents.slice(-8);
  const eventKindForId = (id: string) => Object.keys(EVENT_CONFIG).find((kind) => id.startsWith(kind));
  const translateDelta = (delta: ResourceDelta) => ([
    ['energy', 'common.energy'],
    ['oxygen', 'common.oxygen'],
    ['shield', 'common.shield'],
    ['foodSupply', 'common.food'],
    ['radiationExposure', 'common.radiationExposure'],
    ['scienceProgress', 'common.science'],
    ['solarEfficiency', 'common.solarEfficiency'],
  ] as const).flatMap(([key, resourceKey]) => {
    const amount = delta[key];
    return amount ? [t('results.resourceDelta', {
      sign: amount > 0 ? '+' : '−',
      amount: Math.abs(amount),
      resource: t(resourceKey),
    })] : [];
  }).join(' · ');
  const decisionSummaries = decisions.map((decision) => {
    const actionId = INTERVENTIONS.find((item) => item.action === decision.action)?.id;
    const actionLabel = actionId ? t(`interventions.items.${actionId}.label`) : t('interventions.noIntervention');
    const delta = translateDelta(decision.resourceDelta);
    return `${t('results.actionRecorded', { action: actionLabel })}${delta ? ` ${t('results.actionResourceDelta', { delta })}` : ''}`;
  });
  const consequenceSummaries = unresolvedEvents.map((event) => {
    const kind = eventKindForId(event.sourceAlertId);
    const eventName = kind ? t(`events.${kind}.title`) : t('results.unknownEvent');
    const delta = translateDelta(event.resourceDelta);
    return `${t('results.consequenceRecorded', { event: eventName })}${delta ? ` ${t('results.actionResourceDelta', { delta })}` : ''}`;
  });
  const trainingEntries = finalState.setup.earthProfile?.trainings ?? [];
  const outcomeByMission = new Map((finalState.setup.earthProfile?.outcomes ?? []).map((outcome) => [outcome.missionId, outcome]));
  const trainingSummaries = trainingEntries.map((training) => {
    const copy = `earthMissions.catalog.${training.id}`;
    const outcome = outcomeByMission.get(training.id);
    const cost = outcome ? translateDelta(outcome.spaceDelta) : '';
    return `${t('results.earthTrainingTitle', { name: t(`${copy}.name`), effect: t(`${copy}.effect`) })}${cost ? ` ${t('results.earthTrainingCost', { cost })}` : ''}`;
  });
  const currentOutcomeTitle = completed
    ? t('results.completed')
    : scientificIncomplete
      ? t('results.incomplete')
      : t('results.interrupted');
  const currentOutcomeDescription = completed
    ? t('results.completedDesc')
    : scientificIncomplete
      ? t('results.objectiveIncomplete')
      : t('results.interruptedGeneric');
  return <main className="results-shell">
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '0.6rem' }}>
      <LanguageSelector variant="hud" />
    </div>
    <section className={`results-banner pixel-panel ${completed ? 'results-banner--success' : 'results-banner--failed'}`}>
      <span className="pixel-kicker">{t('results.bannerKicker')}</span>
      {result.finalState.setup.earthProfile && <p>{result.finalState.setup.earthProfile.fictionalName}</p>}
      <h1>{currentOutcomeTitle}</h1>
      <p>{currentOutcomeDescription}</p>
      <div className="score-total"><span>{t('results.scoreLabel')}</span><strong>{score.total}</strong><small>/100</small></div>
    </section>

    <div className="results-grid">
      <section className="pixel-panel">
        <span className="pixel-kicker">{t('results.reportKicker')}</span>
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
        {decisionSummaries.length
          ? <ul>{decisionSummaries.map((item, index) => <li key={`action-${index}`}>{item}</li>)}</ul>
          : <p>{t('results.noInterventions')}</p>}
      </div>
      <div>
        <h2>{t('results.consequencesTitle')}</h2>
        {consequenceSummaries.length
          ? <ul>{consequenceSummaries.map((item, index) => <li key={`consequence-${index}`}>{item}</li>)}</ul>
          : <p>{t('results.noConsequences')}</p>}
      </div>
    </section>

    <section className="module-report pixel-panel">
      <div className="section-heading">
        <div><span className="pixel-kicker">{t('results.modulesBuiltTitle')}</span><h2>{t('results.modulesBuiltTitle')}</h2></div>
        <strong>{result.relevantModules.length}/3</strong>
      </div>
      <div className="module-report-grid">
        {result.moduleReport.map((entry) => {
          const module = MODULE_CATALOG.find((candidate) => candidate.id === entry.moduleId);
          const moduleCopy = `baseBuilder.catalog.${entry.moduleId}`;
          const costs = translateDelta(entry.resourcesConsumed);
          return <article key={entry.moduleId}>
            <span className="module-report__icon" aria-hidden="true">{module?.icon}</span>
            <h3>{t(`${moduleCopy}.name`)}</h3>
            <p><strong>{t('results.operatingCost')}</strong> {costs || t('results.noOperatingCost')}</p>
            <strong>{t('results.moduleBenefits')}</strong>
            {entry.benefitsProvided.length
              ? <ul><li>{t(`${moduleCopy}.benefit`)}</li></ul>
              : <p>{t('results.noModuleBenefit')}</p>}
            {entry.relatedConsequences.length > 0 && <p><strong>{t('results.relatedConsequences')}</strong> {t('results.moduleRelatedConsequences', { count: entry.relatedConsequences.length })}</p>}
          </article>;
        })}
      </div>
    </section>

    <section className="decision-report pixel-panel">
      <div>
        <h2>{t('results.configConsequencesTitle')}</h2>
        {trainingSummaries.length
          ? <ul>{trainingSummaries.map((item, index) => <li key={`training-${index}`}>{item}</li>)}</ul>
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
        <p>{t('results.causeAndEffectSummary', { decisions: decisionSummaries.length, events: consequenceSummaries.length })}</p>
      </div>
      <div>
        <h2>{t('results.objectiveAndLinkTitle')}</h2>
        <p>{t('results.scientificObjStatus', { status: result.scientificObjectiveAchieved ? t('results.achieved') : t('results.pending') })}</p>
        <p>{finalState.communicationResponse ? t('results.earthReply') : finalState.consultationUsed ? t('results.communicationPending') : t('results.noConsultationReceived')}</p>
        <p><strong>{t('results.toolsLabel')}</strong> {toolLabels.join(' · ')}</p>
      </div>
    </section>

    <footer className="results-actions">
      <button className="pixel-button" onClick={onRetry}>{t('results.retry')}</button>
      <button className="pixel-button pixel-button--primary" onClick={onFinish}>{t('results.submitReport')}</button>
    </footer>
  </main>;
}
