import type { NasaDataset, NasaObservation } from '../../game/contracts';
import { LIMA_SOLAR_RECORDS } from '../../data/nasa/powerData';
import { DEFAULT_DONKI_EVENT } from '../../data/nasa/donkiData';

/**
 * Normaliza y construye el dataset NASA verificado que se entregará al módulo espacial.
 * Cumple estrictamente con el contrato NasaDataset, distinguiendo fuentes, parámetros y unidades.
 */
export function buildVerifiedNasaDataset(selectedSolarDayIndex: number = 0): NasaDataset {
  const solarDay = LIMA_SOLAR_RECORDS.days[selectedSolarDayIndex] ?? LIMA_SOLAR_RECORDS.days[0];
  const donkiEvent = DEFAULT_DONKI_EVENT;

  const observations: readonly NasaObservation[] = [
    solarDay.observation,
    donkiEvent.observation,
  ];

  return {
    validation: 'VERIFIED',
    observations,
    note: `Datos históricos verificados de NASA POWER (Lima, ${solarDay.date}, ${solarDay.irradianceKwhPerM2} kWh/m²/día) y NASA DONKI (Tormenta CME ${donkiEvent.observedAt.slice(0, 10)}).`,
  };
}
