import { describe, expect, it } from 'vitest';
import { RADIO_TIMING, canInterrupt, visibleDurationMs } from '../../src/features/radio/radioTiming';

/** Prueba 12 de la especificación de JD, la parte que no necesita pantalla. */
describe('globo de radio · reglas de tiempo', () => {
  it('el primero tarda ~1,8 s y entre globos hay ~2,4 s de pausa', () => {
    expect(RADIO_TIMING.firstDelayMs).toBe(1800);
    expect(RADIO_TIMING.gapMs).toBe(2400);
  });

  it('un globo dura max(4500, 2500 + 55 × caracteres)', () => {
    expect(visibleDurationMs('Hola')).toBe(4500); // 2500 + 220 = 2720 → manda el mínimo
    const long = 'x'.repeat(100); // 2500 + 5500 = 8000
    expect(visibleDurationMs(long)).toBe(8000);
  });

  it('solo los avisos de peligro interrumpen, y nunca antes de 2,8 s', () => {
    expect(canInterrupt('danger', 2000)).toBe(false);
    expect(canInterrupt('danger', 2800)).toBe(true);
    expect(canInterrupt('danger', 9000)).toBe(true);
    // lo bueno y lo normal nunca interrumpen, por mucho que lleve el otro en pantalla
    expect(canInterrupt('normal', 9000)).toBe(false);
    expect(canInterrupt('good', 9000)).toBe(false);
  });

  it('el aviso de una acción del jugador (front) también interrumpe, pero respeta los 2,8 s', () => {
    expect(canInterrupt('good', 1000, true)).toBe(false);
    expect(canInterrupt('good', 2800, true)).toBe(true);
  });
});
