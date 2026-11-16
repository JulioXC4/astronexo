import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, CloudSun, Info, Minus, Plus, Sparkle } from '@phosphor-icons/react';
import { getSolarDatasetByCity } from '../../../data/nasa/powerData';
import { useI18n } from '../../../i18n';
import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { MinigameShell } from './ui/MinigameShell';
import './clouds-suns.css';
import { GaugeDial } from '../../../visual-kit/GaugeDial';
import { recommendedReserve, reserveMismatch, reserveHint, tierFromCost } from './trainingRules';
import { useScreenRadio } from '../../radio';
import { playSound } from '../../audio';
import { WorkQuality } from '../../../visual-kit/WorkQuality';

interface CloudsSunsGameProps {
  readonly cityId: string;
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

/** Se conservan estos nombres: otras pruebas del proyecto los importan desde aquí. */
export const recommendedReservePercent = recommendedReserve;
export { reserveMismatch };

/** Cuánto sol pierde un día frente al mejor día (0–1). */
export function dayShortfall(value: number, best: number): number {
  return best > 0 ? Math.max(0, 1 - value / best) : 0;
}

const CELLS = 20; // cada celda = 5 %
const SUN_ROWS = [
  '...######...',
  '..########..',
  '.##########.',
  '############',
  '############',
  '############',
  '############',
  '.##########.',
  '..########..',
  '...######...',
] as const;
const CLOUD_ROWS = [
  '....#####.......',
  '..#########.....',
  '.###########.##.',
  '################',
  '################',
  '.##############.',
] as const;

function PixelRows({ rows, x, y, size, fill, shade }: { rows: readonly string[]; x: number; y: number; size: number; fill: string; shade?: string }) {
  return <>{rows.flatMap((row, r) => [...row].map((cell, c) => (cell === '#'
    ? <rect key={`${r}-${c}`} x={x + c * size} y={y + r * size} width={size} height={size} fill={r >= rows.length - 2 && shade ? shade : fill} />
    : null)))}</>;
}

/** Cielo pixel art: cuanto más sol pierde el día, más nubes tapan el Sol. */
function SkyPixel({ shortfall }: { shortfall: number }) {
  const clouds = shortfall < 0.04 ? 0 : shortfall < 0.12 ? 1 : shortfall < 0.25 ? 2 : 3;
  const grey = Math.min(1, shortfall * 3);
  const sky = `rgb(${Math.round(79 + grey * 60)}, ${Math.round(163 - grey * 25)}, ${Math.round(232 - grey * 70)})`;
  return (
    <svg className="clouds-sky" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="160" height="100" fill={sky} />
      <rect y="78" width="160" height="22" fill="#2c4a63" />
      <rect y="78" width="160" height="4" fill="#3d6384" />
      <g opacity={Math.max(0.35, 1 - shortfall * 1.4)}>
        <PixelRows rows={SUN_ROWS} x={22} y={10} size={5} fill="#ffd45c" />
      </g>
      {clouds >= 1 && <PixelRows rows={CLOUD_ROWS} x={36} y={28} size={4} fill="#f4f7fb" shade="#c8d3e0" />}
      {clouds >= 2 && <PixelRows rows={CLOUD_ROWS} x={78} y={14} size={4} fill="#e9eef5" shade="#bcc8d8" />}
      {clouds >= 3 && <PixelRows rows={CLOUD_ROWS} x={8} y={36} size={4} fill="#dfe6ef" shade="#aebccc" />}
    </svg>
  );
}
export function CloudsSunsGame({ cityId, onComplete, onBack }: CloudsSunsGameProps) {
  const { t } = useI18n();
  useScreenRadio([
    { speaker: 'CHISPA', text: t('training.clouds.task') },
    { speaker: 'AURORA', text: t('training.clouds.tip') },
  ]);
  const dataset = getSolarDatasetByCity(cityId);
  const values = useMemo(() => dataset.days.map((day) => day.irradianceKwhPerM2), [dataset]);
  const best = Math.max(...values);
  const [reserve, setReserve] = useState<number>(50);
  const [tested, setTested] = useState<boolean>(false);
  const recommended = recommendedReservePercent(values);
  const mismatch = reserveMismatch(reserve, values);
  const passed = tested && mismatch <= 25;
  const cost = calculateTrainingCost('CLOUDS_SUNS', mismatch);
  const wasPassed = useRef(false);
  useEffect(() => {
    if (passed && !wasPassed.current) playSound('success');
    wasPassed.current = passed;
  }, [passed]);
  const first = dataset.days[0].observation;
  const cityName = cityId === 'TROMSO' ? 'Tromsø' : 'Arequipa';
  const backdrop = cityId === 'TROMSO' ? '/assets/pixel-art/arctic-research-base.png' : '/assets/pixel-art/andean-training-complex.png';
  const filled = Math.round(reserve / (100 / CELLS));

  function changeReserve(next: number) {
    setReserve(Math.max(0, Math.min(100, Math.round(next))));
    setTested(false);
  }

  return (
    <MinigameShell
      className="clouds"
      backdrop={backdrop}
      title={t('minigames.cloudsSuns.title')}
      subtitle={`NASA POWER · ${cityName}`}
      backLabel={t('common.back')}
      onBack={onBack}
    >
      <div className="clouds-layout">
        <p className="mg-card clouds-intro">{t('minigames.cloudsSuns.intro', { city: cityName })}</p>

        <div className="clouds-days" role="img" aria-label={t('minigames.cloudsSuns.chartAria')}>
          {dataset.days.map((day) => {
            const loss = Math.round(dayShortfall(day.irradianceKwhPerM2, best) * 100);
            return (
              <article key={day.date} className="mg-card clouds-day" data-day={day.date}>
                <SkyPixel shortfall={dayShortfall(day.irradianceKwhPerM2, best)} />
                <h2>{day.seasonLabel}</h2>
                <strong className="clouds-day__value">{day.irradianceKwhPerM2} <small>kWh/m²</small></strong>
                <span className="clouds-day__bar" aria-hidden="true"><span style={{ width: `${best > 0 ? (day.irradianceKwhPerM2 / best) * 100 : 0}%` }} /></span>
                <span className="clouds-day__note">{loss === 0 ? t('minigames.cloudsSuns.bestDay') : tested ? t('minigames.cloudsSuns.lossLabel', { pct: loss }) : ' '}</span>
              </article>
            );
          })}
        </div>

        <section className="mg-card clouds-reserve" aria-label={t('minigames.cloudsSuns.reserveLabel', { value: reserve })}>
          <div className="clouds-reserve__head">
            <label htmlFor="clouds-reserve">{t('minigames.cloudsSuns.reserveLabel', { value: reserve })}</label>
            <div className="clouds-stepper">
              <button type="button" className="mg-btn" onClick={() => changeReserve(reserve - 5)} disabled={reserve <= 0} aria-label={t('minigames.cloudsSuns.reserveLess')}><Minus weight="bold" /></button>
              <button type="button" className="mg-btn" onClick={() => changeReserve(reserve + 5)} disabled={reserve >= 100} aria-label={t('minigames.cloudsSuns.reserveMore')}><Plus weight="bold" /></button>
            </div>
          </div>

          <div className="clouds-gauge" role="group" aria-label={t('minigames.cloudsSuns.gaugeAria')}>
            {Array.from({ length: CELLS }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`clouds-gauge__cell${index < filled ? ' is-full' : ''}`}
                aria-label={`${(index + 1) * (100 / CELLS)}%`}
                onClick={() => changeReserve((index + 1) * (100 / CELLS))}
              />
            ))}
            {tested && (
              <span className="clouds-gauge__target" style={{ left: `${recommended}%` }} aria-hidden="true">
                <span>{t('minigames.cloudsSuns.dataSuggest', { pct: recommended })}</span>
              </span>
            )}
          </div>

          <GaugeDial label={t('training.clouds.dial')} value={reserve} min={0} max={100}
            onChange={changeReserve} display={`${reserve}%`} />
          <p className="clouds-hint" role="status">{t(reserveHint(reserve, values) === 'RIGHT'
            ? 'training.clouds.hintRight' : reserveHint(reserve, values) === 'TOO_LITTLE'
              ? 'training.clouds.hintLittle' : 'training.clouds.hintMuch')}</p>
          <input
            id="clouds-reserve" className="clouds-slider" type="range" min={0} max={100} step={1} value={reserve}
            onChange={(event) => changeReserve(Number(event.target.value))}
          />
          <p className="clouds-hint">{t('minigames.cloudsSuns.hint')}</p>

          <div className="clouds-actions">
            <button type="button" className="mg-btn" onClick={() => changeReserve(50)}>{t('training.reset')}</button>
            <p className="clouds-source"><Info size={16} weight="bold" aria-hidden="true" />{t('minigames.cloudsSuns.source', { parameter: first.parameter, unit: first.unit, status: t(`nasaStatus.${first.status ?? 'HISTORICAL'}`) })}</p>
            <button type="button" className="pixel-btn pixel-btn--primary clouds-test" onClick={() => setTested(true)}>
              <Sparkle weight="fill" aria-hidden="true" />
              <span>{t('minigames.cloudsSuns.testBtn')}</span>
            </button>
          </div>
        </section>

        {tested && !passed && (
          <p role="status" className="mg-card mg-card--danger clouds-result">{t('minigames.cloudsSuns.tryAgain', { recommended })}</p>
        )}
        {passed && (
          <div role="status" className="mg-card mg-card--success clouds-result clouds-result--ok">
            <WorkQuality tier={tierFromCost(cost)} />
            <div>
              <strong><CheckCircle weight="fill" aria-hidden="true" /> {t('minigames.cloudsSuns.passed', { recommended })}</strong>
              <p>{t('minigames.cloudsSuns.benefit')}</p>
            </div>
            <button
              type="button" className="pixel-btn pixel-btn--primary clouds-confirm"
              onClick={() => onComplete(createTrainingOutcome(
                'CLOUDS_SUNS', `Reserva ${reserve}% (sugerida ${recommended}%)`, 'energy', cost,
                'Guardar reserva para días sin sol deja menos energía libre al despegar.',
              ))}
            >
              <CloudSun weight="fill" aria-hidden="true" />
              <span>{t('minigames.cloudsSuns.confirmBtn', { cost })}</span>
            </button>
          </div>
        )}
      </div>
    </MinigameShell>
  );
}
