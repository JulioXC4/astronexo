import { useState } from 'react';
import { Wind } from '@phosphor-icons/react';
import { msg, useI18n } from '../../../i18n';
import { GaugeDial } from '../../../visual-kit/GaugeDial';
import type { TrainingOutcome } from '../../../game';
import { calculateTrainingCost, createTrainingOutcome } from '../trainingOutcome';
import { TrainingFrame } from './TrainingFrame';
import { playSound } from '../../audio';
import { useThrottledSound } from './ui/useThrottledSound';
import {
  ALTITUDE, altitudeCost, altitudeDone, altitudeGas, sealsClosed, tierFromCost, type AltitudeState,
} from './trainingRules';

interface AltitudeAcclimatizationGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

const START: AltitudeState = { kpa: 62, seals: [false, false, false] };
const SEALS = [
  { key: 'training.altitude.sealMain', left: '18%', top: '46%' },
  { key: 'training.altitude.sealHatch', left: '50%', top: '30%' },
  { key: 'training.altitude.sealAir', left: '82%', top: '46%' },
] as const;

/**
 * Cámara de altura. Antes: un slider con «76 kPa (Cabina recomendada)» escrito
 * debajo, tres casillas y «Verificar Hermeticidad». Ahora los sellos están en la
 * cámara misma, se cierran tocándolos, y el manómetro marca su zona segura como
 * un instrumento real (sin la cifra de la respuesta).
 */
export function AltitudeAcclimatizationGame({ onComplete, onBack }: AltitudeAcclimatizationGameProps) {
  const { t } = useI18n();
  const [state, setState] = useState<AltitudeState>(START);
  const pumpSound = useThrottledSound(300);
  const closed = sealsClosed(state);
  const done = altitudeDone(state);
  const cost = altitudeCost(state);
  const lowP = state.kpa < ALTITUDE.hypoxiaBelow;
  const highP = state.kpa > ALTITUDE.safe[1];

  const hint = done ? t('training.altitude.hintGood')
    : lowP ? t('training.altitude.hintLow')
      : highP ? t('training.altitude.hintHigh')
        : closed < 3 ? t('training.altitude.hintSeal')
          : t('training.altitude.hintStart');

  // Siguiente objetivo: primero la presión, después el primer sello abierto.
  const pressureOk = state.kpa >= ALTITUDE.safe[0] && state.kpa <= ALTITUDE.safe[1];
  const nextSeal = pressureOk && !done ? state.seals.findIndex((closed) => !closed) : -1;

  const toggle = (index: number) => {
    // Cerrar un sello sella; la escotilla (centro) suena a escotilla al abrirse y al cerrarse.
    if (state.seals[index]) playSound('altitudeHatchOpen');
    else playSound(index === 1 ? 'altitudeHatchClose' : 'altitudeSeal');
    setState((s) => ({
      ...s,
      seals: s.seals.map((value, i) => (i === index ? !value : value)) as unknown as AltitudeState['seals'],
    }));
  };

  const scene = <div className="chamber">
    <svg viewBox="0 0 900 380" role="img" aria-label={t('training.altitude.title')}>
      <rect width="900" height="380" fill="#10243a" />
      <ellipse cx="450" cy="200" rx="400" ry="160" fill={lowP ? '#26323d' : '#1b3a52'} stroke={done ? '#69f0ae' : '#6a8aa8'} strokeWidth="6" />
      {/* Astronauta: respira bien cuando la presión es buena */}
      <circle cx="450" cy="190" r="26" fill="#fff" />
      <rect x="430" y="214" width="40" height="50" rx="8" fill={lowP ? '#ef5350' : '#e8b04a'} />
      {lowP && <text x="450" y="150" textAnchor="middle" fontSize="26" fill="#ffab91">...</text>}
      {/* Aire que se escapa por cada sello abierto */}
      {SEALS.map((seal, i) => !state.seals[i] && (
        <g key={seal.key} opacity=".8" transform={`translate(${parseFloat(seal.left) * 9}, ${parseFloat(seal.top) * 3.8})`}>
          <circle r="5" cx="-14" cy="-8" fill="#b3e5fc" /><circle r="4" cx="-24" cy="-18" fill="#b3e5fc" />
        </g>
      ))}
    </svg>
    {SEALS.map((seal, i) => <button
      key={seal.key}
      type="button"
      className={`chamber__seal ${state.seals[i] ? 'is-closed' : 'is-open'}`}
      style={{ left: seal.left, top: seal.top }}
      aria-pressed={state.seals[i]}
      data-target={i === nextSeal || undefined}
      onClick={() => toggle(i)}
    >
      <strong>{t(seal.key)}</strong>
      <span>{t(state.seals[i] ? 'training.altitude.sealClosed' : 'training.altitude.sealOpen')}</span>
    </button>)}
  </div>;

  const controls = <GaugeDial
    label={t('training.altitude.pressure')}
    value={state.kpa}
    min={ALTITUDE.kpaMin}
    max={ALTITUDE.kpaMax}
    onChange={(kpa) => { if (kpa > state.kpa) pumpSound('altitudePump'); setState((s) => ({ ...s, kpa })); }}
    target={!pressureOk && !done}
    display={`${state.kpa} kPa`}
    lowLabel={t('training.altitude.low')}
    highLabel={t('training.altitude.high')}
    zones={[
      { from: 50, to: 70, tone: 'bad' },
      { from: 70, to: 82, tone: 'ok' },
      { from: 82, to: 100, tone: 'warn' },
    ]}
  />;

  return <TrainingFrame
    scope="ALTITUDE_ACCLIMATIZATION"
    title={t('training.altitude.title')}
    icon={<Wind weight="fill" color="#80d8ff" />}
    onBack={onBack}
    taskKey="training.altitude.task"
    tipKey="training.altitude.tip"
    goals={[
      { label: t('training.goals.pressureGreen'), ok: pressureOk },
      { label: t('training.goals.sealsClosed', { closed }), ok: closed === 3 },
    ]}
    scene={scene}
    controls={controls}
    hint={hint}
    result={done ? { tier: tierFromCost(cost), cost, resource: 'oxygen' } : null}
    onReset={() => setState(START)}
    onConfirm={() => onComplete(createTrainingOutcome(
      'ALTITUDE_ACCLIMATIZATION',
      msg('trainingOutcomes.ALTITUDE_ACCLIMATIZATION.decision', { gas: altitudeGas(state) }),
      'oxygen',
      calculateTrainingCost('ALTITUDE_ACCLIMATIZATION', altitudeGas(state)),
      msg('trainingOutcomes.ALTITUDE_ACCLIMATIZATION.limitation'),
    ))}
  />;
}
