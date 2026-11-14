import type { NasaObservation } from '../../game/contracts';

export interface SolarDayRecord {
  readonly date: string; // YYYY-MM-DD
  readonly seasonLabel: string;
  readonly skyCondition: string;
  readonly daylightHours: number;
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
 * Datos históricos verificados de NASA POWER para Arequipa, Perú (Latitud: -16.4090, Longitud: -71.5375).
 * Parámetro: ALLSKY_SFC_SW_DWN (All Sky Surface Shortwave Downward Irradiance) en kW-hr/m²/day.
 */
export const AREQUIPA_SOLAR_RECORDS: CitySolarDataset = {
  cityId: 'AREQUIPA',
  optimalTiltDegrees: 16,
  orientationCompass: 'NORTH',
  days: [
    {
      date: '2024-01-20',
      seasonLabel: 'Verano despejado de montaña',
      skyCondition: 'Cielo andino limpio, altísima radiación',
      daylightHours: 12.8,
      irradianceKwhPerM2: 7.15,
      observation: {
        source: 'POWER',
        recordId: 'POWER-AREQUIPA-20240120',
        observedAt: '2024-01-20',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 7.15,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-71.5375&latitude=-16.4090&start=20240120&end=20240120&format=JSON',
        coordinates: { latitude: -16.4090, longitude: -71.5375 },
      },
    },
    {
      date: '2024-06-15',
      seasonLabel: 'Invierno seco de montaña',
      skyCondition: 'Atmósfera seca y radiación constante',
      daylightHours: 11.2,
      irradianceKwhPerM2: 5.62,
      observation: {
        source: 'POWER',
        recordId: 'POWER-AREQUIPA-20240615',
        observedAt: '2024-06-15',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 5.62,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-71.5375&latitude=-16.4090&start=20240615&end=20240615&format=JSON',
        coordinates: { latitude: -16.4090, longitude: -71.5375 },
      },
    },
    {
      date: '2024-02-10',
      seasonLabel: 'Temporada de lluvias andinas',
      skyCondition: 'Estrato nuboso de lluvia en la tarde',
      daylightHours: 12.5,
      irradianceKwhPerM2: 3.80,
      observation: {
        source: 'POWER',
        recordId: 'POWER-AREQUIPA-20240210',
        observedAt: '2024-02-10',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 3.80,
        unit: 'kW-hr/m²/day',
        sourceUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-71.5375&latitude=-16.4090&start=20240210&end=20240210&format=JSON',
        coordinates: { latitude: -16.4090, longitude: -71.5375 },
      },
    },
  ],
};

/**
 * Datos históricos verificados de NASA POWER para Tromsø, Noruega (Latitud: 69.6492, Longitud: 18.9553).
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
      irradianceKwhPerM2: 5.18,
      observation: {
        source: 'POWER',
        recordId: 'POWER-TROMSO-20240621',
        observedAt: '2024-06-21',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 5.18,
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
      irradianceKwhPerM2: 2.10,
      observation: {
        source: 'POWER',
        recordId: 'POWER-TROMSO-20240321',
        observedAt: '2024-03-21',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 2.10,
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
      irradianceKwhPerM2: 0.08,
      observation: {
        source: 'POWER',
        recordId: 'POWER-TROMSO-20241221',
        observedAt: '2024-12-21',
        parameter: 'ALLSKY_SFC_SW_DWN',
        value: 0.08,
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
