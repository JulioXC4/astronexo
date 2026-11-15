export type AssetId =
  | 'character.alba' | 'character.chispa' | 'character.aurora' | 'character.nico'
  | 'background.earth' | 'background.earthWelcome' | 'background.moon' | 'background.mars'
  | 'background.moonBuilder' | 'background.marsBuilder'
  | 'camera.lunarExteriorDay' | 'camera.lunarExteriorNight' | 'camera.marsExteriorDustStorm'
  | 'ui.welcomeWordmark' | 'ui.dialogFrame' | 'ui.alertFrame' | 'ui.cameraFrame'
  | 'ui.energy' | 'ui.air' | 'ui.shelter' | 'ui.food' | 'ui.research'
  | 'ui.selectionRing' | 'ui.arrowBack' | 'ui.arrowNext' | 'ui.repairCompleted'
  | 'facility.observatory' | 'facility.weatherTower' | 'facility.eclssHangar' | 'facility.bioDome' | 'facility.launchPad'
  | 'tool.panels' | 'tool.lifeSupport' | 'tool.shelterKit' | 'tool.cropKit'
  | 'ui.console'
  | 'object.panel' | 'object.airlock' | 'animation.alert' | 'audio.alert';

export interface AssetEntry {
  readonly path: string | null;
  readonly fallbackLabel: string;
  readonly fallbackColor: string;
}

export const assetManifest: Record<AssetId, AssetEntry> = {
  'character.alba': { path: '/assets/pixel-art/cadet-alba.png', fallbackLabel: 'Alba', fallbackColor: '#5c7ab3' },
  'character.chispa': { path: '/assets/characters/chispa.png', fallbackLabel: 'Chispa', fallbackColor: '#e0a548' },
  'character.aurora': { path: '/assets/pixel-art/officer-aurora.png', fallbackLabel: 'Aurora', fallbackColor: '#9a7ac0' },
  'character.nico': { path: '/assets/pixel-art/engineer-nico.png', fallbackLabel: 'Nico', fallbackColor: '#67a995' },
  'background.earth': { path: null, fallbackLabel: 'Centro terrestre', fallbackColor: '#38547a' },
  'background.earthWelcome': { path: '/assets/pixel-art/academy-sunset.png', fallbackLabel: 'Centro espacial al amanecer', fallbackColor: '#263b53' },
  'background.moon': { path: '/assets/space/backgrounds/moon-control.png', fallbackLabel: 'Control lunar', fallbackColor: '#626b7d' },
  'background.mars': { path: '/assets/space/backgrounds/mars-control.png', fallbackLabel: 'Control marciano', fallbackColor: '#985f4b' },
  'background.moonBuilder': { path: '/assets/space/backgrounds/moon-base-builder.jpg', fallbackLabel: 'Constructor lunar', fallbackColor: '#394858' },
  'background.marsBuilder': { path: '/assets/space/backgrounds/mars-base-builder.jpg', fallbackLabel: 'Constructor marciano', fallbackColor: '#6f3b2c' },
  'camera.lunarExteriorDay': { path: '/assets/space/cameras/lunar-exterior-day.webp', fallbackLabel: 'Exterior lunar diurno', fallbackColor: '#66717c' },
  'camera.lunarExteriorNight': { path: '/assets/space/cameras/lunar-exterior-night.webp', fallbackLabel: 'Exterior lunar nocturno', fallbackColor: '#172c3e' },
  'camera.marsExteriorDustStorm': { path: '/assets/space/cameras/mars-exterior-dust-storm.webp', fallbackLabel: 'Exterior marciano con polvo', fallbackColor: '#6a2e23' },
  'ui.welcomeWordmark': { path: '/assets/ui/welcome-wordmark-concept.png', fallbackLabel: 'Astronauta Junior', fallbackColor: '#fff3cf' },
  'ui.dialogFrame': { path: '/assets/space/ui/dialog-frame.png', fallbackLabel: 'Marco de diálogo', fallbackColor: '#25384f' },
  'ui.alertFrame': { path: '/assets/space/ui/alert-frame.png', fallbackLabel: 'Marco de alerta', fallbackColor: '#7d2530' },
  'ui.cameraFrame': { path: '/assets/space/ui/camera-frame.png', fallbackLabel: 'Marco de cámara', fallbackColor: '#315b73' },
  'ui.energy': { path: '/assets/space/ui/energy-icon.png', fallbackLabel: 'Energía', fallbackColor: '#d6a54e' },
  'ui.air': { path: '/assets/space/ui/oxygen-icon.png', fallbackLabel: 'Oxígeno', fallbackColor: '#7cb5c8' },
  'ui.shelter': { path: '/assets/space/ui/shield-icon.png', fallbackLabel: 'Escudo', fallbackColor: '#8fab81' },
  'ui.food': { path: '/assets/space/ui/food-icon.png', fallbackLabel: 'Alimento', fallbackColor: '#d87c43' },
  'ui.research': { path: '/assets/space/ui/research-icon.png', fallbackLabel: 'Investigación', fallbackColor: '#9a7ac0' },
  'ui.selectionRing': { path: '/assets/space/ui/selection-ring.png', fallbackLabel: 'Indicador de selección', fallbackColor: '#ffd65a' },
  'ui.arrowBack': { path: '/assets/space/ui/arrow-back.png', fallbackLabel: 'Atrás', fallbackColor: '#6ecbe7' },
  'ui.arrowNext': { path: '/assets/space/ui/arrow-next.png', fallbackLabel: 'Siguiente', fallbackColor: '#6ecbe7' },
  'ui.repairCompleted': { path: '/assets/space/ui/repair-completed-icon.png', fallbackLabel: 'Reparación completada', fallbackColor: '#68d66a' },
  'facility.observatory': { path: null, fallbackLabel: 'Observatorio Solar', fallbackColor: '#3d6494' },
  'facility.weatherTower': { path: null, fallbackLabel: 'Torre de Clima Espacial', fallbackColor: '#4a3b68' },
  'facility.eclssHangar': { path: null, fallbackLabel: 'Hangar de Soporte Vital', fallbackColor: '#2f5972' },
  'facility.bioDome': { path: null, fallbackLabel: 'Bio-Domo de Cultivos', fallbackColor: '#2b583f' },
  'facility.launchPad': { path: null, fallbackLabel: 'Plataforma de Despegue', fallbackColor: '#5d4037' },
  'tool.panels': { path: null, fallbackLabel: 'Paneles plegables', fallbackColor: '#d6a54e' },
  'tool.lifeSupport': { path: null, fallbackLabel: 'Kit de soporte vital', fallbackColor: '#7cb5c8' },
  'tool.shelterKit': { path: null, fallbackLabel: 'Kit de refugio', fallbackColor: '#8fab81' },
  'tool.cropKit': { path: null, fallbackLabel: 'Kit de cultivos', fallbackColor: '#67a995' },
  'ui.console': { path: '/assets/space/ui/dialog-frame.png', fallbackLabel: 'Consola', fallbackColor: '#25384f' },
  'object.panel': { path: '/assets/space/objects/solar-panel-damaged.png', fallbackLabel: 'Panel solar', fallbackColor: '#57758c' },
  'object.airlock': { path: '/assets/space/objects/refuge-hatch-open.png', fallbackLabel: 'Compuerta de refugio', fallbackColor: '#708391' },
  'animation.alert': { path: '/assets/space/ui/alert-frame.png', fallbackLabel: 'Alerta', fallbackColor: '#c37e57' },
  'audio.alert': { path: null, fallbackLabel: 'Aviso sonoro', fallbackColor: '#5c7ab3' },
};

export const spaceBackgrounds = {
  control: {
    MOON: assetManifest['background.moon'],
    MARS: assetManifest['background.mars'],
  },
  builder: {
    MOON: assetManifest['background.moonBuilder'],
    MARS: assetManifest['background.marsBuilder'],
  },
} as const;

export const exteriorCameraScenes = {
  lunarDay: assetManifest['camera.lunarExteriorDay'],
  lunarNight: assetManifest['camera.lunarExteriorNight'],
  marsDustStorm: assetManifest['camera.marsExteriorDustStorm'],
} as const;

export const hudAssets = {
  dialogFrame: assetManifest['ui.dialogFrame'],
  alertFrame: assetManifest['ui.alertFrame'],
  cameraFrame: assetManifest['ui.cameraFrame'],
  energy: assetManifest['ui.energy'],
  oxygen: assetManifest['ui.air'],
  shield: assetManifest['ui.shelter'],
  food: assetManifest['ui.food'],
  research: assetManifest['ui.research'],
  selectionRing: assetManifest['ui.selectionRing'],
  arrowBack: assetManifest['ui.arrowBack'],
  arrowNext: assetManifest['ui.arrowNext'],
  repairCompleted: assetManifest['ui.repairCompleted'],
} as const;

export type PlayerSkinId =
  | 'FEMININE_LIGHT' | 'FEMININE_MEDIUM' | 'FEMININE_DARK'
  | 'MASCULINE_LIGHT' | 'MASCULINE_MEDIUM' | 'MASCULINE_DARK';

export interface PlayerSkinAsset {
  readonly id: PlayerSkinId;
  readonly path: string;
  readonly fallbackLabel: string;
}

export const playerSkinCatalog: readonly PlayerSkinAsset[] = [
  { id: 'FEMININE_LIGHT', path: '/assets/characters/player-skins/feminine-light.png', fallbackLabel: 'Cadete 1' },
  { id: 'FEMININE_MEDIUM', path: '/assets/characters/player-skins/feminine-medium.png', fallbackLabel: 'Cadete 2' },
  { id: 'FEMININE_DARK', path: '/assets/characters/player-skins/feminine-dark.png', fallbackLabel: 'Cadete 3' },
  { id: 'MASCULINE_LIGHT', path: '/assets/characters/player-skins/masculine-light.png', fallbackLabel: 'Cadete 4' },
  { id: 'MASCULINE_MEDIUM', path: '/assets/characters/player-skins/masculine-medium.png', fallbackLabel: 'Cadete 5' },
  { id: 'MASCULINE_DARK', path: '/assets/characters/player-skins/masculine-dark.png', fallbackLabel: 'Cadete 6' },
] as const;

const legacyAvatarSkin: Readonly<Record<'ALBA' | 'LEO' | 'NICO' | 'AURORA', PlayerSkinId>> = {
  ALBA: 'FEMININE_LIGHT',
  LEO: 'MASCULINE_MEDIUM',
  NICO: 'MASCULINE_DARK',
  AURORA: 'FEMININE_DARK',
};

export function getPlayerSkinForAvatarId(avatarId: string): PlayerSkinAsset {
  const skinId = legacyAvatarSkin[avatarId as keyof typeof legacyAvatarSkin] ?? 'FEMININE_MEDIUM';
  return playerSkinCatalog.find((skin) => skin.id === skinId) ?? playerSkinCatalog[0];
}
