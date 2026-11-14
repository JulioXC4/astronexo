import { describe, expect, it } from 'vitest';
import {
  advanceTurn,
  applyAction,
  createMission,
  getMissionResult,
} from '../../src/game';
import type { GameSetup, MissionState } from '../../src/game';

const setup: GameSetup = {
  mode: 'SOLO',
  city: 'AREQUIPA',
  destination: 'MOON',
  selectedTools: ['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT'],
  selectedModules: [],
  scenarioId: 'H1_LUNAR_TRAINING',
  difficulty: 'CALM',
};

function resolveForWinningPath(state: MissionState) {
  const preferredKind = state.turn % 2 === 1 ? 'OXYGEN_LEAK' : 'PANEL_DAMAGE';
  const alert = state.activeAlerts.find((candidate) => candidate.kind === preferredKind);
  if (!alert) return applyAction(state, { type: 'SKIP_INTERVENTION' });
  return applyAction(state, {
    type: preferredKind === 'OXYGEN_LEAK' ? 'PATCH_OXYGEN_LEAK' : 'REPAIR_PANELS',
    targetId: alert.id,
  });
}

describe('motor H0 + H1', () => {
  it('crea una misión lunar válida con dos alertas y sin mutar el setup', () => {
    const state = createMission(setup);

    expect(state.turn).toBe(1);
    expect(state.maxTurns).toBe(5);
    expect(state.clockLabel).toBe('Día lunar 2');
    expect(state.activeAlerts).toHaveLength(2);
    expect(state.oxygen).toBe(78);
    expect(state).not.toBe(setup);
    expect(state.selectedTools).not.toBe(setup.selectedTools);
  });

  it('produce el mismo estado para la misma configuración', () => {
    expect(createMission(setup)).toEqual(createMission(setup));
  });

  it('cobra G1 una sola vez aunque se intente aplicar dos veces', () => {
    const initial = createMission(setup);
    const panelAlert = initial.activeAlerts.find((alert) => alert.kind === 'PANEL_DAMAGE');
    expect(panelAlert).toBeDefined();

    const once = applyAction(initial, { type: 'REPAIR_PANELS', targetId: panelAlert?.id });
    const twice = applyAction(once, { type: 'REPAIR_PANELS', targetId: panelAlert?.id });

    expect(once.energy).toBe(initial.energy - 5);
    expect(twice.energy).toBe(once.energy);
    expect(twice.decisions).toHaveLength(1);
    expect(initial.energy).toBe(64);
  });

  it('mantiene y agrava una alerta ignorada al avanzar el turno', () => {
    const initial = createMission(setup);
    const leak = initial.activeAlerts.find((alert) => alert.kind === 'OXYGEN_LEAK');
    const acted = applyAction(initial, { type: 'REPAIR_PANELS' });
    const next = advanceTurn(acted);
    const carriedLeak = next.activeAlerts.find((alert) => alert.id === leak?.id);

    expect(next.turn).toBe(2);
    expect(next.oxygen).toBeLessThan(initial.oxygen);
    expect(carriedLeak?.severity).toBe(2);
    expect(next.unresolvedEvents.at(-1)?.sourceAlertId).toBe(leak?.id);
  });

  it('completa de forma reproducible la guardia lunar con decisiones alternadas', () => {
    let state = createMission(setup);
    while (state.outcome === 'IN_PROGRESS') {
      state = advanceTurn(resolveForWinningPath(state));
    }

    const result = getMissionResult(state);
    expect(state.outcome).toBe('COMPLETED');
    expect(state.turn).toBe(5);
    expect(result?.outcome).toBe('COMPLETED');
    expect(result?.score.total).toBeGreaterThan(0);
    expect(result?.helpfulDecisions).toHaveLength(5);
  });

  it('interrumpe la misión y conserva puntuación parcial cuando se ignoran las alertas', () => {
    let state = createMission(setup);
    while (state.outcome === 'IN_PROGRESS') {
      state = advanceTurn(applyAction(state, { type: 'SKIP_INTERVENTION' }));
    }

    const result = getMissionResult(state);
    expect(state.outcome).toBe('INTERRUPTED');
    expect(result?.outcome).toBe('INTERRUPTED');
    expect(result?.score.total).toBeGreaterThan(0);
    expect(result?.interruptionCause).toBeTruthy();
  });

  it('inicializa Marte con el mismo motor y su reloj propio', () => {
    const state = createMission({ ...setup, destination: 'MARS' });
    expect(state.clockLabel).toBe('14:00 LMST');
    expect(state.destination).toBe('MARS');
    expect(state.activeAlerts).toHaveLength(2);
  });
});
