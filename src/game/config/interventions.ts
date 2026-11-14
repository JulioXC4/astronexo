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
  readonly benefit: string;
}

export const INTERVENTIONS: readonly InterventionConfig[] = [
  {
    id: 'G1', action: 'REPAIR_PANELS', label: 'Reparar paneles',
    objective: 'Recupera el arreglo solar antes de que baje la energía.',
    instructions: 'Arrastra la celda al panel o usa la alternativa accesible.',
    resolves: ['PANEL_DAMAGE'], requiresAlert: true,
    cost: { energy: -5 }, effect: { solarEfficiency: 20 },
    benefit: 'Repara el panel y recupera eficiencia solar.',
  },
  {
    id: 'G2', action: 'CLEAN_PANELS', label: 'Limpiar paneles',
    objective: 'Retira el polvo para recuperar generación solar.',
    instructions: 'Desliza el control hasta completar la limpieza.',
    resolves: ['DUSTY_PANELS', 'MARS_DUST_STORM', 'ENERGY_SHORTAGE'], requiresAlert: true,
    cost: { energy: -3 }, effect: { solarEfficiency: 30 },
    benefit: 'Recupera 30 puntos de eficiencia solar.',
  },
  {
    id: 'G3', action: 'PATCH_OXYGEN_LEAK', label: 'Parchar fuga',
    objective: 'Sella la fuga del circuito de oxígeno.',
    instructions: 'Toca los tres puntos de fuga o usa la alternativa accesible.',
    resolves: ['OXYGEN_LEAK'], requiresAlert: true,
    cost: { energy: -4 }, effect: { oxygen: 4 },
    benefit: 'Detiene la fuga y recupera 4 puntos de oxígeno.',
  },
  {
    id: 'G4', action: 'RECYCLE_OXYGEN', label: 'Reciclar oxígeno',
    objective: 'Activa el ciclo de recuperación de la base.',
    instructions: 'Mantén presionado el control o usa la alternativa accesible.',
    resolves: [], requiresAlert: false,
    cost: { energy: -6 }, effect: { oxygen: 20 },
    benefit: 'Recupera 20 puntos de oxígeno.',
  },
  {
    id: 'G5', action: 'REINFORCE_SHELTER', label: 'Reforzar refugio',
    objective: 'Añade regolito para mejorar la preparación protectora.',
    instructions: 'Arrastra el regolito al refugio o usa la alternativa accesible.',
    resolves: ['RADIATION_RISK'], requiresAlert: false,
    cost: { energy: -8 }, effect: { shield: 20 },
    benefit: 'Mejora 20 puntos de Escudo sin borrar exposición acumulada.',
  },
  {
    id: 'G6', action: 'RUN_RESEARCH', label: 'Hacer ciencia',
    objective: 'Procesa una muestra para avanzar el objetivo científico.',
    instructions: 'Mantén presionado el analizador o usa la alternativa accesible.',
    resolves: ['SCIENCE_OPPORTUNITY'], requiresAlert: false,
    cost: { energy: -10, oxygen: -4 }, effect: { scienceProgress: 25 },
    benefit: 'Añade 25 puntos de progreso científico.',
  },
  {
    id: 'G7', action: 'MANAGE_GREENHOUSE', label: 'Gestionar invernadero',
    objective: 'Decide si mantienes o suspendes temporalmente los cultivos.',
    instructions: 'Elige mantener para obtener alimento o suspender para ahorrar energía.',
    resolves: ['GREENHOUSE_STRAIN'], requiresAlert: false,
    cost: { energy: -3 }, effect: { foodSupply: 16 },
    benefit: 'Mantener recupera alimento; suspender ahorra energía pero reduce reservas.',
  },
  {
    id: 'G8', action: 'CONSULT_EARTH', label: 'Consultar a Tierra',
    objective: 'Solicita una recomendación simulada al equipo terrestre.',
    instructions: 'Selecciona una consulta. Solo se permite una por misión.',
    resolves: ['COMMUNICATION_WINDOW'], requiresAlert: false,
    cost: {}, effect: {},
    benefit: 'Luna responde ahora; Marte responde al inicio del siguiente turno.',
  },
] as const;

export function getIntervention(action: InterventionAction) {
  return INTERVENTIONS.find((intervention) => intervention.action === action);
}
