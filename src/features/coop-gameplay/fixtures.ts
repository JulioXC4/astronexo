import type { GameSetup } from '../../game';
import { createLocalCoopConfig } from './coop.types';

export const COOP_DEMO_SETUP: GameSetup = {
  mode: 'LOCAL_COOP',
  city: 'AREQUIPA',
  destination: 'MOON',
  completedEarthMissions: ['M1', 'M4', 'M5'],
  selectedTools: ['SPARE_PARTS_KIT', 'EXTRA_BATTERY', 'WATER_RECYCLER'],
  selectedModules: ['SOLAR_STORAGE', 'GREENHOUSE', 'SCIENCE_LAB'],
  scenarioId: 'H4_LOCAL_COOP_DEMO',
  difficulty: 'CALM',
};

export const COOP_DEMO_GROUPS = {
  THREE: createLocalCoopConfig('Órbita Tres', ['Nova', 'Rayo', 'Luna']),
  FOUR: createLocalCoopConfig('Cuadrante', ['Nova', 'Rayo', 'Luna', 'Astro']),
  FIVE: createLocalCoopConfig('Constelación', ['Nova', 'Rayo', 'Luna', 'Astro', 'Brote']),
} as const;
