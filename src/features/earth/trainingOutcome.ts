import type { TrainingOutcome } from '../../game';
import { ALL_EARTH_MISSIONS, type MissionType } from '../../data/missions';

export type { TrainingOutcome } from '../../game';

export function trainingResourceLabel(resource: TrainingOutcome['resource']): string {
  return { energy: 'Energía', oxygen: 'Oxígeno', foodSupply: 'Alimentos' }[resource];
}

/** Umbrales de equilibrio del simulador. metric usa el control ya existente en cada juego. */
export function calculateTrainingCost(missionId: MissionType, metric: number): number {
  if (!Number.isFinite(metric)) throw new Error('Decisión terrestre inválida.');
  switch (missionId) {
    case 'SOLAR_DETECTIVE': return metric >= 50 ? 1 : 2; // % reservado
    case 'DARK_MONTHS_RESERVE': return metric <= 55 ? 1 : 2; // % calefacción
    case 'ALTITUDE_ACCLIMATIZATION': return metric <= 45 ? 1 : 2; // % gas de prueba
    case 'SOLAR_WATCH': return metric === 0 ? 2 : 1; // protocolo para la CME de mayor o menor velocidad
    case 'ECLSS_TRAINING': return metric <= 420 ? 1 : 2; // W consumidos
    case 'VEGGIE_LAB': return metric >= 70 ? 1 : 2; // % luz roja
    case 'CLOUDS_SUNS': return metric <= 10 ? 1 : 2; // puntos % de diferencia con la reserva que piden los datos POWER
    case 'ARCTIC_GREENHOUSE': return metric <= 52 ? 1 : 2; // % flujo geotérmico
  }
}

export function createTrainingOutcome(
  missionId: MissionType,
  decision: string,
  resource: TrainingOutcome['resource'],
  cost: number,
  limitation: string,
): TrainingOutcome {
  if (!Number.isInteger(cost) || cost < 1 || cost > 3) throw new Error('Costo terrestre fuera del límite educativo.');
  const mission = ALL_EARTH_MISSIONS[missionId];
  return {
    missionId, decision, resource, cost, tool: mission.targetTool,
    benefit: mission.effectOnSpaceMission, limitation,
    explanation: `${decision}: se reservaron ${cost} puntos menos de ${trainingResourceLabel(resource)} para el despegue. ${limitation}`,
    spaceDelta: { [resource]: -cost },
  };
}
