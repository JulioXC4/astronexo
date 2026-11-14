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
 * Registros históricos verificables de NASA DONKI (Space Weather Database of Notifications, Knowledge, Information).
 * Incluye la tormenta solar extrema de mayo de 2024 y la gran llamarada X del ciclo solar 25.
 */
export const DONKI_HISTORICAL_EVENTS: readonly DonkiEventRecord[] = [
  {
    eventId: '2024-05-10T06:54:00-CME-001',
    eventType: 'CME',
    typeLabel: 'Eyección de Masa Coronal (CME) y Tormenta G5',
    observedAt: '2024-05-10T06:54:00Z',
    summary: 'La mayor tormenta geomagnética en 21 años (clase extrema G5), originada por el complejo de manchas solares NOAA AR 3664.',
    scientificDetail: 'Nube masiva de plasma solar y campo magnético lanzada a más de 1200 km/s hacia el espacio interplanetario. En la Luna, sin atmósfera, la radiación ionizante impacta directamente en la superficie.',
    sourceUrl: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/27043/1',
    recommendedAction: {
      id: 'SHELTER_SHIELD',
      label: 'Orientar blindaje del refugio y asegurar instrumental',
      description: 'Activar protocolo de confinamiento en el módulo blindado y orientar paneles en modo de supervivencia.',
      outcomeType: 'CORRECT',
      explanation: '¡Protocolo excelente! Los astronautas se mantienen protegidos tras los escudos de polietileno/agua y la telemetría continúa funcionando.',
    },
    alternativeActions: [
      {
        id: 'MAX_POWER',
        label: 'Acelerar recarga de baterías al máximo nivel',
        description: 'Forzar captación de energía sin proteger la electrónica sensible.',
        outcomeType: 'RISKY',
        explanation: '¡Riesgo de sobrecarga! La corriente inducida por las partículas puede quemar reguladores de carga no aislados.',
      },
      {
        id: 'TOTAL_SHUTDOWN',
        label: 'Apagar toda la base y cortar el soporte vital',
        description: 'Desconectar absolutamente todos los sistemas para evitar cualquier interferencia.',
        outcomeType: 'INEFFECTIVE',
        explanation: 'Reacción desmedida: cortar el soporte vital innecesariamente pone en riesgo el aire y la temperatura de la tripulación.',
      },
    ],
    observation: {
      source: 'DONKI',
      recordId: '2024-05-10T06:54:00-CME-001',
      observedAt: '2024-05-10T06:54:00Z',
      parameter: 'Coronal Mass Ejection (CME) - NOAA AR 3664',
      value: 'Speed > 1200 km/s · Geomagnetic Storm G5',
      unit: 'km/s',
      sourceUrl: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/27043/1',
    },
  },
  {
    eventId: '2024-02-22T22:08:00-FLR-001',
    eventType: 'FLR',
    typeLabel: 'Llamarada Solar Clase X6.3',
    observedAt: '2024-02-22T22:08:00Z',
    summary: 'La llamarada solar más potente del ciclo solar 25 hasta esa fecha, detectada por los satélites SDO y GOES.',
    scientificDetail: 'Emisión súbita de rayos X y radiación ultravioleta extrema que viaja a la velocidad de la luz, alcanzando la órbita lunar en solo 8 minutos.',
    sourceUrl: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/FLR/26780/1',
    recommendedAction: {
      id: 'RADIO_COMM_ALERT',
      label: 'Activar protocolo de comunicaciones seguras y filtro UV',
      description: 'Suspender transmisiones no críticas y proteger antenas de radio de alta frecuencia.',
      outcomeType: 'CORRECT',
      explanation: '¡Gran decisión! Evitaste el apagón de comunicaciones por interferencia electromagnética durante el pulso inicial.',
    },
    alternativeActions: [
      {
        id: 'IGNORE_WARNING',
        label: 'Ignorar aviso porque el cielo lunar se ve oscuro',
        description: 'Continuar trabajos exteriores sin tomar medidas.',
        outcomeType: 'RISKY',
        explanation: 'Peligro: la radiación X no se ve con los ojos humanos, pero eleva bruscamente la dosis absorbida en el exterior.',
      },
    ],
    observation: {
      source: 'DONKI',
      recordId: '2024-02-22T22:08:00-FLR-001',
      observedAt: '2024-02-22T22:08:00Z',
      parameter: 'Solar Flare X-Ray Peak Flux',
      value: 'X6.3 class flare',
      unit: 'Watts/m²',
      sourceUrl: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/FLR/26780/1',
    },
  },
] as const;

export const DEFAULT_DONKI_EVENT = DONKI_HISTORICAL_EVENTS[0];
