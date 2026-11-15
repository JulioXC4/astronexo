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

  it('registra las ocho cámaras y conserva los cinco interiores lunares', () => {
    expect(Object.values(marsModuleScenes)).toHaveLength(5);
    expect(Object.values(lunarModuleScenes)).toHaveLength(5);
    expect(Object.values(exteriorModuleScenes)).toHaveLength(3);
    expect(new Set([...Object.values(marsModuleScenes), ...Object.values(exteriorModuleScenes)]).size).toBe(8);
    expect(lunarModuleScenes.SOLAR_STORAGE).toBe('/assets/pixel-art/lunar-energy-module.png');
  });

  it('las cámaras importadas tienen extensión y firma WebP reales', () => {
    const cameras = [...Object.values(marsModuleScenes), ...Object.values(exteriorModuleScenes)];
    for (const path of cameras) {
      const data = bytes(path);
      expect(path.endsWith('.webp')).toBe(true);
      expect(data.subarray(0, 4).toString('ascii')).toBe('RIFF');
      expect(data.subarray(8, 12).toString('ascii')).toBe('WEBP');
    }
  });

  it('los fondos de control son PNG y los del constructor son JPEG válidos', () => {
    for (const entry of Object.values(spaceBackgrounds.control)) {
      const data = bytes(entry.path!);
      expect([...data.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    }
    for (const entry of Object.values(spaceBackgrounds.builder)) {
      const data = bytes(entry.path!);
      expect([...data.subarray(0, 2)]).toEqual([255, 216]);
    }
  });

  it('conserva transparencia en personajes, objetos e iconos PNG', () => {
    const pngs = [
      ...(['character.alba', 'character.chispa', 'character.aurora', 'character.nico'] as const).map((id) => assetManifest[id].path!),
      ...Object.values(hudAssets).map((entry) => entry.path!),
      ...Object.values(interventionAssets).flatMap((assets) => assets.map((asset) => asset.path)),
      ...playerSkinCatalog.map((skin) => skin.path),
    ];
    for (const path of new Set(pngs)) {
      const data = bytes(path);
      expect(data[25], path).toBe(6);
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
    expect(hudAssets.energy.path).toBe('/assets/space/ui/energy-icon.png');
    expect(hudAssets.oxygen.path).toBe('/assets/space/ui/oxygen-icon.png');
    expect(hudAssets.shield.path).toBe('/assets/space/ui/shield-icon.png');
    expect(exteriorCameraScenes.marsDustStorm.path).toBe(exteriorModuleScenes.MARS_DUST_STORM);
  });
});
