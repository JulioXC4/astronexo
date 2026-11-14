import type { GameSetup, SelectedTools, ToolId } from '../types';

export interface ToolDefinition {
  readonly id: ToolId;
  readonly label: string;
}

export const EARTH_MISSION_IDS = ['M1', 'M2', 'M3', 'M4', 'M5'] as const;

export const TOOL_CATALOG: readonly ToolDefinition[] = [
  { id: 'FOLDING_PANELS', label: 'Paneles plegables' },
  { id: 'LIFE_SUPPORT', label: 'Kit de soporte vital' },
  { id: 'SHELTER_KIT', label: 'Kit de refugio' },
  { id: 'CROP_KIT', label: 'Kit de cultivos' },
] as const;

/** Catálogo v1.1 que Software 2 debe usar al migrar el flujo terrestre. */
export const H2_TOOL_CATALOG: readonly ToolDefinition[] = [
  { id: 'SPARE_PARTS_KIT', label: 'Kit de repuestos' },
  { id: 'EARLY_WARNING', label: 'Alerta temprana' },
  { id: 'GROW_TRAY', label: 'Bandeja de cultivo' },
  { id: 'EXTRA_BATTERY', label: 'Batería adicional' },
  { id: 'WATER_RECYCLER', label: 'Reciclador de agua (Arequipa)' },
  { id: 'THERMAL_INSULATION', label: 'Aislamiento térmico (Tromsø)' },
] as const;

export const ALL_TOOL_CATALOG: readonly ToolDefinition[] = [
  ...H2_TOOL_CATALOG,
  ...TOOL_CATALOG,
];

export function isValidSelectedTools(tools: readonly ToolId[]): tools is SelectedTools {
  const catalogIds = new Set<ToolId>(ALL_TOOL_CATALOG.map((tool) => tool.id));
  return tools.length === 3
    && new Set(tools).size === 3
    && tools.every((tool) => catalogIds.has(tool));
}

export function isValidGameSetup(setup: GameSetup) {
  const completed = new Set(setup.completedEarthMissions);
  return isValidSelectedTools(setup.selectedTools)
    && setup.completedEarthMissions.length === 3
    && completed.size === 3
    && setup.completedEarthMissions.every((mission) => EARTH_MISSION_IDS.includes(mission));
}
