import type { NasaObservation } from '../../game/contracts';
import donkiSnapshot from './snapshots/donki.json';

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
const LOCAL_PRIMARY_CME: DonkiEventRecord = {
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
      status: 'HISTORICAL',
      fetchedAt: '2026-11-15',
    },
};

export interface DonkiSnapshotEvent {
  readonly activityID: string;
  readonly type: 'CME' | 'FLR' | 'GST';
  readonly startTime: string;
  /** CME: km/s · FLR: clase (p. ej. X5.8) · GST: Kp máximo. */
  readonly value: number | string;
  readonly unit: string;
  readonly link: string;
}
export interface DonkiSnapshotFile {
  readonly fetchedAt: string | null;
  /** URL consultada SIN api_key. */
  readonly requestUrl: string | null;
  readonly events: readonly DonkiSnapshotEvent[];
  /** Tipos que el servicio no devolvió y el motivo (p. ej. FLR con HTTP 404). */
  readonly skipped?: readonly { readonly type: string; readonly reason: string }[];
}

const snapshot = donkiSnapshot as DonkiSnapshotFile;

/** Una CME del snapshot solo se acepta con velocidad, fecha y enlace válidos. */
function validSnapshotCmes(file: DonkiSnapshotFile): DonkiSnapshotEvent[] {
  if (!file.fetchedAt) return [];
  return file.events.filter((e) => e.type === 'CME' && typeof e.value === 'number'
    && Number.isFinite(e.value) && e.value > 0 && e.value < 4000
    && !Number.isNaN(Date.parse(e.startTime)) && /^https:\/\/(ccmc|kauai\.ccmc)\.gsfc\.nasa\.gov\//.test(e.link));
}

/** Con `activityId` devuelve exactamente esa CME; sin él, la más rápida del snapshot. */
export function pickSnapshotCme(file: DonkiSnapshotFile, activityId?: string): DonkiSnapshotEvent | null {
  const cmes = validSnapshotCmes(file);
  if (activityId) return cmes.find((e) => e.activityID === activityId) ?? null;
  if (cmes.length === 0) return null;
  return cmes.reduce((best, e) => (Number(e.value) > Number(best.value) ? e : best));
}

/**
 * Actualiza un evento local con su CME gemela del snapshot (mismo activityID).
 * Nunca cambia de evento en silencio: si el identificador no está o es inválido, se conserva el respaldo.
 */
export function applyDonkiSnapshot(local: DonkiEventRecord, file: DonkiSnapshotFile): DonkiEventRecord {
  const cme = pickSnapshotCme(file, local.eventId);
  if (!cme || !file.fetchedAt) return local;
  const speed = Number(cme.value);
  return {
    ...local,
    observedAt: cme.startTime,
    sourceUrl: cme.link,
    summary: speed === Number(local.observation.value)
      ? local.summary
      : `CME ${cme.startTime.slice(0, 10)} (DONKI ${cme.activityID}); velocidad del análisis más preciso: ${speed} km/s.`,
    observation: {
      ...local.observation,
      observedAt: cme.startTime,
      value: speed,
      unit: 'km/s',
      sourceUrl: cme.link,
      status: 'UPDATED',
      fetchedAt: file.fetchedAt,
    },
  };
}

const PRIMARY_CME = applyDonkiSnapshot(LOCAL_PRIMARY_CME, snapshot);

/** Eventos de apoyo (GST/FLR) solo existen si el script los obtuvo de DONKI; nunca hay cifras locales inventadas. */
export const DONKI_SUPPORTING_EVENTS: readonly DonkiSnapshotEvent[] = snapshot.fetchedAt
  ? snapshot.events.filter((e) => e.type !== 'CME') : [];

export const DONKI_HISTORICAL_EVENTS: readonly DonkiEventRecord[] = [
  PRIMARY_CME,
  applyDonkiSnapshot({
    ...LOCAL_PRIMARY_CME,
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
      status: 'HISTORICAL',
      fetchedAt: '2026-11-15',
    },
  }, snapshot),
];

export const DEFAULT_DONKI_EVENT = DONKI_HISTORICAL_EVENTS[0];
