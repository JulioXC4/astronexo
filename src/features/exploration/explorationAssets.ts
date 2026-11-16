import type { Destination } from '../../game';
import { COLLECTION_SIZE } from './explorationData';

/**
 * Rutas y carga de los sprites PNG de la salida a explorar
 * (`public/assets/exploration/`). Solo describen cómo SE VE el mapa: las
 * posiciones, colisiones y reglas viven en `explorationData.ts`, `terrain.ts` y
 * `explorationEngine.ts`.
 */
const ROOT = '/assets/exploration';

type ByDestination<T> = Readonly<Record<Destination, T>>;

export const BACKGROUNDS: ByDestination<string> = {
  MOON: `${ROOT}/backgrounds/moon.png`,
  MARS: `${ROOT}/backgrounds/mars.png`,
};

export const BASES: ByDestination<string> = {
  MOON: `${ROOT}/bases-rovers/base-moon.png`,
  MARS: `${ROOT}/bases-rovers/base-mars.png`,
};

export const ROVERS: ByDestination<string> = {
  MOON: `${ROOT}/bases-rovers/rover-moon.png`,
  MARS: `${ROOT}/bases-rovers/rover-mars.png`,
};

/** Las cuatro poses del explorador a pie. Las de caminar miran a la derecha. */
export interface ExplorerPoses {
  readonly front: string;
  readonly back: string;
  readonly walk1: string;
  readonly walk2: string;
}

/** Ids de `AVATAR_OPTIONS` que tienen poses propias para la salida a explorar. */
export type ExplorerId = 'ALBA' | 'AURORA' | 'LEO' | 'NICO';

const explorerPoses = (folder: string): ExplorerPoses => ({
  front: `${ROOT}/characters/${folder}/front.png`,
  back: `${ROOT}/characters/${folder}/back.png`,
  walk1: `${ROOT}/characters/${folder}/walk-1.png`,
  walk2: `${ROOT}/characters/${folder}/walk-2.png`,
});

/** Poses de cada personaje elegible: el niño explora con el personaje que eligió. */
export const EXPLORERS: Readonly<Record<ExplorerId, ExplorerPoses>> = {
  ALBA: explorerPoses('alba'),
  AURORA: explorerPoses('aurora'),
  LEO: explorerPoses('leo'),
  NICO: explorerPoses('nico'),
};

const DEFAULT_EXPLORER: ExplorerId = 'ALBA';

/** Poses del personaje elegido; un id desconocido (o ausente) usa a Alba, el avatar por defecto. */
export function posesForAvatar(avatarId: string | null | undefined): ExplorerPoses {
  const id = (avatarId ?? '').toUpperCase();
  return id in EXPLORERS ? EXPLORERS[id as ExplorerId] : EXPLORERS[DEFAULT_EXPLORER];
}

/**
 * Geometría común de las poses (lienzo cuadrado de 512 px con margen transparente):
 * todas apoyan los pies en la misma línea base y el cuerpo ocupa casi todo el alto.
 * El renderer la usa para anclar los pies en la posición lógica y escalar por el
 * cuerpo, no por el lienzo.
 */
export const EXPLORER_FRAME = {
  /** Fila de los pies, como fracción del alto del PNG (485 / 512). */
  footY: 485 / 512,
  /** Alto del personaje (casco a botas), como fracción del alto del PNG (457 / 512). */
  bodyHeight: 457 / 512,
} as const;

export const MARKERS = {
  sample: `${ROOT}/markers/sample.png`,
  viewpoint: `${ROOT}/markers/viewpoint.png`,
  trace: `${ROOT}/markers/mission-trace.png`,
  curiosity: `${ROOT}/markers/nasa-curiosity.png`,
  beacon: `${ROOT}/markers/rescue-beacon.png`,
  returnArrow: `${ROOT}/markers/return-arrow.png`,
} as const;

export const UI = {
  battery: {
    20: `${ROOT}/ui/battery-20.png`,
    35: `${ROOT}/ui/battery-35.png`,
    50: `${ROOT}/ui/battery-50.png`,
  } as Readonly<Record<number, string>>,
  scienceBadge: `${ROOT}/ui/science-badge.png`,
  cardFoot: `${ROOT}/ui/card-go-foot.png`,
  cardRover: `${ROOT}/ui/card-go-rover.png`,
  cardStay: `${ROOT}/ui/card-stay-base.png`,
} as const;

export interface TerrainSprites {
  readonly craterLarge: string;
  readonly craterSmall: string;
  readonly rockMedium: string;
  readonly rockSmall: string;
  readonly soft: string;
  readonly pebbles: string;
  readonly particles: string;
  /** Huellas (Luna) o rodadas (Marte), para el rastro y la decoración. */
  readonly tracks: string;
}

export const TERRAIN_SPRITES: ByDestination<TerrainSprites> = {
  MOON: {
    craterLarge: `${ROOT}/terrain/moon-crater-large.png`,
    craterSmall: `${ROOT}/terrain/moon-crater-small.png`,
    rockMedium: `${ROOT}/terrain/moon-rock-medium.png`,
    rockSmall: `${ROOT}/terrain/moon-rock-small.png`,
    soft: `${ROOT}/terrain/moon-soft-regolith.png`,
    pebbles: `${ROOT}/terrain/moon-pebbles.png`,
    particles: `${ROOT}/terrain/moon-regolith-particles.png`,
    tracks: `${ROOT}/terrain/moon-footprints.png`,
  },
  MARS: {
    craterLarge: `${ROOT}/terrain/mars-crater-large.png`,
    craterSmall: `${ROOT}/terrain/mars-crater-small.png`,
    rockMedium: `${ROOT}/terrain/mars-rock-layered.png`,
    rockSmall: `${ROOT}/terrain/mars-rock-small.png`,
    soft: `${ROOT}/terrain/mars-soft-sand.png`,
    pebbles: `${ROOT}/terrain/mars-pebbles.png`,
    particles: `${ROOT}/terrain/mars-pebbles.png`,
    tracks: `${ROOT}/terrain/mars-wheel-tracks.png`,
  },
};

/**
 * Miniatura de cada hallazgo, en el MISMO orden que `exploration.collections.<destino>.<índice>`
 * del i18n (el índice es el `Place.index` de `PLACES`). Marte 0 «Polvo rojo» no tiene lámina
 * propia: reutiliza el sprite de arena blanda del terreno en lugar de duplicar el archivo.
 */
export const FINDING_IMAGES: ByDestination<readonly string[]> = {
  MOON: [
    `${ROOT}/findings/moon/00-regolith.png`,
    `${ROOT}/findings/moon/01-basalt.png`,
    `${ROOT}/findings/moon/02-anorthosite.png`,
    `${ROOT}/findings/moon/03-water-ice.png`,
    `${ROOT}/findings/moon/04-crater-rock.png`,
    `${ROOT}/findings/moon/05-earth-in-sky.png`,
    `${ROOT}/findings/moon/06-airless-sky.png`,
    `${ROOT}/findings/moon/07-astronaut-footprints.png`,
    `${ROOT}/findings/moon/08-landing-plaque.png`,
    `${ROOT}/findings/moon/09-apollo-rover.png`,
    `${ROOT}/findings/moon/10-surveyor-3.png`,
  ],
  MARS: [
    `${ROOT}/terrain/mars-soft-sand.png`,
    `${ROOT}/findings/mars/01-volcanic-rock.png`,
    `${ROOT}/findings/mars/02-layered-rock.png`,
    `${ROOT}/findings/mars/03-small-stone.png`,
    `${ROOT}/findings/mars/04-fine-sand.png`,
    `${ROOT}/findings/mars/05-pink-sky.png`,
    `${ROOT}/findings/mars/06-martian-day.png`,
    `${ROOT}/findings/mars/07-rover-track.png`,
    `${ROOT}/findings/mars/08-wheel-morse-code.png`,
    `${ROOT}/findings/mars/09-ingenuity.png`,
    `${ROOT}/findings/mars/10-sojourner.png`,
  ],
};

export function findingImage(destination: Destination, index: number): string | null {
  return FINDING_IMAGES[destination][index] ?? null;
}

export const FINDING_COUNT = COLLECTION_SIZE;

/** Qué parte del fondo panorámico cubre el mundo (fracciones de la imagen). */
export interface BackgroundCrop {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/**
 * Ambos recortes tienen la proporción del mundo (3000×1800) para no estirar la
 * imagen. El de la Luna deja fuera la base y el cohete que ya trae pintados el
 * fondo (arriba a la izquierda), para no duplicar la base del juego.
 */
export const BACKGROUND_CROPS: ByDestination<BackgroundCrop> = {
  MOON: { x: 0.4575, y: 0.4167, w: 0.5425, h: 0.5833 },
  MARS: { x: 0.0349, y: 0, w: 0.9302, h: 1 },
};

// ---------------------------------------------------------------- carga única

const cache = new Map<string, HTMLImageElement>();

/** Crea el `Image` una sola vez por ruta y lo reutiliza (nunca uno por cuadro). */
export function loadSprite(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  let img = cache.get(src);
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = src;
    cache.set(src, img);
  }
  return img;
}

export function isReady(img: HTMLImageElement | null | undefined): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

export interface SpriteSet {
  readonly destination: Destination;
  readonly background: HTMLImageElement | null;
  readonly base: HTMLImageElement | null;
  readonly rover: HTMLImageElement | null;
  readonly astronaut: Readonly<Record<keyof ExplorerPoses, HTMLImageElement | null>>;
  readonly markers: Readonly<Record<keyof typeof MARKERS, HTMLImageElement | null>>;
  readonly terrain: Readonly<Record<keyof TerrainSprites, HTMLImageElement | null>>;
}

function mapValues<K extends string>(source: Readonly<Record<K, string>>): Record<K, HTMLImageElement | null> {
  const out = {} as Record<K, HTMLImageElement | null>;
  for (const key of Object.keys(source) as K[]) out[key] = loadSprite(source[key]);
  return out;
}

/** Todo lo que el mapa dibuja en un destino, con el personaje elegido; se pide al abrir la salida. */
export function createSpriteSet(destination: Destination, avatarId?: string | null): SpriteSet {
  return {
    destination,
    background: loadSprite(BACKGROUNDS[destination]),
    base: loadSprite(BASES[destination]),
    rover: loadSprite(ROVERS[destination]),
    astronaut: mapValues<keyof ExplorerPoses>(posesForAvatar(avatarId)),
    markers: mapValues(MARKERS),
    terrain: mapValues(TERRAIN_SPRITES[destination]),
  };
}
