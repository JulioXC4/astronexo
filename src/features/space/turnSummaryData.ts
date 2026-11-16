import { INTERVENTIONS } from '../../game';
import type { AlertKind, MissionState } from '../../game';

export interface TurnSummaryData {
  readonly completedTurn: number;
  /** Reloj del turno que terminó. */
  readonly clock: string;
  /** Qué hizo el niño, ya traducido. null si no intervino. */
  readonly actionLabel: string | null;
  /** Alertas que quedaron activas al cerrar y aplicaron su consecuencia. */
  readonly ignoredAlerts: readonly AlertKind[];
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

/**
 * Reúne lo que hay que contarle al niño del turno que acaba de cerrar. Se llama
 * ANTES de avanzar: en ese momento `activeAlerts` son justo las que se ignoraron
 * (la atendida ya se quitó al confirmar la acción).
 */
export function collectTurnSummary(before: MissionState, t: Translate): TurnSummaryData {
  const decision = [...before.decisions].reverse().find((item) => item.turn === before.turn);
  const intervention = decision && INTERVENTIONS.find((item) => item.action === decision.action);
  return {
    completedTurn: before.turn,
    clock: before.destination === 'MOON'
      ? t('missionControl.lunarDay', { day: before.clockLabel.match(/\d+/)?.[0] ?? before.turn })
      : before.clockLabel,
    actionLabel: intervention ? t(`interventions.items.${intervention.id}.label`) : null,
    ignoredAlerts: before.activeAlerts.map((alert) => alert.kind),
  };
}
