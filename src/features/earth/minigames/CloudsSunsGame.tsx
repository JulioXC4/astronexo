import { useMemo, useState } from 'react';
import { CloudSun } from '@phosphor-icons/react';
import { getSolarDatasetByCity } from '../../../data/nasa/powerData';
import { useI18n } from '../../../i18n';
import { GaugeDial } from '../../../visual-kit/GaugeDial';
import type { TrainingOutcome } from '../../../game';
import { createTrainingOutcome } from '../trainingOutcome';
import { TrainingFrame } from './TrainingFrame';
import {
  cloudsCost, cloudsDone, recommendedReserve, reserveHint, reserveMismatch, tierFromCost,
} from './trainingRules';

interface CloudsSunsGameProps {
  readonly cityId: string;
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

/** Se conservan estos nombres: otras pruebas del proyecto los importan desde aquí. */
export const recommendedReservePercent = recommendedReserve;
export { reserveMismatch };

/**
 * Nubes y soles. Antes era adivinar un número escondido, y al fallar el juego
 * lo revelaba («los datos piden cerca de 31 %»). Ahora se mira el sol real de
 * tres días y la pista dice solo hacia dónde corregir, como un «frío / caliente».
 */
export function CloudsSunsGame({ cityId, onComplete, onBack }: CloudsSunsGameProps) {
  const { t } = useI18n();
  const dataset = getSolarDatasetByCity(cityId);
  const values = useMemo(() => dataset.days.map((day) => day.irradianceKwhPerM2), [dataset]);
  const best = Math.max(...values);
  const [reserve, setReserve] = useState<number>(50);
  const [touched, setTouched] = useState(false);

  const done = cloudsDone(reserve, values);
  const cost = cloudsCost(reserve, values);
  const direction = reserveHint(reserve, values);

  const hint = !touched ? t('training.clouds.hintStart')
    : direction === 'RIGHT' ? t('training.clouds.hintRight')
      : done ? t('training.clouds.hintClose')
        : direction === 'TOO_LITTLE' ? t('training.clouds.hintLittle')
          : t('training.clouds.hintMuch');

  const scene = <div className="clouds" role="img" aria-label={t('training.clouds.days')}>
    <div className="clouds__days">
      {dataset.days.map((day) => {
        const ratio = best > 0 ? day.irradianceKwhPerM2 / best : 0;
        return <div key={day.date} className="clouds__day" title={`${day.irradianceKwhPerM2} kWh/m²`}>
          <div className="clouds__bar"><span style={{ height: `${ratio * 100}%` }} /></div>
          <strong>{day.irradianceKwhPerM2.toFixed(1)}</strong>
          <small>{day.seasonLabel}</small>
        </div>;
      })}
    </div>
    {/* La batería se llena con lo que guardas */}
    <div className="clouds__battery" aria-hidden="true">
      <div className="clouds__battery-body"><span style={{ height: `${reserve}%` }} /></div>
      <div className="clouds__battery-cap" />
      <strong>{reserve}%</strong>
    </div>
  </div>;

  const controls = <GaugeDial
    label={t('training.clouds.dial')}
    value={reserve}
    min={0}
    max={100}
    onChange={(value) => { setReserve(value); setTouched(true); }}
    display={`${reserve}%`}
  />;

  return <TrainingFrame
    title={t('training.clouds.title')}
    icon={<CloudSun weight="fill" color="#f6c15b" />}
    onBack={onBack}
    task={t('training.clouds.task')}
    tip={t('training.clouds.tip')}
    scene={scene}
    controls={controls}
    hint={hint}
    result={touched && done ? { tier: tierFromCost(cost), cost, resource: 'energy' } : null}
    onReset={() => { setReserve(50); setTouched(false); }}
    onConfirm={() => onComplete(createTrainingOutcome(
      'CLOUDS_SUNS',
      `Reserva ${reserve}% (sugerida ${recommendedReserve(values)}%)`,
      'energy',
      cost,
      'Guardar reserva para días sin sol deja menos energía libre al despegar.',
    ))}
  />;
}
