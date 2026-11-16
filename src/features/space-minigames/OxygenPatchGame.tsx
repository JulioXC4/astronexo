import { useState } from 'react';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { isOxygenLeakResolved, leakingCompartmentForSeed } from './puzzleRules';
import { qualityFromMistakes } from '../../game';

interface OxygenPatchGameProps {
  readonly onReadyChange: (ready: boolean, quality?: number) => void;
  /** Semilla del turno: la fuga no siempre está en el mismo sitio. */
  readonly seed: number;
}

export function OxygenPatchGame({ onReadyChange, seed }: OxygenPatchGameProps) {
  const LEAKING_COMPARTMENT = leakingCompartmentForSeed(seed);
  const { t } = useI18n();
  const [isolated, setIsolated] = useState<number | null>(null);
  const [patches, setPatches] = useState<readonly boolean[]>([false, false]);
  const [hint, setHint] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const ready = isOxygenLeakResolved(isolated, LEAKING_COMPARTMENT, patches);
  const asset = (role: string) => interventionAssets.G3.find((item) => item.role === role)!.path;

  function isolate(index: number) {
    setIsolated(index); setPatches([false, false]); onReadyChange(false);
    if (index !== LEAKING_COMPARTMENT) setMistakes((value) => value + 1);
    setHint(t(index === LEAKING_COMPARTMENT ? 'interventions.puzzles.g3.correctHatch' : 'interventions.puzzles.g3.wrongHatch'));
  }
  function patch(index: number) {
    if (isolated !== LEAKING_COMPARTMENT || patches[index]) return;
    const next = patches.map((value, position) => position === index ? true : value);
    setPatches(next);
    if (isOxygenLeakResolved(isolated, LEAKING_COMPARTMENT, next)) onReadyChange(true, qualityFromMistakes(mistakes));
  }

  return <div className={`puzzle puzzle--oxygen ${ready ? 'puzzle--success' : ''}`} aria-label={t('interventions.puzzles.g3.aria')}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g3.title')}</strong><span>{t('interventions.puzzles.g3.pressure', { value: ready ? 100 : isolated === LEAKING_COMPARTMENT ? 72 : 38 })}</span></div>
    <div className="compartment-grid">
      {[0, 1, 2].map((index) => <button type="button" key={index} className={`compartment ${isolated === index ? 'compartment--isolated' : ''}`} data-low-pressure={index === LEAKING_COMPARTMENT && !ready} aria-pressed={isolated === index} onClick={() => isolate(index)}>
        {/* La tubería rota solo se ve al aislar el compartimento correcto; antes hay que deducirlo por la presión. */}
        <img src={asset(index === LEAKING_COMPARTMENT && isolated === index && !ready ? 'leakingPipe' : 'intactPipe')} alt="" />
        <span>{t('interventions.puzzles.g3.compartment', { number: index + 1 })}</span>
        <b>{isolated === index ? t('interventions.puzzles.g3.closed') : t('interventions.puzzles.g3.open')}</b>
        <small className="compartment__pressure">{t('interventions.puzzles.g3.compartmentPressure', { value: index === LEAKING_COMPARTMENT && !ready ? 42 : 100 })}</small>
      </button>)}
    </div>
    {isolated === LEAKING_COMPARTMENT && <div className="oxygen-damage-points">
      {patches.map((sealed, index) => <button type="button" key={index} className={sealed ? 'damage-point damage-point--sealed' : 'damage-point'} disabled={sealed} onClick={() => patch(index)}>
        <img src={asset('patch')} alt="" /><span>{t(sealed ? 'interventions.puzzles.g3.sealed' : 'interventions.puzzles.g3.patchPoint', { number: index + 1 })}</span>
      </button>)}
    </div>}
    <p className="puzzle__hint" aria-live="polite">{ready ? t('interventions.puzzles.g3.success') : hint || t('interventions.puzzles.g3.hint')}</p>
  </div>;
}
