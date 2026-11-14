import type { AlertKind, Destination, ResourceDelta } from '../types';

export interface EventConfig {
  readonly kind: AlertKind;
  readonly destinations: readonly Destination[];
  readonly title: string;
  readonly description: string;
  readonly consequencePreview: string;
  readonly baseConsequence: ResourceDelta;
  readonly escalation: ResourceDelta;
}

export const EVENT_CONFIG: Readonly<Record<AlertKind, EventConfig>> = {
  PANEL_DAMAGE: {
    kind: 'PANEL_DAMAGE', destinations: ['MOON', 'MARS'],
    title: 'Panel solar dañado', description: 'Una unión del arreglo solar perdió contacto.',
    consequencePreview: 'Reduce energía y empeora si continúa sin reparación.',
    baseConsequence: { energy: -5, solarEfficiency: -8 }, escalation: { energy: -2, solarEfficiency: -3 },
  },
  DUSTY_PANELS: {
    kind: 'DUSTY_PANELS', destinations: ['MOON', 'MARS'],
    title: 'Paneles cubiertos de polvo', description: 'Polvo simulado reduce la superficie útil del arreglo.',
    consequencePreview: 'Disminuye la eficiencia solar mientras no se limpie.',
    baseConsequence: { solarEfficiency: -14 }, escalation: { solarEfficiency: -5 },
  },
  OXYGEN_LEAK: {
    kind: 'OXYGEN_LEAK', destinations: ['MOON', 'MARS'],
    title: 'Fuga de oxígeno', description: 'El circuito de soporte vital registra una fuga pequeña.',
    consequencePreview: 'La pérdida de oxígeno aumenta cada turno.',
    baseConsequence: { oxygen: -8 }, escalation: { oxygen: -3 },
  },
  ENERGY_SHORTAGE: {
    kind: 'ENERGY_SHORTAGE', destinations: ['MOON', 'MARS'],
    title: 'Reserva de energía baja', description: 'La demanda operativa supera la generación disponible.',
    consequencePreview: 'Consume reservas adicionales si no se recupera generación.',
    baseConsequence: { energy: -7 }, escalation: { energy: -2 },
  },
  RADIATION_RISK: {
    kind: 'RADIATION_RISK', destinations: ['MOON', 'MARS'],
    title: 'Riesgo solar simulado', description: 'El protocolo educativo recomienda reforzar el refugio.',
    consequencePreview: 'Aumenta exposición acumulada; el Escudo no se consume como masa.',
    baseConsequence: { radiationExposure: 8 }, escalation: { radiationExposure: 4 },
  },
  GREENHOUSE_STRAIN: {
    kind: 'GREENHOUSE_STRAIN', destinations: ['MOON', 'MARS'],
    title: 'Invernadero exigido', description: 'Los cultivos necesitan una decisión de energía y alimento.',
    consequencePreview: 'Reduce alimento y energía mientras no se gestione.',
    baseConsequence: { foodSupply: -8, energy: -2 }, escalation: { foodSupply: -3 },
  },
  SCIENCE_OPPORTUNITY: {
    kind: 'SCIENCE_OPPORTUNITY', destinations: ['MOON', 'MARS'],
    title: 'Oportunidad científica', description: 'Hay una muestra simulada lista para investigación.',
    consequencePreview: 'La oportunidad ocupa capacidad operativa hasta ser atendida.',
    baseConsequence: {}, escalation: {},
  },
  MARS_DUST_STORM: {
    kind: 'MARS_DUST_STORM', destinations: ['MARS'],
    title: 'Tormenta de polvo marciana', description: 'Un frente de polvo simulado reduce la luz disponible.',
    consequencePreview: 'Reduce energía y eficiencia solar de forma creciente.',
    baseConsequence: { energy: -4, solarEfficiency: -18 }, escalation: { energy: -2, solarEfficiency: -6 },
  },
  COMMUNICATION_WINDOW: {
    kind: 'COMMUNICATION_WINDOW', destinations: ['MOON', 'MARS'],
    title: 'Ventana de comunicación', description: 'La Tierra está disponible para una consulta educativa.',
    consequencePreview: 'Si se ignora, la ventana permanece pero ocupa una alerta activa.',
    baseConsequence: {}, escalation: {},
  },
};
