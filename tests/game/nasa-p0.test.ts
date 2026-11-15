import { describe, expect, it } from 'vitest';
import { AREQUIPA_SOLAR_RECORDS, TROMSO_SOLAR_RECORDS } from '../../src/data/nasa/powerData';
import { DONKI_HISTORICAL_EVENTS } from '../../src/data/nasa/donkiData';
import { buildVerifiedNasaDataset } from '../../src/features/nasa/adapters';

describe('Respaldo científico NASA P0', () => {
  it('conserva los seis valores diarios consultados en POWER el 2026-11-15 con fecha, unidad y coordenadas', () => {
    const expected = [
      [AREQUIPA_SOLAR_RECORDS, [5.6028, 5.6455, 6.174]],
      [TROMSO_SOLAR_RECORDS, [3.5702, 1.7194, 0]],
    ] as const;
    for (const [city, values] of expected) {
      city.days.forEach((day, index) => {
        expect(day.irradianceKwhPerM2).toBe(values[index]);
        expect(day.observation.value).toBe(values[index]);
        expect(day.observation.observedAt).toBe(day.date);
        expect(day.observation.unit).toBe('kW-hr/m²/day');
        const url = new URL(day.observation.sourceUrl);
        expect(url.hostname).toBe('power.larc.nasa.gov');
        expect(url.searchParams.get('start')).toBe(day.date.replaceAll('-', ''));
        expect(url.searchParams.get('end')).toBe(day.date.replaceAll('-', ''));
        expect(Number(url.searchParams.get('latitude'))).toBe(day.observation.coordinates?.latitude);
        expect(Number(url.searchParams.get('longitude'))).toBe(day.observation.coordinates?.longitude);
      });
    }
  });

  it('conserva eventos DONKI identificables sin presentar la simulación como una dosis NASA', () => {
    expect(DONKI_HISTORICAL_EVENTS).toHaveLength(2);
    for (const event of DONKI_HISTORICAL_EVENTS) {
      expect(event.eventId).toBe(event.observation.recordId);
      expect(event.observedAt).toBe(event.observation.observedAt);
      expect(event.observation.unit).toBe('km/s');
      expect(event.sourceUrl).toBe(event.observation.sourceUrl);
      expect(new URL(event.sourceUrl).hostname).toBe('ccmc.gsfc.nasa.gov');
      expect(event.eventType).toBe('CME');
    }
  });

  it('transfiere observaciones históricas y separa las reglas espaciales simuladas', () => {
    const dataset = buildVerifiedNasaDataset('TROMSO', 2);
    expect(dataset.validation).toBe('VERIFIED');
    expect(dataset.observations.map((item) => item.source)).toEqual(['POWER', 'DONKI']);
    expect(dataset.observations[0].value).toBe(0);
    expect(dataset.note).toContain('POWER solo describe la Tierra');
    expect(dataset.note).toContain('parámetros simulados');
  });
});
