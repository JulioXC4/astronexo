import type { ToolId } from '../game/contracts';

export type MissionType =
  | 'SOLAR_DETECTIVE'
  | 'ALTITUDE_ACCLIMATIZATION'
  | 'DARK_MONTHS_RESERVE'
  | 'ARCTIC_GREENHOUSE'
  | 'SOLAR_WATCH'
  | 'ECLSS_TRAINING'
  | 'VEGGIE_LAB';

export interface EarthMissionDefinition {
  readonly id: MissionType;
  readonly name: string;
  readonly facilityName: string;
  readonly facilityIcon: string;
  readonly targetTool: ToolId;
  readonly toolLabel: string;
  readonly isCitySpecific: boolean;
  readonly objective: string;
  readonly costDescription: string;
  readonly effectOnSpaceMission: string;
  readonly scienceSource: string;
}

export const ALL_EARTH_MISSIONS: Record<MissionType, EarthMissionDefinition> = {
  SOLAR_DETECTIVE: {
    id: 'SOLAR_DETECTIVE',
    name: 'Detective del Sol (Arequipa)',
    facilityName: 'Observatorio Solar Andino',
    facilityIcon: '🔭',
    targetTool: 'FOLDING_PANELS',
    toolLabel: 'Paneles plegables',
    isCitySpecific: true,
    objective: 'Orientar celdas solares hacia el norte a 16° para captar la radiación de montaña (>6.5 kWh/m²/día) de Arequipa.',
    costDescription: 'Tiempo de calibración y balance de almacenamiento.',
    effectOnSpaceMission: 'Mayor generación de electricidad durante los días lunares con sol directo.',
    scienceSource: 'NASA POWER (Arequipa, -16.4° S)',
  },
  ALTITUDE_ACCLIMATIZATION: {
    id: 'ALTITUDE_ACCLIMATIZATION',
    name: 'Aclimatación de Altura Andina',
    facilityName: 'Cámara Hipobárica de Altura',
    facilityIcon: '⛰️',
    targetTool: 'LIFE_SUPPORT',
    toolLabel: 'Kit de soporte vital',
    isCitySpecific: true,
    objective: 'Entrenar el sellado hermético bajo la baja presión atmosférica de Arequipa (2,325 m s. n. m.).',
    costDescription: 'Gasto de tanques de gas de calibración.',
    effectOnSpaceMission: 'Respuesta más rápida ante fugas de aire en la estación lunar.',
    scienceSource: 'NASA ECLSS & Medicina de Altura',
  },
  DARK_MONTHS_RESERVE: {
    id: 'DARK_MONTHS_RESERVE',
    name: 'Reserva para los Meses Oscuros',
    facilityName: 'Banco de Baterías Criogénicas',
    facilityIcon: '❄️',
    targetTool: 'FOLDING_PANELS',
    toolLabel: 'Paneles plegables',
    isCitySpecific: true,
    objective: 'Gestionar el almacenamiento de energía para la noche polar ártica de Tromsø (0.08 kWh/m²/día), análoga a la noche lunar.',
    costDescription: 'Racionamiento de energía para calefacción.',
    effectOnSpaceMission: 'Baterías optimizadas para soportar la noche lunar de 14 días terrestres continuos.',
    scienceSource: 'NASA POWER (Tromsø, 69.6° N)',
  },
  ARCTIC_GREENHOUSE: {
    id: 'ARCTIC_GREENHOUSE',
    name: 'Invernadero Ártico Geotérmico',
    facilityName: 'Bio-Refugio Ártico',
    facilityIcon: '🌱',
    targetTool: 'CROP_KIT',
    toolLabel: 'Kit de cultivos',
    isCitySpecific: true,
    objective: 'Mantener cultivos hidropónicos con calor geotérmico y LEDs en el frío ártico extremo.',
    costDescription: 'Consumo continuo de agua y sales nutritivas.',
    effectOnSpaceMission: 'Suministro garantizado de microvegetales frescos para la tripulación.',
    scienceSource: 'CSA & NASA Veggie Polar Biology',
  },
  SOLAR_WATCH: {
    id: 'SOLAR_WATCH',
    name: 'Mirador de Tormentas (DONKI)',
    facilityName: 'Centro de Clima Espacial',
    facilityIcon: '🛰️',
    targetTool: 'SHELTER_KIT',
    toolLabel: 'Kit de refugio',
    isCitySpecific: false,
    objective: 'Detectar eyecciones de masa coronal (CME) históricas y activar el protocolo de blindaje hermético.',
    costDescription: 'Suspensión temporal de actividades exteriores.',
    effectOnSpaceMission: 'Módulo de refugio blindado con polietileno/agua contra radiación ionizante.',
    scienceSource: 'NASA DONKI (Evento CME Mayo 2024)',
  },
  ECLSS_TRAINING: {
    id: 'ECLSS_TRAINING',
    name: 'Módulo de Soporte Vital Regenerativo',
    facilityName: 'Hangar de Filtrado ECLSS',
    facilityIcon: '💨',
    targetTool: 'LIFE_SUPPORT',
    toolLabel: 'Kit de soporte vital',
    isCitySpecific: false,
    objective: 'Probar el reciclaje de condensación y electrólisis de agua en oxígeno respirable en circuito cerrado.',
    costDescription: 'Energía de electrólisis y filtros de prueba.',
    effectOnSpaceMission: 'Recuperación eficiente de aire ante emergencias de despresurización.',
    scienceSource: 'NASA ECLSS (Soporte Vital Regenerativo)',
  },
  VEGGIE_LAB: {
    id: 'VEGGIE_LAB',
    name: 'Laboratorio de Cultivos Veggie',
    facilityName: 'Bio-Domo Hidropónico',
    facilityIcon: '🌾',
    targetTool: 'CROP_KIT',
    toolLabel: 'Kit de cultivos',
    isCitySpecific: false,
    objective: 'Calibrar la iluminación LED roja y azul para acelerar la fotosíntesis de plantas espaciales.',
    costDescription: 'Balance de iluminación vs consumo de batería.',
    effectOnSpaceMission: 'Renovación de raciones alimenticias durante estancias prolongadas.',
    scienceSource: 'NASA Veggie & Advanced Plant Habitat',
  },
};

/**
 * Retorna las 5 misiones de la ciudad seleccionada:
 * - 2 específicas de la ciudad.
 * - 3 comunes a ambas ciudades.
 */
export function getMissionsForCity(cityId: string): readonly EarthMissionDefinition[] {
  if (cityId === 'TROMSO') {
    return [
      ALL_EARTH_MISSIONS.DARK_MONTHS_RESERVE, // Específica Tromsø 1
      ALL_EARTH_MISSIONS.ARCTIC_GREENHOUSE,   // Específica Tromsø 2
      ALL_EARTH_MISSIONS.SOLAR_WATCH,         // Común 1
      ALL_EARTH_MISSIONS.ECLSS_TRAINING,      // Común 2
      ALL_EARTH_MISSIONS.VEGGIE_LAB,              // Común 3 (Alimento / Cultivos hidropónicos)
    ];
  }
  // Arequipa (default)
  return [
    ALL_EARTH_MISSIONS.SOLAR_DETECTIVE,         // Específica Arequipa 1
    ALL_EARTH_MISSIONS.ALTITUDE_ACCLIMATIZATION,// Específica Arequipa 2
    ALL_EARTH_MISSIONS.SOLAR_WATCH,             // Común 1
    ALL_EARTH_MISSIONS.ECLSS_TRAINING,          // Común 2
    ALL_EARTH_MISSIONS.VEGGIE_LAB,              // Común 3
  ];
}
