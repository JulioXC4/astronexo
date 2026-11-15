import { useEffect, useState } from 'react';
import { ArrowLeft, Info } from '@phosphor-icons/react';
import type { TrainingOutcome } from '../../../game';
import { AREQUIPA_SOLAR_RECORDS } from '../../../data/nasa/powerData';
import { useI18n, LanguageSelector } from '../../../i18n';
import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import { allocate, assignedUnits, captureEnergy, DEMAND, EMPTY_ALLOCATION, evaluate, nightEnergy, remainingNightEnergy, type Allocation, type SystemId } from './solarEnergy';
import './solar-detective.css';

interface Props {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

type Phase = 'capture' | 'distribute' | 'night' | 'result';
const ASSET_ROOT = '/assets/minigames/solar/';
const PANEL_ANGLES = [5, 16, 35, 50] as const;
const SYSTEMS: SystemId[] = ['communications', 'laboratory', 'shelter'];

function panelSprite(angle: number) {
  if (angle < 8) return 'panel-flat.png';
  if (angle < 25) return 'panel-tilted.png';
  if (angle < 43) return 'panel-raised.png';
  return 'panel-steep.png';
}

export function SolarDetectiveGame({ onComplete, onBack }: Props) {
  const { t } = useI18n();
  const tr = (key: string, params?: Record<string, string | number>) => t(`minigames.solarDetective.${key}`, params);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(5);
  const [phase, setPhase] = useState<Phase>('capture');
  const [allocation, setAllocation] = useState<Allocation>(EMPTY_ALLOCATION);
  const [nightTick, setNightTick] = useState(0);
  const [switchMoving, setSwitchMoving] = useState(false);

  const day = AREQUIPA_SOLAR_RECORDS.days[selectedDayIndex] ?? AREQUIPA_SOLAR_RECORDS.days[0];
  const capture = captureEnergy(day.irradianceKwhPerM2, tiltAngle);
  const circuitClosed = phase !== 'capture';
  const available = capture.units - assignedUnits(allocation);
  const result = evaluate(allocation, capture.units, circuitClosed);
  const nightRemaining = remainingNightEnergy(allocation, nightTick);
  const batteryUnits = phase === 'capture' ? 0 : phase === 'distribute' ? nightEnergy(allocation) : nightRemaining;
  const batteryPercent = Math.round(batteryUnits / Math.max(capture.units, 1) * 100);
  const isNight = phase === 'night' || (phase === 'result' && !result.passed);
  const hasPower = phase === 'result' && result.passed;
  const canReward = phase === 'result' && result.passed;

  useEffect(() => {
    if (phase !== 'night') return;
    const timer = window.setInterval(() => {
      setNightTick((tick) => {
        if (tick >= 7) {
          window.clearInterval(timer);
          setPhase('result');
          return 7;
        }
        return tick + 1;
      });
    }, 360);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (!switchMoving) return;
    const timer = window.setTimeout(() => setSwitchMoving(false), 180);
    return () => window.clearTimeout(timer);
  }, [switchMoving]);

  function resetDay(index = selectedDayIndex) {
    setSelectedDayIndex(index);
    setPhase('capture');
    setAllocation(EMPTY_ALLOCATION);
    setNightTick(0);
  }

  function adjustAngle(angle: number) {
    setTiltAngle(angle);
    if (phase !== 'capture') resetDay();
  }

  function changeAllocation(system: SystemId, change: number) {
    if (phase !== 'distribute') return;
    setAllocation((current) => allocate(current, system, change, capture.units));
  }

  function toggleCircuit() {
    if (phase === 'night' || phase === 'result') return;
    setSwitchMoving(true);
    if (phase === 'capture') setPhase('distribute');
    else resetDay();
  }

  function startNight() {
    if (phase !== 'distribute' || assignedUnits(allocation) === 0) return;
    setNightTick(0);
    setPhase('night');
  }

  function claimReward() {
    if (!canReward) return;
    const cost = calculateTrainingCost('SOLAR_DETECTIVE', result.reservePercent);
    onComplete(createTrainingOutcome('SOLAR_DETECTIVE', `Reserva ${result.reservePercent}%`, 'energy', cost, 'La prueba solar consumió parte de la reserva.'));
  }

  const batterySprite = batteryUnits === 0 ? 'battery-empty.png' : phase === 'result' || phase === 'distribute' ? 'battery-charged.png' : 'battery-charging.png';
  const instruction = phase === 'capture' ? tr('captureInstruction') : phase === 'distribute' ? tr('distributeInstruction') : phase === 'night' ? tr('nightInstruction') : result.passed ? tr('missionSuccess') : tr('missionFailure');

  return <div className="earth-screen solar-game">
    <header className="earth-screen__header solar-game__header">
      <button type="button" className="earth-screen__back-btn" onClick={onBack}><ArrowLeft weight="bold" />{tr('back')}</button>
      <span className="earth-screen__progress-pill">{tr('pill')}</span>
      <LanguageSelector variant="hud" />
    </header>
    <main className="solar-game__main">
      <div className="solar-game__intro">
        <div><h1>{tr('gameTitle')}</h1><p>{tr('missionPrompt')}</p></div>
        <div className="solar-game__days" role="group" aria-label={tr('chooseDay')}>
          {AREQUIPA_SOLAR_RECORDS.days.map((record, index) => <button key={record.date} type="button" className={selectedDayIndex === index ? 'is-selected' : ''} aria-pressed={selectedDayIndex === index} onClick={() => resetDay(index)}><span>{record.date}</span><strong>{record.irradianceKwhPerM2} kWh/m²</strong></button>)}
        </div>
      </div>
      <section className={`solar-game__scene solar-game__scene--game ${isNight ? 'is-night' : ''} ${hasPower ? 'is-success is-dawn' : ''} ${phase === 'result' && !result.passed ? 'is-failure' : ''}`} aria-label={tr('circuitScene')}>
        <div className="solar-game__window" aria-hidden="true"><span className="solar-game__window-light" /></div>
        <div className="solar-game__sky">{isNight ? tr('night') : tr('day')}</div>
        <div className="solar-game__ceiling-lamp" aria-hidden="true" />
        <div className="solar-game__power-conduit" aria-hidden="true" />
        <div className="solar-game__equipment">
          <div className="solar-game__device solar-game__panel">
            <button type="button" className="solar-game__sprite-button" onClick={() => adjustAngle(PANEL_ANGLES[(PANEL_ANGLES.indexOf(tiltAngle as typeof PANEL_ANGLES[number]) + 1) % PANEL_ANGLES.length])} disabled={phase === 'night'} aria-label={tr('rotatePanel')} title={tr('rotatePanel')}><img key={panelSprite(tiltAngle)} src={`${ASSET_ROOT}${panelSprite(tiltAngle)}`} alt="" draggable="false" /></button>
            <strong>{tr('panel')}</strong><small>{tiltAngle}° · {capture.kwh} kWh · {capture.efficiencyPercent}%</small>
          </div>
          <div className="solar-game__device solar-game__switch">
            <button type="button" className="solar-game__sprite-button" onClick={toggleCircuit} disabled={isNight} aria-pressed={circuitClosed} aria-label={circuitClosed ? tr('openCircuit') : tr('closeCircuit')}><img src={`${ASSET_ROOT}${switchMoving ? 'switch-transition.png' : circuitClosed ? 'switch-closed.png' : 'switch-open.png'}`} alt="" draggable="false" /></button>
            <strong>{tr('switch')}</strong><small>{circuitClosed ? tr('closed') : tr('open')}</small>
          </div>
          <div className="solar-game__device solar-game__battery">
            <div className="solar-game__battery-art"><img src={`${ASSET_ROOT}${batterySprite}`} alt="" draggable="false" /><div className="solar-game__battery-display" role="progressbar" aria-label={tr('battery')} aria-valuemin={0} aria-valuemax={capture.units} aria-valuenow={batteryUnits}><div className="solar-game__battery-fill" style={{ width: `${batteryPercent}%` }} /><span>{batteryUnits} kWh</span></div></div>
            <strong>{tr('battery')}</strong><small>{phase === 'distribute' ? tr('nightReserveUnits', { count: nightEnergy(allocation) }) : isNight ? tr('nightRemaining', { count: nightRemaining }) : tr('capturedUnits', { count: capture.units })}</small>
          </div>
        </div>
        <div className="solar-game__workbench" aria-hidden="true" />
        <div className="solar-game__game-hud">
          <p className="solar-game__scene-feedback" aria-live="polite">{instruction}</p>
          {phase === 'capture' && <p className="solar-game__capture-meter">{tr('capturedUnits', { count: capture.units })} · {capture.kwh} kWh</p>}
          {(phase === 'distribute' || isNight) && <div className="solar-game__systems" aria-label={tr('distribution')}>
            {SYSTEMS.map((system) => {
              const assigned = allocation[system];
              const demand = DEMAND[system];
              const powered = phase === 'distribute' ? assigned >= demand : system === 'communications' ? assigned >= 4 && (phase !== 'night' || nightTick < 2) : system === 'shelter' ? assigned >= 5 && (phase !== 'night' || nightTick < 7) : assigned >= 3;
              return <div key={system} className={`solar-game__system ${powered ? 'is-powered' : ''} ${isNight && !powered ? 'is-unpowered' : ''}`} onDragOver={(event) => { if (phase === 'distribute') event.preventDefault(); }} onDrop={(event) => { event.preventDefault(); changeAllocation(system, 1); }}>
                <span className="solar-game__system-light" aria-hidden="true" /><strong>{tr(`system.${system}`)}</strong><span>{assigned}/{demand} kWh</span>
                {phase === 'distribute' && <div className="solar-game__system-actions"><button type="button" onClick={() => changeAllocation(system, -1)} disabled={assigned === 0} aria-label={tr('removeUnit', { system: tr(`system.${system}`) })}>−</button><button type="button" onClick={() => changeAllocation(system, 1)} disabled={assigned >= demand || available === 0} aria-label={tr('addUnit', { system: tr(`system.${system}`) })}>+</button></div>}
              </div>;
            })}
          </div>}
          {phase === 'distribute' && <div className="solar-game__energy-tokens" aria-label={tr('availableEnergy', { count: available })}>{Array.from({ length: available }, (_, index) => <span key={index} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', 'energy')} title={tr('dragEnergy')}>◆</span>)}</div>}
          {phase === 'night' && <div className="solar-game__night-progress" role="progressbar" aria-label={tr('nightProgress')} aria-valuenow={nightTick} aria-valuemin={0} aria-valuemax={7}><span style={{ width: `${nightTick / 7 * 100}%` }} /></div>}
        </div>
      </section>
      <div className="solar-game__game-actions">
        {phase === 'capture' && <details className="solar-game__alternate"><summary>{tr('preciseControl')}</summary><label htmlFor="tilt-angle-slider">{tr('tiltLabel')} {tiltAngle}°</label><input id="tilt-angle-slider" type="range" min="0" max="50" value={tiltAngle} onChange={(event) => adjustAngle(Number(event.target.value))} /></details>}
        {phase === 'distribute' && <><span>{tr('availableEnergy', { count: available })} · {tr('optionalLab')}</span><button type="button" className="solar-game__primary" onClick={startNight} disabled={assignedUnits(allocation) === 0}>{tr('startNight')}</button></>}
        {phase === 'result' && !result.passed && <button type="button" className="solar-game__primary" onClick={() => { setPhase('distribute'); setNightTick(0); }}>{tr('retryDistribution')}</button>}
        {phase === 'result' && result.passed && <><span>{tr(`grade.${result.grade}`)}</span><button type="button" className="solar-game__primary" onClick={claimReward}>{tr('confirmCost', { cost: calculateTrainingCost('SOLAR_DETECTIVE', result.reservePercent) })}</button></>}
      </div>
      {phase === 'result' && <p className="solar-game__explanation" role="status">{result.passed ? tr('winExplanation', { reserve: result.reservePercent }) : !result.communicationsDay ? tr('failCommunicationsDay') : !result.communicationsNight ? tr('failCommunicationsNight') : tr('failShelter')}</p>}
      <details className="solar-game__science"><summary><Info size={18} />{tr('scienceDetails')}</summary><p>{tr('scientificNote', { irradiance: day.irradianceKwhPerM2 })} {tr('educationalNote')} {tr('unitExplanation')}</p></details>
    </main>
  </div>;
}
