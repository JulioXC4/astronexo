import { describe, it, expect } from 'vitest';
import {
  FACILITY_POSITIONS,
  LAUNCH_PAD,
  MAP_HEIGHT,
  MAP_WIDTH,
  computeSceneLayout,
} from '../../src/visual-kit/earthMapLayout';

/** Rectángulo (en px de pantalla) de una caja lógica del escenario. */
function screenBox(layout: ReturnType<typeof computeSceneLayout>, x0: number, y0: number, x1: number, y1: number) {
  return {
    left: layout.x + x0 * layout.scale,
    right: layout.x + x1 * layout.scale,
    top: layout.y + y0 * layout.scale,
    bottom: layout.y + y1 * layout.scale,
  };
}

const VIEWPORTS: ReadonlyArray<readonly [number, number]> = [
  [1920, 1080], [1366, 768], [1280, 720], [1024, 768], [1180, 820], [820, 1180], [2560, 1080], [3440, 1440], [390, 844],
];

describe('Mapa terrestre inmersivo: encuadre del escenario', () => {
  it('con 16:9 llena el viewport exactamente, sin recortes ni franjas', () => {
    for (const [w, h] of [[1920, 1080], [1366, 768], [1280, 720]] as const) {
      const layout = computeSceneLayout(w, h);
      expect(layout.scale).toBeCloseTo(w / MAP_WIDTH, 2);
      expect(Math.abs(layout.x)).toBeLessThan(1.5);
      expect(Math.abs(layout.y)).toBeLessThan(1.5); // 16:9 redondeado: como mucho 1 px de recorte
      expect(layout.letterboxX).toBe(false);
      expect(layout.letterboxY).toBe(false);
    }
  });

  it('conserva siempre la relación de aspecto original del escenario', () => {
    for (const [w, h] of VIEWPORTS) {
      const layout = computeSceneLayout(w, h);
      expect(layout.width / layout.height).toBeCloseTo(MAP_WIDTH / MAP_HEIGHT, 3);
    }
  });

  it('nunca recorta edificios ni la plataforma de lanzamiento en ningún viewport', () => {
    for (const [w, h] of VIEWPORTS) {
      const layout = computeSceneLayout(w, h);
      for (const { x, y } of FACILITY_POSITIONS) {
        // Sprite 150x135 anclado en (x-75, y-100). La sombra suave bajo la plataforma puede quedar
        // a pocos píxeles del borde en pantallas ultra anchas sin afectar al edificio.
        const box = screenBox(layout, x - 75, y - 100, x + 75, y + 35);
        expect(box.left, `${w}x${h} izquierda`).toBeGreaterThanOrEqual(-0.5);
        expect(box.right, `${w}x${h} derecha`).toBeLessThanOrEqual(w + 0.5);
        expect(box.top, `${w}x${h} arriba`).toBeGreaterThanOrEqual(-0.5);
        expect(box.bottom, `${w}x${h} abajo`).toBeLessThanOrEqual(h + 0.5);
      }
      const pad = screenBox(layout, LAUNCH_PAD.x - 96, LAUNCH_PAD.y - 52, LAUNCH_PAD.x + 96, LAUNCH_PAD.y + 52);
      expect(pad.right, `${w}x${h} plataforma`).toBeLessThanOrEqual(w + 0.5 + 0.1 * w);
      expect(pad.left, `${w}x${h} plataforma`).toBeGreaterThanOrEqual(0);
    }
  });

  it('cuando el escenario no llena la pantalla, queda dentro del contenedor y avisa de las franjas', () => {
    const tablet = computeSceneLayout(1024, 768);
    expect(tablet.letterboxY).toBe(true);
    expect(tablet.y).toBeGreaterThanOrEqual(0);
    expect(tablet.y + tablet.height).toBeLessThanOrEqual(768);

    const portrait = computeSceneLayout(820, 1180);
    expect(portrait.letterboxLarge).toBe(true);
    // En vertical se recorta solo el borde izquierdo (decoración) para mantener visible la plataforma de lanzamiento.
    expect(portrait.x).toBeLessThanOrEqual(0);
    expect(portrait.x + portrait.width).toBeGreaterThanOrEqual(820);
  });

  it('degrada con seguridad con contenedores sin medir', () => {
    const layout = computeSceneLayout(0, 0);
    expect(layout.scale).toBe(1);
    expect(layout.letterboxX || layout.letterboxY).toBe(false);
  });

  it('mantiene las posiciones originales de las cinco instalaciones', () => {
    expect(FACILITY_POSITIONS).toEqual([
      { x: 245, y: 185 }, { x: 608, y: 185 }, { x: 190, y: 325 }, { x: 630, y: 325 }, { x: 402, y: 438 },
    ]);
  });
});
