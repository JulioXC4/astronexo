export type AssetId =
  | 'character.alba' | 'character.chispa' | 'character.aurora' | 'character.nico'
  | 'background.earth' | 'background.moon' | 'background.mars'
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
  'background.moon': { path: null, fallbackLabel: 'Base lunar', fallbackColor: '#626b7d' },
  'background.mars': { path: null, fallbackLabel: 'Base marciana', fallbackColor: '#985f4b' },
  'ui.console': { path: null, fallbackLabel: 'Consola', fallbackColor: '#25384f' },
  'ui.energy': { path: null, fallbackLabel: 'Energía', fallbackColor: '#d6a54e' },
  'ui.air': { path: null, fallbackLabel: 'Aire', fallbackColor: '#7cb5c8' },
  'ui.shelter': { path: null, fallbackLabel: 'Escudo: refugio listo', fallbackColor: '#8fab81' },
  'object.panel': { path: null, fallbackLabel: 'Panel solar', fallbackColor: '#57758c' },
  'object.airlock': { path: null, fallbackLabel: 'Cámara de aire', fallbackColor: '#708391' },
  'animation.alert': { path: null, fallbackLabel: 'Alerta', fallbackColor: '#c37e57' },
  'audio.alert': { path: null, fallbackLabel: 'Aviso sonoro', fallbackColor: '#5c7ab3' },
};
