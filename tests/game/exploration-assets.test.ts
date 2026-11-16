import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { AVATAR_OPTIONS } from '../../src/data/avatars';
import {
  BACKGROUND_CROPS,
  BACKGROUNDS,
  BASES,
  EXPLORER_FRAME,
  EXPLORERS,
  FINDING_IMAGES,
  MARKERS,
  posesForAvatar,
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
  ...Object.values(EXPLORERS).flatMap((poses) => Object.values(poses)),
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

  it('cada personaje elegible explora con sus propias poses', () => {
    const seen = new Set<string>();
    for (const avatar of AVATAR_OPTIONS) {
      const poses = posesForAvatar(avatar.id);
      expect(poses, avatar.id).toBe(EXPLORERS[avatar.id as keyof typeof EXPLORERS]);
      for (const path of Object.values(poses)) {
        expect(path, avatar.id).toContain(`/characters/${avatar.id.toLowerCase()}/`);
        seen.add(path);
      }
    }
    expect(seen.size).toBe(AVATAR_OPTIONS.length * 4);
  });

  it('un avatar desconocido o ausente explora con Alba (el avatar por defecto)', () => {
    expect(posesForAvatar(undefined)).toBe(EXPLORERS.ALBA);
    expect(posesForAvatar('SIN_PERSONAJE')).toBe(EXPLORERS.ALBA);
    expect(posesForAvatar('nico')).toBe(EXPLORERS.NICO);
  });

  it('las poses comparten el lienzo cuadrado que asume la geometría del renderer', () => {
    for (const poses of Object.values(EXPLORERS)) {
      for (const path of Object.values(poses)) expect(pngSize(path), path).toEqual({ width: 512, height: 512 });
    }
    expect(EXPLORER_FRAME.footY).toBeGreaterThan(EXPLORER_FRAME.bodyHeight);
    expect(EXPLORER_FRAME.footY).toBeLessThanOrEqual(1);
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
