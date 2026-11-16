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
  /**
   * Texto o referencia al diccionario (`msg('clave')`). Se traduce al dibujarse, así un
   * cambio de idioma a mitad de pantalla (o «Repetir ayuda») sale en el idioma activo.
   */
  readonly text: string;
  readonly tone: RadioTone;
  /**
   * Juego o pantalla al que pertenece la ayuda. Si el niño cierra el globo, las demás
   * ayudas de ese ámbito ya no salen solas (ni al volver a entrar en ese minijuego).
   */
  readonly scope?: string;
  /** Clave «una vez en toda la partida»: se marca como dicha cuando el globo sale de verdad. */
  readonly onceEver?: string;
  /** Las pistas solo salen una vez por pantalla. */
  readonly once?: string;
  /**
   * Aviso de una acción del jugador (recoger una pieza, chocar con terreno blando):
   * pasa al frente de la cola y, como el peligro, echa al globo en pantalla pasados
   * los 2,8 s protegidos. Lo hace así el código de referencia de JD.
   */
  readonly front?: boolean;
}

/**
 * Decide si un mensaje nuevo puede echar al que está en pantalla.
 * Interrumpen los avisos de peligro y los de una acción del jugador (`front`),
 * y nunca antes de `protectedMs`. Las pistas de ayuda esperan su turno.
 */
export function canInterrupt(incoming: RadioTone, shownForMs: number, front = false): boolean {
  if (incoming !== 'danger' && !front) return false;
  return shownForMs >= RADIO_TIMING.protectedMs;
}

export const RADIO_PORTRAITS: Readonly<Record<RadioSpeaker, string>> = {
  ALBA: '/assets/pixel-art/cadet-alba.webp',
  CHISPA: '/assets/characters/chispa.webp',
  AURORA: '/assets/pixel-art/officer-aurora.webp',
  NICO: '/assets/pixel-art/engineer-nico.webp',
};
