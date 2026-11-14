import { describe, expect, it } from 'vitest';
import {
  EARTH_MISSION_IDS,
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
  selectedTools: ['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT'],
  selectedModules: [],
  scenarioId: 'H1_CONTRACT_TEST',
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
});
