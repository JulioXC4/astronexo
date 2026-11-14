export type VisualCategory = 'characters' | 'robots' | 'maps' | 'earth' | 'destinations' | 'ui' | 'inventory' | 'minigames' | 'animations';

export interface VisualAsset {
  id: string;
  label: string;
  category: VisualCategory;
  path: string | null;
  sourcePage: number | null;
  pixelArt: boolean;
  fallbackColor: string;
}

// PDF images remain references until the design team confirms authorship and reuse rights.
export const visualAssets: readonly VisualAsset[] = [
  { id: 'city.arequipa', label: 'Arequipa', category: 'maps', path: null, sourcePage: 6, pixelArt: true, fallbackColor: '#b47747' },
  { id: 'city.tromso', label: 'Tromsø', category: 'maps', path: null, sourcePage: 7, pixelArt: true, fallbackColor: '#548fa4' },
  { id: 'destination.moon', label: 'Luna', category: 'destinations', path: null, sourcePage: 3, pixelArt: true, fallbackColor: '#8794a6' },
  { id: 'destination.mars', label: 'Marte', category: 'destinations', path: null, sourcePage: 3, pixelArt: true, fallbackColor: '#b7654b' },
  { id: 'avatar.blue', label: 'Astronauta azul', category: 'characters', path: null, sourcePage: 8, pixelArt: true, fallbackColor: '#557caa' },
  { id: 'character.scientist', label: 'Científica', category: 'characters', path: null, sourcePage: 10, pixelArt: true, fallbackColor: '#8c92ad' },
  { id: 'robot.helper', label: 'Robot ayudante', category: 'robots', path: null, sourcePage: 9, pixelArt: true, fallbackColor: '#60a9b1' },
  { id: 'earth.facility', label: 'Edificio de misión', category: 'earth', path: null, sourcePage: null, pixelArt: true, fallbackColor: '#4c7995' },
  { id: 'inventory.backpack', label: 'Mochila', category: 'inventory', path: null, sourcePage: 15, pixelArt: true, fallbackColor: '#a97448' },
  { id: 'ui.resources', label: 'Recursos', category: 'ui', path: null, sourcePage: 15, pixelArt: true, fallbackColor: '#5a9f9c' },
  { id: 'minigame.solar', label: 'Panel solar', category: 'minigames', path: null, sourcePage: 16, pixelArt: true, fallbackColor: '#d7a94f' },
  { id: 'minigame.storm', label: 'Refugio de tormenta', category: 'minigames', path: null, sourcePage: 17, pixelArt: true, fallbackColor: '#8d6c9b' },
  { id: 'animation.alert', label: 'Alarma', category: 'animations', path: null, sourcePage: null, pixelArt: true, fallbackColor: '#d98466' },
] as const;

export function getVisualAsset(id: string): VisualAsset | undefined {
  return visualAssets.find((asset) => asset.id === id);
}
