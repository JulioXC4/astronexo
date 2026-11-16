import { useState } from 'react';
import { Drop } from '@phosphor-icons/react';
import { msg, useI18n } from '../../../i18n';
import { GaugeDial } from '../../../visual-kit/GaugeDial';
import { LiveMeter } from '../../../visual-kit/LiveMeter';
import type { TrainingOutcome } from '../../../game';
import { calculateTrainingCost, createTrainingOutcome } from '../trainingOutcome';
import { TrainingFrame } from './TrainingFrame';
import { playSound } from '../../audio';
import { useThrottledSound } from './ui/useThrottledSound';
import {
  ECLSS, eclssCo2, eclssCost, eclssDone, eclssOxygen, eclssTotalPower, tierFromCost, type EclssState,
} from './trainingRules';

interface EclssTrainingGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

const START: EclssState = { watts: 200, scrubber: false, recycle: 70 };
/** Los medidores del aire van de 18 a 23 % de oxígeno y de 0 a 2 % de CO₂. */
const O2_MIN = 18;
const O2_MAX = 23;
const o2Ratio = (o2: number) => (o2 - O2_MIN) / (O2_MAX - O2_MIN);

/**
 * Aire y agua (ECLSS). Antes: dos sliders, una casilla y «Verificar Circuito»,
 * con cuatro inecuaciones a la vez y la respuesta escrita («340 W óptimo»). Ahora
 * los medidores del aire dicen cuándo vas bien y se juega con tres controles
 * que se ven en la máquina.
 */
export function EclssTrainingGame({ onComplete, onBack }: EclssTrainingGameProps) {
  const { t } = useI18n();
  const [state, setState] = useState<EclssState>(START);
  const dialSound = useThrottledSound(700);
  const o2 = eclssOxygen(state);
  const co2 = eclssCo2(state);
  const total = eclssTotalPower(state);
  const done = eclssDone(state);
  const cost = eclssCost(state);
  const o2Ok = o2 >= 20.4 && o2 <= 21.8;

  const hint = done ? t('training.eclss.hintGood')
    : total > ECLSS.powerLimit ? t('training.eclss.hintOverload')
      : o2 < 20.4 ? t('training.eclss.hintLowO')
        : o2 > 21.8 ? t('training.eclss.hintHighO')
          : !state.scrubber ? t('training.eclss.hintDirty')
            : state.recycle < 80 ? t('training.eclss.hintThirsty')
              : t('training.eclss.hintStart');

  // Siguiente objetivo, en el mismo orden que las pistas: potencia, limpiador, agua reciclada.
  const target: 'power' | 'scrubber' | 'recycle' | null = done ? null
    : (total > ECLSS.powerLimit || o2 < 20.4 || o2 > 21.8) ? 'power'
      : !state.scrubber ? 'scrubber'
        : state.recycle < 80 ? 'recycle'
          : 'power';

  const scene = <svg viewBox="0 0 900 380" role="img" aria-label={t('training.eclss.title')}>
    <rect width="900" height="380" fill="#0d1d2e" />
    {/* Agua → máquina → aire */}
    <rect x="70" y="140" width="160" height="150" rx="14" fill="#16405c" stroke="#4cc3d9" strokeWidth="4" />
    <rect x="86" y={290 - state.recycle * 1.1} width="128" height={state.recycle * 1.1 - 12} fill="#0288d1" opacity=".75" />
    <text x="150" y="124" textAnchor="middle" fill="#9bc0e4" fontSize="20" fontWeight="800">{t('training.eclss.recycle')}</text>
    <path d="M230 215 H330" stroke="#4cc3d9" strokeWidth="10" strokeLinecap="round" className="eclss-flow" />
    <rect x="330" y="120" width="240" height="190" rx="16" fill="#1d2f44" stroke={o2Ok ? '#69f0ae' : '#6a8aa8'} strokeWidth="5" />
    <text x="450" y="205" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="800">{state.watts} W</text>
    <path d="M570 215 H680" stroke={state.scrubber ? '#69f0ae' : '#7f9bb8'} strokeWidth="10" strokeLinecap="round" />
    <circle cx="760" cy="215" r="70" fill={co2 > 0.1 ? '#4a3a2a' : '#17443a'} stroke={co2 > 0.1 ? '#ffb74d' : '#69f0ae'} strokeWidth="5" />
    {Array.from({ length: 6 }, (_, i) => (
      <circle key={i} cx={725 + (i % 3) * 32} cy={195 + Math.floor(i / 3) * 36} r="7" fill={co2 > 0.1 ? '#8d6e63' : '#b2dfdb'} opacity=".85" />
    ))}
  </svg>;

  const controls = <>
    <GaugeDial
      label={t('training.eclss.power')}
      value={state.watts}
      min={ECLSS.wattsMin}
      max={ECLSS.wattsMax}
      step={10}
      onChange={(watts) => { dialSound('eclssElectrolysis'); setState((s) => ({ ...s, watts })); }}
      target={target === 'power'}
      display={`${state.watts} W`}
    />
    <GaugeDial
      label={t('training.eclss.recycle')}
      value={state.recycle}
      min={ECLSS.recycleMin}
      max={ECLSS.recycleMax}
      step={2}
      onChange={(recycle) => { dialSound('eclssWaterRecycler'); setState((s) => ({ ...s, recycle })); }}
      target={target === 'recycle'}
      display={`${state.recycle}%`}
    />
    <div className="train-switch" data-target={target === 'scrubber' || undefined}>
      <strong>{t('training.eclss.scrubber')}</strong>
      <button type="button" aria-pressed={state.scrubber} onClick={() => { if (!state.scrubber) playSound('eclssCo2Filter'); setState((s) => ({ ...s, scrubber: !s.scrubber })); }}>
        {t(state.scrubber ? 'training.eclss.scrubberOn' : 'training.eclss.scrubberOff')}
      </button>
    </div>
    <div className="train-meters">
      <LiveMeter
        label={t('training.eclss.oxygen')}
        valueText={`${o2.toFixed(1)} %`}
        ratio={o2Ratio(o2)}
        band={[o2Ratio(20.4), o2Ratio(21.8)]}
        tone={o2Ok ? 'ok' : 'warn'}
      />
      <LiveMeter
        label={t('training.eclss.co2')}
        valueText={co2 <= 0.1 ? '✓' : `${co2.toFixed(2)} %`}
        ratio={co2 / 2}
        band={[0, 0.05]}
        tone={co2 <= 0.1 ? 'ok' : 'bad'}
      />
      <LiveMeter
        label={t('training.eclss.total')}
        valueText={`${total} W`}
        ratio={total / 600}
        limit={{ ratio: ECLSS.powerLimit / 600, label: t('training.eclss.limit', { limit: ECLSS.powerLimit }) }}
        tone={total > ECLSS.powerLimit ? 'bad' : 'ok'}
      />
    </div>
  </>;

  return <TrainingFrame
    title={t('training.eclss.title')}
    icon={<Drop weight="fill" color="#4cc3d9" />}
    onBack={onBack}
    task={t('training.eclss.task')}
    tip={t('training.eclss.tip')}
    scene={scene}
    controls={controls}
    hint={hint}
    result={done ? { tier: tierFromCost(cost), cost, resource: 'energy' } : null}
    onReset={() => setState(START)}
    onConfirm={() => onComplete(createTrainingOutcome(
      'ECLSS_TRAINING',
      msg('trainingOutcomes.ECLSS_TRAINING.decision', { watts: total }),
      'energy',
      calculateTrainingCost('ECLSS_TRAINING', total),
      msg('trainingOutcomes.ECLSS_TRAINING.limitation'),
    ))}
  />;
}
