import { describe, expect, it } from 'vitest';
import {
  advanceTurn,
  applyAction,
  createMission,
  getMissionResult,
  scenarioSeedFromId,
} from '../../src/game';
import type { Destination, GameAction, GameSetup, MissionState } from '../../src/game';

function setup(destination: Destination, scenarioId = `H2_${destination}_VICTORY`): GameSetup {
  return {
    mode: 'SOLO', city: destination === 'MOON' ? 'AREQUIPA' : 'TROMSO', destination,
    completedEarthMissions: ['M1', 'M2', 'M3'],
    selectedTools: ['EXTRA_BATTERY', 'WATER_RECYCLER', 'THERMAL_INSULATION'],
    selectedModules: [], scenarioId, difficulty: 'CALM',
  };
}

function priorityAction(state: MissionState): GameAction {
  const leak = state.activeAlerts.find((alert) => alert.kind === 'OXYGEN_LEAK');
  if (leak) return { type: 'PATCH_OXYGEN_LEAK', targetId: leak.id };
  const panel = state.activeAlerts.find((alert) => alert.kind === 'PANEL_DAMAGE');
  if (panel) return { type: 'REPAIR_PANELS', targetId: panel.id };
  const dust = state.activeAlerts.find((alert) =>
    alert.kind === 'DUSTY_PANELS'
    || alert.kind === 'MARS_DUST_STORM'
    || alert.kind === 'ENERGY_SHORTAGE');
  if (dust) return { type: 'CLEAN_PANELS', targetId: dust.id };
  const radiation = state.activeAlerts.find((alert) => alert.kind === 'RADIATION_RISK');
  if (radiation) return { type: 'REINFORCE_SHELTER', targetId: radiation.id };
  const greenhouse = state.activeAlerts.find((alert) => alert.kind === 'GREENHOUSE_STRAIN');
  if (greenhouse) return { type: 'MANAGE_GREENHOUSE', targetId: greenhouse.id, choiceId: 'MAINTAIN_CROPS' };
  return { type: 'MANAGE_GREENHOUSE', choiceId: 'SUSPEND_CROPS' };
}

function playScientificMission(destination: Destination) {
  let state = createMission(setup(destination));
  while (state.outcome === 'IN_PROGRESS') {
    const desired: GameAction = state.scienceProgress < 50 && (state.turn === 3 || state.turn === 4)
      ? { type: 'RUN_RESEARCH' }
      : priorityAction(state);
    let acted = applyAction(state, desired);
    if (acted === state) acted = applyAction(state, priorityAction(state));
    state = advanceTurn(acted);
  }
  return state;
}

describe('Luna y Marte con el mismo motor', () => {
  it('usa relojes y primeros eventos diferentes', () => {
    const moon = createMission(setup('MOON'));
    const mars = createMission(setup('MARS'));
    expect(moon.clockLabel).toBe('Día lunar 2');
    expect(mars.clockLabel).toBe('14:00 LMST');
    expect(moon.activeAlerts.map((alert) => alert.kind)).toContain('PANEL_DAMAGE');
    expect(mars.activeAlerts.map((alert) => alert.kind)).toContain('DUSTY_PANELS');

    const moonNext = advanceTurn(applyAction(moon, { type: 'PATCH_OXYGEN_LEAK' }));
    const marsNext = advanceTurn(applyAction(mars, { type: 'PATCH_OXYGEN_LEAK' }));
    expect(moonNext.clockLabel).toBe('Día lunar 6');
    expect(marsNext.clockLabel).toBe('15:00 LMST');
  });

  it.each(['MOON', 'MARS'] as const)('permite victoria científica en %s', (destination) => {
    const state = playScientificMission(destination);
    const result = getMissionResult(state);
    expect(state.outcome).toBe('COMPLETED');
    expect(state.completedTurns).toBe(5);
    expect(state.scienceProgress).toBeGreaterThanOrEqual(50);
    expect(result?.scientificObjectiveAchieved).toBe(true);
    expect(result?.score.scientificObjective).toBe(100);
  });

  it.each(['MOON', 'MARS'] as const)('permite interrupción en %s', (destination) => {
    let state = createMission({
      ...setup(destination, `H2_${destination}_FAILURE`),
      selectedTools: ['SPARE_PARTS_KIT', 'GROW_TRAY', 'CROP_KIT'],
    });
    while (state.outcome === 'IN_PROGRESS') {
      state = advanceTurn(applyAction(state, { type: 'SKIP_INTERVENTION' }));
    }
    expect(state.outcome).toBe('INTERRUPTED');
    expect(getMissionResult(state)?.score.total).toBeGreaterThan(0);
  });

  it('genera una tormenta de polvo solo en el escenario marciano pertinente', () => {
    let scenarioId = 'MARS_DUST_0';
    for (let index = 0; index < 100; index += 1) {
      const candidate = `MARS_DUST_${index}`;
      if ((scenarioSeedFromId(candidate) + 2) % 3 === 0) {
        scenarioId = candidate;
        break;
      }
    }
    const initial = createMission(setup('MARS', scenarioId));
    const cleaned = applyAction(initial, { type: 'CLEAN_PANELS' });
    const next = advanceTurn(cleaned);
    expect(next.activeAlerts.map((alert) => alert.kind)).toContain('MARS_DUST_STORM');
  });

  it('reproduce el mismo escenario y decisiones exactamente', () => {
    let first = createMission(setup('MARS', 'H2_FIXED_SEED'));
    let second = createMission(setup('MARS', 'H2_FIXED_SEED'));
    while (first.outcome === 'IN_PROGRESS') {
      const action = priorityAction(first);
      first = advanceTurn(applyAction(first, action));
      second = advanceTurn(applyAction(second, action));
      expect(first).toEqual(second);
    }
  });
});
