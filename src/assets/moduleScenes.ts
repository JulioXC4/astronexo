import type { Destination, ModuleId } from '../game';

/** Existing lunar interiors remain the canonical Moon camera feeds. */
export const lunarModuleScenes: Record<ModuleId, string> = {
  SOLAR_STORAGE: '/assets/pixel-art/lunar-energy-module.webp',
  REINFORCED_LIFE_SUPPORT: '/assets/pixel-art/lunar-life-support-room.webp',
  STORM_SHELTER: '/assets/pixel-art/airlock-refuge.webp',
  GREENHOUSE: '/assets/pixel-art/lunar-greenhouse-lab.webp',
  SCIENCE_LAB: '/assets/pixel-art/lunar-laboratory.webp',
};

export const marsModuleScenes: Record<ModuleId, string> = {
  SOLAR_STORAGE: '/assets/space/cameras/mars-panels-batteries.webp',
  REINFORCED_LIFE_SUPPORT: '/assets/space/cameras/mars-life-support.webp',
  STORM_SHELTER: '/assets/space/cameras/mars-storm-shelter.webp',
  GREENHOUSE: '/assets/space/cameras/mars-greenhouse.webp',
  SCIENCE_LAB: '/assets/space/cameras/mars-science-laboratory.webp',
};

export const moduleScenes: Record<Destination, Record<ModuleId, string>> = {
  MOON: lunarModuleScenes,
  MARS: marsModuleScenes,
};

export const exteriorModuleScenes = {
  MOON_DAY: '/assets/space/cameras/lunar-exterior-day.webp',
  MOON_NIGHT: '/assets/space/cameras/lunar-exterior-night.webp',
  MARS_DUST_STORM: '/assets/space/cameras/mars-exterior-dust-storm.webp',
} as const;

export function getModuleScene(destination: Destination, moduleId: ModuleId): string {
  return moduleScenes[destination][moduleId];
}
