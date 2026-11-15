import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowCounterClockwise, CheckCircle, Info, Warning } from '@phosphor-icons/react';
import type { TrainingOutcome } from '../../../game';
import { AREQUIPA_SOLAR_RECORDS, type SolarDayRecord } from '../../../data/nasa/powerData';
import { useI18n, LanguageSelector } from '../../../i18n';
import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import './solar-detective.css';

interface SolarDetectiveGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

const ASSET_ROOT = '/assets/minigames/solar/';
const PANEL_ANGLES = [5, 16, 35, 50] as const;

function panelSprite(angle: number): string {
  if (angle < 8) return 'panel-flat.png';
  if (angle < 25) return 'panel-tilted.png';
  if (angle < 43) return 'panel-raised.png';
  return 'panel-steep.png';
}

export function SolarDetectiveGame({ onComplete, onBack }: SolarDetectiveGameProps) {
  const { t } = useI18n();
  const tr = (key: string, params?: Record<string, string | number>) => t(`minigames.solarDetective.${key}`, params);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(5);
  const [reserveRatioPercent, setReserveRatioPercent] = useState(45);
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [nightMode, setNightMode] = useState(false);
  const [switchMoving, setSwitchMoving] = useState(false);

  const currentDay: SolarDayRecord = AREQUIPA_SOLAR_RECORDS.days[selectedDayIndex] ?? AREQUIPA_SOLAR_RECORDS.days[0];
  // NASA POWER supplies irradiance. Tilt, panel efficiency and area are educational model parameters.
  const angleError = Math.abs(tiltAngle - 16);
  const orientationFactor = Math.max(0.60, Math.cos((angleError * Math.PI) / 180));
  const totalDailyEnergyKwh = Number((currentDay.irradianceKwhPerM2 * orientationFactor * 0.22 * 10).toFixed(2));
  const maxPossibleKwh = Number((currentDay.irradianceKwhPerM2 * 0.22 * 10).toFixed(2));
  const efficiencyPercent = Math.round((totalDailyEnergyKwh / maxPossibleKwh) * 100);
  const storedEnergyKwh = Number((totalDailyEnergyKwh * reserveRatioPercent / 100).toFixed(2));
  const daytimeAvailableKwh = Number((totalDailyEnergyKwh - storedEnergyKwh).toFixed(2));
  const targetBatteryPercent = Math.min(100, Math.round(efficiencyPercent * reserveRatioPercent / 50));
  const isOrientationGood = angleError <= 5;
  const isReserveOptimal = reserveRatioPercent >= 30 && reserveRatioPercent <= 60;
  const isTestPassed = isSwitchClosed && isOrientationGood && isReserveOptimal && batteryLevel >= 60;
  const isCharging = isSwitchClosed && batteryLevel < targetBatteryPercent;
  const canInspectNight = isSwitchClosed && !isCharging;

  useEffect(() => {
    if (!isSwitchClosed) {
      setBatteryLevel(0);
      return;
    }
    setBatteryLevel(0);
    const interval = window.setInterval(() => {
      setBatteryLevel((level) => Math.min(level + 5, targetBatteryPercent));
    }, 45);
    return () => window.clearInterval(interval);
  }, [isSwitchClosed, targetBatteryPercent]);

  useEffect(() => {
    if (!switchMoving) return;
    const timeout = window.setTimeout(() => setSwitchMoving(false), 180);
    return () => window.clearTimeout(timeout);
  }, [switchMoving]);

  function resetCircuit() {
    setIsSwitchClosed(false);
    setBatteryLevel(0);
    setNightMode(false);
  }

  function changeTilt(angle: number) {
    setTiltAngle(angle);
    if (isSwitchClosed) resetCircuit();
  }

  function changeReserve(percent: number) {
    setReserveRatioPercent(percent);
    if (isSwitchClosed) resetCircuit();
  }

  function toggleSwitch() {
    setSwitchMoving(true);
    setIsSwitchClosed((closed) => !closed);
    setNightMode(false);
  }

  const batterySprite = batteryLevel === 0 ? 'battery-empty.png' : !isCharging && isSwitchClosed ? 'battery-charged.png' : 'battery-charging.png';
  const failure = isSwitchClosed && !isCharging && !isTestPassed;

  return (
    <div className="earth-screen solar-game">
      <header className="earth-screen__header solar-game__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}><ArrowLeft weight="bold" />{tr('back')}</button>
        <span className="earth-screen__progress-pill">{tr('pill')}</span>
        <LanguageSelector variant="hud" />
      </header>

      <main className="solar-game__main">
        <div className="solar-game__intro">
          <div>
            <h1>{tr('title')}</h1>
            <p>{tr('missionPrompt')}</p>
          </div>
          <div className="solar-game__days" role="group" aria-label={tr('chooseDay')}>
            {AREQUIPA_SOLAR_RECORDS.days.map((day, index) => (
              <button key={day.date} type="button" className={selectedDayIndex === index ? 'is-selected' : ''}
                aria-pressed={selectedDayIndex === index}
                onClick={() => { setSelectedDayIndex(index); resetCircuit(); }}>
                <span>{day.date}</span><strong>{day.irradianceKwhPerM2} kWh/m²</strong>
              </button>
            ))}
          </div>
        </div>

        <section className={`solar-game__scene ${nightMode ? 'is-night' : ''} ${isTestPassed && nightMode ? 'is-success' : ''}`} aria-label={tr('circuitScene')}>
          <div className="solar-game__window" aria-hidden="true"><span className="solar-game__window-light" /></div><div className="solar-game__sky"><span>{nightMode ? tr('night') : tr('day')}</span></div><div className="solar-game__ceiling-lamp" aria-hidden="true" /><div className="solar-game__power-conduit" aria-hidden="true" />
          <div className="solar-game__equipment">
            
            <div className={`solar-game__device solar-game__panel ${isOrientationGood ? 'is-aligned' : 'is-misaligned'}`}>
              <button type="button" className="solar-game__sprite-button" onClick={() => changeTilt(PANEL_ANGLES[(PANEL_ANGLES.indexOf(tiltAngle as typeof PANEL_ANGLES[number]) + 1) % PANEL_ANGLES.length])}
                aria-label={tr('rotatePanel')} title={tr('rotatePanel')}>
                <img key={panelSprite(tiltAngle)} src={`${ASSET_ROOT}${panelSprite(tiltAngle)}`} alt="" draggable="false" />
              </button>
              <strong>{tr('panel')}</strong><small>{tiltAngle}° · {efficiencyPercent}% {tr('capture')}</small>
            </div>
            
            <div className="solar-game__device solar-game__switch">
              <button type="button" className="solar-game__sprite-button" onClick={toggleSwitch} aria-pressed={isSwitchClosed}
                aria-label={isSwitchClosed ? tr('openCircuit') : tr('closeCircuit')} title={isSwitchClosed ? tr('openCircuit') : tr('closeCircuit')}>
                <img src={`${ASSET_ROOT}${switchMoving ? 'switch-transition.png' : isSwitchClosed ? 'switch-closed.png' : 'switch-open.png'}`} alt="" draggable="false" />
              </button>
              <strong>{tr('switch')}</strong><small>{isSwitchClosed ? tr('closed') : tr('open')}</small>
            </div>
            
            <div className={`solar-game__device solar-game__battery ${isCharging ? 'is-charging' : ''}`}>
              <div className="solar-game__battery-art">
                <img src={`${ASSET_ROOT}${batterySprite}`} alt="" draggable="false" />
                <div className="solar-game__battery-display" role="progressbar" aria-label={tr('battery')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={batteryLevel}>
                  <div className="solar-game__battery-fill" style={{ width: `${batteryLevel}%` }} />
                  <span>{batteryLevel}%</span>
                </div>
              </div>
              <strong>{tr('battery')}</strong><small>{storedEnergyKwh} kWh {isSwitchClosed ? tr('reserved') : tr('potentialReserve')}</small>
            </div>
          </div>
          <div className="solar-game__workbench" aria-hidden="true" /><p className="solar-game__scene-feedback" aria-live="polite">{nightMode ? (isTestPassed ? tr('nightSuccess') : tr('nightFailure')) : isCharging ? tr('charging') : isSwitchClosed ? tr('readyForNight') : tr('connectPrompt')}</p>
        </section>

        <section className="solar-game__controls" aria-label={tr('controls')}>
          <label htmlFor="tilt-angle-slider"><span>{tr('tiltLabel')}</span><strong>{tiltAngle}°</strong></label>
          <input id="tilt-angle-slider" type="range" min="0" max="50" value={tiltAngle} onChange={(event) => changeTilt(Number(event.target.value))} />
          <p>{isOrientationGood ? tr('aligned') : tr('aimFor16')}</p>
          <label htmlFor="solar-reserve-slider"><span>{tr('reserveLabel')}</span><strong>{reserveRatioPercent}%</strong></label>
          <input id="solar-reserve-slider" type="range" min="15" max="85" step="5" value={reserveRatioPercent} onChange={(event) => changeReserve(Number(event.target.value))} />
          <p>{tr('daytimeAvailable', { kwh: daytimeAvailableKwh })} · {tr('nightReserve', { kwh: storedEnergyKwh })}</p>
          <div className="solar-game__actions">
            <button type="button" className="solar-game__primary" onClick={() => setNightMode((mode) => !mode)} disabled={!canInspectNight}>{nightMode ? tr('returnToDay') : tr('inspectNight')}</button>
            <button type="button" className="solar-game__reset" onClick={resetCircuit} aria-label={tr('reset')} title={tr('reset')}><ArrowCounterClockwise weight="bold" /></button>
          </div>
        </section>

        {failure && <div className="solar-game__result is-error" role="status"><Warning weight="fill" size={26} /><div><strong>{tr('suboptimalWarning')}</strong><p>{!isOrientationGood ? tr('tiltWarning', { angle: tiltAngle }) : reserveRatioPercent < 30 ? tr('lowReserveWarning') : tr('highReserveWarning')} {tr('retryPrompt')}</p></div></div>}
        {isTestPassed && nightMode && <div className="solar-game__result is-success" role="status"><CheckCircle weight="fill" size={28} /><div><strong>{tr('passedTitle')}</strong><p>{tr('passedDesc', { angle: tiltAngle, reserve: reserveRatioPercent, kwh: totalDailyEnergyKwh, efficiency: efficiencyPercent, stored: storedEnergyKwh })}</p></div><button type="button" className="solar-game__primary" onClick={() => onComplete(createTrainingOutcome('SOLAR_DETECTIVE', `Reserva ${reserveRatioPercent}%`, 'energy', calculateTrainingCost('SOLAR_DETECTIVE', reserveRatioPercent), 'La prueba solar consumió parte de la reserva.'))}>{tr('confirmCost', { cost: calculateTrainingCost('SOLAR_DETECTIVE', reserveRatioPercent) })}</button></div>}
        <details className="solar-game__science"><summary><Info size={18} />{tr('scienceDetails')}</summary><p>{tr('scientificNote', { irradiance: currentDay.irradianceKwhPerM2 })} {tr('educationalNote')}</p></details>
      </main>
    </div>
  );
}
