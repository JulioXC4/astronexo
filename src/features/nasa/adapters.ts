import type { NasaDataset, NasaObservation } from '../../game/contracts';
import { getSolarDatasetByCity } from '../../data/nasa/powerData';
import { DEFAULT_DONKI_EVENT } from '../../data/nasa/donkiData';

/**
 * Construye el respaldo local contrastado con las fuentes NASA el 2026-11-15.
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
    note: `Respaldo histórico NASA POWER (${solarDataset.cityId}, ${solarDay.date}, ${solarDay.irradianceKwhPerM2} kW-hr/m²/día) y NASA DONKI (CME ${donkiEvent.observedAt.slice(0, 10)}), contrastado el 2026-11-15. Las barras, costos, alertas y producción espacial son parámetros simulados; POWER solo describe la Tierra.`,
  };
}
