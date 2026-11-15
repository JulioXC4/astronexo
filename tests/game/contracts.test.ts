import { describe, expect, it } from 'vitest';
import {
  EARTH_MISSION_IDS,
  createMission,
  isValidGameSetup,
  isValidSelectedTools,
} from '../../src/game';
import { isValidBackpack } from '../../src/game/contracts';
import type { GameSetup } from '../../src/game';

const setup: GameSetup = {
  mode: 'SOLO',
  city: 'TROMSO',
  destination: 'MOON',
  completedEarthMissions: ['M1', 'M3', 'M5'],
  selectedTools: ['SPARE_PARTS_KIT', 'GROW_TRAY', 'THERMAL_INSULATION'],
  selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
  scenarioId: 'H2_CONTRACT_TEST',
  difficulty: 'CALM',
};

describe('contrato público v3.0', () => {
  it('publica las cinco misiones terrestres y valida tres completadas', () => {
    expect(EARTH_MISSION_IDS).toEqual(['M1', 'M2', 'M3', 'M4', 'M5']);
    expect(isValidGameSetup(setup)).toBe(true);
    expect(isValidGameSetup({ ...setup, completedEarthMissions: ['M1', 'M2'] })).toBe(false);
  });

  it('valida tres herramientas distintas y conserva el adaptador legacy', () => {
    expect(isValidSelectedTools(setup.selectedTools)).toBe(true);
    expect(isValidBackpack(setup.selectedTools)).toBe(true);
    expect(isValidSelectedTools(['LIFE_SUPPORT', 'LIFE_SUPPORT', 'CROP_KIT'])).toBe(false);
  });

  it('rechaza herramientas ajenas a las misiones, M5 incorrecta y módulos duplicados', () => {
    expect(isValidGameSetup({
      ...setup,
      selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'THERMAL_INSULATION'],
    })).toBe(false);
    expect(isValidGameSetup({
      ...setup,
      selectedTools: ['SPARE_PARTS_KIT', 'GROW_TRAY', 'WATER_RECYCLER'],
    })).toBe(false);
    expect(isValidGameSetup({
      ...setup,
      selectedModules: ['SOLAR_STORAGE', 'SOLAR_STORAGE', 'SCIENCE_LAB'],
    })).toBe(false);
    expect(() => createMission({
      ...setup,
      selectedModules: ['SOLAR_STORAGE', 'SOLAR_STORAGE', 'SCIENCE_LAB'],
    })).toThrow(/GameSetup inválido/);
    expect(isValidGameSetup({ ...setup, destination: 'VENUS' } as GameSetup)).toBe(false);
    expect(isValidGameSetup({ ...setup, mode: 'ONLINE' } as GameSetup)).toBe(false);
  });
});
