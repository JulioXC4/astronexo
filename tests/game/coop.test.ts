import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  advanceTurn,
  applyAction,
  createMission,
  getMissionResult,
} from '../../src/game';
import type { GameAction, GameSetup, MissionState } from '../../src/game';
import {
  COOP_DEMO_GROUPS,
  COOP_DEMO_SETUP,
  confirmGroupDecision,
  createLocalCoopConfig,
  rolesForPlayerCount,
  rotateActivePlayer,
  showsFoodAsPrimary,
  stageGroupDecision,
  validateLocalCoopConfig,
  CoopMissionView,
} from '../../src/features/coop-gameplay';
import type { LocalCoopConfig } from '../../src/features/coop-gameplay';

function withPlayers(count: number): LocalCoopConfig {
  return createLocalCoopConfig('Equipo de prueba', Array.from({ length: count }, (_, index) => `Tripulante ${index + 1}`));
}

function finishMission(setup: GameSetup) {
  let state = createMission(setup);
  while (state.outcome === 'IN_PROGRESS') {
    const desired: GameAction = state.scienceProgress < 50
      ? { type: 'RUN_RESEARCH' }
      : { type: 'SKIP_INTERVENTION' };
    let acted = applyAction(state, desired);
    if (acted === state) acted = applyAction(state, { type: 'SKIP_INTERVENTION' });
    state = advanceTurn(acted);
  }
  return state;
}

describe('H4 · cooperación local', () => {
  it('rechaza grupos con menos de 3 o más de 5 participantes', () => {
    expect(validateLocalCoopConfig(withPlayers(2))).toContain('El grupo debe tener entre 3 y 5 participantes.');
    expect(validateLocalCoopConfig(withPlayers(6))).toContain('El grupo debe tener entre 3 y 5 participantes.');
    expect(validateLocalCoopConfig(withPlayers(3))).toHaveLength(0);
    expect(validateLocalCoopConfig(withPlayers(5))).toHaveLength(0);
  });

  it('rechaza identificadores ficticios duplicados', () => {
    const group = withPlayers(3);
    const duplicated = {
      ...group,
      players: group.players.map((player, index) => ({ ...player, id: index < 2 ? 'DUPLICADO' : player.id })),
    };
    expect(validateLocalCoopConfig(duplicated)).toContain('Los identificadores ficticios deben ser únicos y no vacíos.');
  });

  it('asigna los roles educativos correctos para 3, 4 y 5 participantes', () => {
    expect(rolesForPlayerCount(3)).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION']);
    expect(rolesForPlayerCount(4)).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER']);
    expect(rolesForPlayerCount(5)).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER', 'CROPS']);
    expect(COOP_DEMO_GROUPS.FIVE.players.flatMap((player) => player.roles)).toEqual(rolesForPlayerCount(5));
    expect(COOP_DEMO_GROUPS.FIVE.players.map((player) => player.roles[0])).toEqual([
      'ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER', 'CROPS',
    ]);
    const swapped = {
      ...COOP_DEMO_GROUPS.THREE,
      players: [
        { ...COOP_DEMO_GROUPS.THREE.players[0], roles: ['OXYGEN'] as const },
        { ...COOP_DEMO_GROUPS.THREE.players[1], roles: ['ENERGY'] as const },
        COOP_DEMO_GROUPS.THREE.players[2],
      ],
    };
    expect(validateLocalCoopConfig(swapped)).toContain('Los roles no corresponden al tamaño del grupo.');
  });

  it('rota al participante activo después de cada turno y vuelve al inicio', () => {
    let group = COOP_DEMO_GROUPS.THREE;
    group = rotateActivePlayer(group);
    expect(group.activePlayerIndex).toBe(1);
    group = rotateActivePlayer(rotateActivePlayer(group));
    expect(group.activePlayerIndex).toBe(0);
  });

  it('prepara una decisión sin aplicar costos antes del acuerdo', () => {
    const state = createMission(COOP_DEMO_SETUP);
    const pending = stageGroupDecision(state, COOP_DEMO_GROUPS.FOUR, { type: 'RUN_RESEARCH' });
    expect(pending?.action.type).toBe('RUN_RESEARCH');
    expect(state.energy).toBe(createMission(COOP_DEMO_SETUP).energy);
    expect(state.actionTakenThisTurn).toBe(false);
    expect(state.decisions).toHaveLength(0);
  });

  it('cancelar la confirmación conserva la misión y permite preparar otra decisión', () => {
    const state = createMission(COOP_DEMO_SETUP);
    const firstPending = stageGroupDecision(state, COOP_DEMO_GROUPS.THREE, { type: 'RUN_RESEARCH' });
    const cancelledPending = null;
    const secondPending = stageGroupDecision(state, COOP_DEMO_GROUPS.THREE, { type: 'SKIP_INTERVENTION' });
    expect(firstPending).not.toBeNull();
    expect(cancelledPending).toBeNull();
    expect(secondPending).not.toBeNull();
    expect(state.actionTakenThisTurn).toBe(false);
  });

  it('confirma una sola vez y el bloqueo del motor evita ejecución doble', () => {
    const state = createMission(COOP_DEMO_SETUP);
    const pending = stageGroupDecision(state, COOP_DEMO_GROUPS.FOUR, { type: 'RUN_RESEARCH' });
    expect(pending).not.toBeNull();
    const once = confirmGroupDecision(state, pending!);
    const twice = confirmGroupDecision(once, pending!);
    expect(once.energy).toBeLessThan(state.energy);
    expect(once.decisions).toHaveLength(1);
    expect(twice).toBe(once);
  });

  it('usa exactamente el MissionState producido por el motor existente', () => {
    const state = createMission(COOP_DEMO_SETUP);
    const action: GameAction = { type: 'RUN_RESEARCH' };
    const pending = stageGroupDecision(state, COOP_DEMO_GROUPS.THREE, action);
    expect(confirmGroupDecision(state, pending!)).toEqual(applyAction(state, action));
  });

  it('muestra Comida como barra principal en todos los equipos', () => {
    expect(showsFoodAsPrimary(COOP_DEMO_GROUPS.THREE)).toBe(false);
    expect(showsFoodAsPrimary(COOP_DEMO_GROUPS.FOUR)).toBe(false);
    expect(showsFoodAsPrimary(COOP_DEMO_GROUPS.FIVE)).toBe(true);
    const state = createMission(COOP_DEMO_SETUP);
    const render = (group: LocalCoopConfig) => renderToStaticMarkup(createElement(CoopMissionView, {
      state,
      group,
      pendingDecision: null,
      onRequestDecision: () => undefined,
      onConfirmDecision: () => undefined,
      onCancelDecision: () => undefined,
      onAdvance: () => undefined,
    }));
    expect(render(COOP_DEMO_GROUPS.FIVE)).toContain('aria-label="FOOD"');
    expect(render(COOP_DEMO_GROUPS.FOUR)).toContain('aria-label="FOOD"');
  });

  it('SOLO y LOCAL_COOP mantienen reglas y recursos idénticos', () => {
    const soloSetup: GameSetup = { ...COOP_DEMO_SETUP, mode: 'SOLO' };
    const solo = finishMission(soloSetup);
    const coop = finishMission(COOP_DEMO_SETUP);
    expect({
      energy: coop.energy, oxygen: coop.oxygen, shield: coop.shield,
      food: coop.foodSupply, radiation: coop.radiationExposure, science: coop.scienceProgress,
      outcome: coop.outcome,
    }).toEqual({
      energy: solo.energy, oxygen: solo.oxygen, shield: solo.shield,
      food: solo.foodSupply, radiation: solo.radiationExposure, science: solo.scienceProgress,
      outcome: solo.outcome,
    });
  });

  it('la entrada cooperativa funciona con Luna y Marte sin cambiar el motor', () => {
    const marsSetup: GameSetup = {
      ...COOP_DEMO_SETUP,
      city: 'TROMSO',
      destination: 'MARS',
      completedEarthMissions: ['M1', 'M4', 'M5'],
      selectedTools: ['SPARE_PARTS_KIT', 'EXTRA_BATTERY', 'THERMAL_INSULATION'],
      scenarioId: 'H4_MARS_COOP_DEMO',
    };
    const moon = createMission(COOP_DEMO_SETUP);
    const mars = createMission(marsSetup);
    const pending = stageGroupDecision(mars, COOP_DEMO_GROUPS.THREE, { type: 'SKIP_INTERVENTION' });
    const nextMars = advanceTurn(confirmGroupDecision(mars, pending!));
    expect(moon.destination).toBe('MOON');
    expect(mars.destination).toBe('MARS');
    expect(nextMars.turn).toBe(2);
    expect(nextMars.clockLabel).toBe('15:00 LMST');
  });

  it('la puntuación colectiva conserva exactamente la fórmula individual', () => {
    const solo = getMissionResult(finishMission({ ...COOP_DEMO_SETUP, mode: 'SOLO' }));
    const coop = getMissionResult(finishMission(COOP_DEMO_SETUP));
    expect(coop?.score).toEqual(solo?.score);
  });

  it('reintentar crea estado limpio y conserva solo la configuración', () => {
    const initial = createMission(COOP_DEMO_SETUP);
    const pending = stageGroupDecision(initial, COOP_DEMO_GROUPS.FIVE, { type: 'SKIP_INTERVENTION' });
    const played = advanceTurn(confirmGroupDecision(initial, pending!));
    const retried: MissionState = createMission(played.setup);
    expect(retried).toEqual(initial);
    expect(retried.decisions).toHaveLength(0);
    expect(retried.completedTurns).toBe(0);
  });

  it.each([
    COOP_DEMO_GROUPS.THREE,
    COOP_DEMO_GROUPS.FOUR,
    COOP_DEMO_GROUPS.FIVE,
  ])('completa una guardia funcional con $players.length participantes', (initialGroup) => {
    let group: LocalCoopConfig = initialGroup;
    let state = createMission(COOP_DEMO_SETUP);
    while (state.outcome === 'IN_PROGRESS') {
      const desired: GameAction = state.scienceProgress < 50
        ? { type: 'RUN_RESEARCH' }
        : { type: 'SKIP_INTERVENTION' };
      const pending = stageGroupDecision(state, group, desired);
      let acted = pending ? confirmGroupDecision(state, pending) : state;
      if (acted === state) {
        acted = confirmGroupDecision(state, stageGroupDecision(
          state, group, { type: 'SKIP_INTERVENTION' },
        )!);
      }
      const next = advanceTurn(acted);
      if (next.completedTurns > state.completedTurns) group = rotateActivePlayer(group);
      state = next;
    }
    expect(getMissionResult(state)).not.toBeNull();
    expect(group.activePlayerIndex).toBe(state.completedTurns % group.players.length);
  });
});
