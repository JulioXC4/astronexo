import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ArrowCounterClockwise, Atom, BatteryCharging, Broadcast, CheckCircle, DoorOpen, LockKey, ShieldCheck, Siren, Warning, X } from '@phosphor-icons/react';
import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { DONKI_HISTORICAL_EVENTS } from '../../../data/nasa/donkiData';
import { useI18n } from '../../../i18n';
import { initialStormState, stormFailure, stormReducer, type StormAction } from './solarStormLogic';
import { MinigameShell } from './ui/MinigameShell';
import { useScreenRadio } from '../../radio';
import './solarStorm.css';

interface Props { readonly onComplete: (outcome: TrainingOutcome) => void; readonly onBack: () => void }
const ASSET = '/assets/minigames/solar-storm/';
const ROOM = '/assets/pixel-art/airlock-refuge.webp';
const CREW_SPRITE = { A: '/assets/pixel-art/cadet-alba.webp', B: '/assets/pixel-art/engineer-nico.webp' } as const;


/** Coordenadas en el lienzo lógico 1000 × 563 del cuarto de refugio. */
const STATION_AT = { alarm: { x: 500, y: 76 }, hatch: { x: 500, y: 250 }, telemetry: { x: 272, y: 286 }, backup: { x: 738, y: 168 } } as const;
const CREW_AT = { A: { out: 120, in: 410 }, B: { out: 880, in: 590 } } as const;
const CREW_Y = 470;
const PACKET_AT = [{ x: 236, y: 262 }, { x: 306, y: 262 }] as const;
const SAFE = { x0: 40, x1: 960, y0: 50, y1: 540 };

type Crew = 'A' | 'B';
/** Siguiente objetivo de la operación, en el orden en que se resuelve: alarma → tripulación → respaldo → compuerta → antena → llegada. */
type StormTarget = 'alarm' | 'crewA' | 'crewB' | 'route' | 'backup' | 'hatch' | 'telemetry' | 'impact';
/** Foco de luz (lienzo lógico 1000 × 563): centro y radio. Con `impact` no hay foco: el botón de la barra inferior lleva la guía. */
const SPOT: Record<Exclude<StormTarget, 'impact' | 'route'>, { x: number; y: number; r: number }> = {
  alarm: { ...STATION_AT.alarm, r: 120 },
  hatch: { ...STATION_AT.hatch, r: 200 },
  telemetry: { ...STATION_AT.telemetry, r: 170 },
  backup: { ...STATION_AT.backup, r: 160 },
  crewA: { x: CREW_AT.A.out, y: CREW_Y - 90, r: 140 },
  crewB: { x: CREW_AT.B.out, y: CREW_Y - 90, r: 140 },
};
const STATION_ICON = { alarm: Siren, hatch: DoorOpen, telemetry: Broadcast, backup: BatteryCharging } as const;
const pos = (x: number, y: number) => ({ left: `${x / 10}%`, top: `${y / 5.63}%` });

export function SolarWatchGame({ onComplete, onBack }: Props) {
  const { t } = useI18n();
  const tr = (key: string) => t(`minigames.solarWatchCopy.${key}`);
  // La tarea y un consejo llegan por radio, como en el resto de entrenamientos.
  useScreenRadio([
    { speaker: 'CHISPA', text: t('training.solarWatch.task') },
    { speaker: 'AURORA', text: t('training.solarWatch.tip') },
  ]);
  const [state, dispatch] = useReducer(stormReducer, undefined, () => initialStormState());
  const [eventIndex, setEventIndex] = useState(0);
  const [routeFor, setRouteFor] = useState<Crew | null>(null);
  const [scienceOpen, setScienceOpen] = useState(false);
  // Orden visual de las rutas por astronauta: solo presentación, la lógica no cambia.
  const [freeFirst, setFreeFirst] = useState<Record<Crew, boolean>>(() => ({ A: Math.random() < 0.5, B: Math.random() < 0.5 }));
  const completed = useRef(false);
  const event = DONKI_HISTORICAL_EVENTS[eventIndex] ?? DONKI_HISTORICAL_EVENTS[0];
  const failure = stormFailure(state);
  const safe = state.phase === 'result' && !failure;
  const failed = state.phase === 'result' && !!failure;
  const active = state.phase === 'preparation';
  const act = (action: StormAction) => dispatch(action);
  const reset = () => { dispatch('reset'); completed.current = false; setRouteFor(null); setFreeFirst({ A: Math.random() < 0.5, B: Math.random() < 0.5 }); };

  useEffect(() => {
    if (state.phase !== 'impact') return undefined;
    const timer = window.setTimeout(() => dispatch('resolve'), 1600);
    return () => window.clearTimeout(timer);
  }, [state.phase]);
  useEffect(() => {
    if (!active) setRouteFor(null);
  }, [active]);
  useEffect(() => {
    if (!routeFor) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setRouteFor(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [routeFor]);

  const tool = useMemo(
    () => createTrainingOutcome('SOLAR_WATCH', `Protocolo CME ${eventIndex + 1}`, 'energy', calculateTrainingCost('SOLAR_WATCH', eventIndex), 'El refugio suspende operaciones durante la prueba.'),
    [eventIndex],
  );
  const inside = { A: state.crewA, B: state.crewB };
  const total = state.mode === 'intro' ? 8 : 7;
  const message = state.phase === 'impact' ? tr('arrivalHint') : state.phase === 'result' ? tr('resultHint') : tr(state.feedback === 'start' ? 'startHint' : state.feedback);
  const bad = (key: string) => failed && failure === key;
  const target: StormTarget | null = !active ? null
    : !state.alarm ? 'alarm'
      : routeFor ? 'route'
        : !state.crewA ? 'crewA'
          : !state.crewB ? 'crewB'
            : !state.backup ? 'backup'
              : !state.hatch ? 'hatch'
                : !state.telemetry ? 'telemetry'
                  : 'impact';
  const spot = target && target !== 'impact' ? SPOT[target === 'route' ? (routeFor === 'B' ? 'crewB' : 'crewA') : target] : null;

  const stationLabel = (id: 'alarm' | 'hatch' | 'telemetry' | 'backup') => {
    if (id === 'alarm') return [tr('alarm'), state.alarm ? tr('on') : tr('off')] as const;
    if (id === 'hatch') return [tr('hatchDoor'), state.hatch ? tr('locked') : tr('open')] as const;
    if (id === 'telemetry') return [tr('telemetry'), state.telemetry ? tr('protected') : tr('deployed')] as const;
    return [tr('backup'), state.backup ? tr('backupReady') : tr('backupOff')] as const;
  };
  const stationOn = { alarm: state.alarm, hatch: state.hatch, telemetry: state.telemetry, backup: state.backup };
  const stationAction: Record<'alarm' | 'hatch' | 'telemetry' | 'backup', StormAction> = { alarm: 'alarm', hatch: 'hatch', telemetry: 'telemetry', backup: 'backup' };
  const sprite = {
    alarm: `${ASSET}storm-alarm-${state.alarm ? 'on' : 'off'}.webp`,
    hatch: `${ASSET}storm-hatch-${state.hatch ? 'locked' : 'open'}.webp`,
    telemetry: `${ASSET}storm-telemetry-deployed.webp`,
    backup: '',
  };
  const stationBad = { alarm: bad('noAlarm'), hatch: bad('hatchOpen'), telemetry: bad('antennaExposed'), backup: bad('noBackup') };

  const stage = (
    <>
      <div className="storm-fx storm-fx--alert" aria-hidden="true" />
      <div className="storm-fx storm-fx--wave" aria-hidden="true" />
      <div className="storm-fx storm-fx--flash" aria-hidden="true" />
      {/* Atenúa el cuarto salvo el objetivo actual: el niño ve primero lo que debe tocar */}
      <div
        className={`storm-dim${spot ? ' is-on' : ''}`}
        style={spot ? { ['--sx' as string]: `${spot.x / 10}%`, ['--sy' as string]: `${spot.y / 5.63}%`, ['--sr' as string]: spot.r } : undefined}
        aria-hidden="true"
      />

      {/* Compuerta del refugio */}
      <div className={`storm-door${state.hatch ? ' is-locked' : ''}${stationBad.hatch ? ' is-bad' : ''}`} style={pos(STATION_AT.hatch.x, STATION_AT.hatch.y)} aria-hidden="true">
        {state.hatch && <span className="storm-door__lock"><LockKey weight="fill" /></span>}
      </div>
      {/* Respaldo de energía */}
      <div className={`storm-power${state.backup ? ' is-ready' : ''}${stationBad.backup ? ' is-bad' : ''}`} style={pos(STATION_AT.backup.x, STATION_AT.backup.y)} aria-hidden="true" />
      {/* Escudo de telemetría */}
      <div className={`storm-shield${state.telemetry ? ' is-up' : ''}${!state.telemetry && active ? ' is-exposed' : ''}${stationBad.telemetry ? ' is-bad' : ''}`} style={pos(STATION_AT.telemetry.x, STATION_AT.telemetry.y)} aria-hidden="true">
        {state.telemetry ? <ShieldCheck weight="fill" /> : <Broadcast weight="bold" />}
      </div>
      {/* Baliza de alarma */}
      <div className={`storm-beacon${state.alarm ? ' is-on' : ''}${stationBad.alarm ? ' is-bad' : ''}`} style={pos(STATION_AT.alarm.x, STATION_AT.alarm.y)} aria-hidden="true"><Siren weight="fill" /></div>

      {/* Estaciones interactivas */}
      {(['alarm', 'hatch', 'telemetry', 'backup'] as const).map((id) => {
        const [name, status] = stationLabel(id);
        const Icon = STATION_ICON[id];
        const here = target === id;
        return (
          <div key={id} className="storm-station" style={pos(STATION_AT[id].x, STATION_AT[id].y)}>
            <button
              type="button"
              className={`storm-hit storm-hit--${id}`}
              data-station={id}
              data-on={stationOn[id] || undefined}
              data-target={here || undefined}
              data-guide-below={(here && id === 'alarm') || undefined}
              disabled={!active}
              aria-label={`${name}: ${status}`}
              onClick={() => act(stationAction[id])}
            />
            <span className={`mg-tag storm-tag storm-tag--${id}${here ? '' : ' storm-tag--compact'}${stationOn[id] ? ' mg-tag--on' : ''}${stationBad[id] ? ' mg-tag--bad' : ''}`}>
              {sprite[id] ? <img src={sprite[id]} alt="" draggable={false} /> : <Icon weight="fill" aria-hidden="true" />}
              <span>{name}</span><small>{status}</small>
              {stationOn[id] && <CheckCircle className="storm-tag__check" weight="fill" aria-hidden="true" />}
            </span>
          </div>
        );
      })}

      {/* Paquetes de datos */}
      {PACKET_AT.map((at, index) => {
        const collected = index < state.packets;
        if (collected) return null;
        const lost = state.telemetry || state.phase === 'result' || state.phase === 'impact';
        return (
          <button
            key={index}
            type="button"
            className={`storm-packet${lost ? ' is-lost' : ''}`}
            data-packet={index}
            style={pos(at.x, at.y)}
            disabled={!active || state.telemetry || state.packets >= 2}
            aria-label={`${tr('packet')} · ${state.packets}/2`}
            onClick={() => act('packet')}
          />
        );
      })}

      {/* Tripulación */}
      {(['A', 'B'] as const).map((crew) => {
        const isIn = inside[crew];
        const x = isIn ? CREW_AT[crew].in : CREW_AT[crew].out;
        const out = failed && failure === 'crewOutside' && !isIn;
        return (
          <div key={crew} className={`storm-crew${isIn ? ' is-inside' : ''}${out ? ' is-bad' : ''}${routeFor === crew ? ' is-picking' : ''}`} style={{ ...pos(x, CREW_Y), ['--face' as string]: crew === 'A' ? 1 : -1 }}>
            <button
              type="button"
              className="storm-crew__body"
              data-crew={crew}
              data-target={(target === (crew === 'A' ? 'crewA' : 'crewB')) || undefined}
              disabled={!active || isIn}
              aria-expanded={routeFor === crew}
              aria-label={`${tr('astronaut')} ${crew}: ${isIn ? tr('inside') : tr('outside')}`}
              onClick={() => setRouteFor(routeFor === crew ? null : crew)}
            >
              <img src={CREW_SPRITE[crew]} alt="" draggable={false} />
            </button>
            <span className={`mg-tag storm-crew__tag${target === (crew === 'A' ? 'crewA' : 'crewB') ? '' : ' storm-tag--compact'}${isIn ? ' mg-tag--on' : ''}${out ? ' mg-tag--bad' : ''}`}>{crew}<small>{isIn ? tr('inside') : tr('outside')}</small>{isIn && <CheckCircle className="storm-tag__check" weight="fill" aria-hidden="true" />}</span>
            {routeFor === crew && !isIn && (
              <div className="storm-routes" data-target={target === 'route' || undefined} role="group" aria-label={`${tr('pickRoute')} · ${tr('astronaut')} ${crew}`}>
                {(freeFirst[crew] ? ['free', 'blocked'] as const : ['blocked', 'free'] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    className={`storm-route storm-route--${kind}`}
                    data-route={kind}
                    onClick={() => { act(kind === 'free' ? (crew === 'A' ? 'crewA' : 'crewB') : (crew === 'A' ? 'blockedA' : 'blockedB')); setRouteFor(null); }}
                  >
                    {kind === 'free' ? <CheckCircle weight="bold" /> : <Warning weight="fill" />}
                    <span>{kind === 'free' ? tr('safe') : tr('blocked')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <MinigameShell
      className={`storm storm--${state.phase}${state.alarm ? ' storm--alarm' : ''}${safe ? ' storm--safe' : ''}${failed ? ' storm--failed' : ''}`}
      stageClassName="storm-stage"
      title={tr('title')}
      subtitle={`${event.eventType} · ${event.observedAt.slice(0, 10)} · ${event.observation.value} ${event.observation.unit}`}
      backLabel={tr('map')}
      onBack={onBack}
      stage={{ background: ROOM, safe: SAFE, reserveBottom: 0 }}
      stageContent={stage}
      hudExtra={<button type="button" className="storm-science-btn" onClick={() => setScienceOpen((open) => !open)} aria-expanded={scienceOpen}><Atom weight="bold" aria-hidden="true" />{tr('scienceShort')}</button>}
    >
      {state.phase !== 'briefing' && (
        <div className="storm-meters mg-card" aria-live="polite" data-radio-avoid>
          <span className="mg-kicker">{tr('actionsLabel')}</span>
          <span className="mg-pips" role="img" aria-label={`${state.actions} ${tr('actions')}`}>
            {Array.from({ length: total }, (_, i) => <span key={i} className={i < state.actions ? 'is-full' : ''} />)}
          </span>
          <strong>{state.actions}</strong>
          <span className="storm-meters__sep" aria-hidden="true" />
          <span className="mg-kicker">{tr('packets')}</span>
          <strong data-testid="packets">{state.packets}/2</strong>
        </div>
      )}

      {scienceOpen && (
        <aside className="mg-card storm-science" aria-label={tr('science')}>
          <button type="button" className="storm-science__close" onClick={() => setScienceOpen(false)} aria-label={tr('close')}><X weight="bold" /></button>
          <span className="mg-kicker">{tr('simulated')}</span>
          <h2>{tr('science')}</h2>
          <p>{tr('scienceBody')}</p>
          <p>{tr('nasa')}: <a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.eventId}</a> · {event.observedAt} · {event.observation.value} {event.observation.unit}</p>
        </aside>
      )}

      {state.phase === 'briefing' && (
        <section className="mg-card storm-brief" aria-labelledby="storm-brief-title">
          <span className="mg-kicker">{tr('simulated')}</span>
          <h1 id="storm-brief-title">{tr('alert')}</h1>
          <p>{tr('nasa')}: <a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.eventId}</a></p>
          <div className="storm-brief__row"><span className="mg-kicker">{tr('modeLabel')}</span>
            <div className="mg-choice">
              <button type="button" aria-pressed={state.mode === 'intro'} onClick={() => act('modeIntro')}>{tr('intro')}</button>
              <button type="button" aria-pressed={state.mode === 'normal'} onClick={() => act('modeNormal')}>{tr('normal')}</button>
            </div>
          </div>
          <div className="storm-brief__row"><span className="mg-kicker">{tr('eventLabel')}</span>
            <div className="mg-choice">
              {DONKI_HISTORICAL_EVENTS.map((record, i) => <button type="button" key={record.eventId} aria-pressed={eventIndex === i} onClick={() => setEventIndex(i)}>{record.observedAt.slice(11, 16)} UTC · {record.observation.value} {record.observation.unit}</button>)}
            </div>
          </div>
          <button className="pixel-btn pixel-btn--primary storm-start" type="button" onClick={() => act('start')}>{tr('start')}</button>
        </section>
      )}

      {state.phase !== 'briefing' && state.phase !== 'result' && (
        <div className="mg-dock">
          <p className="mg-status" role="status">{message}</p>
          {active && (
            <div className="mg-actions">
              <button type="button" className="mg-btn" onClick={() => act('undo')} disabled={!state.history.length}><ArrowCounterClockwise weight="bold" aria-hidden="true" />{tr('undo')}</button>
              <button type="button" className="mg-btn" onClick={reset}>{tr('reset')}</button>
              <button type="button" className="pixel-btn pixel-btn--primary storm-impact" data-target={target === 'impact' || undefined} onClick={() => act('impact')}>{tr('impact')}</button>
            </div>
          )}
          {state.phase === 'impact' && <strong className="storm-arrival">{tr('arrival')}</strong>}
        </div>
      )}

      {state.phase === 'result' && (
        <section className={`mg-card storm-result ${safe ? 'mg-card--success' : 'mg-card--danger'}`} role="status">
          <h2>{safe ? tr('successTitle') : tr('failTitle')}</h2>
          <p><strong>{tr('safety')}:</strong> {safe ? tr('successTitle') : tr(failure ?? 'successTitle')}</p>
          <p><strong>{tr('data')}:</strong> {state.packets}/2 {tr('packetCount')}</p>
          <p><strong>{tr('learn')}:</strong> {safe ? tr('successLearn') : tr('failureLesson')} {safe ? tr(`sacrifice${state.packets}`) : ''}</p>
          {safe && <p>{tr('tool')}: {tr('shelterKit')} · {tr('cost')}: {tool.cost}</p>}
          <div className="storm-result__actions">
            {safe && <button className="pixel-btn pixel-btn--primary storm-finish" type="button" onClick={() => { if (completed.current) return; completed.current = true; onComplete(tool); }}>{tr('finish')}</button>}
            <button type="button" className="mg-btn storm-retry" onClick={reset}>{tr('retry')}</button>
          </div>
        </section>
      )}
    </MinigameShell>
  );
}
