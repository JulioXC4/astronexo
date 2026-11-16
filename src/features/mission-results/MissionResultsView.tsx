import { SCIENCE_TARGET } from '../../game';
import type { MissionResult } from '../../game';
import { moduleScenes } from '../../assets/moduleScenes';
import { spaceBackgrounds } from '../../assets/manifest';
import { CharacterPortrait } from '../../visual-kit/CharacterPortrait';
import { ResourceBar } from '../mission-control/ResourceBar';
import { useI18n, LanguageSelector } from '../../i18n';
import { NasaSourcesPanel } from '../nasa/NasaSourcesPanel';
import { CollectionList, formatMinutes } from '../exploration';

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
  const toolCounts = result.relevantTools.reduce((counts, toolId) => {
    counts.set(toolId, (counts.get(toolId) ?? 0) + 1);
    return counts;
  }, new Map<(typeof result.relevantTools)[number], number>());
  const trainings = finalState.setup.earthProfile?.trainings ?? [];
  const cityName = t(`cities.${finalState.setup.city.toLowerCase()}.name`);
  const destinationName = t(`destinations.${finalState.destination.toLowerCase()}.name`);
  const resultDescription = completed
    ? t('results.completedDesc')
    : scientificIncomplete
      ? t('results.scientificIncompleteDesc', { progress: finalState.scienceProgress, target: SCIENCE_TARGET })
      : t('results.interruptedDesc');
  const conclusions = [
    ...result.helpfulDecisions.slice(0, 2),
    ...result.harmfulDecisions.slice(0, 1),
  ].slice(0, 3);
  const background = spaceBackgrounds.control[finalState.destination].path;

  return <main
    className={`results-shell results-shell--${completed ? 'success' : 'partial'}`}
    style={background ? { backgroundImage: `linear-gradient(rgb(2 8 19 / 45%), rgb(2 8 19 / 82%)), url('${background}')` } : undefined}
  >
    <div className="results-language"><LanguageSelector variant="hud" /></div>
    <section className="results-hero">
      <div className="results-companion" aria-hidden="true">
        <CharacterPortrait identity={completed ? 'ALBA' : 'CHISPA'} kind={completed ? 'cadet' : 'robot'} mood={completed ? 'celebrate' : 'alert'} />
      </div>
      <div className="results-hero__copy">
        {finalState.setup.earthProfile && <span>{finalState.setup.earthProfile.fictionalName}</span>}
        <h1>{completed ? t('results.victoryTitle') : scientificIncomplete ? t('results.incomplete') : t('results.partialTitle')}</h1>
        <p>{resultDescription}</p>
      </div>
      <div className="score-total" aria-label={`${t('results.scoreLabel')} ${score.total} / 100`}>
        <span>{t('results.scoreLabel')}</span>
        <strong>{score.total}</strong>
        <small>/100</small>
      </div>
    </section>

    <section className="results-primary-resources" aria-label={t('missionControl.resourceRackAria')}>
      <ResourceBar label={t('missionControl.energy')} value={finalState.energy} tone="energy" />
      <ResourceBar label={t('missionControl.oxygen')} value={finalState.oxygen} tone="oxygen" />
      <ResourceBar label={t('missionControl.shield')} value={finalState.shield} tone="shield" />
    </section>

    <section className="results-conclusions">
      <h2>{t('results.conclusionsTitle')}</h2>
      {conclusions.length
        ? <ol>{conclusions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol>
        : <p>{t('results.noAdditionalRelations')}</p>}
    </section>

    {finalState.explorations.length > 0 && <section className="results-exploration">
      <ul>{finalState.explorations.map((trip) => <li key={trip.afterTurn}>
        {t('exploration.logLine', { turn: trip.afterTurn, time: formatMinutes(trip.minutes), pieces: trip.pieces })}
      </li>)}</ul>
      <CollectionList destination={finalState.destination} collection={finalState.collection} />
    </section>}

    <details className="results-details">
      <summary>{t('results.openFullReport')}</summary>
      <div className="results-details__content">
        <section
          className="preparation-report"
          data-city={finalState.setup.city}
          data-destination={finalState.setup.destination}
        >
          <h2>{t('results.preparationTitle')}</h2>
          <dl className="report-stats">
            <div><dt>{t('results.cityLabel')}</dt><dd>{cityName}</dd></div>
            <div><dt>{t('results.destinationLabel')}</dt><dd>{destinationName}</dd></div>
          </dl>
          <h3>{t('results.trainingsLabel')}</h3>
          <ul>
            {trainings.map((training) => <li key={training.id} data-training-id={training.id}>{training.name}</li>)}
          </ul>
          <h3>{t('results.toolsLabel')}</h3>
          <ul>
            {[...toolCounts.entries()].map(([toolId, count]) => <li key={toolId} data-tool-id={toolId} data-tool-count={count}>
              {t(`tools.${toolId}.label`)}{count > 1 ? ` ×${count}` : ''}
              {count > 1 && <small> — {t('results.duplicateToolNote', { count })}</small>}
            </li>)}
          </ul>
        </section>
        <section>
          <h2>{t('results.finalStateTitle')}</h2>
          <dl className="report-stats">
            <div><dt>{t('results.turns')}</dt><dd>{result.turnsReached}/{finalState.maxTurns}</dd></div>
            <div><dt>{t('common.food')}</dt><dd>{finalState.foodSupply}</dd></div>
            <div><dt>{t('common.radiation')}</dt><dd>{finalState.radiationExposure}</dd></div>
            <div><dt>{t('common.science')}</dt><dd>{finalState.scienceProgress}</dd></div>
            <div><dt>{t('common.solarEfficiency')}</dt><dd>{finalState.solarEfficiency}</dd></div>
          </dl>
        </section>
        <section>
          <h2>{t('results.scoreBreakdownTitle')}</h2>
          <ul className="score-list">
            <li><span>{t('results.crewSafety')}</span><strong>{score.crewSafety}</strong></li>
            <li><span>{t('results.finalResources')}</span><strong>{score.finalResources}</strong></li>
            <li><span>{t('results.alertPrioritization')}</span><strong>{score.alertPrioritization}</strong></li>
            <li><span>{t('results.operationalCompletion')}</span><strong>{score.operationalCompletion}</strong></li>
            <li><span>{t('results.scientificObjective')}</span><strong>{score.scientificObjective}</strong></li>
            <li><span>{t('results.difficultyFactor')}</span><strong>×{score.difficultyFactor}</strong></li>
          </ul>
        </section>
        <section>
          <h2>{t('results.interventionsTitle')}</h2>
          {result.helpfulDecisions.length ? <ul>{result.helpfulDecisions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>{t('results.noInterventions')}</p>}
          <h2>{t('results.consequencesTitle')}</h2>
          {result.harmfulDecisions.length ? <ul>{result.harmfulDecisions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>{t('results.noConsequences')}</p>}
        </section>
        <section className="module-report">
          <h2>{t('results.modulesBuiltTitle')}</h2>
          <div className="module-report-grid">
            {result.moduleReport.map((entry) => {
              const costs = [
                entry.resourcesConsumed.energy ? `${Math.abs(entry.resourcesConsumed.energy)} ${t('hud.energy')}` : '',
                entry.resourcesConsumed.oxygen ? `${Math.abs(entry.resourcesConsumed.oxygen)} ${t('hud.oxygen')}` : '',
                entry.resourcesConsumed.foodSupply ? `${Math.abs(entry.resourcesConsumed.foodSupply)} ${t('hud.food')}` : '',
              ].filter(Boolean);
              return <article key={entry.moduleId} data-module-id={entry.moduleId}>
                <img src={moduleScenes[finalState.destination][entry.moduleId]} alt="" decoding="async" loading="lazy" />
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
        <section>
          <h2>{t('results.causeAndEffectTitle')}</h2>
          {result.causeAndEffect.length ? <ul>{result.causeAndEffect.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul> : <p>{t('results.noAdditionalRelations')}</p>}
          <p>{t('results.scientificObjStatus', { status: t(result.scientificObjectiveAchieved ? 'results.achieved' : 'results.pending') })}</p>
          <p>{finalState.communicationResponse ?? t('results.noConsultationReceived')}</p>
          <p>{t('results.educationalNoteDesc')}</p>
        </section>
        {finalState.setup.spaceWeather && (
          <NasaSourcesPanel cityId={finalState.setup.city} spaceWeather={finalState.setup.spaceWeather} />
        )}
      </div>
    </details>

    <footer className="results-actions">
      <button className="pixel-button" onClick={onRetry}>{t('results.retry')}</button>
      <button className="pixel-button pixel-button--primary" onClick={onFinish}>{t('results.submitReport')}</button>
    </footer>
  </main>;
}
