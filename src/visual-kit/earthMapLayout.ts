/** Geometría normalizada del mapa terrestre (lienzo lógico 16:9) y cálculo de encuadre. Sin dependencias de React. */

/** Tamaño lógico del escenario. Todas las coordenadas del mapa están normalizadas a este lienzo. */
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 563;

/** Zona que nunca debe recortarse: cinco edificios, su sombra y la plataforma de lanzamiento. */
const SAFE_X0 = 100;
const SAFE_X1 = 990;
const SAFE_Y0 = 80;
const SAFE_Y1 = 480;

export interface SceneLayout {
  /** Píxeles de pantalla por unidad lógica. */
  readonly scale: number;
  /** Desplazamiento (px) del escenario dentro del contenedor. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Quedan franjas libres arriba/abajo (y/o a los lados) que rellena el fondo ambiental. */
  readonly letterboxY: boolean;
  readonly letterboxX: boolean;
  /** Las franjas libres superan el 25 % del contenedor (tabletas en vertical, pantallas ultra anchas). */
  readonly letterboxLarge: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

/**
 * Escala el escenario 16:9 al contenedor conservando proporciones (equivalente a `object-fit: cover`),
 * pero sin recortar nunca la zona segura. Si la relación de aspecto no lo permite (p. ej. tabletas 4:3),
 * reduce la escala hasta que quepa y deja que el fondo ambiental rellene las franjas sobrantes.
 */
export function computeSceneLayout(viewportWidth: number, viewportHeight: number): SceneLayout {
  if (!(viewportWidth > 0) || !(viewportHeight > 0)) {
    return { scale: 1, x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT, letterboxX: false, letterboxY: false, letterboxLarge: false };
  }
  const cover = Math.max(viewportWidth / MAP_WIDTH, viewportHeight / MAP_HEIGHT);
  const scale = Math.min(cover, viewportWidth / (SAFE_X1 - SAFE_X0), viewportHeight / (SAFE_Y1 - SAFE_Y0));
  const width = MAP_WIDTH * scale;
  const height = MAP_HEIGHT * scale;

  const letterboxX = width < viewportWidth - 0.5;
  const letterboxY = height < viewportHeight - 0.5;

  const x = letterboxX
    ? (viewportWidth - width) / 2
    : clamp((viewportWidth - width) / 2,
      Math.max(viewportWidth - width, -SAFE_X0 * scale),
      Math.min(0, viewportWidth - SAFE_X1 * scale));
  // Con franjas pequeñas el escenario se sube: deja más aire abajo para la ficha de misión.
  // Con franjas grandes (tableta vertical) se centra.
  const y = letterboxY
    ? (viewportHeight - height) * (viewportHeight - height > 160 ? 0.5 : 0.15)
    : clamp((viewportHeight - height) / 2,
      Math.max(viewportHeight - height, -SAFE_Y0 * scale),
      Math.min(0, viewportHeight - SAFE_Y1 * scale));

  const letterboxLarge = (letterboxY && viewportHeight - height > viewportHeight * 0.25)
    || (letterboxX && viewportWidth - width > viewportWidth * 0.25);

  return { scale, x, y, width, height, letterboxX, letterboxY, letterboxLarge };
}

/** Centros de las plataformas (coordenadas lógicas). No se modifican respecto al diseño original. */
export const FACILITY_POSITIONS = [
  { x: 245, y: 185 }, { x: 608, y: 185 },
  { x: 190, y: 325 }, { x: 630, y: 325 }, { x: 402, y: 438 },
] as const;

/** Centro de la plataforma de lanzamiento dibujada en ambos fondos. */
export const LAUNCH_PAD = { x: 892, y: 254 } as const;

