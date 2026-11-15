import type {
  City,
  EarthMissionId,
  GameSetup,
  SelectedTools,
  ToolId,
} from '../types';
import { isValidModuleSelection, MODULE_CATALOG } from './modules';

export interface ToolDefinition {
  readonly id: ToolId;
  readonly label: string;
}

export const EARTH_MISSION_IDS = ['M1', 'M2', 'M3', 'M4', 'M5'] as const;

export const TOOL_CATALOG = [
  { id: 'FOLDING_PANELS', label: 'Paneles plegables' },
  { id: 'LIFE_SUPPORT', label: 'Kit de soporte vital' },
  { id: 'SHELTER_KIT', label: 'Kit de refugio' },
  { id: 'CROP_KIT', label: 'Kit de cultivos' },
] as const satisfies readonly ToolDefinition[];

/** Catálogo v1.1 que Software 2 debe usar al migrar el flujo terrestre. */
export const H2_TOOL_CATALOG: readonly ToolDefinition[] = [
  { id: 'SPARE_PARTS_KIT', label: 'Kit de repuestos' },
  { id: 'EARLY_WARNING', label: 'Alerta temprana' },
  { id: 'GROW_TRAY', label: 'Bandeja de cultivo' },
  { id: 'EXTRA_BATTERY', label: 'Batería adicional' },
  { id: 'WATER_RECYCLER', label: 'Reciclador de agua (Arequipa)' },
  { id: 'THERMAL_INSULATION', label: 'Aislamiento térmico (Tromsø)' },
] as const;

/** Parámetros educativos configurables; no representan mediciones NASA. */
export const H2_TOOL_RULES = {
  SPARE_PARTS_KIT: {
    benefit: 'Una reparación de paneles sin costo de Energía.',
    repairEnergyCost: 0,
    charges: 1,
  },
  EARLY_WARNING: {
    benefit: 'Anticipa la primera alerta del siguiente turno sin anular consecuencias.',
    turnsAhead: 1,
  },
  GROW_TRAY: {
    benefit: 'Añade 4 Alimentos al gestionar cultivos en modo mantener.',
    greenhouseFoodBonus: 4,
  },
  EXTRA_BATTERY: {
    benefit: 'Añade 18 Energía a la reserva inicial.',
    initialEnergy: 18,
  },
  WATER_RECYCLER: {
    benefit: 'Mejora soporte vital y recuperación de oxígeno.',
    initialOxygen: 8,
    initialFood: 6,
    consumptionSaving: 1,
    recycleOxygenBonus: 5,
  },
  THERMAL_INSULATION: {
    benefit: 'Ahorra 2 Energía del consumo térmico por turno.',
    energySaving: 2,
  },
} as const;

export function getToolBenefit(toolId: ToolId) {
  const earthBenefits: Partial<Record<ToolId, string>> = {
    FOLDING_PANELS: 'Mejora la generación solar en un 20% por kit y aporta reserva inicial.',
    LIFE_SUPPORT: 'Aporta oxígeno inicial, reduce consumo y mejora el sellado de fugas; los kits se acumulan.',
    SHELTER_KIT: 'Aporta escudo inicial y reduce la exposición nueva durante la guardia.',
    CROP_KIT: 'Aporta alimento inicial y aumenta la cosecha al gestionar cultivos.',
  };
  return toolId in H2_TOOL_RULES
    ? H2_TOOL_RULES[toolId as keyof typeof H2_TOOL_RULES].benefit
    : earthBenefits[toolId] ?? ALL_TOOL_CATALOG.find((tool) => tool.id === toolId)?.label ?? toolId;
}

export const ALL_TOOL_CATALOG: readonly ToolDefinition[] = [
  ...H2_TOOL_CATALOG,
  ...TOOL_CATALOG,
];

export const MISSION_TOOL: Readonly<Record<Exclude<EarthMissionId, 'M5'>, ToolId>> = {
  M1: 'SPARE_PARTS_KIT',
  M2: 'EARLY_WARNING',
  M3: 'GROW_TRAY',
  M4: 'EXTRA_BATTERY',
};

export const CITY_M5_TOOL: Readonly<Record<City, ToolId>> = {
  AREQUIPA: 'WATER_RECYCLER',
  TROMSO: 'THERMAL_INSULATION',
};

/** Posiciones de las cinco instalaciones del mapa v3, en el orden visible por ciudad. */
export const EARTH_V3_MISSION_TOOLS: Readonly<Record<City, readonly ToolId[]>> = {
  AREQUIPA: ['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT', 'LIFE_SUPPORT', 'CROP_KIT'],
  TROMSO: ['FOLDING_PANELS', 'CROP_KIT', 'SHELTER_KIT', 'LIFE_SUPPORT', 'CROP_KIT'],
};

const VALID_MODES = ['SOLO', 'LOCAL_COOP'] as const;
const VALID_DESTINATIONS = ['MOON', 'MARS'] as const;
const VALID_CITIES = ['AREQUIPA', 'TROMSO'] as const;
const VALID_DIFFICULTIES = ['CALM', 'ACTIVE', 'STORMY'] as const;

export const LEGACY_TOOL_IDS = [
  'FOLDING_PANELS',
  'LIFE_SUPPORT',
  'SHELTER_KIT',
  'CROP_KIT',
] as const;

export const LEGACY_DEMO_SCENARIO_ID = 'LEGACY_H1_DEMO';

export function isValidSelectedTools(tools: readonly ToolId[]): tools is SelectedTools {
  const catalogIds = new Set<ToolId>(ALL_TOOL_CATALOG.map((tool) => tool.id));
  return tools.length === 3
    && new Set(tools).size === 3
    && tools.every((tool) => catalogIds.has(tool));
}

export function isValidGameSetup(setup: GameSetup) {
  const completed = new Set(setup.completedEarthMissions);
  const earthV3 = setup.scenarioId.startsWith('EARTH_V3_');
  const expectedTools = setup.completedEarthMissions.map((mission) => earthV3
    ? EARTH_V3_MISSION_TOOLS[setup.city]?.[EARTH_MISSION_IDS.indexOf(mission)]
    : mission === 'M5' ? CITY_M5_TOOL[setup.city] : MISSION_TOOL[mission]);
  const expectedCounts = new Map<ToolId, number>();
  for (const tool of expectedTools) {
    if (tool) expectedCounts.set(tool, (expectedCounts.get(tool) ?? 0) + 1);
  }
  const actualCounts = new Map<ToolId, number>();
  for (const tool of setup.selectedTools) actualCounts.set(tool, (actualCounts.get(tool) ?? 0) + 1);
  const outcomes = setup.earthProfile?.outcomes;
  const validOutcomes = !outcomes || (earthV3
    && outcomes.length === 3
    && outcomes.every((outcome, index) => outcome.missionId === setup.earthProfile?.trainings[index]?.id
      && outcome.tool === expectedTools[index]
      && Number.isInteger(outcome.cost) && outcome.cost >= 1 && outcome.cost <= 3
      && ['energy', 'oxygen', 'foodSupply'].includes(outcome.resource)
      && Object.keys(outcome.spaceDelta).length === 1
      && outcome.spaceDelta[outcome.resource] === -outcome.cost));
  return VALID_MODES.includes(setup.mode)
    && validOutcomes
    && VALID_CITIES.includes(setup.city)
    && VALID_DESTINATIONS.includes(setup.destination)
    && VALID_DIFFICULTIES.includes(setup.difficulty)
    && setup.scenarioId.trim().length > 0
    && (earthV3
      ? setup.selectedTools.length === 3 && setup.selectedTools.every((tool) => TOOL_CATALOG.some((item) => item.id === tool))
      : isValidSelectedTools(setup.selectedTools))
    && setup.completedEarthMissions.length === 3
    && completed.size === 3
    && setup.completedEarthMissions.every((mission) => EARTH_MISSION_IDS.includes(mission))
    && expectedCounts.size === actualCounts.size
    && [...expectedCounts].every(([tool, count]) => actualCounts.get(tool) === count)
    && isValidModuleSelection(setup.selectedModules);
}

/** Valida el contrato canónico anterior a P10 sin relajar `createMission()`. */
export function isValidPreBuildGameSetup(setup: GameSetup) {
  return isValidGameSetup({
    ...setup,
    selectedModules: MODULE_CATALOG.slice(0, 3).map((module) => module.id),
  });
}

export function isLegacyToolSelection(tools: readonly ToolId[]): tools is SelectedTools {
  return isValidSelectedTools(tools) && tools.every((tool) => LEGACY_TOOL_IDS.includes(
    tool as (typeof LEGACY_TOOL_IDS)[number],
  ));
}

export function isLegacyDemoSetup(setup: GameSetup) {
  return setup.scenarioId === LEGACY_DEMO_SCENARIO_ID
    && VALID_MODES.includes(setup.mode)
    && VALID_CITIES.includes(setup.city)
    && VALID_DESTINATIONS.includes(setup.destination)
    && VALID_DIFFICULTIES.includes(setup.difficulty)
    && isLegacyToolSelection(setup.selectedTools)
    && isValidModuleSelection(setup.selectedModules);
}
