import { DONKI_HISTORICAL_EVENTS, DEFAULT_DONKI_EVENT, type DonkiEventRecord } from '../../data/nasa/donkiData';

/**
 * Cliente para NASA DONKI (Space Weather Database of Notifications, Knowledge, Information).
 * Proporciona eventos históricos verificables de CME, llamaradas solares y tormentas geomagnéticas.
 */
export async function fetchHistoricalSpaceWeatherEvents(): Promise<readonly DonkiEventRecord[]> {
  return DONKI_HISTORICAL_EVENTS;
}

export function getVerifiedDonkiEvent(eventId?: string): DonkiEventRecord {
  if (!eventId) return DEFAULT_DONKI_EVENT;
  const found = DONKI_HISTORICAL_EVENTS.find((event) => event.eventId === eventId);
  return found ?? DEFAULT_DONKI_EVENT;
}
