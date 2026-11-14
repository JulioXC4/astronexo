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
 * Registros históricos verificados de NASA DONKI (Space Weather Database).
 * - CME: Eyección de masa coronal (nubes de plasma magnetizado que viajan en 1-3 días).
 * - FLR: Llamarada solar (fotones X/UV que llegan a la velocidad de la luz en 8 minutos).
 * - GST: Tormenta geomagnética en la magnetosfera terrestre.
 * - SEP: Eventos de partículas energéticas solares.
 * Los indicadores de protección se expresan en niveles educativos de alerta simulada.
 */
export const DONKI_HISTORICAL_EVENTS: readonly DonkiEventRecord[] = [
  {
    eventId: '2024-05-10T06:54:00-CME-001',
    eventType: 'CME',
    typeLabel: 'Eyección de Masa Coronal (CME) y Tormenta G5',
    observedAt: '2024-05-10T06:54:00Z',
    summary: 'La mayor eyección coronal del ciclo solar 25 (región NOAA AR 3664) con velocidad superior a 1200 km/s.',
    scientificDetail: 'Nube masiva de plasma solar y campo magnético. En cuerpos sin atmósfera ni magnetosfera global (como la Luna o durante el tránsito interplanetario), el flujo de partículas energéticas requiere refugio blindado de polietileno/agua.',
    sourceUrl: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/27043/1',
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
      recordId: '2024-05-10T06:54:00-CME-001',
      observedAt: '2024-05-10T06:54:00Z',
      parameter: 'Coronal Mass Ejection (CME) - NOAA AR 3664',
      value: 'Velocidad > 1200 km/s · Asociada a Tormenta Geomagnética G5',
      unit: 'km/s',
      sourceUrl: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/27043/1',
    },
  },
  {
    eventId: '2024-02-22T22:08:00-FLR-001',
    eventType: 'FLR',
    typeLabel: 'Llamarada Solar Clase X6.3',
    observedAt: '2024-02-22T22:08:00Z',
    summary: 'La llamarada solar más potente de la primera mitad del ciclo solar 25, detectada por SDO y GOES.',
    scientificDetail: 'Emisión repentina de radiación electromagnética (rayos X y UV extremos) que viaja a la velocidad de la luz y alcanza la órbita lunar en solo 8 minutos.',
    sourceUrl: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/FLR/26780/1',
    recommendedAction: {
      id: 'RADIO_COMM_ALERT',
      label: 'Activar filtro de radiofrecuencia y suspender paseos exteriores',
      description: 'Proteger antenas de comunicaciones y mantener a los astronautas en cabina.',
      outcomeType: 'CORRECT',
      explanation: '¡Gran decisión! Evitaste el apagón de telemetría y la exposición directa a rayos X en el exterior.',
    },
    alternativeActions: [
      {
        id: 'IGNORE_WARNING',
        label: 'Ignorar aviso porque el cielo lunar se ve oscuro',
        description: 'Continuar tareas exteriores sin protección.',
        outcomeType: 'RISKY',
        explanation: 'Peligro: la radiación X no es visible al ojo humano pero penetra trajes espaciales ligeros.',
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
