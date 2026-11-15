import { DONKI_HISTORICAL_EVENTS, DEFAULT_DONKI_EVENT, type DonkiEventRecord } from '../../data/nasa/donkiData';

/**
 * Acceso al respaldo local de NASA DONKI.
 * No realiza peticiones de red en tiempo de juego.
 */
export async function fetchHistoricalSpaceWeatherEvents(): Promise<readonly DonkiEventRecord[]> {
  return DONKI_HISTORICAL_EVENTS;
}

export function getVerifiedDonkiEvent(eventId?: string): DonkiEventRecord {
  if (!eventId) return DEFAULT_DONKI_EVENT;
  const found = DONKI_HISTORICAL_EVENTS.find((event) => event.eventId === eventId);
  return found ?? DEFAULT_DONKI_EVENT;
}
