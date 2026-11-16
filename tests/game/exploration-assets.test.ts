import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ASTRONAUT,
  BACKGROUND_CROPS,
  BACKGROUNDS,
  BASES,
  FINDING_IMAGES,
  MARKERS,
  ROVERS,
  TERRAIN_SPRITES,
  UI,
} from '../../src/features/exploration/explorationAssets';
import { COLLECTION_SIZE, PLACES, REQUIREMENTS, WORLD } from '../../src/features/exploration/explorationData';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const publicFile = (webPath: string) => join(projectRoot, 'public', webPath.replace(/^\//, ''));

/** Ancho y alto de un PNG leyendo su cabecera IHDR. */
function pngSize(webPath: string) {
  const data = readFileSync(publicFile(webPath));
  expect(data.subarray(1, 4).toString('ascii'), webPath).toBe('PNG');
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

const allPaths = (): string[] => [
  ...Object.values(BACKGROUNDS),
  ...Object.values(BASES),
  ...Object.values(ROVERS),
  ...Object.values(ASTRONAUT),
  ...Object.values(MARKERS),
  ...Object.values(UI.battery),
  UI.scienceBadge,
  UI.cardFoot,
  UI.cardRover,
  UI.cardStay,
  ...Object.values(TERRAIN_SPRITES).flatMap((set) => Object.values(set)),
  ...Object.values(FINDING_IMAGES).flat(),
];

describe('sprites de la salida a explorar', () => {
  it('todas las rutas apuntan a PNG existentes', () => {
    const missing = [...new Set(allPaths())].filter((path) => !existsSync(publicFile(path)));
    expect(missing).toEqual([]);
    for (const path of new Set(allPaths())) expect(path.endsWith('.png'), path).toBe(true);
  });

  it('cada hallazgo de cada destino tiene su imagen, sin repetirse', () => {
    for (const destination of ['MOON', 'MARS'] as const) {
      expect(FINDING_IMAGES[destination]).toHaveLength(COLLECTION_SIZE);
      expect(new Set(FINDING_IMAGES[destination]).size).toBe(COLLECTION_SIZE);
    }
    // Los índices de los lugares del mapa son los de la colección.
    expect(Math.max(...PLACES.map((place) => place.index))).toBe(COLLECTION_SIZE - 1);
  });

  it('hay un sprite de batería para cada opción de batería', () => {
    for (const battery of REQUIREMENTS.batteryOptions) expect(UI.battery[battery]).toBeTruthy();
  });

  it('los recortes de fondo tienen la proporción del mundo (no se estira) y caben en la imagen', () => {
    for (const destination of ['MOON', 'MARS'] as const) {
      const { width, height } = pngSize(BACKGROUNDS[destination]);
      const crop = BACKGROUND_CROPS[destination];
      expect(crop.x + crop.w).toBeLessThanOrEqual(1.0001);
      expect(crop.y + crop.h).toBeLessThanOrEqual(1.0001);
      const aspect = (width * crop.w) / (height * crop.h);
      expect(aspect).toBeCloseTo(WORLD.width / WORLD.height, 1);
    }
  });
});
