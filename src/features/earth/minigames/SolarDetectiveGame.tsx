import { useEffect, useRef, useState } from 'react';
import { Atom, Minus, MoonStars, Plus, Sun, X } from '@phosphor-icons/react';
import type { TrainingOutcome } from '../../../game';
import { AREQUIPA_SOLAR_RECORDS } from '../../../data/nasa/powerData';
import { useI18n } from '../../../i18n';
import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import { allocate, assignedUnits, captureEnergy, DEMAND, EMPTY_ALLOCATION, evaluate, nightEnergy, nightSystemEnergy, remainingNightEnergy, type Allocation, type SystemId } from './solarEnergy';
import { MinigameShell } from './ui/MinigameShell';
import { useScreenRadio } from '../../radio';
import './solar-detective.css';

interface Props { readonly onComplete: (outcome: TrainingOutcome) => void; readonly onBack: () => void }
type Phase = 'capture' | 'distribute' | 'night' | 'result';
const ASSET_ROOT = '/assets/minigames/solar/';
const OBSERVATORY = '/assets/pixel-art/andean-solar-observatory.png';
const PANEL_ANGLES = [5, 16, 35, 50] as const;
const SYSTEMS: SystemId[] = ['communications', 'shelter', 'laboratory'];
const MAX_CELLS = 13;
const SAFE = { x0: 40, x1: 960, y0: 20, y1: 456 };
const pos = (x: number, y: number) => ({ left: `${x / 10}%`, top: `${y / 5.63}%` });

function panelSprite(angle: number) {
  if (angle < 8) return 'panel-flat.png';
  if (angle < 25) return 'panel-tilted.png';
  if (angle < 43) return 'panel-raised.png';
  return 'panel-steep.png';
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false));
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export function SolarDetectiveGame({ onComplete, onBack }: Props) {
  const { t } = useI18n();
  const tr = (key: string, params?: Record<string, string | number>) => t(`minigames.solarDetective.${key}`, params);
  // La tarea y un consejo llegan por radio, como en el resto de entrenamientos.
  useScreenRadio([
    { speaker: 'CHISPA', text: t('training.solarDetective.task') },
    { speaker: 'AURORA', text: t('training.solarDetective.tip') },
  ]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(5);
  const [phase, setPhase] = useState<Phase>('capture');
  const [allocation, setAllocation] = useState<Allocation>(EMPTY_ALLOCATION);
  const [selectedSystem, setSelectedSystem] = useState<SystemId>('communications');
  const [nightTick, setNightTick] = useState(0);
  const [switchMoving, setSwitchMoving] = useState(false);
  const [scienceOpen, setScienceOpen] = useState(false);
  const rewardClaimed = useRef(false);
  const phone = useMediaQuery('(max-width: 760px)');

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
  const aligned = Math.abs(tiltAngle - 16) <= 6;

  useEffect(() => {
    if (phase !== 'night') return undefined;
    const timer = window.setInterval(() => setNightTick((tick) => Math.min(7, tick + 1)), 850);
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (phase === 'night' && nightTick === 7) setPhase('result');
  }, [phase, nightTick]);
  useEffect(() => {
    if (!switchMoving) return undefined;
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
  const explanation = phase === 'result'
    ? `${result.passed ? tr('winExplanation', { reserve: result.reservePercent }) : !result.communicationsDay ? tr('failCommunicationsDay') : !result.communicationsNight ? tr('failCommunicationsNight') : tr('failShelter')}${result.passed && allocation.laboratory >= 3 ? ` ${tr('labBonus')}` : ''}`
    : '';

  const daysCard = (
    <div className={phone ? 'sd-days sd-days--inline' : 'mg-card sd-days'} role="group" aria-label={tr('chooseDay')}>
      {AREQUIPA_SOLAR_RECORDS.days.map((record, index) => (
        <button key={record.date} type="button" className={selectedDayIndex === index ? 'is-selected' : ''} aria-pressed={selectedDayIndex === index} onClick={() => resetDay(index)}>
          <span>{record.date}</span><strong>{record.irradianceKwhPerM2} kWh/m²</strong>
        </button>
      ))}
    </div>
  );

  const room = (
    <div className={`sd-room sd-room--${phase} sd-room--${stage}${isNight ? ' is-night' : ''}${hasPower ? ' is-dawn' : ''}${phase === 'result' && !result.passed ? ' is-failure' : ''}`} aria-label={tr('circuitScene')} role="group">
      <div className="sd-wall" aria-hidden="true" />
      <div className="sd-window" aria-hidden="true">
        <span className="sd-window__sky" />
        <span className="sd-window__stars" />
        <span className="sd-window__orb">{isNight ? <MoonStars weight="fill" /> : <Sun weight="fill" />}</span>
        <img src={OBSERVATORY} alt="" draggable={false} />
      </div>
      <div className="sd-lamp" aria-hidden="true" />
      <div className="sd-beam" aria-hidden="true" style={{ ['--tilt' as string]: `${tiltAngle}deg` }} />
      <div className="sd-bench" aria-hidden="true" />
      <div className={`sd-conduit${circuitClosed && phase !== 'night' && !hasPower ? ' is-live' : ''}${(phase === 'night' || hasPower) && batteryUnits > 0 ? ' is-night-live' : ''}`} aria-hidden="true" />

      <div className="sd-sky-tag mg-tag" style={pos(690, 96)}>{isNight ? <MoonStars weight="fill" aria-hidden="true" /> : <Sun weight="fill" aria-hidden="true" />}<span>{isNight ? tr('night') : tr('day')}</span>{phase === 'night' && <small>{tr(`stage.${stage}`)}</small>}</div>

      {/* Panel solar */}
      <div className={`sd-device sd-device--panel${aligned ? ' is-aligned' : ''}`} style={pos(205, 372)}>
        <button type="button" className="sd-sprite" data-sd="panel" onClick={() => adjustAngle(PANEL_ANGLES[(PANEL_ANGLES.indexOf(tiltAngle as typeof PANEL_ANGLES[number]) + 1) % PANEL_ANGLES.length])} disabled={phase !== 'capture'} aria-label={tr('rotatePanel')} title={tr('rotatePanel')}>
          <img key={panelSprite(tiltAngle)} src={`${ASSET_ROOT}${panelSprite(tiltAngle)}`} alt="" draggable={false} />
        </button>
      </div>
      <span className="mg-tag sd-tag" style={pos(205, 398)}><span>{tr('panel')}</span><small>{tiltAngle}° · {capture.kwh} kWh</small></span>
      <div className="sd-angles" style={pos(205, 438)} role="group" aria-label={tr('rotatePanel')}>
        {PANEL_ANGLES.map((angle) => (
          <button key={angle} type="button" className={tiltAngle === angle ? 'is-selected' : ''} aria-pressed={tiltAngle === angle} disabled={phase !== 'capture'} onClick={() => adjustAngle(angle)}>{angle}°</button>
        ))}
      </div>

      {/* Interruptor */}
      <div className="sd-device sd-device--switch" style={pos(500, 372)}>
        <button type="button" className="sd-sprite" data-sd="switch" onClick={toggleCircuit} disabled={isNight || phase === 'result'} aria-pressed={circuitClosed} aria-label={circuitClosed ? tr('openCircuit') : tr('closeCircuit')}>
          <img src={`${ASSET_ROOT}${switchMoving ? 'switch-transition.png' : circuitClosed ? 'switch-closed.png' : 'switch-open.png'}`} alt="" draggable={false} />
        </button>
      </div>
      <span className={`mg-tag sd-tag${circuitClosed ? ' mg-tag--on' : ''}`} style={pos(500, 398)}><span>{tr('switch')}</span><small>{circuitClosed ? tr('closed') : tr('open')}</small></span>

      {/* Batería */}
      <div className={`sd-device sd-device--battery${phase === 'night' && batteryUnits > 0 ? ' is-charging' : ''}`} style={pos(795, 372)}>
        <div className="sd-battery-art">
          <img src={`${ASSET_ROOT}${batterySprite}`} alt="" draggable={false} />
          <div className="sd-battery-display" role="progressbar" aria-label={tr('battery')} aria-valuemin={0} aria-valuemax={capture.units} aria-valuenow={batteryUnits}>
            <div className="sd-battery-fill" style={{ width: `${batteryPercent}%` }} /><span>{batteryUnits} kWh</span>
          </div>
        </div>
      </div>
      <span className="mg-tag sd-tag" style={pos(795, 398)}><span>{tr('battery')}</span><small>{phase === 'capture' ? tr('capturedUnits', { count: capture.units }) : phase === 'distribute' ? tr('nightReserveUnits', { count: batteryUnits }) : tr('nightRemaining', { count: batteryUnits })}</small></span>
    </div>
  );

  return (
    <MinigameShell
      className={`sd sd--${phase}`}
      title={tr('gameTitle')}
      subtitle="NASA POWER · Arequipa"
      backLabel={t('common.back')}
      onBack={onBack}
      stage={{ safe: SAFE, reserveTop: phone ? 112 : 0, reserveBottom: phone ? 392 : 222 }}
      stageContent={room}
      hudExtra={<button type="button" className="sd-science-btn" onClick={() => setScienceOpen((open) => !open)} aria-expanded={scienceOpen} title={tr('scienceDetails')}><Atom weight="bold" aria-hidden="true" />{t('map.scienceData')}</button>}
    >
      {!phone && daysCard}

      {scienceOpen && (
        <aside className="mg-card sd-science" aria-label={tr('scienceDetails')}>
          <button type="button" className="sd-science__close" onClick={() => setScienceOpen(false)} aria-label={t('common.close')}><X weight="bold" /></button>
          <span className="mg-kicker">{tr('scienceDetails')}</span>
          <p>{tr('scientificNote', { irradiance: day.irradianceKwhPerM2 })}</p>
          <p>{tr('educationalNote')} {tr('unitExplanation')}</p>
          <p><a href={day.observation.sourceUrl} target="_blank" rel="noreferrer">NASA POWER · {day.observation.recordId}</a></p>
        </aside>
      )}

      <section className={`mg-card sd-dock${phase === 'result' ? (result.passed ? ' mg-card--success' : ' mg-card--danger') : ''}`} data-phase={phase}>
        {phone && daysCard}
        <p className="sd-dock__status" role="status">{instruction}</p>

        {phase === 'capture' && (
          <div className="sd-capture">
            <div className="sd-capture__slider">
              <label htmlFor="tilt-angle-slider">{tr('tiltLabel')} <strong>{tiltAngle}°</strong></label>
              <input id="tilt-angle-slider" type="range" min="0" max="50" value={tiltAngle} onChange={(event) => adjustAngle(Number(event.target.value))} aria-label={tr('preciseControl')} />
              <span className={`sd-hint${aligned ? ' is-ok' : ''}`}>{aligned ? tr('aligned') : tr('aimFor16')}</span>
            </div>
            <div className="sd-capture__chips">
              <span className="sd-chip">{tr('captureResult', { count: capture.units, kwh: capture.kwh })}</span>
              <span className="sd-chip">{tr('orientationFactor', { count: capture.efficiencyPercent })}</span>
            </div>
            <button type="button" className="pixel-btn pixel-btn--primary sd-primary" data-sd="close" onClick={toggleCircuit}>{tr('closeCircuit')}</button>
          </div>
        )}

        {phase !== 'capture' && (
          <div className="sd-board">
            <div className="sd-bank">
              <strong>{phase === 'distribute' ? tr('availableEnergy', { count: available }) : tr('nightRemaining', { count: nightRemaining })}</strong>
              <div className="sd-bank__cells" role="group" aria-label={tr('energyBank')}>
                {Array.from({ length: MAX_CELLS }, (_, index) => (
                  <button key={index} type="button" className={index < available && phase === 'distribute' ? 'is-full' : ''} disabled={phase !== 'distribute' || index >= available} onClick={() => changeAllocation(selectedSystem, 1)} aria-label={tr('transferCell', { system: tr(`system.${selectedSystem}`) })} title={tr('transferCell', { system: tr(`system.${selectedSystem}`) })} />
                ))}
              </div>
              <small>{tr('selectedStation', { system: tr(`system.${selectedSystem}`) })}</small>
            </div>

            <div className="sd-systems" aria-label={tr('distribution')}>
              {SYSTEMS.map((system) => {
                const visibleUnits = phase === 'night' ? system === 'communications' ? nightSystems.communications : system === 'shelter' ? nightSystems.shelter : 0 : allocation[system];
                const label = system === 'laboratory' ? `${tr(`system.${system}`)} · ${tr('optional')}` : tr(`system.${system}`);
                return (
                  <div key={system} data-system={system} className={`sd-system${selectedSystem === system ? ' is-selected' : ''}${systemPowered(system) ? ' is-powered' : ''}${isNight && !systemPowered(system) ? ' is-unpowered' : ''}`}>
                    <button type="button" className="sd-system__main" onClick={() => setSelectedSystem(system)} disabled={phase !== 'distribute'} aria-label={tr('selectSystem', { system: tr(`system.${system}`) })} aria-pressed={selectedSystem === system}>
                      <span className="sd-system__light" aria-hidden="true" /><strong>{label}</strong><span>{phase === 'night' ? `${visibleUnits} kWh` : `${visibleUnits}/${DEMAND[system]}`}</span>
                    </button>
                    <div className="sd-system__cells" aria-hidden="true">{Array.from({ length: DEMAND[system] }, (_, index) => <span key={index} className={index < visibleUnits ? 'is-full' : ''} />)}</div>
                    {phase === 'distribute' && (
                      <div className="sd-system__steps">
                        <button type="button" onClick={() => changeAllocation(system, -1)} disabled={allocation[system] === 0} aria-label={tr('removeUnit', { system: tr(`system.${system}`) })}><Minus weight="bold" /></button>
                        <button type="button" onClick={() => { setSelectedSystem(system); changeAllocation(system, 1); }} disabled={available <= 0 || allocation[system] >= DEMAND[system]} aria-label={tr('addUnit', { system: tr(`system.${system}`) })}><Plus weight="bold" /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="sd-side">
              {phase === 'distribute' && <>
                <span className="sd-hint">{tr('distributionHint')} {tr('optionalLab')}</span>
                <button type="button" className="pixel-btn pixel-btn--primary sd-primary" data-sd="night" onClick={startNight} disabled={assignedUnits(allocation) === 0}>{tr('startNight')}</button>
              </>}
              {phase === 'night' && (
                <div className="sd-night">
                  <div className="sd-night__timeline" role="progressbar" aria-label={tr('nightProgress')} aria-valuenow={nightTick} aria-valuemin={0} aria-valuemax={7}>{Array.from({ length: 7 }, (_, index) => <span key={index} className={index < nightTick ? 'is-past' : index === nightTick ? 'is-current' : ''} />)}</div>
                  <strong>{tr('nightStep', { current: nightTick, total: 7 })}</strong>
                </div>
              )}
              {phase === 'result' && <>
                {result.passed && <span className="sd-grade">{tr(`grade.${result.grade}`)}</span>}
                {!result.passed && <button type="button" className="pixel-btn pixel-btn--primary sd-primary" data-sd="retry" onClick={() => { setPhase('distribute'); setNightTick(0); }}>{tr('retryDistribution')}</button>}
                {result.passed && <button type="button" className="pixel-btn pixel-btn--primary sd-primary" data-sd="claim" onClick={claimReward}>{tr('claimReward', { cost: calculateTrainingCost('SOLAR_DETECTIVE', result.reservePercent) })}</button>}
              </>}
            </div>
          </div>
        )}

        {phase === 'result' && <p className={`sd-explanation${result.passed ? ' is-success' : ''}`}>{explanation}</p>}
      </section>
    </MinigameShell>
  );
}
