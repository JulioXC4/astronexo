import { AREQUIPA_SOLAR_RECORDS, TROMSO_SOLAR_RECORDS, type CitySolarDataset } from '../../data/nasa/powerData';

/**
 * Acceso al respaldo local de NASA POWER para Arequipa y Tromsø.
 * No realiza peticiones de red en tiempo de juego.
 */
export async function fetchSolarDataForCity(cityId: string): Promise<CitySolarDataset> {
  if (cityId === 'TROMSO') return TROMSO_SOLAR_RECORDS;
  return AREQUIPA_SOLAR_RECORDS;
}

export function getVerifiedSolarDataset(cityId: string = 'AREQUIPA'): CitySolarDataset {
  if (cityId === 'TROMSO') return TROMSO_SOLAR_RECORDS;
  return AREQUIPA_SOLAR_RECORDS;
}
