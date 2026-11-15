import { MissionResultsView } from '../mission-results';
import type { MissionResult } from '../../game';
import { useI18n } from '../../i18n';
import { ROLE_LABELS } from './coop.types';
import type { LocalCoopConfig } from './coop.types';

interface CoopMissionResultsProps {
  readonly result: MissionResult;
  readonly group: LocalCoopConfig;
  readonly onRetry: () => void;
  readonly onFinish: () => void;
}

export function CoopMissionResults({ result, group, onRetry, onFinish }: CoopMissionResultsProps) {
  const { t } = useI18n();
  const state = result.finalState;
  const learnings = [
    result.scientificObjectiveAchieved
      ? t('coop.learningScienceComplete')
      : t('coop.learningScienceIncomplete'),
    state.ignoredAlertCount > 0
      ? t('coop.learningIgnoredAlerts', { count: state.ignoredAlertCount })
      : t('coop.learningNoIgnoredAlerts'),
    t('coop.learningModules'),
  ];

  return (
    <div className="coop-results-shell">
      <section className="coop-results-summary pixel-panel">
        <div className="coop-results-summary__identity">
          <span className="pixel-kicker">{t('coop.resultsKicker')}</span>
          <h1>{group.teamAlias}</h1>
        </div>
        <div className="coop-results-summary__facts">
          <span><small>{t('coop.destination')}</small><strong>{t(`destinations.${state.destination === 'MOON' ? 'moon' : 'mars'}.name`)}</strong></span>
          <span><small>{t('coop.city')}</small><strong>{state.setup.city === 'AREQUIPA' ? 'Arequipa' : 'Tromsø'}</strong></span>
          <span><small>{t('coop.team')}</small><strong>{t('coop.participantsCount', { count: group.players.length })}</strong></span>
        </div>
        <details className="coop-results-more">
          <summary>{t('coop.teamDetails')}</summary>
          <div className="coop-results-summary__team">
            {group.players.map((player) => (
              <span key={player.id}>
                <strong>{player.alias}</strong> ·{' '}
                {player.roles.map((role) => t(`coop.roles.${role}`) || ROLE_LABELS[role]).join(', ')}
              </span>
            ))}
          </div>
          <div className="coop-learnings">
            <h2>{t('coop.scientificLearnings')}</h2>
            <ul>{learnings.map((learning) => <li key={learning}>{learning}</li>)}</ul>
          </div>
          <p>{t('coop.noIndividualRankings')}</p>
        </details>
      </section>
      <MissionResultsView result={result} onRetry={onRetry} onFinish={onFinish} />
    </div>
  );
}
