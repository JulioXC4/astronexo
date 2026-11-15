import { useState } from 'react';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { eclssConnectionKey, isEclssComplete, type EclssNode } from './puzzleRules';

interface OxygenRecycleGameProps { readonly onReadyChange: (ready: boolean) => void; }

export function OxygenRecycleGame({ onReadyChange }: OxygenRecycleGameProps) {
  const { t } = useI18n();
  const [from, setFrom] = useState<EclssNode | null>(null);
  const [connections, setConnections] = useState<ReadonlySet<string>>(new Set());
  const [hint, setHint] = useState('');
  const ready = isEclssComplete(connections);
  const asset = (role: string) => interventionAssets.G4.find((item) => item.role === role)!.path;
  const connect = (to: EclssNode) => {
    if (!from || ready) return;
    const key = eclssConnectionKey(from, to);
    const valid = ['WATER>ELECTROLYZER_WATER', 'POWER>ELECTROLYZER_POWER', 'ELECTROLYZER_OXYGEN>TANK'].includes(key);
    if (!valid) { setHint(t('interventions.puzzles.g4.wrong')); setFrom(null); return; }
    const next = new Set(connections).add(key); setConnections(next); setFrom(null); setHint(t('interventions.puzzles.g4.connected'));
    if (isEclssComplete(next)) onReadyChange(true);
  };
  return <div className={`puzzle puzzle--eclss ${ready ? 'puzzle--success' : ''}`}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g4.title')}</strong><span>{t('interventions.puzzles.g4.progress', { count: connections.size })}</span></div>
    <div className="eclss-board">
      <article><img src={asset('waterReservoir')} alt="" /><h4>{t('interventions.puzzles.g4.water')}</h4><button type="button" className={from === 'WATER' ? 'port port--selected' : 'port'} onClick={() => setFrom('WATER')}>{t('interventions.puzzles.g4.output')}</button></article>
      <article><img src={asset('powerUnit')} alt="" /><h4>{t('interventions.puzzles.g4.power')}</h4><button type="button" className={from === 'POWER' ? 'port port--selected' : 'port'} onClick={() => setFrom('POWER')}>{t('interventions.puzzles.g4.output')}</button></article>
      <article className="eclss-machine"><img src={asset('electrolyzer')} alt="" /><h4>{t('interventions.puzzles.g4.electrolyzer')}</h4><div><button type="button" className="port" onClick={() => connect('ELECTROLYZER_WATER')}>{t('interventions.puzzles.g4.waterInput')}</button><button type="button" className="port" onClick={() => connect('ELECTROLYZER_POWER')}>{t('interventions.puzzles.g4.powerInput')}</button><button type="button" className={from === 'ELECTROLYZER_OXYGEN' ? 'port port--selected' : 'port'} onClick={() => setFrom('ELECTROLYZER_OXYGEN')}>{t('interventions.puzzles.g4.oxygenOutput')}</button></div></article>
      <article><img src={asset('tank')} alt="" /><h4>{t('interventions.puzzles.g4.tank')}</h4><button type="button" className="port" onClick={() => connect('TANK')}>{t('interventions.puzzles.g4.oxygenInput')}</button><span className="tank-fill" style={{ height: `${connections.has('ELECTROLYZER_OXYGEN>TANK') ? 82 : 12}%` }} /></article>
      <svg className="eclss-lines" viewBox="0 0 100 40" aria-hidden="true"><path className={connections.has('WATER>ELECTROLYZER_WATER') ? 'is-live' : ''} d="M18 12 H42"/><path className={connections.has('POWER>ELECTROLYZER_POWER') ? 'is-live' : ''} d="M18 30 H42"/><path className={connections.has('ELECTROLYZER_OXYGEN>TANK') ? 'is-live' : ''} d="M60 20 H84"/></svg>
    </div>
    <p className="puzzle__hint" aria-live="polite">{ready ? t('interventions.puzzles.g4.success') : hint || (from ? t('interventions.puzzles.g4.chooseInput') : t('interventions.puzzles.g4.hint'))}</p>
    <p className="puzzle__lesson">{t('interventions.puzzles.g4.lesson')}</p>
  </div>;
}
