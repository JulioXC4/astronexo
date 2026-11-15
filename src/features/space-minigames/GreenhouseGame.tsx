import { useState } from 'react';
import type { ActionChoice } from '../../game';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { isGreenhouseLightingReady } from './puzzleRules';

interface GreenhouseGameProps { readonly onReadyChange: (ready: boolean) => void; readonly onChoiceChange: (choice: ActionChoice | undefined) => void; }

export function GreenhouseGame({ onReadyChange, onChoiceChange }: GreenhouseGameProps) {
  const { t } = useI18n();
  const [lit, setLit] = useState<ReadonlySet<number>>(new Set());
  const [decision, setDecision] = useState<ActionChoice | null>(null);
  const asset = (role: string) => interventionAssets.G7.find((item) => item.role === role)!.path;
  function toggle(index: number) {
    if (decision) return;
    const next = new Set(lit);
    if (next.has(index)) next.delete(index); else if (next.size < 2) next.add(index);
    setLit(next); onReadyChange(false);
  }
  function decide(choice: 'MAINTAIN_CROPS' | 'SUSPEND_CROPS') {
    if (!isGreenhouseLightingReady(lit)) return;
    setDecision(choice); onChoiceChange(choice); onReadyChange(true);
  }
  return <div className={`puzzle puzzle--greenhouse ${decision ? 'puzzle--success' : ''}`}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g7.title')}</strong><span>{t('interventions.puzzles.g7.lights', { count: 2 - lit.size })}</span></div>
    <div className="greenhouse-trays">{[0, 1, 2].map((index) => <button type="button" key={index} className={lit.has(index) ? 'plant-tray is-lit' : 'plant-tray'} aria-pressed={lit.has(index)} onClick={() => toggle(index)}><img className="plant" src={asset('plantedTray')} alt="" /><img className="lamp" src={asset(lit.has(index) ? 'lightsOn' : 'lightsOff')} alt="" /><span>{t('interventions.puzzles.g7.tray', { number: index + 1 })}</span></button>)}</div>
    <div className="greenhouse-decision"><p>{t('interventions.puzzles.g7.costPreview')}</p><button type="button" disabled={!isGreenhouseLightingReady(lit) || Boolean(decision)} onClick={() => decide('MAINTAIN_CROPS')}>{t('interventions.puzzles.g7.maintain')}</button><button type="button" disabled={!isGreenhouseLightingReady(lit) || Boolean(decision)} onClick={() => decide('SUSPEND_CROPS')}>{t('interventions.puzzles.g7.suspend')}</button></div>
    <p className="puzzle__hint" aria-live="polite">{decision ? t('interventions.puzzles.g7.success') : isGreenhouseLightingReady(lit) ? t('interventions.puzzles.g7.decide') : t('interventions.puzzles.g7.hint')}</p>
  </div>;
}
