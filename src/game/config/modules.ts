import type {
  AlertKind,
  MissionState,
  ModuleId,
  ModuleOperationRecord,
  ResourceDelta,
} from '../types';

export interface ModuleDefinition {
  readonly id: ModuleId;
  readonly name: string;
  readonly description: string;
  readonly benefit: string;
  readonly costLabel: string;
  readonly rule: string;
  readonly icon: string;
  readonly initialEffect?: ResourceDelta;
  readonly operationalCost?: ResourceDelta;
  readonly turnBenefit?: ResourceDelta;
  readonly requiresActiveGreenhouse?: boolean;
  readonly researchBonus?: number;
  readonly solarGenerationBonusRatio?: number;
  readonly affectedBy: readonly AlertKind[];
}

export const MODULE_CATALOG: readonly ModuleDefinition[] = [
  {
    id: 'SOLAR_STORAGE', name: 'Paneles y baterías', icon: '☀',
    description: 'Amplía la reserva y aprovecha mejor cada ciclo solar.',
    benefit: '+12 de reserva inicial y +30% de la generación solar efectiva.', costLabel: 'Sin costo operativo',
    rule: 'La batería amplía la reserva; el aporte por turno depende de la luz y eficiencia disponibles.',
    initialEffect: { energy: 12 }, solarGenerationBonusRatio: 0.3,
    affectedBy: ['PANEL_DAMAGE', 'DUSTY_PANELS', 'MARS_DUST_STORM'],
  },
  {
    id: 'REINFORCED_LIFE_SUPPORT', name: 'Soporte vital reforzado', icon: '◉',
    description: 'Recupera parte del oxígeno usado por la tripulación.',
    benefit: '+1 Oxígeno por turno.', costLabel: '1 Energía por turno',
    rule: 'Compensa una unidad del consumo operativo de oxígeno una vez por turno.',
    operationalCost: { energy: -1 }, turnBenefit: { oxygen: 1 },
    affectedBy: ['OXYGEN_LEAK', 'ENERGY_SHORTAGE'],
  },
  {
    id: 'STORM_SHELTER', name: 'Refugio de tormentas', icon: '◈',
    description: 'Reduce la exposición nueva sin borrar la ya acumulada.',
    benefit: 'Evita hasta 2 de exposición por turno.', costLabel: 'Sin costo operativo',
    rule: 'Resta exposición solo al incremento del turno; nunca cura exposición previa.',
    turnBenefit: { radiationExposure: -2 },
    affectedBy: ['RADIATION_RISK'],
  },
  {
    id: 'GREENHOUSE', name: 'Invernadero', icon: '☘',
    description: 'Favorece el suministro cuando los cultivos están activos.',
    benefit: '+3 Alimentos por turno activo.', costLabel: '1 Energía por turno activo',
    rule: 'Costo y producción se aplican juntos; al suspender no se aplica ninguno.',
    operationalCost: { energy: -1 }, turnBenefit: { foodSupply: 3 },
    requiresActiveGreenhouse: true,
    affectedBy: ['GREENHOUSE_STRAIN', 'ENERGY_SHORTAGE'],
  },
  {
    id: 'SCIENCE_LAB', name: 'Laboratorio', icon: '⚗',
    description: 'Procesa muestras con más eficiencia durante la guardia.',
    benefit: '+10 Ciencia al investigar.', costLabel: '2 Energía por turno',
    rule: 'Consume energía al operar y mejora únicamente acciones reales de investigación.',
    operationalCost: { energy: -2 }, researchBonus: 10,
    affectedBy: ['SCIENCE_OPPORTUNITY', 'ENERGY_SHORTAGE'],
  },
] as const;

export function isValidModuleSelection(modules: readonly ModuleId[]) {
  const ids = new Set(MODULE_CATALOG.map((module) => module.id));
  return modules.length === 3
    && new Set(modules).size === 3
    && modules.every((module) => ids.has(module));
}

export function getModuleDefinition(id: ModuleId) {
  return MODULE_CATALOG.find((module) => module.id === id);
}

export function getInitialModuleDelta(modules: readonly ModuleId[]): ResourceDelta {
  return modules.reduce<ResourceDelta>((total, id) => {
    const delta = getModuleDefinition(id)?.initialEffect;
    return {
      energy: (total.energy ?? 0) + (delta?.energy ?? 0),
      oxygen: (total.oxygen ?? 0) + (delta?.oxygen ?? 0),
      shield: (total.shield ?? 0) + (delta?.shield ?? 0),
      foodSupply: (total.foodSupply ?? 0) + (delta?.foodSupply ?? 0),
      radiationExposure: (total.radiationExposure ?? 0) + (delta?.radiationExposure ?? 0),
      scienceProgress: (total.scienceProgress ?? 0) + (delta?.scienceProgress ?? 0),
      solarEfficiency: (total.solarEfficiency ?? 0) + (delta?.solarEfficiency ?? 0),
    };
  }, {});
}

export function getInitialModuleOperations(modules: readonly ModuleId[]): readonly ModuleOperationRecord[] {
  return modules.flatMap((id) => {
    const module = getModuleDefinition(id);
    if (!module?.initialEffect || Object.values(module.initialEffect).every((value) => !value)) return [];
    return [{
      turn: 0,
      moduleId: id,
      phase: 'SETUP' as const,
      summary: `${module.name}: aplicó su beneficio inicial.`,
      cost: {},
      benefit: module.initialEffect,
    }];
  });
}

export function getModuleTurnOperations(
  state: Pick<MissionState, 'turn' | 'selectedModules' | 'greenhouseActive'>,
  radiationIncrease: number,
  solarGeneration: number,
): readonly ModuleOperationRecord[] {
  return state.selectedModules.flatMap((id) => {
    const module = getModuleDefinition(id);
    if (!module || (module.requiresActiveGreenhouse && !state.greenhouseActive)) return [];
    const benefit = id === 'STORM_SHELTER'
      ? { radiationExposure: -Math.min(radiationIncrease, 2) }
      : id === 'SOLAR_STORAGE'
        ? { energy: Math.round(solarGeneration * (module.solarGenerationBonusRatio ?? 0)) }
        : (module.turnBenefit ?? {});
    if (!module.operationalCost && Object.keys(benefit).length === 0) return [];
    return [{
      turn: state.turn,
      moduleId: id,
      phase: 'TURN' as const,
      summary: `${module.name}: ${module.benefit}`,
      cost: module.operationalCost ?? {},
      benefit,
    }];
  });
}

export function getModuleWarnings(state: Pick<MissionState, 'selectedModules' | 'activeAlerts'>) {
  const activeKinds = new Set(state.activeAlerts.map((alert) => alert.kind));
  return state.selectedModules.filter((id) =>
    getModuleDefinition(id)?.affectedBy.some((kind) => activeKinds.has(kind)));
}
