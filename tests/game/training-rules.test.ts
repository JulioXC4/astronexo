import { describe, expect, it } from 'vitest';
import {
  altitudeCost, altitudeDone, altitudeGas,
  arcticCost, arcticDone, arcticTemperature,
  cloudsCost, cloudsDone, moveToken, polarCost, polarDone, POLAR_START,
  eclssCost, eclssDone, eclssOxygen, eclssTotalPower,
  recommendedReserve, reserveHint, reserveMismatch, tierFromCost,
  veggieCost, veggieDone, veggieGrowth,
} from '../../src/features/earth/minigames/trainingRules';

/**
 * Las reglas de los minijuegos de la Tierra no cambiaron al rediseñarlos: lo que
 * cambió es cómo se juegan. Estas pruebas fijan los números de antes.
 */
describe('huerto (Veggie)', () => {
  it('se completa con luz roja entre 65 y 75 y agua media; con 70 o más cuesta 1', () => {
    expect(veggieDone({ red: 70, water: 'MID' })).toBe(true);
    expect(veggieCost({ red: 70, water: 'MID' })).toBe(1);
    expect(veggieDone({ red: 65, water: 'MID' })).toBe(true);
    expect(veggieCost({ red: 65, water: 'MID' })).toBe(2);
  });
  it('no se completa con la luz equivocada ni con poca o mucha agua', () => {
    expect(veggieDone({ red: 60, water: 'MID' })).toBe(false);
    expect(veggieDone({ red: 70, water: 'LOW' })).toBe(false);
    expect(veggieDone({ red: 70, water: 'HIGH' })).toBe(false);
    expect(veggieGrowth({ red: 70, water: 'MID' })).toBe(100);
  });
});

describe('invernadero ártico', () => {
  it('con la cúpula cerrada y flujo 52 llega a 24 °C y cuesta 1', () => {
    const s = { flow: 52, insulated: true, led: 'NORMAL' } as const;
    expect(arcticTemperature(s)).toBe(24);
    expect(arcticDone(s)).toBe(true);
    expect(arcticCost(s)).toBe(1);
  });
  it('sin cúpula cerrada o con poco calor no se completa', () => {
    expect(arcticDone({ flow: 52, insulated: false, led: 'NORMAL' })).toBe(false);
    expect(arcticDone({ flow: 30, insulated: true, led: 'NORMAL' })).toBe(false);
  });
  it('gastar mucho calor de la Tierra (flujo > 65) no vale aunque la temperatura sirva', () => {
    expect(arcticDone({ flow: 70, insulated: true, led: 'LOW' })).toBe(false);
  });
});

describe('reserva polar', () => {
  it('con 5 baterías en calefacción cuesta 1; con 6 o más, 2', () => {
    expect(polarDone({ heat: 5, crops: 2, radio: 3 })).toBe(true);
    expect(polarCost({ heat: 5, crops: 2, radio: 3 })).toBe(1);
    expect(polarDone({ heat: 6, crops: 2, radio: 2 })).toBe(true);
    expect(polarCost({ heat: 6, crops: 2, radio: 2 })).toBe(2);
  });
  it('no se completa si falta calefacción, plantas o radio', () => {
    expect(polarDone(POLAR_START)).toBe(false); // 4 de calefacción: se congela
    expect(polarDone({ heat: 5, crops: 1, radio: 4 })).toBe(false);
    expect(polarDone({ heat: 5, crops: 5, radio: 0 })).toBe(false);
  });
  it('mover baterías conserva el total y nunca deja un lugar en negativo', () => {
    let s = POLAR_START;
    s = moveToken(s, 'radio', 'heat');
    expect(s).toEqual({ heat: 5, crops: 3, radio: 2 });
    expect(s.heat + s.crops + s.radio).toBe(10);
    const empty = { heat: 10, crops: 0, radio: 0 };
    expect(moveToken(empty, 'crops', 'heat')).toBe(empty);
    expect(moveToken(s, 'heat', 'heat')).toBe(s);
  });
});

describe('cámara de altura', () => {
  const closed = [true, true, true] as const;
  it('entre 70 y 82 kPa con los tres sellos cerrados se completa; hasta 75 cuesta 1', () => {
    expect(altitudeDone({ kpa: 72, seals: closed })).toBe(true);
    expect(altitudeGas({ kpa: 72, seals: closed })).toBe(43);
    expect(altitudeCost({ kpa: 72, seals: closed })).toBe(1);
    expect(altitudeCost({ kpa: 78, seals: closed })).toBe(2);
  });
  it('con poca presión o un sello abierto no se completa', () => {
    expect(altitudeDone({ kpa: 68, seals: closed })).toBe(false);
    expect(altitudeDone({ kpa: 72, seals: [true, true, false] })).toBe(false);
    expect(altitudeDone({ kpa: 90, seals: closed })).toBe(false);
  });
});

describe('soporte vital (ECLSS)', () => {
  it('con 300 W, limpiador y 88 % de agua se completa y cuesta 1', () => {
    const s = { watts: 300, scrubber: true, recycle: 88 };
    expect(eclssOxygen(s)).toBe(20.7);
    expect(eclssTotalPower(s)).toBe(389);
    expect(eclssDone(s)).toBe(true);
    expect(eclssCost(s)).toBe(1);
  });
  it('con 340 W también se completa pero gasta más y cuesta 2', () => {
    const s = { watts: 340, scrubber: true, recycle: 88 };
    expect(eclssDone(s)).toBe(true);
    expect(eclssCost(s)).toBe(2);
  });
  it('sin limpiador, con poco oxígeno o pasándose de potencia no se completa', () => {
    expect(eclssDone({ watts: 300, scrubber: false, recycle: 88 })).toBe(false);
    expect(eclssDone({ watts: 200, scrubber: true, recycle: 88 })).toBe(false);
    expect(eclssDone({ watts: 420, scrubber: true, recycle: 98 })).toBe(false); // 420 + 45 + 49 > 450
  });
});

describe('nubes y soles', () => {
  const values = [5.6, 5.65, 6.17];
  it('la reserva sugerida es lo que cada día pierde respecto al mejor', () => {
    // (1 − 5,6/6,17 + 1 − 5,65/6,17 + 0) / 3 ≈ 5,9 %
    expect(recommendedReserve(values)).toBe(6);
    expect(reserveMismatch(6, values)).toBe(0);
  });
  it('con una diferencia de hasta 25 puntos se completa; hasta 10 cuesta 1', () => {
    expect(cloudsDone(5, values)).toBe(true);
    expect(cloudsCost(5, values)).toBe(1);
    expect(cloudsDone(30, values)).toBe(true);
    expect(cloudsCost(30, values)).toBe(2);
    expect(cloudsDone(60, values)).toBe(false);
  });
  it('la pista dice hacia dónde corregir, sin revelar el número', () => {
    const wide = [1, 3, 6]; // días muy distintos: pide una reserva alta
    expect(reserveHint(0, wide)).toBe('TOO_LITTLE');
    expect(reserveHint(100, wide)).toBe('TOO_MUCH');
    expect(reserveHint(recommendedReserve(wide), wide)).toBe('RIGHT');
  });
});

describe('calidad', () => {
  it('costo 1 es «Perfecto» y costo 2 es «Bien hecho»', () => {
    expect(tierFromCost(1)).toBe('excellent');
    expect(tierFromCost(2)).toBe('good');
  });
});
