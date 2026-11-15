import type { Difficulty, SpaceWeatherContext } from '../../game';
import { DEFAULT_DONKI_EVENT, DONKI_SUPPORTING_EVENTS, type DonkiEventRecord, type DonkiSnapshotEvent } from '../../data/nasa/donkiData';

/**
 * Regla SIMULADA (no NASA): la velocidad de una CME real de DONKI fija la dificultad educativa.
 * No convierte avisos DONKI en dosis de radiación.
 */
export const CME_SPEED_BANDS: readonly { readonly fromKmS: number; readonly difficulty: Difficulty }[] = [
  { fromKmS: 1000, difficulty: 'STORMY' },
  { fromKmS: 600, difficulty: 'ACTIVE' },
  { fromKmS: 0, difficulty: 'CALM' },
];

export function difficultyForCmeSpeed(speedKmS: number): { difficulty: Difficulty; bandFromKmS: number } {
  const band = CME_SPEED_BANDS.find((item) => speedKmS >= item.fromKmS) ?? CME_SPEED_BANDS[CME_SPEED_BANDS.length - 1];
  return { difficulty: band.difficulty, bandFromKmS: band.fromKmS };
}

/** Contexto reproducible: mismo evento → misma dificultad. Funciona sin conexión. */
export function buildSpaceWeatherContext(event: DonkiEventRecord = DEFAULT_DONKI_EVENT): SpaceWeatherContext {
  const speed = Number(event.observation.value);
  if (event.eventType !== 'CME' || !Number.isFinite(speed) || speed <= 0) {
    throw new Error('El evento DONKI no es una CME con velocidad válida.');
  }
  const { difficulty, bandFromKmS } = difficultyForCmeSpeed(speed);
  return {
    event: {
      eventId: event.eventId,
      eventType: 'CME',
      observedAt: event.observedAt,
      value: speed,
      unit: 'km/s',
      sourceUrl: event.sourceUrl,
      status: event.observation.status ?? 'HISTORICAL',
    },
    rule: { ruleId: 'CME_SPEED_BANDS_V1', difficulty, bandFromKmS },
  };
}

/** GST/FLR de apoyo; vacío si el snapshot local no se ha generado. */
export function getSupportingSpaceWeatherEvents(): readonly DonkiSnapshotEvent[] {
  return DONKI_SUPPORTING_EVENTS;
}
