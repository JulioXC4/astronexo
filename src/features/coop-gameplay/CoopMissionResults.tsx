import { MissionResultsView } from '../mission-results';
import type { MissionResult } from '../../game';
import { ROLE_LABELS } from './coop.types';
import type { LocalCoopConfig } from './coop.types';

interface CoopMissionResultsProps {
  readonly result: MissionResult;
  readonly group: LocalCoopConfig;
  readonly onRetry: () => void;
  readonly onFinish: () => void;
}

export function CoopMissionResults({ result, group, onRetry, onFinish }: CoopMissionResultsProps) {
  const state = result.finalState;
  const learnings = [
    result.scientificObjectiveAchieved
      ? 'La investigación solo cuenta cuando el equipo completa el objetivo científico.'
      : 'Sobrevivir no basta: la ciencia también forma parte del objetivo de misión.',
    state.ignoredAlertCount > 0
      ? `Ignorar ${state.ignoredAlertCount} alertas produjo consecuencias acumuladas.`
      : 'El equipo atendió todas las alertas sin dejar consecuencias pendientes.',
    'Los módulos cambian eficiencia y reservas, pero no sustituyen los sistemas esenciales.',
  ];
  return <div className="coop-results-shell">
    <section className="coop-results-summary pixel-panel">
      <span className="pixel-kicker">E7 · INFORME COLECTIVO</span>
      <h1>{group.teamAlias}</h1>
      <dl>
        <div><dt>Destino</dt><dd>{state.destination === 'MOON' ? 'Luna' : 'Marte'}</dd></div>
        <div><dt>Ciudad</dt><dd>{state.setup.city === 'AREQUIPA' ? 'Arequipa' : 'Tromsø'}</dd></div>
        <div><dt>Equipo</dt><dd>{group.players.length} participantes</dd></div>
        <div><dt>Puntuación colectiva</dt><dd>{result.score.total}/100</dd></div>
      </dl>
      <div className="coop-results-summary__team">
        {group.players.map((player) => <span key={player.id}>
          <strong>{player.alias}</strong> · {player.roles.map((role) => ROLE_LABELS[role]).join(', ')}
        </span>)}
      </div>
      <div className="coop-learnings">
        <h2>Aprendizajes científicos</h2>
        <ul>{learnings.map((learning) => <li key={learning}>{learning}</li>)}</ul>
      </div>
      <p>No se generan clasificaciones ni estadísticas individuales.</p>
    </section>
    <MissionResultsView result={result} onRetry={onRetry} onFinish={onFinish} />
  </div>;
}
