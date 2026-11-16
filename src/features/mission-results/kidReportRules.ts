import type { AlertKind, MissionResult, UnresolvedEvent } from '../../game';

const TIP_RESOURCES = [
  { key: 'energy', labelKey: 'missionControl.energy' },
  { key: 'oxygen', labelKey: 'missionControl.oxygen' },
  { key: 'shield', labelKey: 'missionControl.shield' },
  { key: 'foodSupply', labelKey: 'missionControl.food' },
] as const;

export interface AlertTip {
  readonly kind: AlertKind;
  /** Clave i18n del recurso que más perdió por no atenderla. */
  readonly resourceLabelKey: string;
  readonly lost: number;
}

/**
 * «Para la próxima»: las alertas que dejó sin atender y que más le costaron, en palabras de niño
 * («atiende antes la fuga de oxígeno: te quitó 22 de oxígeno»). Antes el informe repetía la línea
 * técnica del motor («Fuga de oxígeno aplicó consecuencias de nivel 1/2…»).
 */
export function alertTips(events: readonly UnresolvedEvent[], limit = 2): AlertTip[] {
  const losses = new Map<AlertKind, Record<string, number>>();
  for (const event of events) {
    if (!event.alertKind) continue;
    const total = losses.get(event.alertKind) ?? {};
    for (const { key } of TIP_RESOURCES) {
      const value = event.resourceDelta[key] ?? 0;
      if (value < 0) total[key] = (total[key] ?? 0) - value;
    }
    losses.set(event.alertKind, total);
  }
  return [...losses.entries()]
    .map(([kind, total]) => {
      const worst = TIP_RESOURCES
        .map(({ key, labelKey }) => ({ labelKey, lost: total[key] ?? 0 }))
        .sort((a, b) => b.lost - a.lost)[0];
      return { kind, resourceLabelKey: worst.labelKey, lost: worst.lost };
    })
    .filter((tip) => tip.lost > 0)
    .sort((a, b) => b.lost - a.lost)
    .slice(0, limit);
}

/**
 * ¿La tripulación tuvo que volver porque se acabó algo? (mismas reglas que el motor). Distinto de
 * «llegó al turno 5 sin la ciencia», que el motor también marca como INTERRUPTED pero con todos a salvo.
 */
export function resourceRanOut(state: Pick<MissionResult['finalState'], 'oxygen' | 'energy' | 'foodSupply' | 'radiationExposure'>): boolean {
  return state.oxygen <= 0 || state.energy <= 0 || state.foodSupply <= 0 || state.radiationExposure >= 100;
}

/**
 * De 1 a 3 estrellas: lo primero que entiende un niño de 7 años.
 * - Se acabó un recurso: 1 (siempre hay algo que aprender).
 * - 3 estrellas: meta científica lograda y puntuación alta (75+).
 * - 2 estrellas: meta científica lograda o puntuación media (50+).
 */
export function starsFor(result: Pick<MissionResult, 'outcome' | 'score' | 'scientificObjectiveAchieved' | 'finalState'>): 1 | 2 | 3 {
  if (resourceRanOut(result.finalState)) return 1;
  const total = result.score.total;
  if (result.scientificObjectiveAchieved && total >= 75) return 3;
  return total >= 50 || result.scientificObjectiveAchieved ? 2 : 1;
}

/** Medallas del informe: cada una premia una idea del reto (cuidar a la tripulación, la ciencia, los recursos, explorar). */
export function earnedMedals(result: Pick<MissionResult, 'outcome' | 'scientificObjectiveAchieved' | 'finalState'>) {
  const { finalState } = result;
  return {
    crew: !resourceRanOut(finalState),
    science: result.scientificObjectiveAchieved,
    keeper: finalState.energy >= 40 && finalState.oxygen >= 40 && finalState.shield >= 40,
    explorer: finalState.explorations.length > 0 || finalState.starsFound.length > 0,
  } as const;
}
