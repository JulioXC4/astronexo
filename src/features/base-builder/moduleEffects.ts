import { getModuleDefinition } from '../../game';
import type { ModuleId } from '../../game';

export type EffectResource = 'energy' | 'oxygen' | 'food' | 'radiation' | 'science';
/** Cuándo se aplica: al llegar, cada turno, al investigar o sobre la luz del Sol. */
export type EffectWhen = 'start' | 'turn' | 'research' | 'sun';

export interface ModuleEffect {
  readonly resource: EffectResource;
  /** Con signo: positivo sube la barra, negativo la baja. */
  readonly amount: number;
  readonly percent?: boolean;
  readonly when: EffectWhen;
  /** Bueno para la base (verde) o un costo (rojo). Menos radiación es bueno aunque el número baje. */
  readonly good: boolean;
}

/**
 * Lo que cada módulo da y cuesta, leído del catálogo del motor (solo lectura: no se
 * inventa ni se cambia ningún número). Sirve para que el niño vea «qué ayuda» y «qué gasta».
 */
export function getModuleEffects(moduleId: ModuleId): readonly ModuleEffect[] {
  const module = getModuleDefinition(moduleId);
  if (!module) return [];
  const effects: ModuleEffect[] = [];
  const initial = module.initialEffect;
  if (initial?.energy) effects.push({ resource: 'energy', amount: initial.energy, when: 'start', good: initial.energy > 0 });
  if (module.solarGenerationBonusRatio) {
    effects.push({ resource: 'energy', amount: Math.round(module.solarGenerationBonusRatio * 100), percent: true, when: 'sun', good: true });
  }
  const turn = module.turnBenefit;
  if (turn?.oxygen) effects.push({ resource: 'oxygen', amount: turn.oxygen, when: 'turn', good: turn.oxygen > 0 });
  if (turn?.foodSupply) effects.push({ resource: 'food', amount: turn.foodSupply, when: 'turn', good: turn.foodSupply > 0 });
  if (turn?.radiationExposure) effects.push({ resource: 'radiation', amount: turn.radiationExposure, when: 'turn', good: turn.radiationExposure < 0 });
  if (module.researchBonus) effects.push({ resource: 'science', amount: module.researchBonus, when: 'research', good: true });
  const cost = module.operationalCost;
  if (cost?.energy) effects.push({ resource: 'energy', amount: cost.energy, when: 'turn', good: false });
  return effects;
}

/** El recurso principal que mejora el módulo (para el diálogo corto de Alba/Nico). */
export function mainBenefitResource(moduleId: ModuleId): EffectResource | null {
  return getModuleEffects(moduleId).find((effect) => effect.good)?.resource ?? null;
}
