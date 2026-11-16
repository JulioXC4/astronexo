import { useState } from 'react';
import { Plant } from '@phosphor-icons/react';
import { useI18n } from '../../../i18n';
import { GaugeDial } from '../../../visual-kit/GaugeDial';
import { LiveMeter } from '../../../visual-kit/LiveMeter';
import type { TrainingOutcome } from '../../../game';
import { calculateTrainingCost, createTrainingOutcome } from '../trainingOutcome';
import { TrainingFrame } from './TrainingFrame';
import {
  ARCTIC, arcticCost, arcticDone, arcticTemperature, tierFromCost,
  type ArcticState, type LedMode,
} from './trainingRules';

interface ArcticGreenhouseGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

const START: ArcticState = { flow: 30, insulated: false, led: 'NORMAL' };
/** El termómetro va de −15 °C (afuera) a 40 °C. */
const T_MIN = -15;
const T_MAX = 40;
const tempRatio = (temp: number) => (temp - T_MIN) / (T_MAX - T_MIN);

/**
 * Invernadero del Ártico. Antes: un slider, un interruptor, tres botones y un
 * «Auto-Calibrar (52%)» que traía la respuesta. Ahora el termómetro y las
 * plantas dicen cómo vas, y no hay nada que verificar.
 */
export function ArcticGreenhouseGame({ onComplete, onBack }: ArcticGreenhouseGameProps) {
  const { t } = useI18n();
  const [state, setState] = useState<ArcticState>(START);
  const temp = arcticTemperature(state);
  const done = arcticDone(state);
  const cost = arcticCost(state);
  const freezing = temp < 14;
  const hot = temp > 26;
  const comfy = temp >= 18 && temp <= 24;

  const hint = done ? t('training.arctic.hintGood')
    : freezing ? t('training.arctic.hintFreezing')
      : hot ? t('training.arctic.hintHot')
        : !state.insulated ? t('training.arctic.hintOpen')
          : state.flow > ARCTIC.maxFlow ? t('training.arctic.hintWaste')
            : comfy ? t('training.arctic.hintGood')
              : t('training.arctic.hintCold');

  const plant = freezing ? '#b3e5fc' : hot ? '#ffb74d' : comfy ? '#4caf50' : '#9ccc65';

  const scene = <svg viewBox="0 0 900 380" role="img" aria-label={t('training.arctic.title')}>
    {/* Afuera: nieve y cielo frío */}
    <rect x="0" y="0" width="900" height="380" fill={freezing ? '#10243a' : '#142c44'} />
    {Array.from({ length: 28 }, (_, i) => (
      <circle key={i} cx={(i * 97) % 900} cy={(i * 53) % 220} r={2} fill="#dff3ff" opacity=".7" />
    ))}
    <rect x="0" y="300" width="900" height="80" fill="#e3f2fd" />
    {/* La cúpula: cerrada brilla; abierta deja una abertura */}
    <path
      d="M180 300 A270 230 0 0 1 720 300 Z"
      fill={state.insulated ? 'rgba(129,212,250,.28)' : 'rgba(129,212,250,.08)'}
      stroke={state.insulated ? '#81d4fa' : '#546e7a'}
      strokeWidth="5"
      strokeDasharray={state.insulated ? undefined : '14 10'}
    />
    {/* Calor que sube de la tierra */}
    {Array.from({ length: 5 }, (_, i) => (
      <path
        key={i}
        d={`M${290 + i * 80} 372 q-10 -22 0 -44 q10 -22 0 -44`}
        fill="none"
        stroke="#ff8a65"
        strokeWidth="5"
        strokeLinecap="round"
        opacity={Math.min(1, state.flow / 70)}
      />
    ))}
    {/* Plantas */}
    {[-150, -75, 0, 75, 150].map((dx) => (
      <g key={dx} transform={`translate(${450 + dx}, 296)`}>
        <rect x="-4" y="-34" width="8" height="34" fill="#5d4037" />
        <ellipse cx="-12" cy="-40" rx="14" ry={freezing ? 8 : 18} fill={plant} />
        <ellipse cx="12" cy="-40" rx="14" ry={freezing ? 8 : 18} fill={plant} />
      </g>
    ))}
    {/* Termómetro */}
    <g transform="translate(820, 70)">
      <rect x="-12" y="0" width="24" height="200" rx="12" fill="#0a1522" stroke="#dfeef0" strokeWidth="3" />
      <rect x="-12" y={200 - tempRatio(temp) * 200} width="24" height={tempRatio(temp) * 200} rx="12" fill={freezing ? '#4fc3f7' : hot ? '#ff7043' : comfy ? '#3fae6a' : '#e8b04a'} />
      <text x="0" y="228" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800">{temp} °C</text>
    </g>
  </svg>;

  const ledOption = (mode: LedMode, key: string) => (
    <button key={mode} type="button" aria-pressed={state.led === mode} onClick={() => setState((s) => ({ ...s, led: mode }))}>
      {t(key)}
    </button>
  );

  const controls = <>
    <GaugeDial
      label={t('training.arctic.heat')}
      value={state.flow}
      min={ARCTIC.flowMin}
      max={ARCTIC.flowMax}
      step={2}
      onChange={(flow) => setState((s) => ({ ...s, flow }))}
      display={`${state.flow}%`}
      lowLabel={t('training.arctic.heatLow')}
      highLabel={t('training.arctic.heatHigh')}
    />
    <div className="train-switch">
      <strong>{t('training.arctic.dome')}</strong>
      <button type="button" aria-pressed={state.insulated} onClick={() => setState((s) => ({ ...s, insulated: !s.insulated }))}>
        {t(state.insulated ? 'training.arctic.domeClosed' : 'training.arctic.domeOpen')}
      </button>
    </div>
    <div className="train-choice">
      <strong>{t('training.arctic.lights')}</strong>
      <div className="train-choice__row">
        {ledOption('LOW', 'training.arctic.lightsLow')}
        {ledOption('NORMAL', 'training.arctic.lightsMid')}
        {ledOption('BOOST', 'training.arctic.lightsBoost')}
      </div>
    </div>
    <LiveMeter
      label={t('training.arctic.temp')}
      valueText={`${temp} °C`}
      ratio={tempRatio(temp)}
      band={[tempRatio(18), tempRatio(24)]}
      tone={comfy ? 'ok' : freezing || hot ? 'bad' : 'warn'}
    />
  </>;

  return <TrainingFrame
    title={t('training.arctic.title')}
    icon={<Plant weight="fill" color="#a5d6a7" />}
    onBack={onBack}
    task={t('training.arctic.task')}
    tip={t('training.arctic.tip')}
    scene={scene}
    controls={controls}
    hint={hint || t('training.arctic.hintStart')}
    result={done ? { tier: tierFromCost(cost), cost, resource: 'energy' } : null}
    onReset={() => setState(START)}
    onConfirm={() => onComplete(createTrainingOutcome(
      'ARCTIC_GREENHOUSE',
      `Flujo geotérmico ${state.flow}%`,
      'energy',
      calculateTrainingCost('ARCTIC_GREENHOUSE', state.flow),
      'Calefacción e iluminación consumen reserva.',
    ))}
  />;
}
