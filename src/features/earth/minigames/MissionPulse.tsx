import { useState } from 'react';
import { useI18n } from '../../../i18n';

interface Signal {
  readonly label: string;
  readonly good: boolean;
}

interface MissionPulseProps {
  readonly objective: string;
  readonly signals: readonly Signal[];
  readonly hint: string;
  readonly attempted: boolean;
  readonly solved: boolean;
  readonly fact: string;
}

/** Live system state. A future pixel-art scene can consume the same signals. */
export function MissionPulse({ objective, signals, hint, attempted, solved, fact }: MissionPulseProps) {
  const { t } = useI18n();
  const [showHint, setShowHint] = useState(false);

  return (
    <section className="mission-pulse" aria-label={t('gameplayV2.systems')}>
      <p className="mission-pulse__objective">{objective}</p>
      <div className="mission-pulse__signals" role="list">
        {signals.map(({ label, good }) => (
          <div key={label} role="listitem" className={`mission-pulse__signal ${good ? 'mission-pulse__signal--good' : ''}`}>
            <span className="mission-pulse__light" aria-hidden="true" />
            <span>{label}</span>
            <strong>{t(good ? 'gameplayV2.ready' : 'gameplayV2.needsWork')}</strong>
          </div>
        ))}
      </div>
      {attempted && !solved && (
        <div className="mission-pulse__help">
          <button type="button" onClick={() => setShowHint((current) => !current)} aria-expanded={showHint}>
            {t(showHint ? 'gameplayV2.hideHint' : 'gameplayV2.showHint')}
          </button>
          {showHint && <p role="status">{hint}</p>}
        </div>
      )}
      {solved && <p className="mission-pulse__fact" role="status">{fact}</p>}
    </section>
  );
}
