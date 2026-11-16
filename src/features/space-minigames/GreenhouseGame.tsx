import { useState } from 'react';
import type { ActionChoice } from '../../game';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { greenhouseMatureTray, isGreenhouseLightingReady } from './puzzleRules';
import { qualityFromMistakes } from '../../game';

interface GreenhouseGameProps {
  readonly onReadyChange: (ready: boolean, quality?: number) => void;
  readonly onChoiceChange: (choice: ActionChoice | undefined) => void;
  /** Semilla del turno: cambia cuál planta es la crecida. */
  readonly seed: number;
}

/** Tamaño de la planta: la crecida se ve grande; las pequeñas piden la luz. */
const MATURE_SCALE = 1.25;
const SMALL_SCALE = 0.6;

export function GreenhouseGame({ onReadyChange, onChoiceChange, seed }: GreenhouseGameProps) {
  const { t } = useI18n();
  const mature = greenhouseMatureTray(seed);
  const [lit, setLit] = useState<ReadonlySet<number>>(new Set());
  const [decision, setDecision] = useState<ActionChoice | null>(null);
  const [moves, setMoves] = useState(0);
  const asset = (role: string) => interventionAssets.G7.find((item) => item.role === role)!.path;
  function toggle(index: number) {
    if (decision) return;
    const next = new Set(lit);
    if (next.has(index)) next.delete(index); else if (next.size < 2) next.add(index);
    setLit(next); setMoves((value) => value + 1); onReadyChange(false);
  }
  function decide(choice: 'MAINTAIN_CROPS' | 'SUSPEND_CROPS') {
    if (!isGreenhouseLightingReady(lit, mature)) return;
    setDecision(choice); onChoiceChange(choice); onReadyChange(true, qualityFromMistakes(Math.max(0, moves - 2)));
  }
  return <div className={`puzzle puzzle--greenhouse ${decision ? 'puzzle--success' : ''}`}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g7.title')}</strong><span>{t('interventions.puzzles.g7.lights', { count: 2 - lit.size })}</span></div>
    <div className="greenhouse-trays">{[0, 1, 2].map((index) => <button type="button" key={index} className={lit.has(index) ? 'plant-tray is-lit' : 'plant-tray'} data-mature={index === mature} aria-pressed={lit.has(index)} onClick={() => toggle(index)}><img className="plant" src={asset('plantedTray')} alt="" style={{ transform: `scale(${index === mature ? MATURE_SCALE : SMALL_SCALE})`, transformOrigin: 'bottom center' }} /><img className="lamp" src={asset(lit.has(index) ? 'lightsOn' : 'lightsOff')} alt="" /><span>{t('interventions.puzzles.g7.tray', { number: index + 1 })}</span></button>)}</div>
    <div className="greenhouse-decision"><p>{t('interventions.puzzles.g7.costPreview')}</p><button type="button" disabled={!isGreenhouseLightingReady(lit, mature) || Boolean(decision)} onClick={() => decide('MAINTAIN_CROPS')}>{t('interventions.puzzles.g7.maintain')}</button><button type="button" disabled={!isGreenhouseLightingReady(lit, mature) || Boolean(decision)} onClick={() => decide('SUSPEND_CROPS')}>{t('interventions.puzzles.g7.suspend')}</button></div>
    <p className="puzzle__hint" aria-live="polite">{decision ? t('interventions.puzzles.g7.success') : isGreenhouseLightingReady(lit, mature) ? t('interventions.puzzles.g7.decide') : lit.size === 2 ? t('interventions.puzzles.g7.wrongTray') : t('interventions.puzzles.g7.hint')}</p>
  </div>;
}
