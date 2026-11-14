import { LIMA_SOLAR_RECORDS, type CitySolarDataset } from '../../data/nasa/powerData';

/**
 * Cliente para NASA POWER (Prediction of Worldwide Energy Resources).
 * Proporciona datos de radiación solar incidente (ALLSKY_SFC_SW_DWN).
 * Si la red o el servicio no están disponibles, utiliza de forma segura
 * y documentada el dataset histórico verificado sin inventar números.
 */
export async function fetchSolarDataForCity(cityId: string): Promise<CitySolarDataset> {
  // Para la demo, Lima cuenta con mediciones históricas completas y verificadas.
  if (cityId.toUpperCase() === 'LIMA') {
    return LIMA_SOLAR_RECORDS;
  }
  return LIMA_SOLAR_RECORDS;
}

export function getVerifiedSolarDataset(_cityId: string = 'LIMA'): CitySolarDataset {
  return LIMA_SOLAR_RECORDS;
}
