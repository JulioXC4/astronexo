import type { NasaObservation } from '../../game/contracts';

export interface SolarDayRecord {
  readonly date: string; // YYYY-MM-DD
  readonly seasonLabel: string; // Etiqueta educativa, no salida de POWER.
  readonly skyCondition: string; // Contexto ilustrativo, no observación meteorológica de POWER.
  readonly daylightHours: number; // Contexto astronómico aproximado, no parámetro consultado.
  readonly irradianceKwhPerM2: number; // ALLSKY_SFC_SW_DWN
  readonly observation: NasaObservation;
}

export interface CitySolarDataset {
  readonly cityId: 'AREQUIPA' | 'TROMSO';
  readonly optimalTiltDegrees: number;
  readonly orientationCompass: 'NORTH' | 'SOUTH';
  readonly days: readonly [SolarDayRecord, SolarDayRecord, SolarDayRecord];
}

/**
 * Valores diarios contrastados con NASA POWER el 2026-11-15 para Arequipa, Perú
 * (Latitud: -16.4090, Longitud: -71.5375). Solo irradianceKwhPerM2 es dato POWER.
 * Parámetro: ALLSKY_SFC_SW_DWN (All Sky Surface Shortwave Downward Irradiance) en kW-hr/m²/day.
 */
export const AREQUIPA_SOLAR_RECORDS: CitySolarDataset = {
  cityId: 'AREQUIPA',
  optimalTiltDegrees: 16,
  orientationCompass: 'NORTH',
  days: [
    {
      date: '2024-01-20',
      seasonLabel: 'Enero de 2024',
      skyCondition: 'Condición del cielo no incluida en este registro',
      daylightHours: 12.8,
      irradianceKwhPerM2: 5.6028,
      observation: {
        source: 'POWER',
        recordId: 'POWER-AREQUIPA-20240120',
        observedAt: '2024-01-20',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 5.6028,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-71.5375&latitude=-16.4090&start=20240120&end=20240120&format=JSON',
        coordinates: { latitude: -16.4090, longitude: -71.5375 },
      },
    },
    {
      date: '2024-06-15',
      seasonLabel: 'Junio de 2024',
      skyCondition: 'Condición del cielo no incluida en este registro',
      daylightHours: 11.2,
      irradianceKwhPerM2: 5.6455,
      observation: {
        source: 'POWER',
        recordId: 'POWER-AREQUIPA-20240615',
        observedAt: '2024-06-15',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 5.6455,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-71.5375&latitude=-16.4090&start=20240615&end=20240615&format=JSON',
        coordinates: { latitude: -16.4090, longitude: -71.5375 },
      },
    },
    {
      date: '2024-02-10',
      seasonLabel: 'Febrero de 2024',
      skyCondition: 'Condición del cielo no incluida en este registro',
      daylightHours: 12.5,
      irradianceKwhPerM2: 6.174,
      observation: {
        source: 'POWER',
        recordId: 'POWER-AREQUIPA-20240210',
        observedAt: '2024-02-10',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 6.174,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-71.5375&latitude=-16.4090&start=20240210&end=20240210&format=JSON',
        coordinates: { latitude: -16.4090, longitude: -71.5375 },
      },
    },
  ],
};

/**
 * Valores diarios contrastados con NASA POWER el 2026-11-15 para Tromsø, Noruega
 * (Latitud: 69.6492, Longitud: 18.9553). Solo irradianceKwhPerM2 es dato POWER.
 * Refleja el ciclo polar ártico: Sol de Medianoche en junio vs. Noche Polar en diciembre.
 */
export const TROMSO_SOLAR_RECORDS: CitySolarDataset = {
  cityId: 'TROMSO',
  optimalTiltDegrees: 68,
  orientationCompass: 'SOUTH',
  days: [
    {
      date: '2024-06-21',
      seasonLabel: 'Solsticio de verano (Sol de medianoche)',
      skyCondition: 'Luz solar continua las 24 horas del día',
      daylightHours: 24.0,
      irradianceKwhPerM2: 3.5702,
      observation: {
        source: 'POWER',
        recordId: 'POWER-TROMSO-20240621',
        observedAt: '2024-06-21',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 3.5702,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=18.9553&latitude=69.6492&start=20240621&end=20240621&format=JSON',
        coordinates: { latitude: 69.6492, longitude: 18.9553 },
      },
    },
    {
      date: '2024-03-21',
      seasonLabel: 'Equinoccio de primavera boreal',
      skyCondition: 'Sol bajo sobre el horizonte ártico',
      daylightHours: 12.0,
      irradianceKwhPerM2: 1.7194,
      observation: {
        source: 'POWER',
        recordId: 'POWER-TROMSO-20240321',
        observedAt: '2024-03-21',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 1.7194,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=18.9553&latitude=69.6492&start=20240321&end=20240321&format=JSON',
        coordinates: { latitude: 69.6492, longitude: 18.9553 },
      },
    },
    {
      date: '2024-12-21',
      seasonLabel: 'Solsticio de invierno (Noche polar)',
      skyCondition: 'El Sol no supera el horizonte (oscuridad total)',
      daylightHours: 0.0,
      irradianceKwhPerM2: 0,
      observation: {
        source: 'POWER',
        recordId: 'POWER-TROMSO-20241221',
        observedAt: '2024-12-21',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 0,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=18.9553&latitude=69.6492&start=20241221&end=20241221&format=JSON',
        coordinates: { latitude: 69.6492, longitude: 18.9553 },
      },
    },
  ],
};

export function getSolarDatasetByCity(cityId: string): CitySolarDataset {
  if (cityId === 'TROMSO') return TROMSO_SOLAR_RECORDS;
  return AREQUIPA_SOLAR_RECORDS;
}
