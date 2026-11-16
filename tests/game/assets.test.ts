import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  assetManifest,
  exteriorCameraScenes,
  getPlayerSkinForAvatarId,
  hudAssets,
  playerSkinCatalog,
  spaceBackgrounds,
} from '../../src/assets/manifest';
import { interventionAssets } from '../../src/assets/interventionAssets';
import { exteriorModuleScenes, lunarModuleScenes, marsModuleScenes } from '../../src/assets/moduleScenes';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const publicFile = (webPath: string) => join(projectRoot, 'public', webPath.replace(/^\//, ''));
const bytes = (webPath: string) => readFileSync(publicFile(webPath));

/** Firma del contenedor WebP: "RIFF" .... "WEBP". */
const isWebp = (data: Buffer) =>
  data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP';

/**
 * Un WebP solo lleva canal alfa si usa el contenedor extendido VP8X con el bit
 * 0x10 encendido; VP8 simple nunca tiene transparencia.
 */
const webpHasAlpha = (data: Buffer) =>
  data.subarray(12, 16).toString('ascii') === 'VP8X' && (data[20] & 0x10) !== 0;

const catalogPaths = (): string[] => [
  ...Object.values(assetManifest).flatMap((entry) => entry.path ? [entry.path] : []),
  ...Object.values(lunarModuleScenes),
  ...Object.values(marsModuleScenes),
  ...Object.values(exteriorModuleScenes),
  ...playerSkinCatalog.map((skin) => skin.path),
  ...Object.values(interventionAssets).flatMap((assets) => assets.map((asset) => asset.path)),
];

describe('catálogo de recursos visuales', () => {
  it('solo publica rutas existentes', () => {
    const missing = [...new Set(catalogPaths())].filter((path) => !existsSync(publicFile(path)));
    expect(missing).toEqual([]);
  });

  it('registra los 15 sprites obligatorios y la muestra marciana sin retirar los anteriores', () => {
    const newFiles = [
      'circuit-straight.webp', 'circuit-corner.webp', 'circuit-junction.webp', 'solar-battery-bank.webp',
      'solar-cleaner-cartridge.webp', 'eclss-water-reservoir.webp', 'eclss-power-unit.webp', 'eclss-electrolyzer.webp',
      'supply-crate-full.webp', 'sample-basalt.webp', 'sample-anorthosite.webp', 'sample-regolith.webp',
      'instrument-mineral-analyzer.webp', 'instrument-magnifier.webp', 'instrument-grain-imager.webp', 'sample-mars-sedimentary.webp',
    ];
    const paths = Object.values(interventionAssets).flatMap((assets) => assets.map((asset) => asset.path));
    for (const file of newFiles) expect(paths).toContain(`/assets/space/objects/${file}`);
    expect(paths).toHaveLength(39);
  });

  it('registra las ocho cámaras y conserva los cinco interiores lunares', () => {
    expect(Object.values(marsModuleScenes)).toHaveLength(5);
    expect(Object.values(lunarModuleScenes)).toHaveLength(5);
    expect(Object.values(exteriorModuleScenes)).toHaveLength(3);
    expect(new Set([...Object.values(marsModuleScenes), ...Object.values(exteriorModuleScenes)]).size).toBe(8);
    expect(lunarModuleScenes.SOLAR_STORAGE).toBe('/assets/pixel-art/lunar-energy-module.webp');
  });

  it('las cámaras importadas tienen extensión y firma WebP reales', () => {
    const cameras = [...Object.values(marsModuleScenes), ...Object.values(exteriorModuleScenes)];
    for (const path of cameras) {
      const data = bytes(path);
      expect(path.endsWith('.webp')).toBe(true);
      expect(isWebp(data), path).toBe(true);
    }
  });

  it('todo el catálogo son WebP válidos: ni un PNG ni un JPEG sueltos', () => {
    for (const path of new Set(catalogPaths())) {
      expect(path.endsWith('.webp'), path).toBe(true);
      expect(isWebp(bytes(path)), path).toBe(true);
    }
    for (const entry of [...Object.values(spaceBackgrounds.control), ...Object.values(spaceBackgrounds.builder)]) {
      expect(isWebp(bytes(entry.path!)), entry.path!).toBe(true);
    }
  });

  it('conserva transparencia en personajes, objetos e iconos', () => {
    const pngs = [
      ...(['character.alba', 'character.chispa', 'character.aurora', 'character.nico'] as const).map((id) => assetManifest[id].path!),
      ...Object.values(hudAssets).map((entry) => entry.path!),
      ...Object.values(interventionAssets).flatMap((assets) => assets.map((asset) => asset.path)),
      ...playerSkinCatalog.map((skin) => skin.path),
    ];
    for (const path of new Set(pngs)) {
      expect(webpHasAlpha(bytes(path)), path).toBe(true);
    }
  });

  it('expone seis skins y adapta los cuatro IDs de avatar existentes', () => {
    expect(playerSkinCatalog).toHaveLength(6);
    expect(new Set(playerSkinCatalog.map((skin) => skin.id)).size).toBe(6);
    for (const avatarId of ['ALBA', 'LEO', 'AURORA', 'NICO']) {
      expect(getPlayerSkinForAvatarId(avatarId).path).toMatch(/^\/assets\/characters\/player-skins\//);
    }
  });

  it('mantiene disponibles las rutas semánticas del HUD y cámaras exteriores', () => {
    expect(hudAssets.energy.path).toBe('/assets/space/ui/energy-icon.webp');
    expect(hudAssets.oxygen.path).toBe('/assets/space/ui/oxygen-icon.webp');
    expect(hudAssets.shield.path).toBe('/assets/space/ui/shield-icon.webp');
    expect(exteriorCameraScenes.marsDustStorm.path).toBe(exteriorModuleScenes.MARS_DUST_STORM);
  });
});
