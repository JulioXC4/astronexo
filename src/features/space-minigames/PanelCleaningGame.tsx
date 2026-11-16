import { useState } from 'react';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { applyCleaner, panelDustForSeed, solarCapturePercent } from './puzzleRules';
import { qualityFromRange } from '../../game';
import { playSound } from '../audio';

interface PanelCleaningGameProps {
  readonly onReadyChange: (ready: boolean, quality?: number) => void;
  /** Semilla del turno: hace que el polvo no caiga siempre igual. */
  readonly seed: number;
}

export function PanelCleaningGame({ onReadyChange, seed }: PanelCleaningGameProps) {
  const { t } = useI18n();
  const start = panelDustForSeed(seed);
  const [dust, setDust] = useState<readonly number[]>(start);
  const [applications, setApplications] = useState(2);
  const capture = solarCapturePercent(dust);
  const ready = capture >= 85;
  const asset = (role: string) => interventionAssets.G2.find((item) => item.role === role)!.path;
  function clean(index: number) {
    if (ready || applications === 0) return;
    playSound('guardBrushDust');
    const next = applyCleaner(dust, index); setDust(next); setApplications((value) => value - 1);
    const capturedNow = solarCapturePercent(next);
    if (capturedNow >= 85) onReadyChange(true, qualityFromRange(capturedNow, 85, 100));
  }
  function reset() { setDust(start); setApplications(2); onReadyChange(false); }
  return <div className={`puzzle puzzle--cleaning ${ready ? 'puzzle--success' : ''}`}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g2.title')}</strong><span>{t('interventions.puzzles.g2.cleaner', { count: applications })}</span></div>
    <div className="cleaning-layout">
      <img className="cleaner-cartridge" src={asset('cleaner')} alt="" />
      <div className="solar-cell-grid" aria-label={t('interventions.puzzles.g2.aria')}>
        {dust.map((level, index) => <button type="button" key={index} className="solar-cell" disabled={ready || applications === 0} onClick={() => clean(index)}>
          <img src={asset(level === 0 ? 'clean' : 'dusty')} alt="" /><span className={`dust-layer dust-layer--${level}`} aria-hidden="true" /><b>{t('interventions.puzzles.g2.cell', { number: index + 1 })}</b>
        </button>)}
      </div>
    </div>
    <div className="capture-meter"><span style={{ width: `${capture}%` }} /><strong>{t('interventions.puzzles.g2.capture', { value: capture })}</strong></div>
    <p className="puzzle__hint" aria-live="polite">{ready ? t('interventions.puzzles.g2.success') : applications === 0 ? t('interventions.puzzles.g2.retryHint') : t('interventions.puzzles.g2.hint')}</p>
    {!ready && applications === 0 && <button type="button" className="puzzle-reset" onClick={reset}>{t('interventions.puzzles.retry')}</button>}
  </div>;
}
