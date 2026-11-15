import { useState } from 'react';
import type { ActionChoice } from '../../game';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { isShelterProtected, type ShelterMaterial } from './puzzleRules';

interface ShelterProtectionGameProps {
  readonly onReadyChange: (ready: boolean) => void;
  readonly onChoiceChange: (choice: ActionChoice | undefined) => void;
}

export function ShelterProtectionGame({ onReadyChange, onChoiceChange }: ShelterProtectionGameProps) {
  const { t } = useI18n();
  const [material, setMaterial] = useState<ShelterMaterial | null>(null);
  const [zones, setZones] = useState<readonly number[]>([]);
  const [hint, setHint] = useState('');
  const ready = isShelterProtected(zones);
  const asset = (role: string) => interventionAssets.G5.find((item) => item.role === role)!.path;
  function chooseMaterial(next: ShelterMaterial) {
    setMaterial(next); setZones([]); setHint(''); onReadyChange(false); onChoiceChange(next);
  }
  function toggleZone(index: number) {
    if (!material) { setHint(t('interventions.puzzles.g5.chooseMaterial')); return; }
    const next = zones.includes(index) ? zones.filter((zone) => zone !== index) : zones.length < 3 ? [...zones, index] : zones;
    setZones(next);
    const complete = isShelterProtected(next);
    setHint(next.length === 3 && !complete ? t('interventions.puzzles.g5.priorityHint') : '');
    onReadyChange(complete);
  }
  return <div className={`puzzle puzzle--shelter ${ready ? 'puzzle--success' : ''}`}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g5.title')}</strong><span>{t('interventions.puzzles.g5.remaining', { count: 3 - zones.length })}</span></div>
    <div className="material-picker">
      <button type="button" className={material === 'REGOLITH_SHIELDING' ? 'material-card is-selected' : 'material-card'} onClick={() => chooseMaterial('REGOLITH_SHIELDING')}><img src={asset('regolith')} alt="" /><strong>{t('interventions.puzzles.g5.regolith')}</strong><small>{t('interventions.puzzles.g5.regolithCost')}</small></button>
      <button type="button" className={material === 'SUPPLY_SHIELDING' ? 'material-card is-selected' : 'material-card'} onClick={() => chooseMaterial('SUPPLY_SHIELDING')}><img src={asset('supplyCrate')} alt="" /><strong>{t('interventions.puzzles.g5.supplies')}</strong><small>{t('interventions.puzzles.g5.suppliesCost')}</small></button>
    </div>
    <div className="shelter-map" style={{ backgroundImage: `url('${asset(ready ? 'protected' : 'openHatch')}')` }}>
      {[0, 1, 2, 3].map((index) => <button type="button" key={index} aria-pressed={zones.includes(index)} className={`shelter-zone shelter-zone--${index} ${zones.includes(index) ? 'is-covered' : ''} ${index === 0 || index === 2 ? 'is-priority' : ''}`} onClick={() => toggleZone(index)}>
        {zones.includes(index) && <img src={asset(material === 'SUPPLY_SHIELDING' ? 'supplyCrate' : 'regolith')} alt="" />}
        <span>{t('interventions.puzzles.g5.zone', { number: index + 1 })}</span>
      </button>)}
    </div>
    <p className="puzzle__hint" aria-live="polite">{ready ? t('interventions.puzzles.g5.success') : hint || t('interventions.puzzles.g5.hint')}</p>
    {material === 'SUPPLY_SHIELDING' && <p className="puzzle__lesson">{t('interventions.puzzles.g5.suppliesLesson')}</p>}
  </div>;
}
