export interface CityData {
  readonly id: 'AREQUIPA' | 'TROMSO';
  readonly name: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly altitudeMeters: number;
  readonly climateType: string;
  readonly description: string;
  readonly solarContext: string;
}

/**
 * Ciudades oficiales según Requisitos V3.0 (Fuente de Verdad):
 * - Arequipa, Perú (AREQUIPA): gran altitud, alta radiación solar constante, menor presión atmosférica.
 * - Tromsø, Noruega (TROMSO): círculo polar ártico, noche polar extrema, sol de medianoche en verano.
 */
export const SUPPORTED_CITIES: readonly CityData[] = [
  {
    id: 'AREQUIPA',
    name: 'Arequipa',
    country: 'Perú',
    latitude: -16.4090,
    longitude: -71.5375,
    altitudeMeters: 2325,
    climateType: 'Montaña andina desértica',
    description: 'La Ciudad Blanca a 2,325 m de altitud. Cielos despejados más de 300 días al año y menor densidad atmosférica.',
    solarContext: 'Radiación solar muy alta y constante (>6.5 kWh/m²/día) debido a su altitud y baja columna de aire. Ángulo óptimo hacia el norte: ~16°.',
  },
  {
    id: 'TROMSO',
    name: 'Tromsø',
    country: 'Noruega',
    latitude: 69.6492,
    longitude: 18.9553,
    altitudeMeters: 20,
    climateType: 'Subártico marítimo',
    description: 'La puerta al Ártico sobre el paralelo 69° N. Hogar de la noche polar en invierno y del sol de medianoche en verano.',
    solarContext: 'Variación solar extrema: desde 0.08 kWh/m²/día en la noche polar de diciembre hasta 5.18 kWh/m²/día en el solsticio de junio.',
  },
] as const;

export const DEFAULT_CITY: CityData = SUPPORTED_CITIES[0]; // Arequipa
