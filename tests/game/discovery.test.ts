import { describe, expect, it } from 'vitest';
import { STAR_SCIENCE, claimStar, createMission } from '../../src/game';
import type { GameSetup } from '../../src/game';

const setup: GameSetup = {
  mode: 'SOLO',
  city: 'AREQUIPA',
  destination: 'MOON',
  completedEarthMissions: ['M1', 'M2', 'M3'],
  selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY'],
  selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
  scenarioId: 'H2_REPRODUCIBLE',
  difficulty: 'CALM',
};

describe('estrella dorada escondida', () => {
  it('da 3 puntos de Ciencia y se cobra una sola vez por minijuego', () => {
    const start = createMission(setup);
    const once = claimStar(start, 'G3');
    expect(once.scienceProgress).toBe(start.scienceProgress + STAR_SCIENCE);
    expect(once.starsFound).toEqual(['G3']);

    // Volver a abrir el mismo minijuego no da puntos de nuevo.
    expect(claimStar(once, 'G3')).toBe(once);
    // Otro minijuego tiene su propia estrella.
    const two = claimStar(once, 'G6');
    expect(two.scienceProgress).toBe(start.scienceProgress + 2 * STAR_SCIENCE);
    expect(two.starsFound).toEqual(['G3', 'G6']);
  });

  it('las ocho estrellas suman 24 puntos, bajo la meta de 50: ayudan pero no ganan solas', () => {
    let state = createMission(setup);
    const base = state.scienceProgress;
    for (const id of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8']) state = claimStar(state, id);
    expect(state.scienceProgress - base).toBe(24);
    expect(state.scienceProgress).toBeLessThan(50);
  });
});
