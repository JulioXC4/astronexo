import { describe, expect, it } from 'vitest';
import { applyExploration, createMission, shouldOfferExploration } from '../../src/game';
import type { GameSetup } from '../../src/game';
import {
  collect,
  distanceToBase,
  formatMinutes,
  placeInReach,
  pointsFor,
  rescue,
  returnMargin,
  startExpedition,
  stepExpedition,
  toResult,
  type Expedition,
} from '../../src/features/exploration/explorationEngine';
import { PLACES, WORLD } from '../../src/features/exploration/explorationData';
import { TERRAIN, type Terrain } from '../../src/features/exploration/terrain';

/**
 * Pruebas de aceptación de la especificación de JD (§13) que se pueden
 * comprobar sin pantalla. Las que dependen de la interfaz (redimensionar la
 * ventana, aro de resaltado) se verifican jugando.
 */

const EMPTY: Terrain = { craters: [], rocks: [], soft: [], decoration: [], solid: [] };
const RICH = { energy: 70, oxygen: 70, shield: 60 };

function walk(e: Expedition, dx: number, dy: number, seconds: number, fps = 100, terrain: Terrain = EMPTY) {
  const frames = Math.round(seconds * fps);
  for (let i = 0; i < frames; i++) stepExpedition(e, { dx, dy }, 1 / fps, terrain);
}

function foot(resources = RICH) {
  const e = startExpedition({ afterTurn: 2, mode: 'FOOT', resources });
  if (!e) throw new Error('no debió negarse la salida a pie');
  return e;
}

function rover(battery: number, resources = RICH) {
  const e = startExpedition({ afterTurn: 2, mode: 'ROVER', battery, resources });
  if (!e) throw new Error('no debió negarse la salida en rover');
  return e;
}

describe('salida a explorar · costos y movimiento', () => {
  it('1 · a pie, 300 px: Energía −3, Oxígeno −3, Protección −1', () => {
    const e = foot();
    walk(e, 1, 0, 300 / 140); // 300 px a 140 px/s
    expect(Math.abs(e.live.energy - 67)).toBeLessThanOrEqual(1);
    expect(Math.abs(e.live.oxygen - 67)).toBeLessThanOrEqual(1);
    expect(Math.abs(e.live.shield - 59)).toBeLessThanOrEqual(1);
  });

  it('2 · en rover con batería 35: la base pierde 35 al partir y 300 px cuestan 2 de batería y 1 de Oxígeno', () => {
    const e = rover(35);
    expect(e.live.energy).toBe(70 - 35);
    walk(e, 1, 0, 1); // 300 px a 300 px/s
    expect(Math.abs(e.battery - 33)).toBeLessThanOrEqual(0.2);
    expect(Math.abs(e.live.oxygen - 69)).toBeLessThanOrEqual(0.2);
    // la Energía de la base no se toca: el rover gasta de SU batería
    expect(e.live.energy).toBe(35);
  });

  it('3 · el movimiento no depende de los cuadros por segundo', () => {
    const distances = [60, 30, 5].map((fps) => {
      const e = rover(35);
      walk(e, 1, 0, 2, fps);
      return e.px - WORLD.playerStart.x;
    });
    for (const d of distances) expect(Math.abs(d - 600)).toBeLessThan(1); // 300 px/s × 2 s
    const onFoot = foot();
    walk(onFoot, 1, 0, 2, 30);
    expect(Math.abs(onFoot.px - WORLD.playerStart.x - 280)).toBeLessThan(1); // 140 px/s × 2 s
  });

  it('4 · batería agotada: el rover queda estacionado y se sigue a pie', () => {
    const e = rover(1, { energy: 100, oxygen: 100, shield: 100 });
    const events = [];
    for (let i = 0; i < 300; i++) events.push(...stepExpedition(e, { dx: 1, dy: 0 }, 0.01, EMPTY));
    expect(events.filter((event) => event.type === 'BATTERY_EMPTY')).toHaveLength(1);
    expect(e.mode).toBe('FOOT');
    expect(e.onFoot).toBe(true);
    expect(e.parked).not.toBeNull();
    expect(e.battery).toBe(0);
  });

  it('5 · un cráter no se atraviesa y el terreno blando frena y cuesta el doble', () => {
    const wall: Terrain = { ...EMPTY, craters: [[400, 900, 50]], solid: [[400, 900, 50]] };
    const blocked = foot();
    walk(blocked, 1, 0, 5, 100, wall);
    expect(blocked.px).toBeLessThan(400 - 50);

    const mud: Terrain = { ...EMPTY, soft: [[240, 900, 200]] };
    const slow = foot();
    const events = [];
    for (let i = 0; i < 100; i++) events.push(...stepExpedition(slow, { dx: 1, dy: 0 }, 0.01, mud));
    expect(events.some((event) => event.type === 'SOFT_TERRAIN')).toBe(true);
    expect(Math.abs(slow.px - WORLD.playerStart.x - 84)).toBeLessThan(1); // 140 × 0.6 = 84 px/s
    // 84 px = 0,28 unidades × 3 de Energía × 2 por terreno blando = 1,68
    expect(Math.abs(70 - slow.live.energy - 1.68)).toBeLessThan(0.05);
  });

  it('el mapa generado deja libre la base y el inicio, y todos los lugares son alcanzables', () => {
    expect(TERRAIN.craters).toHaveLength(26);
    expect(TERRAIN.rocks.length).toBeGreaterThan(20);
    expect(TERRAIN.soft.length).toBeGreaterThan(4);
    const startBlocked = TERRAIN.solid.some(
      (d) => Math.hypot(WORLD.playerStart.x - d[0], WORLD.playerStart.y - d[1]) < d[2] + WORLD.collisionMargin,
    );
    expect(startBlocked).toBe(false);
    for (const place of PLACES) {
      const covered = TERRAIN.solid.some((d) => Math.hypot(place.x - d[0], place.y - d[1]) < d[2] + 30);
      expect(covered, `el lugar ${place.index} no debe quedar tapado`).toBe(false);
    }
  });
});

describe('salida a explorar · hallazgos', () => {
  it('6 · el alcance es de 48 px: a 47 se puede recoger, a 49 no', () => {
    const e = foot();
    const pile = PLACES[0];
    e.px = pile.x + 47; e.py = pile.y;
    expect(placeInReach(e)?.index).toBe(pile.index);
    e.px = pile.x + 49;
    expect(placeInReach(e)).toBeNull();
    expect(collect(e)).toEqual([{ type: 'NOTHING_NEAR' }]);
  });

  it('7 · cuatro piezas del montón de regolito: «×4» y 10 + 3 + 3 + 3 = 19 puntos', () => {
    const e = foot();
    const pile = PLACES[0];
    e.px = pile.x; e.py = pile.y;
    for (let i = 0; i < 4; i++) collect(e);
    const result = toResult(e);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].pieces).toBe(4);
    expect(result.points).toBe(19);
    // el montón queda vacío: una quinta vez ya no hay nada
    expect(collect(e)).toEqual([{ type: 'NOTHING_NEAR' }]);
    // cada pieza gasta 1 de Energía y 1 de Oxígeno y toma 8 min
    expect(e.live.energy).toBe(70 - 4);
    expect(e.live.oxygen).toBe(70 - 4);
    expect(e.minutes).toBe(32);
  });

  it('observar, huella y curiosidad dan 5, 5 y 15 puntos y gastan solo Oxígeno', () => {
    const e = foot();
    for (const index of [5, 7, 9]) {
      const place = PLACES.find((p) => p.index === index)!;
      e.px = place.x; e.py = place.y;
      collect(e);
    }
    expect(toResult(e).points).toBe(5 + 5 + 15);
    expect(e.live.energy).toBe(70);
    expect(e.live.oxygen).toBe(67);
    expect(pointsFor({ type: 's' }, 1)).toBe(10);
  });
});

describe('salida a explorar · rescate y regreso', () => {
  it('8 · con Energía menor que 5: aviso y rescate a los 1,5 s, sin bajar de 1', () => {
    const e = foot({ energy: 30, oxygen: 30, shield: 30 });
    e.live.energy = 4;
    const first = stepExpedition(e, { dx: 0, dy: 0 }, 0.1, EMPTY);
    expect(first.some((event) => event.type === 'NO_MARGIN')).toBe(true);
    expect(e.status).toBe('STUCK');

    stepExpedition(e, { dx: 0, dy: 0 }, 1.0, EMPTY);
    expect(e.status).toBe('STUCK'); // aún no pasaron 1,5 s
    const later = stepExpedition(e, { dx: 0, dy: 0 }, 0.6, EMPTY);
    expect(later.some((event) => event.type === 'RESCUED')).toBe(true);
    expect(e.status).toBe('RESCUED');
    expect(e.live.energy).toBe(1);
    expect(e.live.oxygen).toBe(26);
    expect(e.live.shield).toBe(28);
    expect(e.minutes).toBe(60);
    expect(e.live.energy).toBeGreaterThanOrEqual(1);
  });

  it('pedir rescate cuesta lo mismo y se pierde la batería que quedaba', () => {
    const e = rover(35);
    rescue(e);
    const result = toResult(e);
    expect(result.rescued).toBe(true);
    expect(e.battery).toBe(0);
    expect(result.after.energy).toBe(Math.max(1, 35 - 10));
  });

  it('9 · volver con batería sobrante: la Energía de la base la recupera (tope 100)', () => {
    const e = rover(35);
    walk(e, 1, 0, 0.7); // se aleja más de 260 px de la base
    expect(e.left).toBe(true);
    walk(e, -1, 0, 1); // y vuelve
    expect(e.status).toBe('RETURNED');
    expect(e.batteryReturned).toBeGreaterThan(0);
    const result = toResult(e);
    expect(result.after.energy).toBeGreaterThan(35);
    expect(result.after.energy).toBeLessThanOrEqual(100);
    expect(result.rescued).toBe(false);
    expect(result.batteryReturned).toBe(e.batteryReturned);
  });

  it('el tope de 100 se respeta al devolver la batería', () => {
    const e = rover(50, { energy: 100, oxygen: 100, shield: 100 });
    walk(e, 1, 0, 0.7);
    walk(e, -1, 0, 1);
    expect(e.status).toBe('RETURNED');
    expect(toResult(e).after.energy).toBeLessThanOrEqual(100);
  });

  it('no se puede salir sin recursos suficientes', () => {
    expect(startExpedition({ afterTurn: 2, mode: 'FOOT', resources: { energy: 24, oxygen: 70, shield: 60 } })).toBeNull();
    expect(startExpedition({ afterTurn: 2, mode: 'FOOT', resources: { energy: 70, oxygen: 24, shield: 60 } })).toBeNull();
    // batería 50 exige Energía ≥ 65
    expect(startExpedition({ afterTurn: 2, mode: 'ROVER', battery: 50, resources: { energy: 64, oxygen: 70, shield: 60 } })).toBeNull();
    expect(startExpedition({ afterTurn: 2, mode: 'ROVER', battery: 50, resources: { energy: 65, oxygen: 70, shield: 60 } })).not.toBeNull();
    expect(startExpedition({ afterTurn: 2, mode: 'ROVER', battery: 20, resources: { energy: 70, oxygen: 19, shield: 60 } })).toBeNull();
  });
});

describe('salida a explorar · margen para volver', () => {
  it('cerca de la base el margen es alto; lejos y con poco, no alcanza a volver', () => {
    const near = foot();
    expect(returnMargin(near).tone).toBe('ok');
    expect(returnMargin(near).cannotReturn).toBe(false);

    // a ~7 unidades de la base, volver cuesta ~22 de Energía y de Oxígeno
    const far = foot({ energy: 25, oxygen: 25, shield: 30 });
    far.px = 2300; far.py = 800;
    const margin = returnMargin(far);
    expect(margin.cannotReturn).toBe(true);
    expect(margin.tone).toBe('danger');
  });

  it('dice qué recurso te limita más', () => {
    const e = foot({ energy: 90, oxygen: 30, shield: 60 });
    e.px = 1200; e.py = 900;
    expect(returnMargin(e).limiting).toBe('OXYGEN');
  });

  it('el costo de volver cuesta lo mismo que la ida', () => {
    const e = foot();
    e.px = WORLD.base.x + 600; e.py = WORLD.base.y;
    const margin = returnMargin(e);
    expect(margin.returnEnergy).toBeCloseTo((600 / WORLD.unit) * 3);
    expect(margin.returnOxygen).toBeCloseTo((600 / WORLD.unit) * 3);
    expect(distanceToBase(e)).toBe(600);
  });
});

describe('salida a explorar · enganche con la guardia', () => {
  const setup: GameSetup = {
    mode: 'SOLO',
    city: 'AREQUIPA',
    destination: 'MOON',
    completedEarthMissions: ['M1', 'M2', 'M3'],
    selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY'],
    selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
    scenarioId: 'H2_REPRODUCIBLE',
    difficulty: 'CALM',
  };

  it('13 · aparece solo tras los turnos 2 y 4, y nunca si la guardia ya terminó', () => {
    const live = { outcome: 'IN_PROGRESS' as const };
    expect(shouldOfferExploration(1, live)).toBe(false);
    expect(shouldOfferExploration(2, live)).toBe(true);
    expect(shouldOfferExploration(3, live)).toBe(false);
    expect(shouldOfferExploration(4, live)).toBe(true);
    expect(shouldOfferExploration(5, live)).toBe(false);
    expect(shouldOfferExploration(2, { outcome: 'INTERRUPTED' })).toBe(false);
  });

  it('escribe barras, colección y registro de salidas, y convierte los puntos en Ciencia con tope', () => {
    const e = foot();
    const pile = PLACES.find((place) => place.index === 2)!; // anortosita, 5 piezas
    e.px = pile.x; e.py = pile.y;
    for (let i = 0; i < 5; i++) collect(e);

    const before = createMission(setup);
    const after = applyExploration(before, toResult(e));

    expect(after.collection).toEqual([2, 2, 2, 2, 2]);
    expect(after.explorationPoints).toBe(10 + 3 * 4);
    expect(after.explorations).toHaveLength(1);
    expect(after.explorations[0]).toMatchObject({ afterTurn: 2, pieces: 5, mode: 'FOOT', rescued: false });
    expect(after.energy).toBe(Math.round(e.live.energy));
    expect(after.scienceProgress).toBeGreaterThan(before.scienceProgress);
    // la salida no gasta la acción del turno
    expect(after.actionTakenThisTurn).toBe(before.actionTakenThisTurn);
  });

  it('una salida enorme no gana la partida sola: la Ciencia que da tiene tope', () => {
    const e = foot();
    for (const place of PLACES) {
      e.px = place.x; e.py = place.y;
      for (let i = 0; i < 5; i++) collect(e);
    }
    const result = toResult(e);
    expect(result.points).toBeGreaterThan(60);
    const after = applyExploration(createMission(setup), result);
    expect(after.scienceProgress - createMission(setup).scienceProgress).toBeLessThanOrEqual(20);
  });
});

describe('utilidades', () => {
  it('formatea minutos', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(200)).toBe('3 h 20 min');
    expect(formatMinutes(0)).toBe('0 min');
  });
});
