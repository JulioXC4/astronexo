import { useState } from 'react';
import { BatteryCharging, Snowflake } from '@phosphor-icons/react';
import { msg, useI18n } from '../../../i18n';
import type { TrainingOutcome } from '../../../game';
import { calculateTrainingCost, createTrainingOutcome } from '../trainingOutcome';
import { TrainingFrame } from './TrainingFrame';
import { playSound } from '../../audio';
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

  // Siguiente objetivo: primero la batería que sobra (la del lugar con más de lo necesario);
  // con la batería en la mano, el lugar al que todavía le falta energía.
  const MIN: Record<Place, number> = { heat: POLAR.minHeat, crops: POLAR.minCrops, radio: POLAR.minRadio };
  const lacking = PLACES.find((p) => state[p] < MIN[p]);
  const surplus = [...PLACES].sort((a, b) => (state[b] - MIN[b]) - (state[a] - MIN[a]))[0];
  const target: Place | null = done ? null : picked ? (lacking ?? null) : (lacking && state[surplus] > MIN[surplus] ? surplus : null);

  function touch(place: Place) {
    if (picked === null) {
      if (state[place] > 0) setPicked(place);
      return;
    }
    // Llevar energía a la calefacción la enciende a la vista.
    if (place === 'heat' && picked !== place) playSound('darkHeater');
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
          data-target={target === place || undefined}
          data-guide-below={target === place || undefined}
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
    scope="DARK_MONTHS_RESERVE"
    title={t('training.polar.title')}
    icon={<Snowflake weight="fill" color="#80d8ff" />}
    onBack={onBack}
    taskKey="training.polar.task"
    tipKey="training.polar.tip"
    goals={PLACES.map((place) => ({ label: t(`training.goals.polar.${place}`), ok: ok[place] }))}
    scene={scene}
    controls={<p className="polar__legend">{t('training.polar.battery')} · {POLAR.tokens}</p>}
    hint={hint}
    result={done ? { tier: tierFromCost(cost), cost, resource: 'energy' } : null}
    onReset={() => { setState(POLAR_START); setPicked(null); }}
    onConfirm={() => onComplete(createTrainingOutcome(
      'DARK_MONTHS_RESERVE',
      msg('trainingOutcomes.DARK_MONTHS_RESERVE.decision', { heat: state.heat * 10 }),
      'energy',
      calculateTrainingCost('DARK_MONTHS_RESERVE', state.heat * 10),
      msg('trainingOutcomes.DARK_MONTHS_RESERVE.limitation'),
    ))}
  />;
}
