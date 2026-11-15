import { useState } from 'react';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { PANEL_DUST_START, applyCleaner, solarCapturePercent } from './puzzleRules';

interface PanelCleaningGameProps { readonly onReadyChange: (ready: boolean) => void; }

export function PanelCleaningGame({ onReadyChange }: PanelCleaningGameProps) {
  const { t } = useI18n();
  const [dust, setDust] = useState<readonly number[]>(PANEL_DUST_START);
  const [applications, setApplications] = useState(2);
  const capture = solarCapturePercent(dust);
  const ready = capture >= 85;
  const asset = (role: string) => interventionAssets.G2.find((item) => item.role === role)!.path;
  function clean(index: number) {
    if (ready || applications === 0) return;
    const next = applyCleaner(dust, index); setDust(next); setApplications((value) => value - 1);
    if (solarCapturePercent(next) >= 85) onReadyChange(true);
  }
  function reset() { setDust(PANEL_DUST_START); setApplications(2); onReadyChange(false); }
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
