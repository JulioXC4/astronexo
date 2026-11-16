import type { ExplorationFinding, ExplorationMode, ExplorationResources, ExplorationResult } from '../../game';
import {
  COLLECT,
  COST,
  KIND_BY_TYPE,
  PILE_SIZE,
  PLACES,
  REQUIREMENTS,
  RESCUE,
  SPEED,
  WORLD,
  type Place,
} from './explorationData';
import { isBlocked, isOnSoftTerrain, TERRAIN, type Terrain } from './terrain';

/**
 * Motor de la salida a explorar. Es lógica pura: no sabe nada de React ni del
 * canvas, así el movimiento se puede probar con cualquier cantidad de cuadros
 * por segundo y el dibujo se puede cambiar por arte sin tocar las reglas.
 *
 * Regla de oro de la especificación: el movimiento depende del TIEMPO
 * transcurrido (dt), nunca de los cuadros por segundo. La maqueta tuvo un error
 * por correr dos bucles a la vez; aquí hay un solo paso por llamada.
 */
export type ExpeditionStatus = 'ACTIVE' | 'STUCK' | 'RETURNED' | 'RESCUED';

export interface Expedition {
  readonly afterTurn: number;
  readonly startMode: ExplorationMode;
  mode: ExplorationMode;
  battery: number;
  readonly battery0: number;
  px: number;
  py: number;
  /** Recursos en vivo (con decimales) mientras dura la salida. */
  live: { energy: number; oxygen: number; shield: number };
  /** Lo que había ANTES de salir, antes de repartir la batería. */
  readonly before: ExplorationResources;
  minutes: number;
  distance: number;
  /** Se alejó lo suficiente como para que «volver» tenga sentido. */
  left: boolean;
  /** El rover se quedó sin batería y se sigue a pie. */
  onFoot: boolean;
  parked: { x: number; y: number } | null;
  onSoft: boolean;
  status: ExpeditionStatus;
  stuckFor: number;
  rescued: boolean;
  batteryReturned: number;
  /** Cuánto queda por recoger en cada lugar, por índice. */
  remaining: Record<number, number>;
  /** Piezas recogidas por lugar. */
  counts: Record<number, number>;
  /** Orden en que se visitó cada lugar. */
  order: number[];
  trail: [number, number][];
  /** Para no repetir el aviso de batería baja. */
  warnedLowBattery: boolean;
}

export type ExpeditionEvent =
  | { readonly type: 'SOFT_TERRAIN' }
  | { readonly type: 'BATTERY_LOW' }
  | { readonly type: 'BATTERY_EMPTY' }
  | { readonly type: 'NO_MARGIN' }
  | { readonly type: 'NOTHING_NEAR' }
  | {
    readonly type: 'COLLECTED';
    readonly place: Place;
    readonly count: number;
    readonly total: number;
    readonly pileEmpty: boolean;
  }
  | { readonly type: 'RETURNED' }
  | { readonly type: 'RESCUED' };

export interface MoveInput {
  readonly dx: number;
  readonly dy: number;
}

// ------------------------------------------------------------------ requisitos

export function canWalk(resources: ExplorationResources): boolean {
  return resources.energy >= REQUIREMENTS.foot.energy && resources.oxygen >= REQUIREMENTS.foot.oxygen;
}

export function canRover(resources: ExplorationResources, battery: number): boolean {
  return resources.energy >= battery + REQUIREMENTS.roverEnergyMargin
    && resources.oxygen >= REQUIREMENTS.roverOxygen;
}

// ------------------------------------------------------------------ inicio

export interface StartOptions {
  readonly afterTurn: number;
  readonly mode: ExplorationMode;
  /** Solo el rover: cuánta Energía de la base se le destina como batería. */
  readonly battery?: number;
  readonly resources: ExplorationResources;
}

/** Devuelve null si los recursos no alcanzan para salir de esa forma. */
export function startExpedition(options: StartOptions): Expedition | null {
  const { mode, resources, afterTurn } = options;
  const battery = mode === 'ROVER' ? (options.battery ?? 0) : 0;
  if (mode === 'FOOT' && !canWalk(resources)) return null;
  if (mode === 'ROVER' && !canRover(resources, battery)) return null;

  const remaining: Record<number, number> = {};
  for (const place of PLACES) remaining[place.index] = place.type === 's' ? PILE_SIZE[place.index] : 1;

  return {
    afterTurn,
    startMode: mode,
    mode,
    battery,
    battery0: battery,
    px: WORLD.playerStart.x,
    py: WORLD.playerStart.y,
    // La batería del rover SALE de la Energía de la base al partir.
    live: { energy: resources.energy - battery, oxygen: resources.oxygen, shield: resources.shield },
    before: { ...resources },
    minutes: 0,
    distance: 0,
    left: false,
    onFoot: false,
    parked: null,
    onSoft: false,
    status: 'ACTIVE',
    stuckFor: 0,
    rescued: false,
    batteryReturned: 0,
    remaining,
    counts: {},
    order: [],
    trail: [],
    warnedLowBattery: false,
  };
}

// ------------------------------------------------------------------ geometría

export function distanceToBase(e: Pick<Expedition, 'px' | 'py'>): number {
  return Math.hypot(e.px - WORLD.base.x, e.py - WORLD.base.y);
}

/** El lugar con algo por recoger que esté al alcance, el más cercano primero. */
export function placeInReach(e: Expedition): Place | null {
  let best: Place | null = null;
  let bestDistance: number = COLLECT.reach;
  for (const place of PLACES) {
    if (e.remaining[place.index] <= 0) continue;
    const d = Math.hypot(e.px - place.x, e.py - place.y);
    if (d < bestDistance) { best = place; bestDistance = d; }
  }
  return best;
}

// ------------------------------------------------------------------ gasto

function spend(e: Expedition, units: number, events: ExpeditionEvent[]) {
  if (e.mode === 'ROVER') {
    const c = COST.rover;
    const used = Math.min(e.battery, units * c.battery);
    e.battery -= used;
    e.live.oxygen -= units * c.oxygen;
    e.live.shield -= units * c.shield;
    e.minutes += units * c.minutes;
    if (e.battery <= 0.05) {
      e.battery = 0;
      e.mode = 'FOOT';
      e.onFoot = true;
      e.parked = { x: e.px, y: e.py };
      events.push({ type: 'BATTERY_EMPTY' });
    } else if (!e.warnedLowBattery && e.battery < e.battery0 * 0.25) {
      e.warnedLowBattery = true;
      events.push({ type: 'BATTERY_LOW' });
    }
    return;
  }
  const c = COST.foot;
  e.live.energy -= units * c.energy;
  e.live.oxygen -= units * c.oxygen;
  e.live.shield -= units * c.shield;
  e.minutes += units * c.minutes;
}

// ------------------------------------------------------------------ movimiento

/** Subpasos de 0,03 s: así una ventana lenta no atraviesa cráteres. */
const SUBSTEP = 0.03;

/**
 * Avanza la salida `dt` segundos. Con 60, 30 o 5 cuadros por segundo recorre la
 * misma distancia en el mismo tiempo (300 px/s en rover, 140 a pie).
 */
export function stepExpedition(
  e: Expedition,
  input: MoveInput,
  dt: number,
  terrain: Terrain = TERRAIN,
): ExpeditionEvent[] {
  const events: ExpeditionEvent[] = [];
  if (e.status === 'RETURNED' || e.status === 'RESCUED') return events;

  const soft = isOnSoftTerrain(terrain, e.px, e.py);
  if (soft && !e.onSoft) events.push({ type: 'SOFT_TERRAIN' });
  e.onSoft = soft;

  let remaining = dt;
  while (remaining > 0.0001 && e.status === 'ACTIVE') {
    const h = Math.min(remaining, SUBSTEP);
    remaining -= h;
    if (!input.dx && !input.dy) continue;

    const speed = (e.mode === 'ROVER' ? SPEED.rover : SPEED.foot) * (soft ? SPEED.softTerrain : 1);
    const length = Math.hypot(input.dx, input.dy);
    const margin = WORLD.edgeMargin;
    const nx = Math.max(margin, Math.min(WORLD.width - margin, e.px + (input.dx / length) * speed * h));
    const ny = Math.max(margin, Math.min(WORLD.height - margin, e.py + (input.dy / length) * speed * h));
    if (isBlocked(terrain, nx, ny)) continue;

    const moved = Math.hypot(nx - e.px, ny - e.py);
    e.px = nx;
    e.py = ny;
    const last = e.trail[e.trail.length - 1];
    if (!last || Math.hypot(nx - last[0], ny - last[1]) > 10) e.trail.push([nx, ny]);
    e.distance += moved;
    // En terreno blando se gasta el doble por la misma distancia.
    spend(e, (moved / WORLD.unit) * (soft ? COST.softMultiplier : 1), events);
    if (distanceToBase(e) > WORLD.leftDistance) e.left = true;
  }

  if (e.status === 'ACTIVE' && (e.live.energy < RESCUE.triggerBelow || e.live.oxygen < RESCUE.triggerBelow)) {
    e.status = 'STUCK';
    e.stuckFor = 0;
    events.push({ type: 'NO_MARGIN' });
  }
  if (e.status === 'STUCK') {
    e.stuckFor += dt;
    if (e.stuckFor >= RESCUE.delaySeconds) events.push(...rescue(e));
  }

  if (e.status === 'ACTIVE' && e.left && distanceToBase(e) < WORLD.returnRadius) {
    events.push(...returnToBase(e));
  }
  return events;
}

// ------------------------------------------------------------------ acciones

/** «Espacio»: recoger o mirar lo que esté al alcance. */
export function collect(e: Expedition): ExpeditionEvent[] {
  if (e.status === 'RETURNED' || e.status === 'RESCUED' || e.status === 'STUCK') return [];
  const place = placeInReach(e);
  if (!place) return [{ type: 'NOTHING_NEAR' }];

  if (place.type === 's') {
    e.live.energy -= COLLECT.sample.energy;
    e.live.oxygen -= COLLECT.sample.oxygen;
    e.minutes += COLLECT.sample.minutes;
    e.remaining[place.index] -= 1;
    e.counts[place.index] = (e.counts[place.index] ?? 0) + 1;
  } else {
    e.minutes += COLLECT.look.minutes;
    e.live.oxygen -= COLLECT.look.oxygen;
    e.remaining[place.index] = 0;
    e.counts[place.index] = 1;
  }
  if (!e.order.includes(place.index)) e.order.push(place.index);

  return [{
    type: 'COLLECTED',
    place,
    count: e.counts[place.index],
    total: place.type === 's' ? PILE_SIZE[place.index] : 1,
    pileEmpty: e.remaining[place.index] <= 0,
  }];
}

/** Nunca se «muere»: un compañero sale a buscarte y eso cuesta Energía extra. */
export function rescue(e: Expedition): ExpeditionEvent[] {
  if (e.status === 'RETURNED' || e.status === 'RESCUED') return [];
  const floor = RESCUE.floor;
  e.live.energy = Math.max(floor, e.live.energy - RESCUE.cost.energy);
  e.live.oxygen = Math.max(floor, e.live.oxygen - RESCUE.cost.oxygen);
  e.live.shield = Math.max(floor, e.live.shield - RESCUE.cost.shield);
  e.minutes += RESCUE.extraMinutes;
  e.rescued = true;
  e.status = 'RESCUED';
  e.battery = 0; // se pierde la batería que quedaba
  return [{ type: 'RESCUED' }];
}

function returnToBase(e: Expedition): ExpeditionEvent[] {
  e.batteryReturned = Math.round(e.battery);
  e.live.energy = Math.min(100, e.live.energy + e.battery);
  e.battery = 0;
  e.status = 'RETURNED';
  return [{ type: 'RETURNED' }];
}

// ------------------------------------------------------------------ margen para volver

export interface ReturnMargin {
  /** 0 a 1: lo que sobraría de Energía y Oxígeno tras pagar el regreso. */
  readonly percent: number;
  readonly tone: 'ok' | 'warn' | 'danger';
  readonly limiting: 'ENERGY' | 'OXYGEN';
  readonly returnEnergy: number;
  readonly returnOxygen: number;
  /** Ya no alcanza a volver por su cuenta. */
  readonly cannotReturn: boolean;
}

/**
 * La barra «Margen para volver»: es lo que le sobraría de Energía y de Oxígeno,
 * sobre el total disponible, después de pagar el regreso. Con rover, el regreso
 * usa la batería que aún queda y, a pie, lo que esa batería no cubra.
 */
export function returnMargin(e: Expedition): ReturnMargin {
  const units = distanceToBase(e) / WORLD.unit;
  const usingRover = e.mode === 'ROVER' && e.battery > 0;

  let energy: number;
  let oxygen: number;
  if (usingRover) {
    const roverUnits = e.battery / COST.rover.battery;
    const walkUnits = Math.max(0, units - roverUnits);
    energy = walkUnits * COST.foot.energy;
    oxygen = Math.min(units, roverUnits) * COST.rover.oxygen + walkUnits * COST.foot.oxygen;
  } else {
    energy = units * COST.foot.energy;
    oxygen = units * COST.foot.oxygen;
  }

  const floor = RESCUE.triggerBelow;
  const availableEnergy = Math.max(1, e.live.energy - floor);
  const availableOxygen = Math.max(1, e.live.oxygen - floor);
  const leftEnergy = e.live.energy - floor - energy;
  const leftOxygen = e.live.oxygen - floor - oxygen;
  const ratioEnergy = leftEnergy / availableEnergy;
  const ratioOxygen = leftOxygen / availableOxygen;
  const percent = Math.max(0, Math.min(1, Math.min(ratioEnergy, ratioOxygen)));

  return {
    percent,
    tone: percent > 0.4 ? 'ok' : percent > 0.15 ? 'warn' : 'danger',
    limiting: ratioOxygen < ratioEnergy ? 'OXYGEN' : 'ENERGY',
    returnEnergy: energy,
    returnOxygen: oxygen,
    cannotReturn: leftEnergy < 0 || leftOxygen < 0,
  };
}

// ------------------------------------------------------------------ puntos y resultado

/** 10 la primera pieza y 3 por cada pieza extra; observar 5; huella 5; curiosidad 15. */
export function pointsFor(place: Pick<Place, 'type'>, pieces: number): number {
  switch (place.type) {
    case 's': return COLLECT.points.sampleFirst + COLLECT.points.sampleExtra * Math.max(0, pieces - 1);
    case 'm': return COLLECT.points.viewpoint;
    case 'r': return COLLECT.points.missionTrace;
    case 'e': return COLLECT.points.nasaCuriosity;
  }
}

export function findingsOf(e: Expedition): ExplorationFinding[] {
  return e.order.flatMap((index) => {
    const place = PLACES.find((candidate) => candidate.index === index);
    if (!place) return [];
    const pieces = e.counts[index] ?? 0;
    return [{ index, kind: KIND_BY_TYPE[place.type], pieces, points: pointsFor(place, pieces) }];
  });
}

export function toResult(e: Expedition): ExplorationResult {
  const findings = findingsOf(e);
  return {
    afterTurn: e.afterTurn,
    mode: e.startMode,
    batteryAllocated: e.battery0,
    batteryReturned: e.batteryReturned,
    minutes: Math.round(e.minutes),
    distanceMeters: Math.round(e.distance),
    rescued: e.rescued,
    before: e.before,
    after: {
      energy: Math.round(e.live.energy),
      oxygen: Math.round(e.live.oxygen),
      shield: Math.round(e.live.shield),
    },
    findings,
    points: findings.reduce((total, finding) => total + finding.points, 0),
  };
}

/** «2 h 10 min» o «45 min». */
export function formatMinutes(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return hours > 0 ? `${hours} h ${rest} min` : `${rest} min`;
}
