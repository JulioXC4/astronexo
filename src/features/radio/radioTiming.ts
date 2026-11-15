/**
 * Reglas de tiempo del globo de radio, tomadas literalmente de la maqueta de
 * Juan Diego (especificación §8). No se tocan sin hablar con él.
 *
 * La idea de fondo: no hay cajas de instrucciones ni texto largo sobre la
 * pantalla. Todo lo que hay que decir llega por radio, corto, con la cara de
 * quien habla, y sin interrumpir el juego.
 */
export const RADIO_TIMING = {
  /** Lo que tarda en salir el primer globo de una pantalla. */
  firstDelayMs: 1800,
  /** Pausa obligatoria entre un globo y el siguiente. */
  gapMs: 2400,
  /** Un globo nuevo no interrumpe a uno que lleva menos de esto en pantalla. */
  protectedMs: 2800,
  /** Mínimo que se queda un globo, aunque el texto sea muy corto. */
  minVisibleMs: 4500,
  baseVisibleMs: 2500,
  msPerCharacter: 55,
} as const;

/** `max(4500, 2500 + 55 × caracteres)` */
export function visibleDurationMs(text: string): number {
  return Math.max(
    RADIO_TIMING.minVisibleMs,
    RADIO_TIMING.baseVisibleMs + RADIO_TIMING.msPerCharacter * text.length,
  );
}

export type RadioSpeaker = 'ALBA' | 'CHISPA' | 'AURORA' | 'NICO';

/** Ámbar por defecto, verde para buenas noticias, rojo para peligro. */
export type RadioTone = 'normal' | 'good' | 'danger';

export interface RadioMessage {
  readonly id: string;
  readonly speaker: RadioSpeaker;
  readonly text: string;
  readonly tone: RadioTone;
  /** Las pistas solo salen una vez por pantalla. */
  readonly once?: string;
}

/**
 * Decide si un mensaje nuevo puede echar al que está en pantalla.
 * Solo los avisos de peligro interrumpen, y nunca antes de `protectedMs`.
 */
export function canInterrupt(incoming: RadioTone, shownForMs: number): boolean {
  if (incoming !== 'danger') return false;
  return shownForMs >= RADIO_TIMING.protectedMs;
}

export const RADIO_PORTRAITS: Readonly<Record<RadioSpeaker, string>> = {
  ALBA: '/assets/pixel-art/cadet-alba.png',
  CHISPA: '/assets/characters/chispa.png',
  AURORA: '/assets/pixel-art/officer-aurora.png',
  NICO: '/assets/pixel-art/engineer-nico.png',
};
