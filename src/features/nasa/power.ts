import { AREQUIPA_SOLAR_RECORDS, TROMSO_SOLAR_RECORDS, type CitySolarDataset } from '../../data/nasa/powerData';

/**
 * Cliente de NASA POWER para Arequipa y Tromsø (Requisitos V3.0).
 * Retorna datos verificados de insolación solar según la ciudad seleccionada.
 */
export async function fetchSolarDataForCity(cityId: string): Promise<CitySolarDataset> {
  if (cityId === 'TROMSO') return TROMSO_SOLAR_RECORDS;
  return AREQUIPA_SOLAR_RECORDS;
}

export function getVerifiedSolarDataset(cityId: string = 'AREQUIPA'): CitySolarDataset {
  if (cityId === 'TROMSO') return TROMSO_SOLAR_RECORDS;
  return AREQUIPA_SOLAR_RECORDS;
}
