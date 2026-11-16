import { useCallback, useEffect, useRef, useState } from 'react';
import type { Destination, ExplorationMode, ExplorationResources, ExplorationResult } from '../../game';
import { msg, useI18n } from '../../i18n';
import { useRadio, useRadioLeave } from '../radio';
import { playSound, startLoop, stopLoop } from '../audio';
import { getPlayerSkinForAvatarId } from '../../assets/manifest';
import { ResourceBar } from '../mission-control/ResourceBar';
import { PLACES, RADIO_RANGE } from './explorationData';
import {
  collect,
  distanceToBase,
  formatMinutes,
  rescue,
  returnMargin,
  startExpedition,
  stepExpedition,
  toResult,
  type Expedition,
  type ExpeditionEvent,
  type ReturnMargin,
} from './explorationEngine';
import { createSpriteSet, MARKERS, UI } from './explorationAssets';
import { drawExpedition, isBaseVisible, type PlayerView } from './explorationRenderer';
import { AssetImage } from './AssetImage';
import { TERRAIN } from './terrain';

interface ExplorationCanvasProps {
  readonly destination: Destination;
  readonly afterTurn: number;
  readonly mode: ExplorationMode;
  readonly battery: number;
  readonly resources: ExplorationResources;
  /** Para dibujar al astronauta que eligió el niño. */
  readonly avatarId?: string;
  readonly onFinish: (result: ExplorationResult) => void;
}

interface HudSnapshot {
  readonly energy: number;
  readonly oxygen: number;
  readonly shield: number;
  readonly battery: number;
  readonly battery0: number;
  readonly mode: ExplorationMode;
  readonly onFoot: boolean;
  readonly minutes: number;
  readonly distance: number;
  readonly pieces: number;
  readonly places: number;
  readonly margin: ReturnMargin;
}

type Keys = { up: boolean; down: boolean; left: boolean; right: boolean };
const KEY_MAP: Readonly<Record<string, keyof Keys>> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
};

/** Entre una pista de ayuda y la siguiente: lo que dura un globo más su pausa. */
const HINT_GAP_MS = 7000;
const HUD_REFRESH_MS = 120;
/** Distancia a pie (px del mundo, ~3 pasos por segundo) entre un paso sonoro y el siguiente. */
const STEP_SOUND_PX = 42;
/** Sin avanzar durante este tiempo, el rover se considera parado. */
const ROVER_IDLE_MS = 180;
/** El rover debe haber rodado al menos esto para que su parada suene. */
const ROVER_MIN_RUN_MS = 400;

function snapshotOf(e: Expedition): HudSnapshot {
  return {
    energy: Math.max(0, Math.round(e.live.energy)),
    oxygen: Math.max(0, Math.round(e.live.oxygen)),
    shield: Math.max(0, Math.round(e.live.shield)),
    battery: Math.round(e.battery),
    battery0: e.battery0,
    mode: e.mode,
    onFoot: e.onFoot,
    minutes: e.minutes,
    distance: distanceToBase(e),
    pieces: Object.values(e.counts).reduce((total, count) => total + count, 0),
    places: e.order.length,
    margin: returnMargin(e),
  };
}

export function ExplorationCanvas({ destination, afterTurn, mode, battery, resources, avatarId = 'ALBA', onFinish }: ExplorationCanvasProps) {
  const { t } = useI18n();
  const radio = useRadio();
  useRadioLeave();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const expedition = useRef<Expedition | null>(null);
  if (expedition.current === null) {
    expedition.current = startExpedition({ afterTurn, mode, battery, resources });
  }
  const keys = useRef<Keys>({ up: false, down: false, left: false, right: false });
  const [hud, setHud] = useState<HudSnapshot | null>(() => (expedition.current ? snapshotOf(expedition.current) : null));

  // Lo último que se necesita dentro del bucle, sin reiniciarlo en cada render.
  const latest = useRef({ t, radio, onFinish });
  latest.current = { t, radio, onFinish };
  const lastHintAt = useRef(0);
  const lastNothingAt = useRef(0);
  const said = useRef<Set<string>>(new Set());
  const cannotReturnWarned = useRef(false);
  const baseVisible = useRef(true);

  const placeName = useCallback((index: number) => {
    const key = `exploration.collections.${destination}.${index}`;
    return { name: latest.current.t(`${key}.name`), text: latest.current.t(`${key}.text`) };
  }, [destination]);

  /** Lo mismo, como referencias: la radio lo traduce al idioma activo al mostrarlo. */
  const placeRef = useCallback((index: number) => {
    const key = `exploration.collections.${destination}.${index}`;
    return { name: msg(`${key}.name`), text: msg(`${key}.text`) };
  }, [destination]);

  const react = useCallback((events: readonly ExpeditionEvent[]) => {
    const { radio: rd } = latest.current;
    for (const event of events) {
      switch (event.type) {
        case 'SOFT_TERRAIN':
          if (expedition.current?.mode === 'ROVER') playSound('roverSoftTerrain');
          rd.say({ text: msg('exploration.radio.softTerrain'), tone: 'danger' }); break;
        case 'BATTERY_LOW':
          playSound('explorationBatteryLow');
          rd.say({ text: msg('exploration.radio.lowBattery'), tone: 'danger' }); break;
        case 'BATTERY_EMPTY':
          playSound('explorationBatteryEmpty');
          rd.say({ text: msg('exploration.radio.batteryEmpty'), tone: 'danger' }); break;
        case 'NO_MARGIN': rd.say({ speaker: 'NICO', text: msg('exploration.radio.noMargin'), tone: 'danger' }); break;
        case 'NOTHING_NEAR': {
          const now = Date.now();
          if (now - lastNothingAt.current > 4000) {
            lastNothingAt.current = now;
            playSound('explorationPileEmpty');
            rd.say({ text: msg('exploration.radio.nothingNear'), front: true });
          }
          break;
        }
        case 'COLLECTED': {
          const { name, text } = placeRef(event.place.index);
          const type = event.place.type;
          // Muestra o huella: recoger; mirador: vista panorámica; curiosidad NASA: destello.
          playSound(type === 'm' ? 'explorationLookout' : type === 'e' ? 'explorationCuriosity' : 'explorationCollect');
          if (type === 's') {
            const base = msg('exploration.radio.piece', { name, n: event.count, total: event.total });
            rd.say({ text: event.pileEmpty ? `${base} ${msg('exploration.radio.pileEmpty')}` : base, tone: 'good', front: true });
          } else {
            const key = type === 'm' ? 'viewpoint' : type === 'r' ? 'trace' : 'curiosity';
            rd.say({ speaker: type === 'e' ? 'CHISPA' : 'ALBA', text: msg(`exploration.radio.${key}`, { name, text }), tone: 'good', front: true });
          }
          break;
        }
        default: break;
      }
    }
  }, [placeRef]);

  // Una pista de ayuda cada vez, en el mismo orden de prioridad que la maqueta.
  const maybeHint = useCallback((e: Expedition, margin: ReturnMargin) => {
    const { radio: rd } = latest.current;
    const now = Date.now();

    if (margin.cannotReturn && !cannotReturnWarned.current) {
      cannotReturnWarned.current = true;
      rd.say({ text: msg('exploration.radio.cannotReturn'), tone: 'danger' });
    }
    if (!margin.cannotReturn) cannotReturnWarned.current = false;

    if (now - lastHintAt.current < HINT_GAP_MS) return;
    const left = PLACES.filter((place) => e.remaining[place.index] > 0);
    const nearest = left.length ? Math.min(...left.map((place) => Math.hypot(e.px - place.x, e.py - place.y))) : Infinity;
    const star = left.some((place) => place.type === 'e' && Math.hypot(e.px - place.x, e.py - place.y) < RADIO_RANGE.goldenStar);
    const pieces = Object.values(e.counts).reduce((total, count) => total + count, 0);
    const meters = distanceToBase(e);

    const pick = (id: string, textKey: string) => {
      if (said.current.has(id)) return false;
      said.current.add(id);
      lastHintAt.current = now;
      rd.say({ text: msg(textKey) });
      return true;
    };
    if (nearest < RADIO_RANGE.nearPlace && pick('near', 'exploration.radio.nearPlace')) return;
    if (star && pick('star', 'exploration.radio.goldenStar')) return;
    if (pieces > 0 && pick('first', 'exploration.radio.firstPiece')) return;
    if (meters > RADIO_RANGE.farFromBase && pick('far', 'exploration.radio.farFromBase')) return;
    if (!baseVisible.current && pick('arrow', 'exploration.radio.baseOffscreen')) return;
    if (meters > RADIO_RANGE.veryFar && pick('veryfar', 'exploration.radio.veryFar')) return;
  }, []);

  // El bucle: UN solo requestAnimationFrame y el movimiento depende de dt.
  useEffect(() => {
    const e = expedition.current;
    const canvas = canvasRef.current;
    if (!e || !canvas) return undefined;
    const g = canvas.getContext('2d');
    if (!g) return undefined;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    // Respaldo: el astronauta que eligió el niño, por si las poses nuevas no cargan.
    const playerSprite = new Image();
    playerSprite.src = getPlayerSkinForAvatarId(avatarId).path;
    // Los PNG se piden una sola vez (caché del módulo) y se reutilizan en cada cuadro.
    const sprites = createSpriteSet(destination);
    let view: PlayerView = { facing: 'right', dir: 'down', moving: false };

    latest.current.radio.say({ text: msg('exploration.radio.opening'), once: 'explore.opening' });

    let frame = 0;
    let last = 0;
    let lastHud = 0;
    // Sonido de movimiento: se calcula con la distancia real recorrida, no con los cuadros.
    const stepSound = destination === 'MOON' ? 'stepRegolith' : 'stepMars';
    let prevDistance = e.distance;
    let walked = 0;
    let lastMoveAt = 0;
    let roverRunning = false;
    let roverRunningSince = 0;
    const stopRover = (time: number, announce: boolean) => {
      if (!roverRunning) return;
      roverRunning = false;
      stopLoop('roverRunning');
      if (announce && time - roverRunningSince > ROVER_MIN_RUN_MS) playSound('roverStop');
    };
    if (e.mode === 'ROVER') playSound('roverStart');
    const loop = (time: number) => {
      const dt = last ? Math.min(1, (time - last) / 1000) : 1 / 60;
      last = time;
      const k = keys.current;
      const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      const dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
      react(stepExpedition(e, { dx, dy }, dt));
      // Solo estética: hacia dónde mira el sprite. No interviene en el movimiento.
      if (dx !== 0 || dy !== 0) {
        view = {
          facing: dx !== 0 ? (dx > 0 ? 'right' : 'left') : view.facing,
          dir: dx !== 0 ? 'side' : dy < 0 ? 'up' : 'down',
          moving: true,
        };
      } else if (view.moving) {
        view = { ...view, moving: false };
      }

      const moved = e.distance - prevDistance;
      prevDistance = e.distance;
      if (moved > 0) {
        lastMoveAt = time;
        if (e.mode === 'ROVER') {
          if (!roverRunning) { roverRunning = true; roverRunningSince = time; startLoop('roverRunning'); }
        } else {
          walked += moved;
          if (walked >= STEP_SOUND_PX) { walked = 0; playSound(stepSound); }
        }
      }
      // Parado, sin batería (pasa a pie) o bloqueado: el motor se calla.
      if (roverRunning && (e.mode !== 'ROVER' || time - lastMoveAt > ROVER_IDLE_MS)) stopRover(time, e.mode === 'ROVER');

      const camera = drawExpedition(g, canvas.width, canvas.height, e, TERRAIN, destination, time, {
        base: latest.current.t('exploration.hud.base'),
        hint: (index, type) => {
          const key = type === 's' ? 'exploration.hud.pickUp' : 'exploration.hud.look';
          return latest.current.t(key, { name: placeName(index).name });
        },
      }, playerSprite, sprites, view);
      baseVisible.current = isBaseVisible(camera, canvas.width, canvas.height);

      if (time - lastHud > HUD_REFRESH_MS) {
        lastHud = time;
        const snap = snapshotOf(e);
        setHud(snap);
        maybeHint(e, snap.margin);
      }
      if (e.status === 'RETURNED' || e.status === 'RESCUED') {
        setHud(snapshotOf(e));
        stopRover(time, false);
        latest.current.onFinish(toResult(e));
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      stopLoop('roverRunning');
      window.removeEventListener('resize', resize);
    };
  }, [avatarId, destination, maybeHint, placeName, react]);

  // Teclado: flechas (y WASD) para moverse, Espacio para recoger.
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const dir = KEY_MAP[event.key];
      if (dir) { event.preventDefault(); keys.current[dir] = true; return; }
      if (event.key === ' ') {
        event.preventDefault();
        if (expedition.current) react(collect(expedition.current));
      }
    };
    const up = (event: KeyboardEvent) => {
      const dir = KEY_MAP[event.key];
      if (dir) keys.current[dir] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [react]);

  const hold = (dir: keyof Keys) => ({
    onPointerDown: () => { keys.current[dir] = true; },
    onPointerUp: () => { keys.current[dir] = false; },
    onPointerLeave: () => { keys.current[dir] = false; },
    onPointerCancel: () => { keys.current[dir] = false; },
  });

  if (!hud || !expedition.current) return null;
  const { margin } = hud;
  const limitingLabel = t(margin.limiting === 'OXYGEN' ? 'missionControl.oxygen' : 'missionControl.energy');
  const marginPercent = Math.round(margin.percent * 100);

  return <div className="explore" role="application" aria-label={t('exploration.kicker')}>
    <canvas ref={canvasRef} className="explore__canvas" />

    <div className="explore__bars" aria-label={t('missionControl.resourceRackAria')}>
      <ResourceBar label={t('missionControl.energy')} value={hud.energy} tone="energy" />
      <ResourceBar label={t('missionControl.oxygen')} value={hud.oxygen} tone="oxygen" />
      <ResourceBar label={t('missionControl.shield')} value={hud.shield} tone="shield" />
    </div>

    <div className="explore__panel">
      <p>{t('exploration.hud.time')}: <strong>{formatMinutes(hud.minutes)}</strong> · {t('exploration.hud.distance', { meters: Math.round(hud.distance) })}</p>
      {hud.mode === 'ROVER'
        ? <p className="explore__battery">
          <AssetImage src={UI.battery[hud.battery0]} className="explore__icon" />
          {t('exploration.hud.battery', { now: hud.battery, total: hud.battery0 })}
        </p>
        : hud.onFoot && <p>{t('exploration.hud.onFoot')}</p>}
      <p>{t('exploration.hud.pieces', { count: hud.pieces })} · {t('exploration.hud.places', { found: hud.places, total: PLACES.length })}</p>
      <div className={`explore__margin explore__margin--${margin.tone}`}>
        <strong>
          {t('exploration.hud.margin')}: {marginPercent}%
          {margin.cannotReturn && <span> · {t('exploration.hud.cannotReturn')}</span>}
        </strong>
        <div
          className="explore__margin-track"
          role="meter"
          aria-label={t('exploration.hud.margin')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={marginPercent}
        >
          <span style={{ width: `${marginPercent}%` }} />
        </div>
        <small>
          {t('exploration.hud.limiting', { resource: limitingLabel })}
          {' '}
          {t('exploration.hud.returnCost', { energy: Math.round(margin.returnEnergy), oxygen: Math.round(margin.returnOxygen) })}
        </small>
      </div>
    </div>

    <div className="explore__controls">
      <div className="explore__dpad" role="group" aria-label={t('exploration.hud.controls')}>
        <button type="button" className="explore__key explore__key--up" aria-label={t('exploration.hud.up')} {...hold('up')}>↑</button>
        <button type="button" className="explore__key explore__key--left" aria-label={t('exploration.hud.left')} {...hold('left')}>←</button>
        <button type="button" className="explore__key explore__key--down" aria-label={t('exploration.hud.down')} {...hold('down')}>↓</button>
        <button type="button" className="explore__key explore__key--right" aria-label={t('exploration.hud.right')} {...hold('right')}>→</button>
      </div>
      <button type="button" className="pixel-button pixel-button--primary" onClick={() => expedition.current && react(collect(expedition.current))}>
        {t('exploration.hud.collect')}
      </button>
      <button
        type="button"
        className="pixel-button"
        onClick={() => { if (expedition.current) react(rescue(expedition.current)); }}
      >
        <AssetImage src={MARKERS.beacon} className="explore__icon explore__icon--button" />
        {t('exploration.hud.rescue')}
      </button>
    </div>
  </div>;
}
