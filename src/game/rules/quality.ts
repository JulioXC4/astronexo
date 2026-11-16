import type { ResourceDelta } from '../types';

/**
 * Qué tan bien quedó el trabajo en el minijuego.
 *
 * Antes, resolver un minijuego solo des-grisaba el botón CONFIRMAR: limpiar al
 * 100 % y limpiar al 85 % daban exactamente el mismo resultado. Ahora el
 * desempeño viaja hasta el motor y escala el efecto de la intervención, como
 * en la maqueta de JD («si queda menos del 70 % limpio, ese día se genera un
 * 20 % menos»).
 *
 * No se llama «estrellas» a propósito: la estrella dorada ya significa otra
 * cosa en el juego (el dato escondido de la NASA).
 */
export type QualityTier = 'basic' | 'good' | 'excellent';

export const QUALITY_TIERS: readonly QualityTier[] = ['basic', 'good', 'excellent'];

/** Cuánto se multiplica el efecto de la intervención según cómo quedó el trabajo. */
export const QUALITY_EFFECT_SCALE: Readonly<Record<QualityTier, number>> = {
  basic: 0.7,
  good: 1,
  excellent: 1.3,
};

/** Sin dato de calidad se asume un trabajo correcto: nunca se castiga por omisión. */
export function qualityTier(quality: number | undefined): QualityTier {
  if (quality === undefined || Number.isNaN(quality)) return 'good';
  if (quality >= 0.95) return 'excellent';
  if (quality >= 0.7) return 'good';
  return 'basic';
}

/** Escala simple por número de errores, para los minijuegos que los pueden contar. */
export function qualityFromMistakes(mistakes: number): number {
  if (mistakes <= 0) return 1;
  if (mistakes === 1) return 0.8;
  if (mistakes === 2) return 0.6;
  return 0.45;
}

/** Escala por porcentaje logrado sobre el mínimo exigido (p. ej. captación solar). */
export function qualityFromRange(value: number, minimum: number, best: number): number {
  if (best <= minimum) return 1;
  const ratio = (value - minimum) / (best - minimum);
  return Math.max(0, Math.min(1, 0.5 + 0.5 * ratio));
}

export function scaleEffectByQuality(effect: ResourceDelta, quality: number | undefined): ResourceDelta {
  const factor = QUALITY_EFFECT_SCALE[qualityTier(quality)];
  if (factor === 1) return effect;
  const scaled: Record<string, number> = {};
  for (const [key, value] of Object.entries(effect)) {
    if (typeof value !== 'number') continue;
    // Se redondea alejándose de cero para que un efecto pequeño no desaparezca.
    scaled[key] = value >= 0 ? Math.ceil(value * factor) : Math.floor(value * factor);
  }
  return scaled as ResourceDelta;
}
