export type AssetId =
  | 'character.alba' | 'character.chispa' | 'character.aurora' | 'character.nico'
  | 'background.earth' | 'background.earthWelcome' | 'background.moon' | 'background.mars'
  | 'ui.welcomeWordmark'
  | 'facility.observatory' | 'facility.weatherTower' | 'facility.eclssHangar' | 'facility.bioDome' | 'facility.launchPad'
  | 'tool.panels' | 'tool.lifeSupport' | 'tool.shelterKit' | 'tool.cropKit'
  | 'ui.console' | 'ui.energy' | 'ui.air' | 'ui.shelter'
  | 'object.panel' | 'object.airlock' | 'animation.alert' | 'audio.alert';

export interface AssetEntry {
  readonly path: string | null;
  readonly fallbackLabel: string;
  readonly fallbackColor: string;
}

// Diseño sustituirá path por rutas reales bajo /assets; ningún archivo se presupone existente.
export const assetManifest: Record<AssetId, AssetEntry> = {
  'character.alba': { path: null, fallbackLabel: 'Alba', fallbackColor: '#5c7ab3' },
  'character.chispa': { path: null, fallbackLabel: 'Chispa', fallbackColor: '#e0a548' },
  'character.aurora': { path: null, fallbackLabel: 'Aurora', fallbackColor: '#9a7ac0' },
  'character.nico': { path: null, fallbackLabel: 'Nico', fallbackColor: '#67a995' },
  'background.earth': { path: null, fallbackLabel: 'Centro terrestre', fallbackColor: '#38547a' },
  'background.earthWelcome': { path: '/assets/backgrounds/earth/welcome-concept.png', fallbackLabel: 'Centro espacial al amanecer', fallbackColor: '#263b53' },
  'background.moon': { path: null, fallbackLabel: 'Base lunar', fallbackColor: '#626b7d' },
  'background.mars': { path: null, fallbackLabel: 'Base marciana', fallbackColor: '#985f4b' },
  'ui.welcomeWordmark': { path: '/assets/ui/welcome-wordmark-concept.png', fallbackLabel: 'Astronauta Junior', fallbackColor: '#fff3cf' },
  'facility.observatory': { path: null, fallbackLabel: 'Observatorio Solar', fallbackColor: '#3d6494' },
  'facility.weatherTower': { path: null, fallbackLabel: 'Torre de Clima Espacial', fallbackColor: '#4a3b68' },
  'facility.eclssHangar': { path: null, fallbackLabel: 'Hangar de Soporte Vital', fallbackColor: '#2f5972' },
  'facility.bioDome': { path: null, fallbackLabel: 'Bio-Domo de Cultivos', fallbackColor: '#2b583f' },
  'facility.launchPad': { path: null, fallbackLabel: 'Plataforma de Despegue', fallbackColor: '#5d4037' },
  'tool.panels': { path: null, fallbackLabel: 'Paneles plegables', fallbackColor: '#d6a54e' },
  'tool.lifeSupport': { path: null, fallbackLabel: 'Kit de soporte vital', fallbackColor: '#7cb5c8' },
  'tool.shelterKit': { path: null, fallbackLabel: 'Kit de refugio', fallbackColor: '#8fab81' },
  'tool.cropKit': { path: null, fallbackLabel: 'Kit de cultivos', fallbackColor: '#67a995' },
  'ui.console': { path: null, fallbackLabel: 'Consola', fallbackColor: '#25384f' },
  'ui.energy': { path: null, fallbackLabel: 'Energía', fallbackColor: '#d6a54e' },
  'ui.air': { path: null, fallbackLabel: 'Aire', fallbackColor: '#7cb5c8' },
  'ui.shelter': { path: null, fallbackLabel: 'Escudo: refugio listo', fallbackColor: '#8fab81' },
  'object.panel': { path: null, fallbackLabel: 'Panel solar', fallbackColor: '#57758c' },
  'object.airlock': { path: null, fallbackLabel: 'Cámara de aire', fallbackColor: '#708391' },
  'animation.alert': { path: null, fallbackLabel: 'Alerta', fallbackColor: '#c37e57' },
  'audio.alert': { path: null, fallbackLabel: 'Aviso sonoro', fallbackColor: '#5c7ab3' },
};
