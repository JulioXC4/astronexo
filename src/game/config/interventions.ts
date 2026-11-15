import type {
  AlertKind,
  InterventionAction,
  InterventionId,
  ResourceDelta,
} from '../types';

export interface InterventionConfig {
  readonly id: InterventionId;
  readonly action: InterventionAction;
  readonly label: string;
  readonly objective: string;
  readonly instructions: string;
  readonly resolves: readonly AlertKind[];
  readonly requiresAlert: boolean;
  readonly cost: ResourceDelta;
  readonly effect: ResourceDelta;
  readonly choiceCosts?: Readonly<Partial<Record<'REGOLITH_SHIELDING' | 'SUPPLY_SHIELDING', ResourceDelta>>>;
  readonly benefit: string;
}

export const INTERVENTIONS: readonly InterventionConfig[] = [
  {
    id: 'G1', action: 'REPAIR_PANELS', label: 'Reparar paneles',
    objective: 'Recupera el arreglo solar antes de que baje la energía.',
    instructions: 'Repara solo las conexiones necesarias y gíralas hasta cerrar el circuito.',
    resolves: ['PANEL_DAMAGE'], requiresAlert: true,
    cost: { energy: -5 }, effect: { solarEfficiency: 20 },
    benefit: 'Repara el panel y recupera eficiencia solar.',
  },
  {
    id: 'G2', action: 'CLEAN_PANELS', label: 'Limpiar paneles',
    objective: 'Retira el polvo para recuperar generación solar.',
    instructions: 'Usa dos aplicaciones sobre las celdas que limpien mayor superficie.',
    resolves: ['DUSTY_PANELS', 'MARS_DUST_STORM', 'ENERGY_SHORTAGE'], requiresAlert: true,
    cost: { energy: -3 }, effect: { solarEfficiency: 30 },
    benefit: 'Recupera 30 puntos de eficiencia solar.',
  },
  {
    id: 'G3', action: 'PATCH_OXYGEN_LEAK', label: 'Parchar fuga',
    objective: 'Sella la fuga del circuito de oxígeno.',
    instructions: 'Aísla el compartimento con fuga y parchea sus dos daños.',
    resolves: ['OXYGEN_LEAK'], requiresAlert: true,
    cost: { energy: -4 }, effect: { oxygen: 4 },
    benefit: 'Detiene la fuga y recupera 4 puntos de oxígeno.',
  },
  {
    id: 'G4', action: 'RECYCLE_OXYGEN', label: 'Reciclar oxígeno',
    objective: 'Activa el ciclo de recuperación de la base.',
    instructions: 'Conecta agua y electricidad al electrolizador, y su salida al tanque.',
    resolves: [], requiresAlert: false,
    cost: { energy: -6 }, effect: { oxygen: 20 },
    benefit: 'Recupera 20 puntos de oxígeno.',
  },
  {
    id: 'G5', action: 'REINFORCE_SHELTER', label: 'Reforzar refugio',
    objective: 'Añade regolito para mejorar la preparación protectora.',
    instructions: 'Elige un material y protege tres zonas, incluidas las dos prioritarias.',
    resolves: ['RADIATION_RISK'], requiresAlert: false,
    cost: { energy: -8 }, effect: { shield: 20 },
    choiceCosts: {
      REGOLITH_SHIELDING: { energy: -8 },
      SUPPLY_SHIELDING: { energy: -5, foodSupply: -8 },
    },
    benefit: 'Mejora 20 puntos de Escudo sin borrar exposición acumulada.',
  },
  {
    id: 'G6', action: 'RUN_RESEARCH', label: 'Hacer ciencia',
    objective: 'Procesa una muestra para avanzar el objetivo científico.',
    instructions: 'Observa y clasifica dos muestras con el instrumento adecuado.',
    resolves: ['SCIENCE_OPPORTUNITY'], requiresAlert: false,
    cost: { energy: -10, oxygen: -4 }, effect: { scienceProgress: 25 },
    benefit: 'Añade 25 puntos de progreso científico.',
  },
  {
    id: 'G7', action: 'MANAGE_GREENHOUSE', label: 'Gestionar invernadero',
    objective: 'Decide si mantienes o suspendes temporalmente los cultivos.',
    instructions: 'Distribuye dos luces y luego decide mantener o suspender los cultivos.',
    resolves: ['GREENHOUSE_STRAIN'], requiresAlert: false,
    cost: { energy: -3 }, effect: { foodSupply: 16 },
    benefit: 'Mantener recupera alimento; suspender ahorra energía pero reduce reservas.',
  },
  {
    id: 'G8', action: 'CONSULT_EARTH', label: 'Consultar a Tierra',
    objective: 'Solicita una recomendación simulada al equipo terrestre.',
    instructions: 'Elige un problema y adjunta dos datos pertinentes antes de transmitir.',
    resolves: ['COMMUNICATION_WINDOW'], requiresAlert: false,
    cost: {}, effect: {},
    benefit: 'Luna responde ahora; Marte responde al inicio del siguiente turno.',
  },
] as const;

export function getIntervention(action: InterventionAction) {
  return INTERVENTIONS.find((intervention) => intervention.action === action);
}
