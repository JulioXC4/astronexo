export interface CityData {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly description: string;
  readonly solarContext: string;
}

export const SUPPORTED_CITIES: readonly CityData[] = [
  {
    id: 'LIMA',
    name: 'Lima',
    country: 'Perú',
    latitude: -12.0464,
    longitude: -77.0428,
    description: 'Capital costera del Pacífico, con verano soleado e invierno nublado caracterizado por niebla costera.',
    solarContext: 'Gran variación estacional: desde más de 6 kWh/m²/día en verano hasta 2.5 kWh/m²/día en invierno debido a la cobertura nubosa baja.',
  },
  {
    id: 'AREQUIPA',
    name: 'Arequipa',
    country: 'Perú',
    latitude: -16.4090,
    longitude: -71.5375,
    description: 'La Ciudad Blanca, ubicada a 2,325 m sobre el nivel del mar, con más de 300 días de sol al año.',
    solarContext: 'Radiación solar muy alta y constante (>6.5 kWh/m²/día) debido a su gran altitud y cielos despejados.',
  },
  {
    id: 'BOGOTA',
    name: 'Bogotá',
    country: 'Colombia',
    latitude: 4.7110,
    longitude: -74.0721,
    description: 'Metrópoli andina a 2,640 m de altitud con clima de montaña tropical y nubosidad variable.',
    solarContext: 'Radiación moderada y variable (4.0 a 4.8 kWh/m²/día) afectada por el régimen de lluvias andino.',
  },
  {
    id: 'HOUSTON',
    name: 'Houston',
    country: 'EE. UU.',
    latitude: 29.7604,
    longitude: -95.3698,
    description: 'Sede del Centro Espacial Johnson de la NASA y del Control de Misión de vuelos tripulados.',
    solarContext: 'Radiación estacional marcada en el hemisferio norte: alta en verano (>6.0 kWh/m²/día) y moderada en invierno.',
  },
] as const;

export const DEFAULT_CITY = SUPPORTED_CITIES[0]; // Lima
