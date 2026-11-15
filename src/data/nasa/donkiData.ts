import type { NasaObservation } from '../../game/contracts';

export interface DonkiEventRecord {
  readonly eventId: string;
  readonly eventType: 'CME' | 'FLR' | 'SEP' | 'GST';
  readonly typeLabel: string;
  readonly observedAt: string;
  readonly summary: string;
  readonly scientificDetail: string;
  readonly sourceUrl: string;
  readonly recommendedAction: {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly outcomeType: 'CORRECT' | 'RISKY' | 'INEFFECTIVE';
    readonly explanation: string;
  };
  readonly alternativeActions: readonly {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly outcomeType: 'CORRECT' | 'RISKY' | 'INEFFECTIVE';
    readonly explanation: string;
  }[];
  readonly observation: NasaObservation;
}

/**
 * Respaldo local de registros históricos de NASA DONKI (M2M_CATALOG).
 * Ambos registros son CME. Las fechas y velocidades provienen de sus fichas DONKI;
 * el protocolo jugable y sus consecuencias son una simulación educativa.
 * Los indicadores de protección se expresan en niveles educativos de alerta simulada.
 */
const PRIMARY_CME: DonkiEventRecord = {
    eventId: '2024-05-10T07:12:00-CME-001',
    eventType: 'CME',
    typeLabel: 'Eyección de Masa Coronal (CME)',
    observedAt: '2024-05-10T07:12:00Z',
    summary: 'CME observada el 10 de mayo de 2024 desde la región activa 13664; análisis de la parte principal: 1018 km/s.',
    scientificDetail: 'Nube masiva de plasma solar y campo magnético. En cuerpos sin atmósfera ni magnetosfera global (como la Luna o durante el tránsito interplanetario), el flujo de partículas energéticas requiere refugio blindado de polietileno/agua.',
    sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30670/-1',
    recommendedAction: {
      id: 'SHELTER_SHIELD',
      label: 'Activar protocolo de refugio y blindaje hermético',
      description: 'Trasladar tripulación al búnker interior y orientar escudos de protección.',
      outcomeType: 'CORRECT',
      explanation: '¡Protocolo excelente! La tripulación se resguarda tras las capas de polietileno y agua, y la electrónica sensible se mantiene en modo seguro.',
    },
    alternativeActions: [
      {
        id: 'MAX_POWER',
        label: 'Acelerar recarga de baterías al máximo nivel',
        description: 'Mantener paneles expuestos sin aislar la electrónica.',
        outcomeType: 'RISKY',
        explanation: '¡Riesgo de sobretensión! Las partículas inducen corrientes en circuitos no blindados.',
      },
      {
        id: 'TOTAL_SHUTDOWN',
        label: 'Apagar toda la base y cortar el soporte vital',
        description: 'Desconectar absolutamente todos los sistemas.',
        outcomeType: 'INEFFECTIVE',
        explanation: 'Corte innecesario: apagar el soporte vital interrumpe el reciclaje de oxígeno y la calefacción.',
      },
    ],
    observation: {
      source: 'DONKI',
      recordId: '2024-05-10T07:12:00-CME-001',
      observedAt: '2024-05-10T07:12:00Z',
      parameter: 'CME bulk speed (M2M_CATALOG, NOAA AR 13664)',
      value: 1018,
      unit: 'km/s',
      sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30670/-1',
    },
};

export const DONKI_HISTORICAL_EVENTS: readonly DonkiEventRecord[] = [
  PRIMARY_CME,
  {
    ...PRIMARY_CME,
    eventId: '2024-05-10T21:28:00-CME-001',
    typeLabel: 'Eyección de Masa Coronal (CME) posterior',
    observedAt: '2024-05-10T21:28:00Z',
    summary: 'CME observada el 10 de mayo de 2024 desde S35E01; primer análisis DONKI: 717 km/s.',
    sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30753/-1',
    observation: {
      source: 'DONKI',
      recordId: '2024-05-10T21:28:00-CME-001',
      observedAt: '2024-05-10T21:28:00Z',
      parameter: 'CME speed (M2M_CATALOG, first analysis)',
      value: 717,
      unit: 'km/s',
      sourceUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/view/CME/30753/-1',
    },
  },
];

export const DEFAULT_DONKI_EVENT = DONKI_HISTORICAL_EVENTS[0];
