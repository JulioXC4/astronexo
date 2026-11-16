/**
 * Salida a explorar (evento opcional entre turnos, especificación de JD).
 *
 * Estos tipos viven en `game/` y no en `features/exploration` porque el estado
 * de la misión tiene que poder guardar el resultado sin depender de la interfaz.
 */
export type ExplorationMode = 'FOOT' | 'ROVER';

/** Qué clase de hallazgo es: decide los puntos y cómo se cuenta. */
export type FindingKind = 'SAMPLE' | 'VIEWPOINT' | 'MISSION_TRACE' | 'NASA_CURIOSITY';

export interface ExplorationFinding {
  /** Posición en la colección del destino (0 a 10). */
  readonly index: number;
  readonly kind: FindingKind;
  /** Piezas recogidas. Las muestras vienen en montones; lo demás cuenta como 1. */
  readonly pieces: number;
  readonly points: number;
}

export interface ExplorationResources {
  readonly energy: number;
  readonly oxygen: number;
  readonly shield: number;
}

/** Lo que dejó escrito una salida cuando terminó. */
export interface ExplorationResult {
  /** Turno de la guardia después del cual ocurrió (2 o 4). */
  readonly afterTurn: number;
  readonly mode: ExplorationMode;
  /** Batería con la que salió (0 si fue a pie). */
  readonly batteryAllocated: number;
  /** Batería que sobró y volvió a la base. */
  readonly batteryReturned: number;
  readonly minutes: number;
  readonly distanceMeters: number;
  /** Nunca se «muere»: si no alcanzan los recursos, alguien sale a buscarte. */
  readonly rescued: boolean;
  readonly before: ExplorationResources;
  readonly after: ExplorationResources;
  readonly findings: readonly ExplorationFinding[];
  readonly points: number;
}

/** Una línea del registro de salidas que usa el informe de la guardia. */
export interface ExplorationRecord {
  readonly afterTurn: number;
  readonly minutes: number;
  readonly pieces: number;
  readonly mode: ExplorationMode;
  readonly rescued: boolean;
}
