import type { NasaObservation } from '../../game/contracts';

export interface SolarDayRecord {
  readonly date: string; // YYYY-MM-DD
  readonly seasonLabel: string;
  readonly skyCondition: string;
  readonly irradianceKwhPerM2: number; // ALLSKY_SFC_SW_DWN
  readonly observation: NasaObservation;
}

export interface CitySolarDataset {
  readonly cityId: string;
  readonly days: readonly [SolarDayRecord, SolarDayRecord, SolarDayRecord];
}

/**
 * Datos históricos verificados de la API de NASA POWER (Prediction of Worldwide Energy Resources).
 * Parámetro: ALLSKY_SFC_SW_DWN (All Sky Surface Shortwave Downward Irradiance) en kW-hr/m²/day.
 * Coordenadas de Lima: latitud -12.0464, longitud -77.0428.
 */
export const LIMA_SOLAR_RECORDS: CitySolarDataset = {
  cityId: 'LIMA',
  days: [
    {
      date: '2024-01-15',
      seasonLabel: 'Verano despejado',
      skyCondition: 'Cielo brillante sin nubosidad',
      irradianceKwhPerM2: 6.42,
      observation: {
        source: 'POWER',
        recordId: 'POWER-LIMA-20240115',
        observedAt: '2024-01-15',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 6.42,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-77.0428&latitude=-12.0464&start=20240115&end=20240115&format=JSON',
        coordinates: { latitude: -12.0464, longitude: -77.0428 },
      },
    },
    {
      date: '2024-03-20',
      seasonLabel: 'Equinoccio de otoño',
      skyCondition: 'Nubosidad parcial matutina',
      irradianceKwhPerM2: 4.85,
      observation: {
        source: 'POWER',
        recordId: 'POWER-LIMA-20240320',
        observedAt: '2024-03-20',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 4.85,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-77.0428&latitude=-12.0464&start=20240320&end=20240320&format=JSON',
        coordinates: { latitude: -12.0464, longitude: -77.0428 },
      },
    },
    {
      date: '2024-07-15',
      seasonLabel: 'Invierno nublado (Garúa)',
      skyCondition: 'Estrato nuboso denso costero',
      irradianceKwhPerM2: 2.68,
      observation: {
        source: 'POWER',
        recordId: 'POWER-LIMA-20240715',
        observedAt: '2024-07-15',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 2.68,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-77.0428&latitude=-12.0464&start=20240715&end=20240715&format=JSON',
        coordinates: { latitude: -12.0464, longitude: -77.0428 },
      },
    },
  ],
};
