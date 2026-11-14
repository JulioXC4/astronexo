import type { NasaDataset, NasaObservation } from '../../game/contracts';
import { getSolarDatasetByCity } from '../../data/nasa/powerData';
import { DEFAULT_DONKI_EVENT } from '../../data/nasa/donkiData';

/**
 * Normaliza y construye el dataset NASA verificado según la ciudad y la misión.
 */
export function buildVerifiedNasaDataset(cityId: string = 'AREQUIPA', selectedSolarDayIndex: number = 0): NasaDataset {
  const solarDataset = getSolarDatasetByCity(cityId);
  const solarDay = solarDataset.days[selectedSolarDayIndex] ?? solarDataset.days[0];
  const donkiEvent = DEFAULT_DONKI_EVENT;

  const observations: readonly NasaObservation[] = [
    solarDay.observation,
    donkiEvent.observation,
  ];

  return {
    validation: 'VERIFIED',
    observations,
    note: `Datos históricos verificados de NASA POWER (${solarDataset.cityId}, ${solarDay.date}, ${solarDay.irradianceKwhPerM2} kWh/m²/día) y NASA DONKI (Tormenta CME ${donkiEvent.observedAt.slice(0, 10)}).`,
  };
}
