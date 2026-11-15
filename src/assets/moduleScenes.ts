import type { ModuleId } from '../game';

/** Interiors made for the lunar base. Mars uses a distinct signal view until its own art is available. */
export const lunarModuleScenes: Record<ModuleId, string> = {
  SOLAR_STORAGE: '/assets/pixel-art/lunar-energy-module.png',
  REINFORCED_LIFE_SUPPORT: '/assets/pixel-art/lunar-life-support-room.png',
  STORM_SHELTER: '/assets/pixel-art/airlock-refuge.png',
  GREENHOUSE: '/assets/pixel-art/lunar-greenhouse-lab.png',
  SCIENCE_LAB: '/assets/pixel-art/lunar-laboratory.png',
};
