import { useEffect, useRef, useState } from 'react';
import { PottedPlant } from '@phosphor-icons/react';
import { msg, useI18n } from '../../../i18n';
import { GaugeDial } from '../../../visual-kit/GaugeDial';
import { LiveMeter } from '../../../visual-kit/LiveMeter';
import type { TrainingOutcome } from '../../../game';
import { calculateTrainingCost, createTrainingOutcome } from '../trainingOutcome';
import { TrainingFrame } from './TrainingFrame';
import { useThrottledSound } from './ui/useThrottledSound';
import { playSound } from '../../audio';
import {
  VEGGIE, WATER_LITERS, tierFromCost, veggieCost, veggieDone, veggieGrowth,
  type VeggieState, type WaterDose,
} from './trainingRules';

interface VeggieLabGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

const START: VeggieState = { red: 50, water: 'LOW' };

/**
 * Huerto espacial. Antes eran dos controles y un botón «Verificar», con la
 * respuesta escrita («Objetivo: 70% rojo») y un botón que la resolvía solo. Ahora
 * se juega mirando las plantas: crecen fuertes cuando la luz y el agua son
 * justas, y el juego se completa solo en cuanto lo logras.
 */
export function VeggieLabGame({ onComplete, onBack }: VeggieLabGameProps) {
  const { t } = useI18n();
  const [state, setState] = useState<VeggieState>(START);
  const lightSound = useThrottledSound(300);
  const growth = veggieGrowth(state);
  const done = veggieDone(state);
  const cost = veggieCost(state);
  const redOk = state.red >= 65 && state.red <= 75;

  const hint = done ? t('training.veggie.hintGood')
    : state.water === 'LOW' ? t('training.veggie.hintThirsty')
      : state.water === 'HIGH' ? t('training.veggie.hintFlood')
        : !redOk ? t('training.veggie.hintLight')
          : t('training.veggie.hintStart');

  // Siguiente objetivo: el agua si falta o sobra; luego la luz.
  const target: 'water' | 'light' | null = done ? null
    : state.water !== 'MID' ? 'water'
      : 'light';

  const strong = growth >= 80;
  // Las plantas brotan fuertes una vez, en el momento en que llegan a ese punto.
  const wasStrong = useRef(false);
  useEffect(() => {
    if (strong && !wasStrong.current) playSound('veggieGrow');
    wasStrong.current = strong;
  }, [strong]);
  const redLeds = Math.round((state.red / 100) * 12);
  const waterLevel = state.water === 'LOW' ? 8 : state.water === 'MID' ? 20 : 30;
  const leaf = strong ? '#4caf50' : growth >= 50 ? '#8bc34a' : '#cddc39';

  const scene = <svg viewBox="0 0 900 380" role="img" aria-label={t('training.veggie.title')}>
    <defs>
      <linearGradient id="vg-glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={`rgb(${Math.round(state.red * 2.5)}, 30, ${Math.round((100 - state.red) * 4)})`} stopOpacity=".85" />
        <stop offset="100%" stopColor="#172c3d" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="250" y="24" width="400" height="40" rx="8" fill="#263238" stroke="#455a64" strokeWidth="2" />
    {/* De 12 diodos, tantos rojos como pida la mezcla: la lámpara «muestra» el color elegido. */}
    {Array.from({ length: 12 }, (_, i) => (
      <circle key={i} cx={280 + i * 31} cy={44} r={7} fill={i < redLeds ? '#ef5350' : '#42a5f5'} />
    ))}
    <polygon points="260,64 640,64 730,300 170,300" fill="url(#vg-glow)" />
    <rect x="200" y="290" width="500" height="70" rx="10" fill="#1b2a3a" stroke="#375577" strokeWidth="3" />
    <rect x="220" y={350 - waterLevel} width="460" height={waterLevel} rx="5" fill="#0288d1" opacity=".7" />
    {[-140, -70, 0, 70, 140].map((dx, i) => {
      const lift = growth * 0.2;
      return <g key={i} transform={`translate(${450 + dx}, 290)`} className={strong ? 'veggie-plant is-strong' : 'veggie-plant'}>
        <ellipse cx="0" cy={-14 - lift} rx={14 + growth * 0.15} ry={18 + growth * 0.22} fill={leaf} />
        <ellipse cx="-13" cy={-9 - lift * 0.6} rx={10 + growth * 0.1} ry={14 + growth * 0.15} fill={strong ? '#388e3c' : '#7cb342'} />
        <ellipse cx="13" cy={-9 - lift * 0.6} rx={10 + growth * 0.1} ry={14 + growth * 0.15} fill={strong ? '#2e7d32' : '#689f38'} />
      </g>;
    })}
  </svg>;

  const waterOption = (dose: WaterDose, key: string) => (
    <button key={dose} type="button" aria-pressed={state.water === dose} onClick={() => setState((s) => ({ ...s, water: dose }))}>
      {t(key)}
    </button>
  );

  const controls = <>
    <GaugeDial
      label={t('training.veggie.light')}
      value={state.red}
      min={VEGGIE.redMin}
      max={VEGGIE.redMax}
      onChange={(red) => { lightSound('veggieLed'); setState((s) => ({ ...s, red })); }}
      target={target === 'light'}
      display={t('training.veggie.lightValue', { red: state.red })}
      lowLabel={t('training.veggie.lightBlue')}
      highLabel={t('training.veggie.lightRed')}
    />
    <div className="train-choice" data-target={target === 'water' || undefined}>
      <strong>{t('training.veggie.water')}</strong>
      <div className="train-choice__row">
        {waterOption('LOW', 'training.veggie.waterLow')}
        {waterOption('MID', 'training.veggie.waterMid')}
        {waterOption('HIGH', 'training.veggie.waterHigh')}
      </div>
      <small>{t('training.veggie.waterUse', { liters: WATER_LITERS[state.water] })}</small>
    </div>
    <LiveMeter
      label={t('training.veggie.growth')}
      valueText={strong ? t('training.veggie.growthStrong') : t('training.veggie.growthWeak')}
      ratio={growth / 100}
      tone={strong ? 'ok' : growth >= 50 ? 'warn' : 'bad'}
    />
  </>;

  return <TrainingFrame
    scope="VEGGIE_LAB"
    title={t('training.veggie.title')}
    icon={<PottedPlant weight="fill" color="#81c784" />}
    onBack={onBack}
    taskKey="training.veggie.task"
    tipKey="training.veggie.tip"
    goals={[
      { label: t('training.goals.waterMid'), ok: state.water === 'MID' },
      { label: t('training.goals.lightRight'), ok: redOk },
    ]}
    scene={scene}
    controls={controls}
    hint={hint}
    result={done ? { tier: tierFromCost(cost), cost, resource: 'foodSupply' } : null}
    onReset={() => setState(START)}
    onConfirm={() => onComplete(createTrainingOutcome(
      'VEGGIE_LAB',
      msg('trainingOutcomes.VEGGIE_LAB.decision', { liters: WATER_LITERS[state.water], red: state.red }),
      'foodSupply',
      calculateTrainingCost('VEGGIE_LAB', state.red),
      msg('trainingOutcomes.VEGGIE_LAB.limitation'),
    ))}
  />;
}
