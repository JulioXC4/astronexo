import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ArrowCounterClockwise, Atom, Broadcast, CheckCircle, LockKey, ShieldCheck, Siren, Warning, X } from '@phosphor-icons/react';
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
const ROOM = '/assets/pixel-art/airlock-refuge.png';
const CREW_SPRITE = { A: '/assets/pixel-art/cadet-alba.png', B: '/assets/pixel-art/engineer-nico.png' } as const;
const copy = {
  en: {
    title: 'Operation Shelter', subtitle: 'CME alert · NASA DONKI', alert: 'Space alert! Prepare the shelter before the simulated event.', start: 'Start operation', intro: 'Intro · 8 actions', normal: 'Normal · 7 actions', actions: 'actions left', simulated: 'Educational simulation', nasa: 'NASA DONKI record', science: 'The science behind this mission', scienceBody: 'A coronal mass ejection (CME) is a large release of solar plasma and magnetic field. Space weather can affect spacecraft systems. This exercise uses fictional actions, crew positions and data packets; it is not an official NASA emergency procedure. The historical record does not describe an impact on this station.', alarm: 'Alarm', shelter: 'Shelter', telemetry: 'Telemetry', off: 'OFF', on: 'ON', open: 'OPEN', locked: 'LOCKED', deployed: 'DEPLOYED', protected: 'PROTECTED', backup: 'Backup power', backupReady: 'READY', backupOff: 'OFF', crew: 'Crew corridor', safe: 'Clear route', blocked: 'Blocked route', packet: 'Collect data packet', packetCount: 'data packets', undo: 'Undo', reset: 'Restart', impact: 'Simulate arrival', arrival: 'CME arrival', successTitle: 'Shelter secured!', failTitle: 'Protocol incomplete', safety: 'Mission safety', data: 'Data recovered', tool: 'Tool earned', cost: 'RF-69 energy cost', finish: 'Claim kit and continue', retry: 'Try again', learn: 'What happened', successLearn: 'You prioritized the crew, backup power and equipment protection.', sacrifice0: 'You protected the station immediately and saved no extra data packets.', sacrifice1: 'You saved one packet and left the second to protect the station.', sacrifice2: 'You saved both packets before retracting the antenna.', noAlarm: 'The alarm was off, so the crew was not guided to shelter.', crewOutside: 'A crew member was still outside the shelter.', noBackup: 'Backup power was not ready for the shelter.', hatchOpen: 'The hatch was open when the event arrived.', antennaExposed: 'The antenna remained exposed.', startHint: 'Tap the alarm, then guide each astronaut.', alarmOn: 'Alarm on. Guide both astronauts along the clear route.', alreadyOn: 'The alarm is already on.', alarmFirst: 'Sound the alarm before moving the crew.', alreadyInside: 'This astronaut is already inside.', crewMoved: 'Astronaut reached the shelter.', blockedRoute: 'A fallen panel blocks this route. Try the clear route.', alreadyReady: 'Backup power is already prepared.', backupPrepared: 'Backup power ready.', backupFirst: 'Prepare backup power before securing the hatch.', alreadyLocked: 'The hatch is already secured.', hatchLocked: 'The hatch is secured.', antennaRetracted: 'The antenna is retracted. No more packets can be collected.', packetsFull: 'Both packets are already saved.', packetSaved: 'A simulation data packet was saved.', alreadyProtected: 'Telemetry is already protected.', telemetryProtected: 'Antenna retracted and protected.', undone: 'Last action undone.', arrivalHint: 'The event is reaching the station…', resultHint: 'Review the outcome and try another strategy.', noData: 'No extra packets were saved.', failureLesson: 'Check the unfinished station, then try a new order of actions.',
    astronaut: 'Astronaut', pickRoute: 'Choose a route', modeLabel: 'Difficulty', eventLabel: 'Historical event', packets: 'Data packets', scienceShort: 'Science', close: 'Close', map: 'Map', actionsLabel: 'Actions', statusLost: 'LOST', inside: 'IN SHELTER', outside: 'OUTSIDE', hatchDoor: 'Shelter hatch',
  },
  es: {
    title: 'Operación Refugio', subtitle: 'Alerta CME · NASA DONKI', alert: '¡Alerta espacial! Prepara el refugio antes del evento simulado.', start: 'Iniciar operación', intro: 'Inicial · 8 acciones', normal: 'Normal · 7 acciones', actions: 'acciones restantes', simulated: 'Simulación educativa', nasa: 'Registro NASA DONKI', science: 'La ciencia de esta misión', scienceBody: 'Una eyección de masa coronal (CME) libera plasma solar y campo magnético. El clima espacial puede afectar los sistemas de una nave. Las acciones, posiciones y paquetes de este ejercicio son ficticios; no representan un procedimiento oficial de NASA. El registro histórico no describe un impacto en esta estación.', alarm: 'Alarma', shelter: 'Refugio', telemetry: 'Telemetría', off: 'APAGADA', on: 'ACTIVA', open: 'ABIERTA', locked: 'ASEGURADA', deployed: 'DESPLEGADA', protected: 'PROTEGIDA', backup: 'Energía de respaldo', backupReady: 'LISTA', backupOff: 'APAGADA', crew: 'Corredor de evacuación', safe: 'Ruta libre', blocked: 'Ruta bloqueada', packet: 'Recoger paquete de datos', packetCount: 'paquetes de datos', undo: 'Deshacer', reset: 'Reiniciar', impact: 'Simular llegada', arrival: 'Llega la CME', successTitle: '¡Refugio protegido!', failTitle: 'Protocolo incompleto', safety: 'Seguridad de la misión', data: 'Datos recuperados', tool: 'Herramienta obtenida', cost: 'Costo RF-69 de energía', finish: 'Obtener kit y continuar', retry: 'Reintentar', learn: 'Qué ocurrió', successLearn: 'Priorizaste a la tripulación, la energía de respaldo y la protección del equipo.', sacrifice0: 'Protegiste la estación de inmediato y no guardaste paquetes adicionales.', sacrifice1: 'Guardaste un paquete y dejaste el segundo para proteger la estación.', sacrifice2: 'Guardaste ambos paquetes antes de replegar la antena.', noAlarm: 'La alarma estaba apagada y no se guio a la tripulación.', crewOutside: 'Un astronauta seguía fuera del refugio.', noBackup: 'La energía de respaldo no estaba preparada.', hatchOpen: 'La compuerta estaba abierta al llegar el evento.', antennaExposed: 'La antena quedó expuesta.', startHint: 'Toca la alarma y guía a cada astronauta.', alarmOn: 'Alarma activa. Guía a ambos por la ruta libre.', alreadyOn: 'La alarma ya está activa.', alarmFirst: 'Activa la alarma antes de mover a la tripulación.', alreadyInside: 'Este astronauta ya está dentro.', crewMoved: 'El astronauta llegó al refugio.', blockedRoute: 'Un panel caído bloquea el camino. Prueba la ruta libre.', alreadyReady: 'La energía de respaldo ya está preparada.', backupPrepared: 'Energía de respaldo lista.', backupFirst: 'Prepara la energía de respaldo antes de asegurar la compuerta.', alreadyLocked: 'La compuerta ya está asegurada.', hatchLocked: 'Compuerta asegurada.', antennaRetracted: 'La antena está replegada. Ya no puedes recoger paquetes.', packetsFull: 'Ya guardaste los dos paquetes.', packetSaved: 'Guardaste un paquete de datos de la simulación.', alreadyProtected: 'La telemetría ya está protegida.', telemetryProtected: 'Antena replegada y protegida.', undone: 'Última acción deshecha.', arrivalHint: 'El evento se acerca a la estación…', resultHint: 'Revisa el resultado y prueba otra estrategia.', noData: 'No se guardaron paquetes adicionales.', failureLesson: 'Revisa el sistema pendiente y prueba otro orden de acciones.',
    astronaut: 'Astronauta', pickRoute: 'Elige una ruta', modeLabel: 'Dificultad', eventLabel: 'Evento histórico', packets: 'Paquetes de datos', scienceShort: 'Ciencia', close: 'Cerrar', map: 'Mapa', actionsLabel: 'Acciones', statusLost: 'PERDIDOS', inside: 'EN REFUGIO', outside: 'AFUERA', hatchDoor: 'Compuerta del refugio',
  }
} as const;
type CopyKey = keyof typeof copy.en;

/** Coordenadas en el lienzo lógico 1000 × 563 del cuarto de refugio. */
const STATION_AT = { alarm: { x: 500, y: 76 }, hatch: { x: 500, y: 250 }, telemetry: { x: 272, y: 286 }, backup: { x: 738, y: 168 } } as const;
const CREW_AT = { A: { out: 120, in: 410 }, B: { out: 880, in: 590 } } as const;
const CREW_Y = 470;
const PACKET_AT = [{ x: 236, y: 262 }, { x: 306, y: 262 }] as const;
const SAFE = { x0: 40, x1: 960, y0: 50, y1: 540 };

type Crew = 'A' | 'B';
const pos = (x: number, y: number) => ({ left: `${x / 10}%`, top: `${y / 5.63}%` });

export function SolarWatchGame({ onComplete, onBack }: Props) {
  const { language, t } = useI18n();
  const words = language === 'es' ? copy.es : copy.en;
  const tr = (key: string) => words[key as CopyKey] ?? key;
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

  const stationLabel = (id: 'alarm' | 'hatch' | 'telemetry' | 'backup') => {
    if (id === 'alarm') return [tr('alarm'), state.alarm ? tr('on') : tr('off')] as const;
    if (id === 'hatch') return [tr('hatchDoor'), state.hatch ? tr('locked') : tr('open')] as const;
    if (id === 'telemetry') return [tr('telemetry'), state.telemetry ? tr('protected') : tr('deployed')] as const;
    return [tr('backup'), state.backup ? tr('backupReady') : tr('backupOff')] as const;
  };
  const stationOn = { alarm: state.alarm, hatch: state.hatch, telemetry: state.telemetry, backup: state.backup };
  const stationAction: Record<'alarm' | 'hatch' | 'telemetry' | 'backup', StormAction> = { alarm: 'alarm', hatch: 'hatch', telemetry: 'telemetry', backup: 'backup' };
  const sprite = {
    alarm: `${ASSET}storm-alarm-${state.alarm ? 'on' : 'off'}.png`,
    hatch: `${ASSET}storm-hatch-${state.hatch ? 'locked' : 'open'}.png`,
    telemetry: `${ASSET}storm-telemetry-deployed.png`,
    backup: '',
  };
  const stationBad = { alarm: bad('noAlarm'), hatch: bad('hatchOpen'), telemetry: bad('antennaExposed'), backup: bad('noBackup') };

  const stage = (
    <>
      <div className="storm-fx storm-fx--alert" aria-hidden="true" />
      <div className="storm-fx storm-fx--wave" aria-hidden="true" />
      <div className="storm-fx storm-fx--flash" aria-hidden="true" />

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
        return (
          <div key={id} className="storm-station" style={pos(STATION_AT[id].x, STATION_AT[id].y)}>
            <button
              type="button"
              className={`storm-hit storm-hit--${id}`}
              data-station={id}
              data-on={stationOn[id] || undefined}
              disabled={!active}
              aria-label={`${name}: ${status}`}
              onClick={() => act(stationAction[id])}
            />
            <span className={`mg-tag storm-tag storm-tag--${id}${stationOn[id] ? ' mg-tag--on' : ''}${stationBad[id] ? ' mg-tag--bad' : ''}`}>
              {sprite[id] && <img src={sprite[id]} alt="" draggable={false} />}
              <span>{name}</span><small>{status}</small>
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
              disabled={!active || isIn}
              aria-expanded={routeFor === crew}
              aria-label={`${tr('astronaut')} ${crew}: ${isIn ? tr('inside') : tr('outside')}`}
              onClick={() => setRouteFor(routeFor === crew ? null : crew)}
            >
              <img src={CREW_SPRITE[crew]} alt="" draggable={false} />
            </button>
            <span className={`mg-tag storm-crew__tag${isIn ? ' mg-tag--on' : ''}${out ? ' mg-tag--bad' : ''}`}>{crew}<small>{isIn ? tr('inside') : tr('outside')}</small></span>
            {routeFor === crew && !isIn && (
              <div className="storm-routes" role="group" aria-label={`${tr('pickRoute')} · ${tr('astronaut')} ${crew}`}>
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
        <div className="storm-meters mg-card" aria-live="polite">
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
              <button type="button" className="pixel-btn pixel-btn--primary storm-impact" onClick={() => act('impact')}>{tr('impact')}</button>
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
          {safe && <p>{tr('tool')}: {language === 'es' ? 'Kit de refugio' : 'Shelter kit'} · {tr('cost')}: {tool.cost}</p>}
          <div className="storm-result__actions">
            {safe && <button className="pixel-btn pixel-btn--primary storm-finish" type="button" onClick={() => { if (completed.current) return; completed.current = true; onComplete(tool); }}>{tr('finish')}</button>}
            <button type="button" className="mg-btn storm-retry" onClick={reset}>{tr('retry')}</button>
          </div>
        </section>
      )}
    </MinigameShell>
  );
}
