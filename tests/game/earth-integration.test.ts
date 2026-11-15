import { describe, expect, it } from 'vitest';
import { buildEarthV3Setup } from '../../src/features/earth/earthToSpace';
import { getMissionsForCity } from '../../src/data/missions';
import { createMission, getMissionResult, isValidGameSetup, isValidPreBuildGameSetup, advanceTurn, applyAction } from '../../src/game';
import type { City, Destination, GameSetup } from '../../src/game';

const modules = ['SOLAR_STORAGE', 'REINFORCED_LIFE_SUPPORT', 'STORM_SHELTER'] as const;

function setup(city: City, destination: Destination, indexes: readonly number[]) {
  const missions = getMissionsForCity(city);
  return buildEarthV3Setup({
    city, destination, avatarId: 'ALBA', fictionalName: 'Cóndor',
    completedMissions: indexes.map((index) => missions[index].id),
    earnedTools: indexes.map((index) => missions[index].targetTool),
  });
}

describe('Integración Tierra → SoloSpaceGame', () => {
  it('mapea las cinco instalaciones de cada ciudad a M1–M5 sin cambiar sus herramientas', () => {
    for (const city of ['AREQUIPA', 'TROMSO'] as const) {
      for (let a = 0; a < 3; a++) for (let b = a + 1; b < 4; b++) for (let c = b + 1; c < 5; c++) {
        const result = setup(city, 'MOON', [a, b, c]);
        expect(result.completedEarthMissions).toEqual([a, b, c].map((index) => `M${index + 1}`));
        expect(isValidPreBuildGameSetup(result)).toBe(true);
        expect(isValidGameSetup({ ...result, selectedModules: modules })).toBe(true);
      }
    }
  });

  it('conserva dos recompensas iguales y acumula sus efectos iniciales', () => {
    const result = setup('AREQUIPA', 'MOON', [1, 2, 3]);
    expect(result.selectedTools).toEqual(['LIFE_SUPPORT', 'SHELTER_KIT', 'LIFE_SUPPORT']);
    const mission = createMission({ ...result, selectedModules: modules });
    expect(mission.oxygen).toBeGreaterThan(createMission({ ...setup('AREQUIPA', 'MOON', [0, 1, 2]), selectedModules: modules }).oxygen);
    expect(mission.setup.earthProfile?.trainings).toHaveLength(3);
  });

  it('rechaza herramientas regaladas, misiones repetidas y una ciudad incompatible', () => {
    const result = setup('TROMSO', 'MARS', [0, 1, 4]);
    expect(isValidPreBuildGameSetup(result)).toBe(true);
    expect(isValidPreBuildGameSetup({ ...result, selectedTools: ['FOLDING_PANELS', 'CROP_KIT', 'SHELTER_KIT'] })).toBe(false);
    expect(() => buildEarthV3Setup({
      city: 'TROMSO', destination: 'MARS', avatarId: 'ALBA', fictionalName: 'Cóndor',
      completedMissions: ['VEGGIE_LAB', 'VEGGIE_LAB', 'SOLAR_WATCH'],
      earnedTools: ['CROP_KIT', 'CROP_KIT', 'SHELTER_KIT'],
    })).toThrow();
  });

  it('conserva el escenario y el perfil hasta el informe final', () => {
    const initial: GameSetup = { ...setup('AREQUIPA', 'MOON', [0, 2, 4]), selectedModules: modules };
    let state = createMission(initial);
    for (let turn = 0; turn < 5 && state.outcome === 'IN_PROGRESS'; turn++) {
      state = advanceTurn(applyAction(state, { type: 'SKIP_INTERVENTION' }));
    }
    const report = getMissionResult(state);
    expect(report).not.toBeNull();
    expect(report?.outcome).toBe('INTERRUPTED');
    expect(report?.finalState.setup.scenarioId).toBe(initial.scenarioId);
    expect(report?.finalState.setup.earthProfile?.fictionalName).toBe('Cóndor');
    expect(report?.configurationConsequences.some((line) => line.includes('Costo terrestre:'))).toBe(true);
  });

  it('puede completar los cinco turnos con una preparación terrestre v3', () => {
    let state = createMission({
      ...setup('AREQUIPA', 'MOON', [0, 2, 3]),
      selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
    });
    while (state.outcome === 'IN_PROGRESS') {
      const panel = state.activeAlerts.find((alert) => alert.kind === 'PANEL_DAMAGE');
      const dust = state.activeAlerts.find((alert) => alert.kind === 'DUSTY_PANELS');
      const action = state.scienceProgress < 50 && state.turn >= 2
        ? { type: 'RUN_RESEARCH' as const }
        : panel ? { type: 'REPAIR_PANELS' as const, targetId: panel.id }
          : dust ? { type: 'CLEAN_PANELS' as const, targetId: dust.id }
            : { type: 'RECYCLE_OXYGEN' as const };
      state = advanceTurn(applyAction(state, action));
    }
    expect(state.completedTurns).toBe(5);
    expect(state.outcome).toBe('COMPLETED');
  });
});
