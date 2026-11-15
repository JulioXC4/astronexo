import { describe, expect, it } from 'vitest';
import { calculateTrainingCost, createTrainingOutcome } from '../../src/features/earth/trainingOutcome';
import { buildEarthV3Setup } from '../../src/features/earth/earthToSpace';
import { getMissionsForCity } from '../../src/data/missions';
import { createMission, getMissionResult, advanceTurn, applyAction, isValidGameSetup } from '../../src/game';
import type { City, Destination, TrainingOutcome } from '../../src/game';

const cases = [
  ['SOLAR_DETECTIVE', 45, 55], ['DARK_MONTHS_RESERVE', 55, 60],
  ['ALTITUDE_ACCLIMATIZATION', 42, 50], ['SOLAR_WATCH', 0, 1],
  ['ECLSS_TRAINING', 410, 430], ['VEGGIE_LAB', 72, 68],
  ['ARCTIC_GREENHOUSE', 50, 55],
] as const;

function configured(city: City, destination: Destination, costs: readonly number[]) {
  const missions = getMissionsForCity(city).slice(0, 3);
  const outcomes = missions.map((mission, index) => createTrainingOutcome(
    mission.id, `Decisión ${index + 1}`, mission.id === 'ALTITUDE_ACCLIMATIZATION' ? 'oxygen' : 'energy',
    costs[index], 'Costo de prueba del simulador.',
  ));
  const setup = buildEarthV3Setup({
    city, destination, avatarId: 'ALBA', fictionalName: 'Prueba',
    completedMissions: missions.map((mission) => mission.id),
    earnedTools: missions.map((mission) => mission.targetTool), trainingOutcomes: outcomes,
  });
  return { setup: { ...setup, selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'] as const }, outcomes };
}

describe('RF-69: decisiones terrestres con costo', () => {
  it.each(cases)('%s calcula dos costos a partir de decisiones distintas', (id, low, high) => {
    const inverted = id === 'SOLAR_DETECTIVE' || id === 'SOLAR_WATCH';
    expect(calculateTrainingCost(id, low)).toBe(inverted ? 2 : 1);
    expect(calculateTrainingCost(id, high)).toBe(inverted ? 1 : 2);
  });

  it.each([['AREQUIPA', 'MOON'], ['TROMSO', 'MARS']] as const)(
    '%s → %s conserva las tres decisiones, aplica costos una vez y mantiene límites', (city, destination) => {
      const efficient = configured(city, destination, [1, 1, 1]);
      const expensive = configured(city, destination, [2, 2, 2]);
      expect(isValidGameSetup(efficient.setup)).toBe(true);
      expect(efficient.setup.selectedTools).toEqual(expensive.setup.selectedTools);
      expect(efficient.setup.earthProfile?.outcomes).toEqual(efficient.outcomes);
      const a = createMission(efficient.setup);
      const b = createMission(expensive.setup);
      expect(a.energy).toBeGreaterThan(b.energy);
      expect(createMission(efficient.setup)).toEqual(a);
      for (const value of [a.energy, a.oxygen, a.shield, b.energy, b.oxygen, b.shield]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
      let state = a;
      while (state.outcome === 'IN_PROGRESS') state = advanceTurn(applyAction(state, { type: 'SKIP_INTERVENTION' }));
      expect(getMissionResult(state)?.configurationConsequences.some((line) => line.includes('Decisión 1'))).toBe(true);
      expect(state.completedTurns).toBeLessThanOrEqual(5);
    },
  );

  it('rechaza una herramienta regalada o un costo alterado', () => {
    const { setup, outcomes } = configured('AREQUIPA', 'MOON', [1, 2, 1]);
    expect(() => buildEarthV3Setup({
      city: 'AREQUIPA', destination: 'MOON', avatarId: 'ALBA', fictionalName: 'Prueba',
      completedMissions: getMissionsForCity('AREQUIPA').slice(0, 3).map((mission) => mission.id),
      earnedTools: ['CROP_KIT', 'LIFE_SUPPORT', 'SHELTER_KIT'], trainingOutcomes: outcomes,
    })).toThrow();
    const corrupted: TrainingOutcome = { ...outcomes[0], spaceDelta: { energy: 5 } };
    expect(isValidGameSetup({ ...setup, earthProfile: { ...setup.earthProfile!, outcomes: [corrupted, ...outcomes.slice(1)] } })).toBe(false);
  });

  it('permite una victoria de cinco turnos con costos terrestres aplicados', () => {
    const missions = [0, 2, 3].map((index) => getMissionsForCity('AREQUIPA')[index]);
    const outcomes = missions.map((mission) => createTrainingOutcome(
      mission.id, 'Preparación eficiente', 'energy', 1, 'Reserva consumida durante la prueba.',
    ));
    const setup = buildEarthV3Setup({
      city: 'AREQUIPA', destination: 'MOON', avatarId: 'ALBA', fictionalName: 'Prueba',
      completedMissions: missions.map((mission) => mission.id),
      earnedTools: missions.map((mission) => mission.targetTool), trainingOutcomes: outcomes,
    });
    let state = createMission({ ...setup, selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'] });
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
