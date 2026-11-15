import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Info, Sun, MoonStars } from '@phosphor-icons/react';
import type { TrainingOutcome } from '../../../game';
import { AREQUIPA_SOLAR_RECORDS } from '../../../data/nasa/powerData';
import { useI18n, LanguageSelector } from '../../../i18n';
import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import { allocate, assignedUnits, captureEnergy, DEMAND, EMPTY_ALLOCATION, evaluate, nightEnergy, nightSystemEnergy, remainingNightEnergy, type Allocation, type SystemId } from './solarEnergy';
import './solar-detective.css';

interface Props { readonly onComplete: (outcome: TrainingOutcome) => void; readonly onBack: () => void }
type Phase = 'capture' | 'distribute' | 'night' | 'result';
const ASSET_ROOT = '/assets/minigames/solar/';
const PANEL_ANGLES = [5, 16, 35, 50] as const;
const SYSTEMS: SystemId[] = ['communications', 'shelter', 'laboratory'];
const MAX_CELLS = 13;
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
  const [selectedSystem, setSelectedSystem] = useState<SystemId>('communications');
  const [nightTick, setNightTick] = useState(0);
  const [switchMoving, setSwitchMoving] = useState(false);
  const rewardClaimed = useRef(false);

  const day = AREQUIPA_SOLAR_RECORDS.days[selectedDayIndex] ?? AREQUIPA_SOLAR_RECORDS.days[0];
  const capture = captureEnergy(day.irradianceKwhPerM2, tiltAngle);
  const circuitClosed = phase !== 'capture';
  const available = capture.units - assignedUnits(allocation);
  const result = evaluate(allocation, capture.units, circuitClosed);
  const nightRemaining = remainingNightEnergy(allocation, nightTick);
  const nightSystems = nightSystemEnergy(allocation, nightTick);
  const batteryUnits = phase === 'capture' ? 0 : phase === 'distribute' ? nightEnergy(allocation) : nightRemaining;
  const batteryPercent = Math.round(batteryUnits / Math.max(capture.units, 1) * 100);
  const isNight = phase === 'night' || (phase === 'result' && !result.passed);
  const hasPower = phase === 'result' && result.passed;
  const stage = nightTick <= 2 ? 'dusk' : nightTick <= 5 ? 'midnight' : 'predawn';

  useEffect(() => {
    if (phase !== 'night') return;
    const timer = window.setInterval(() => setNightTick((tick) => Math.min(7, tick + 1)), 850);
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (phase === 'night' && nightTick === 7) setPhase('result');
  }, [phase, nightTick]);
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
    setSelectedSystem('communications');
    rewardClaimed.current = false;
  }
  function adjustAngle(angle: number) { if (phase === 'capture') setTiltAngle(angle); }
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
    if (phase !== 'result' || !result.passed || rewardClaimed.current) return;
    rewardClaimed.current = true;
    const cost = calculateTrainingCost('SOLAR_DETECTIVE', result.reservePercent);
    onComplete(createTrainingOutcome('SOLAR_DETECTIVE', tr('outcomeDecision', { reserve: result.reservePercent }), 'energy', cost, tr('outcomeConsequence')));
  }

  const batterySprite = batteryUnits === 0 ? 'battery-empty.png' : phase === 'night' ? 'battery-charging.png' : 'battery-charged.png';
  const instruction = phase === 'capture' ? tr('captureInstruction') : phase === 'distribute' ? tr('distributeInstruction') : phase === 'night' ? tr('nightInstruction') : result.passed ? tr('missionSuccess') : tr('missionFailure');
  const systemPowered = (system: SystemId) => {
    if (phase === 'capture') return false;
    if (system === 'laboratory') return allocation.laboratory >= 3 && (phase === 'distribute' || (phase === 'result' && result.passed));
    if (phase === 'distribute') return allocation[system] >= DEMAND[system];
    if (phase === 'result') return system === 'communications' ? result.communicationsNight : result.shelterNight;
    return system === 'communications' ? allocation.communications >= DEMAND.communications : allocation.shelter >= DEMAND.shelter;
  };

  return <div className="earth-screen solar-game solar-game--puzzle">
    <header className="earth-screen__header solar-game__header">
      <button type="button" className="earth-screen__back-btn" onClick={onBack}><ArrowLeft weight="bold" />{tr('back')}</button>
      <span className="earth-screen__progress-pill">{tr('pill')}</span>
      <LanguageSelector variant="hud" />
    </header>
    <main className="solar-game__main">
      <div className="solar-game__intro"><div><h1>{tr('gameTitle')}</h1><p>{tr('missionPrompt')}</p></div><div className="solar-game__days" role="group" aria-label={tr('chooseDay')}>{AREQUIPA_SOLAR_RECORDS.days.map((record, index) => <button key={record.date} type="button" className={selectedDayIndex === index ? 'is-selected' : ''} aria-pressed={selectedDayIndex === index} onClick={() => resetDay(index)}><span>{record.date}</span><strong>{record.irradianceKwhPerM2} kWh/m²</strong></button>)}</div></div>
      <section className={`solar-game__scene solar-game__scene--game solar-game__scene--${phase} solar-game__scene--${stage} ${isNight ? 'is-night' : ''} ${hasPower ? 'is-success is-dawn' : ''} ${phase === 'result' && !result.passed ? 'is-failure' : ''}`} aria-label={tr('circuitScene')}>
        <div className="solar-game__window" aria-hidden="true"><span className="solar-game__window-light" /></div>
        <div className="solar-game__sky">{isNight ? <MoonStars size={18} /> : <Sun size={18} weight="fill" />}{isNight ? tr('night') : tr('day')}{phase === 'night' && <span>· {tr(`stage.${stage}`)}</span>}</div>
        <div className="solar-game__ceiling-lamp" aria-hidden="true" /><div className="solar-game__power-conduit" aria-hidden="true" />
        <div className="solar-game__sunbeam" aria-hidden="true" />
        <div className="solar-game__equipment">
          <div className="solar-game__device solar-game__panel"><button type="button" className="solar-game__sprite-button" onClick={() => adjustAngle(PANEL_ANGLES[(PANEL_ANGLES.indexOf(tiltAngle as typeof PANEL_ANGLES[number]) + 1) % PANEL_ANGLES.length])} disabled={phase !== 'capture'} aria-label={tr('rotatePanel')} title={tr('rotatePanel')}><img key={panelSprite(tiltAngle)} src={`${ASSET_ROOT}${panelSprite(tiltAngle)}`} alt="" draggable="false" /></button><strong>{tr('panel')}</strong><small>{tiltAngle}° · {capture.kwh} kWh</small><span className="solar-game__capture-track" role="meter" aria-label={tr('capture')} aria-valuemin={0} aria-valuemax={13} aria-valuenow={capture.units}><span style={{ width: `${Math.min(capture.units, 13) / 13 * 100}%` }} /></span></div>
          <div className="solar-game__device solar-game__switch"><button type="button" className="solar-game__sprite-button" onClick={toggleCircuit} disabled={isNight || phase === 'result'} aria-pressed={circuitClosed} aria-label={circuitClosed ? tr('openCircuit') : tr('closeCircuit')}><img src={`${ASSET_ROOT}${switchMoving ? 'switch-transition.png' : circuitClosed ? 'switch-closed.png' : 'switch-open.png'}`} alt="" draggable="false" /></button><strong>{tr('switch')}</strong><small>{circuitClosed ? tr('closed') : tr('open')}</small></div>
          <div className="solar-game__device solar-game__battery"><div className="solar-game__battery-art"><img src={`${ASSET_ROOT}${batterySprite}`} alt="" draggable="false" /><div className="solar-game__battery-display" role="progressbar" aria-label={tr('battery')} aria-valuemin={0} aria-valuemax={capture.units} aria-valuenow={batteryUnits}><div className="solar-game__battery-fill" style={{ width: `${batteryPercent}%` }} /><span>{batteryUnits} kWh</span></div></div><strong>{tr('battery')}</strong><small>{phase === 'capture' ? tr('capturedUnits', { count: capture.units }) : phase === 'distribute' ? tr('nightReserveUnits', { count: batteryUnits }) : tr('nightRemaining', { count: batteryUnits })}</small></div>
        </div>
        <div className="solar-game__workbench" aria-hidden="true" />
        <div className="solar-game__game-hud"><p className="solar-game__scene-feedback" aria-live="polite">{instruction}</p>
          {phase === 'capture' && <div className="solar-game__capture-summary"><span>{tr('captureResult', { count: capture.units, kwh: capture.kwh })}</span><span>{tr('orientationFactor', { count: capture.efficiencyPercent })}</span></div>}
          {phase !== 'capture' && <div className="solar-game__distribution-board"><div className="solar-game__energy-bank"><strong>{phase === 'distribute' ? tr('availableEnergy', { count: available }) : tr('nightRemaining', { count: nightRemaining })}</strong><div className="solar-game__energy-cells" role="group" aria-label={tr('energyBank')}>{Array.from({ length: MAX_CELLS }, (_, index) => <button key={index} type="button" className={index < available && phase === 'distribute' ? 'is-full' : ''} disabled={phase !== 'distribute' || index >= available} onClick={() => changeAllocation(selectedSystem, 1)} aria-label={tr('transferCell', { system: tr(`system.${selectedSystem}`) })} title={tr('transferCell', { system: tr(`system.${selectedSystem}`) })} />)}</div><small>{tr('selectedStation', { system: tr(`system.${selectedSystem}`) })}</small></div><div className="solar-game__systems" aria-label={tr('distribution')}>{SYSTEMS.map((system) => { const visibleUnits = phase === 'night' ? system === 'communications' ? nightSystems.communications : system === 'shelter' ? nightSystems.shelter : 0 : allocation[system]; const label = system === 'laboratory' ? `${tr(`system.${system}`)} · ${tr('optional')}` : tr(`system.${system}`); return <div key={system} className={`solar-game__system ${selectedSystem === system ? 'is-selected' : ''} ${systemPowered(system) ? 'is-powered' : ''} ${isNight && !systemPowered(system) ? 'is-unpowered' : ''}`}><button type="button" className="solar-game__system-main" onClick={() => setSelectedSystem(system)} disabled={phase !== 'distribute'} aria-label={tr('selectSystem', { system: tr(`system.${system}`) })} aria-pressed={selectedSystem === system}><span className="solar-game__system-light" aria-hidden="true" /><strong>{label}</strong><span>{phase === 'night' ? `${visibleUnits} kWh` : `${visibleUnits}/${DEMAND[system]}`}</span></button><div className="solar-game__system-cells" aria-hidden="true">{Array.from({ length: DEMAND[system] }, (_, index) => <span key={index} className={index < visibleUnits ? 'is-full' : ''} />)}</div>{phase === 'distribute' && <button type="button" className="solar-game__system-remove" onClick={() => changeAllocation(system, -1)} disabled={allocation[system] === 0} aria-label={tr('removeUnit', { system: tr(`system.${system}`) })}>−</button>}</div>; })}</div></div>}
          {phase === 'night' && <div className="solar-game__night-progress"><div className="solar-game__night-timeline" role="progressbar" aria-label={tr('nightProgress')} aria-valuenow={nightTick} aria-valuemin={0} aria-valuemax={7}>{Array.from({ length: 7 }, (_, index) => <span key={index} className={index < nightTick ? 'is-past' : index === nightTick ? 'is-current' : ''} />)}</div><strong>{tr('nightStep', { current: nightTick, total: 7 })}</strong></div>}
        </div>
      </section>
      <div className="solar-game__game-actions">{phase === 'capture' && <details className="solar-game__alternate"><summary>{tr('preciseControl')}</summary><label htmlFor="tilt-angle-slider">{tr('tiltLabel')} {tiltAngle}°</label><input id="tilt-angle-slider" type="range" min="0" max="50" value={tiltAngle} onChange={(event) => adjustAngle(Number(event.target.value))} /></details>}{phase === 'distribute' && <><span>{tr('distributionHint')} {tr('optionalLab')}</span><button type="button" className="solar-game__primary" onClick={startNight} disabled={assignedUnits(allocation) === 0}>{tr('startNight')}</button></>}{phase === 'result' && !result.passed && <button type="button" className="solar-game__primary" onClick={() => { setPhase('distribute'); setNightTick(0); }}>{tr('retryDistribution')}</button>}{phase === 'result' && result.passed && <><span>{tr(`grade.${result.grade}`)}</span><button type="button" className="solar-game__primary" onClick={claimReward}>{tr('claimReward', { cost: calculateTrainingCost('SOLAR_DETECTIVE', result.reservePercent) })}</button></>}</div>
      {phase === 'result' && <p className={`solar-game__explanation ${result.passed ? 'is-success' : ''}`} role="status">{result.passed ? tr('winExplanation', { reserve: result.reservePercent }) : !result.communicationsDay ? tr('failCommunicationsDay') : !result.communicationsNight ? tr('failCommunicationsNight') : tr('failShelter')}{result.passed && allocation.laboratory >= 3 ? ` ${tr('labBonus')}` : ''}</p>}
      <details className="solar-game__science"><summary><Info size={18} />{tr('scienceDetails')}</summary><p>{tr('scientificNote', { irradiance: day.irradianceKwhPerM2 })} {tr('educationalNote')} {tr('unitExplanation')}</p><p><a href={day.observation.sourceUrl} target="_blank" rel="noreferrer">NASA POWER · {day.observation.recordId}</a></p></details>
    </main>
  </div>;
}
