import { describe, expect, it } from 'vitest';
import { advanceTurn, applyAction, createMission, getMissionResult } from '../../src/game';
import type { GameSetup, MissionState } from '../../src/game';

export const baseSetup: GameSetup = {
  mode: 'SOLO',
  city: 'AREQUIPA',
  destination: 'MOON',
  completedEarthMissions: ['M1', 'M2', 'M3'],
  selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY'],
  selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
  scenarioId: 'H2_REPRODUCIBLE',
  difficulty: 'CALM',
};

export function resolvePriorityAlert(state: MissionState) {
  const leak = state.activeAlerts.find((alert) => alert.kind === 'OXYGEN_LEAK');
  if (leak) return applyAction(state, { type: 'PATCH_OXYGEN_LEAK', targetId: leak.id });
  const panel = state.activeAlerts.find((alert) => alert.kind === 'PANEL_DAMAGE');
  if (panel) return applyAction(state, { type: 'REPAIR_PANELS', targetId: panel.id });
  const dust = state.activeAlerts.find((alert) =>
    alert.kind === 'DUSTY_PANELS'
    || alert.kind === 'MARS_DUST_STORM'
    || alert.kind === 'ENERGY_SHORTAGE');
  if (dust) return applyAction(state, { type: 'CLEAN_PANELS', targetId: dust.id });
  const radiation = state.activeAlerts.find((alert) => alert.kind === 'RADIATION_RISK');
  if (radiation) return applyAction(state, { type: 'REINFORCE_SHELTER', targetId: radiation.id });
  return applyAction(state, { type: 'RECYCLE_OXYGEN' });
}

describe('motor H0–H2', () => {
  it('crea una misión reproducible, inmutable y con máximo dos alertas', () => {
    const first = createMission(baseSetup);
    const second = createMission(baseSetup);

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.activeAlerts).toHaveLength(2);
    expect(first.activeAlerts.length).toBeLessThanOrEqual(2);
    expect(first.selectedTools).not.toBe(baseSetup.selectedTools);
  });

  it('no avanza ni aplica consecuencias sin una decisión registrada', () => {
    const initial = createMission(baseSetup);
    expect(advanceTurn(initial)).toBe(initial);
    expect(initial.completedTurns).toBe(0);
  });

  it('bloquea una segunda intervención y evita el doble cobro', () => {
    const initial = createMission(baseSetup);
    const leak = initial.activeAlerts.find((alert) => alert.kind === 'OXYGEN_LEAK');
    const once = applyAction(initial, { type: 'PATCH_OXYGEN_LEAK', targetId: leak?.id });
    const twice = applyAction(once, { type: 'RUN_RESEARCH' });

    expect(once.energy).toBe(initial.energy - 4);
    expect(twice).toBe(once);
    expect(twice.decisions).toHaveLength(1);
  });

  it('mantiene y agrava las alertas ignoradas', () => {
    const initial = createMission(baseSetup);
    const panel = initial.activeAlerts.find((alert) => alert.kind === 'PANEL_DAMAGE');
    const acted = applyAction(initial, { type: 'PATCH_OXYGEN_LEAK' });
    const next = advanceTurn(acted);
    const carried = next.activeAlerts.find((alert) => alert.id === panel?.id);

    expect(next.unresolvedEvents.some((event) => event.sourceAlertId === panel?.id)).toBe(true);
    expect(carried?.severity).toBe(2);
    expect(carried?.age).toBe(1);
  });

  it('interrumpe y puntúa parcialmente cuando se ignoran todas las alertas', () => {
    let state = createMission({
      ...baseSetup,
      completedEarthMissions: ['M1', 'M3', 'M4'],
      selectedTools: ['SPARE_PARTS_KIT', 'GROW_TRAY', 'EXTRA_BATTERY'],
    });
    while (state.outcome === 'IN_PROGRESS') {
      state = advanceTurn(applyAction(state, { type: 'SKIP_INTERVENTION' }));
    }

    const result = getMissionResult(state);
    expect(state.outcome).toBe('INTERRUPTED');
    expect(result?.score.total).toBeGreaterThan(0);
    expect(result?.score.operationalCompletion).toBeGreaterThan(0);
    expect(result?.interruptionCause).toBeTruthy();
    expect(result?.causeAndEffect.some((line) => line.startsWith('Energía:') && line.includes('alertas ignoradas'))).toBe(true);
    expect(result?.causeAndEffect.some((line) => line.startsWith('Oxígeno:'))).toBe(true);
    expect(result?.causeAndEffect.some((line) => line.startsWith('Escudo:'))).toBe(true);
  });

  it('no completa el objetivo científico por sobrevivir cinco turnos', () => {
    let state = createMission(baseSetup);
    while (state.outcome === 'IN_PROGRESS') state = advanceTurn(resolvePriorityAlert(state));
    const result = getMissionResult(state);

    expect(result?.score.scientificObjective).toBe(0);
    expect(result?.scientificObjectiveAchieved).toBe(false);
    expect(result?.outcome).toBe('INTERRUPTED');
    expect(result?.interruptionCause).toContain('objetivo científico');
  });

  it('calcula el puntaje con los cuatro componentes P0 y el factor de dificultad', () => {
    let state = createMission({ ...baseSetup, difficulty: 'ACTIVE' });
    while (state.outcome === 'IN_PROGRESS') state = advanceTurn(applyAction(state, { type: 'SKIP_INTERVENTION' }));
    const score = getMissionResult(state)?.score;
    expect(score).toBeDefined();
    if (!score) return;
    const expected = Math.max(0, Math.min(100, Math.round((
      score.crewSafety + score.finalResources + score.alertPrioritization + score.scientificObjective
    ) / 4 * score.difficultyFactor)));
    expect(score.total).toBe(expected);
    expect(score.difficultyFactor).toBe(1.08);
  });

  it('interrumpe por alimento y por exposición sin consumir Escudo automáticamente', () => {
    const initial = createMission(baseSetup);
    const foodCritical = advanceTurn(applyAction({ ...initial, foodSupply: 2 }, { type: 'SKIP_INTERVENTION' }));
    const radiationCritical = advanceTurn(applyAction({
      ...initial,
      radiationExposure: 99,
      shield: 0,
      activeAlerts: [],
    }, { type: 'SKIP_INTERVENTION' }));

    expect(foodCritical.outcome).toBe('INTERRUPTED');
    expect(foodCritical.interruptionCause).toContain('alimentarios');
    expect(radiationCritical.outcome).toBe('INTERRUPTED');
    expect(radiationCritical.shield).toBe(0);
    expect(radiationCritical.interruptionCause).toContain('radiológica');
  });
});
