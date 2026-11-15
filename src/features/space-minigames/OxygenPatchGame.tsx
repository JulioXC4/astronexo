import { useState } from 'react';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';

interface OxygenPatchGameProps {
  readonly onReadyChange: (ready: boolean) => void;
}

export function OxygenPatchGame({ onReadyChange }: OxygenPatchGameProps) {
  const { t } = useI18n();
  const [sealed, setSealed] = useState<readonly number[]>([]);

  function seal(index: number) {
    if (sealed.includes(index)) return;
    const next = [...sealed, index];
    setSealed(next);
    if (next.length === 3) onReadyChange(true);
  }

  function sealAll() {
    setSealed([0, 1, 2]);
    onReadyChange(true);
  }

  const leaking = interventionAssets.G3.find((asset) => asset.role === 'leakingPipe')!;
  const intact = interventionAssets.G3.find((asset) => asset.role === 'intactPipe')!;
  const patch = interventionAssets.G3.find((asset) => asset.role === 'patch')!;

  return <div className="mini-game mini-game--visual mini-game--oxygen" aria-label={t('interventions.gestures.oxygenGameAria')}>
    <img className="mini-game__scene" src={sealed.length === 3 ? intact.path : leaking.path} alt="" />
    <div className="leak-points">
      {[0, 1, 2].map((index) => <button
        type="button"
        key={index}
        aria-label={t('interventions.gestures.sealPointAria', { point: index + 1 })}
        className={sealed.includes(index) ? 'leak-point leak-point--sealed' : 'leak-point'}
        onClick={() => seal(index)}
      ><img src={patch.path} alt="" /><span>{index + 1}</span></button>)}
    </div>
    <button type="button" className="text-button" disabled={sealed.length === 3} onClick={sealAll}>
      {t('interventions.gestures.oxygenPatchAlt')}
    </button>
  </div>;
}
