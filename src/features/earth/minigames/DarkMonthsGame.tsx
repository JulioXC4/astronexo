import { useState } from 'react';
import { BatteryCharging, Snowflake } from '@phosphor-icons/react';
import { useI18n } from '../../../i18n';
import type { TrainingOutcome } from '../../../game';
import { calculateTrainingCost, createTrainingOutcome } from '../trainingOutcome';
import { TrainingFrame } from './TrainingFrame';
import {
  POLAR, POLAR_START, moveToken, polarCost, polarDone, tierFromCost, type PolarState,
} from './trainingRules';

interface DarkMonthsGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

type Place = keyof PolarState;
const PLACES: readonly Place[] = ['heat', 'crops', 'radio'];

/**
 * Reserva polar. Antes eran tres sliders que tenían que sumar exactamente 100 %
 * (una ecuación con tres incógnitas). Ahora son 10 baterías de verdad que se
 * mueven de un lugar a otro: nunca sobra ni falta energía, y cada lugar se
 * enciende o se apaga a la vista.
 */
export function DarkMonthsGame({ onComplete, onBack }: DarkMonthsGameProps) {
  const { t } = useI18n();
  const [state, setState] = useState<PolarState>(POLAR_START);
  /** De dónde se levantó la batería que se lleva en la mano. */
  const [picked, setPicked] = useState<Place | null>(null);
  const done = polarDone(state);
  const cost = polarCost(state);

  const ok: Record<Place, boolean> = {
    heat: state.heat >= POLAR.minHeat,
    crops: state.crops >= POLAR.minCrops,
    radio: state.radio >= POLAR.minRadio,
  };

  const hint = done ? t('training.polar.hintGood')
    : picked ? t('training.polar.pickedUp')
      : PLACES.every((p) => ok[p]) ? t('training.polar.hintStart')
        : t('training.polar.hintNeed');

  function touch(place: Place) {
    if (picked === null) {
      if (state[place] > 0) setPicked(place);
      return;
    }
    setState((current) => moveToken(current, picked, place));
    setPicked(null);
  }

  const scene = <div className="polar" role="group" aria-label={t('training.polar.title')}>
    <div className="polar__sky" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 60}%` }} />)}
    </div>
    <div className="polar__row">
      {PLACES.map((place) => {
        const on = ok[place];
        const label = t(`training.polar.${place}`);
        const status = t(`training.polar.${place}${on ? 'Ok' : 'Bad'}`);
        return <button
          key={place}
          type="button"
          className={`polar__place polar__place--${place} ${on ? 'is-on' : 'is-off'} ${picked === place ? 'is-source' : ''} ${picked && picked !== place ? 'is-target' : ''}`}
          onClick={() => touch(place)}
          aria-label={t('training.polar.count', { count: state[place], place: label })}
        >
          <span className="polar__lamp" aria-hidden="true" />
          <strong>{label}</strong>
          <span className="polar__tokens" aria-hidden="true">
            {Array.from({ length: state[place] }, (_, i) => <BatteryCharging key={i} weight="fill" />)}
          </span>
          {/* El estado va con palabras: nunca solo con la luz de color. */}
          <em>{status}</em>
        </button>;
      })}
    </div>
  </div>;

  return <TrainingFrame
    title={t('training.polar.title')}
    icon={<Snowflake weight="fill" color="#80d8ff" />}
    onBack={onBack}
    task={t('training.polar.task')}
    tip={t('training.polar.tip')}
    scene={scene}
    controls={<p className="polar__legend">{t('training.polar.battery')} · {POLAR.tokens}</p>}
    hint={hint}
    result={done ? { tier: tierFromCost(cost), cost, resource: 'energy' } : null}
    onReset={() => { setState(POLAR_START); setPicked(null); }}
    onConfirm={() => onComplete(createTrainingOutcome(
      'DARK_MONTHS_RESERVE',
      `Calefacción ${state.heat * 10}%`,
      'energy',
      calculateTrainingCost('DARK_MONTHS_RESERVE', state.heat * 10),
      'La calefacción consume parte de la reserva.',
    ))}
  />;
}
