import { describe, expect, it } from 'vitest';
import {
  EVENT_CONFIG,
  advanceTurn,
  applyAction,
  createMission,
  getActionCost,
} from '../../src/game';
import type { AlertKind, Destination, GameSetup, MissionState } from '../../src/game';

const setup: GameSetup = {
  mode: 'SOLO', city: 'TROMSO', destination: 'MOON',
  completedEarthMissions: ['M2', 'M3', 'M5'],
  selectedTools: ['EARLY_WARNING', 'GROW_TRAY', 'THERMAL_INSULATION'],
  selectedModules: ['SOLAR_STORAGE', 'REINFORCED_LIFE_SUPPORT', 'STORM_SHELTER'],
  scenarioId: 'H2_ACTION_COSTS', difficulty: 'CALM',
};

function withAlert(kind: AlertKind, destination: Destination = 'MOON'): MissionState {
  const state = createMission({ ...setup, destination });
  const event = EVENT_CONFIG[kind];
  return {
    ...state,
    activeAlerts: [{
      id: `${kind}-TEST`, kind, title: event.title, description: event.description,
      consequencePreview: event.consequencePreview, severity: 1, age: 0,
    }],
  };
}

describe('G1–G8', () => {
  it('G1 repara paneles con costo 5 y recupera eficiencia', () => {
    const initial = { ...withAlert('PANEL_DAMAGE'), solarEfficiency: 60 };
    const next = applyAction(initial, { type: 'REPAIR_PANELS' });
    expect(next.energy).toBe(initial.energy - 5);
    expect(next.solarEfficiency).toBe(80);
    expect(next.activeAlerts).toHaveLength(0);
  });

  it('G2 limpia paneles con costo 3', () => {
    const initial = { ...withAlert('DUSTY_PANELS', 'MARS'), solarEfficiency: 50 };
    const next = applyAction(initial, { type: 'CLEAN_PANELS' });
    expect(next.energy).toBe(initial.energy - 3);
    expect(next.solarEfficiency).toBe(80);
  });

  it('G3 parchea una fuga con costo 4', () => {
    const initial = withAlert('OXYGEN_LEAK');
    const next = applyAction(initial, { type: 'PATCH_OXYGEN_LEAK' });
    expect(next.energy).toBe(initial.energy - 4);
    expect(next.oxygen).toBe(initial.oxygen + 4);
  });

  it('G4 recicla oxígeno con costo 6', () => {
    const initial = { ...createMission(setup), oxygen: 50 };
    const next = applyAction(initial, { type: 'RECYCLE_OXYGEN' });
    expect(next.energy).toBe(initial.energy - 6);
    expect(next.oxygen).toBe(70);
  });

  it('G5 refuerza Escudo sin reducir exposición', () => {
    const initial = { ...withAlert('RADIATION_RISK'), shield: 50, radiationExposure: 22 };
    const next = applyAction(initial, { type: 'REINFORCE_SHELTER' });
    expect(next.energy).toBe(initial.energy - 8);
    expect(next.shield).toBe(70);
    expect(next.radiationExposure).toBe(22);
  });

  it('G6 hace ciencia con costo 10 Energía y 4 Oxígeno', () => {
    const initial = createMission(setup);
    const next = applyAction(initial, { type: 'RUN_RESEARCH' });
    expect(next.energy).toBe(initial.energy - 10);
    expect(next.oxygen).toBe(initial.oxygen - 4);
    expect(next.scienceProgress).toBe(25);
  });

  it('G7 mantiene o suspende cultivos con sacrificios diferentes', () => {
    const initial = { ...createMission(setup), foodSupply: 50 };
    const maintained = applyAction(initial, { type: 'MANAGE_GREENHOUSE', choiceId: 'MAINTAIN_CROPS' });
    const suspended = applyAction(initial, { type: 'MANAGE_GREENHOUSE', choiceId: 'SUSPEND_CROPS' });
    expect(maintained.energy).toBe(initial.energy - 3);
    expect(maintained.foodSupply).toBe(70);
    expect(suspended.energy).toBe(initial.energy);
    expect(suspended.foodSupply).toBe(initial.foodSupply);
    expect(suspended.greenhouseActive).toBe(false);
  });

  it('G8 responde inmediatamente en Luna y consume la comunicación disponible', () => {
    const initial = createMission(setup);
    const next = applyAction(initial, { type: 'CONSULT_EARTH', choiceId: 'ENERGY_GUIDANCE' });
    expect(getActionCost(initial, { type: 'CONSULT_EARTH', choiceId: 'ENERGY_GUIDANCE' })).toEqual({});
    expect(next.energy).toBe(initial.energy);
    expect(next.communicationAvailable).toBe(false);
    expect(next.consultationUsed).toBe(true);
    expect(next.pendingCommunication).toBeNull();
    expect(next.communicationResponse).toContain('Respuesta simulada');
  });

  it('bloquea acciones con recursos insuficientes', () => {
    const initial = { ...createMission(setup), energy: 9, oxygen: 3 };
    const next = applyAction(initial, { type: 'RUN_RESEARCH' });
    expect(next).toBe(initial);
    expect(next.actionTakenThisTurn).toBe(false);
  });

  it('mantiene un solo cobro aunque se repita la misma acción', () => {
    const initial = { ...createMission(setup), oxygen: 50 };
    const once = applyAction(initial, { type: 'RECYCLE_OXYGEN' });
    const twice = applyAction(once, { type: 'RECYCLE_OXYGEN' });
    expect(twice).toBe(once);
    expect(twice.energy).toBe(initial.energy - 6);
  });

  it('la respuesta marciana llega al siguiente turno', () => {
    const initial = createMission({ ...setup, destination: 'MARS' });
    const sent = applyAction(initial, { type: 'CONSULT_EARTH', choiceId: 'RADIATION_GUIDANCE' });
    expect(sent.energy).toBe(initial.energy);
    expect(sent.communicationAvailable).toBe(false);
    expect(sent.communicationResponse).toBeUndefined();
    expect(sent.pendingCommunication?.dueTurn).toBe(2);
    const next = advanceTurn(sent);
    expect(next.turn).toBe(2);
    expect(next.pendingCommunication).toBeNull();
    expect(next.communicationResponse).toContain('Respuesta simulada');
    expect(applyAction(next, { type: 'CONSULT_EARTH', choiceId: 'ENERGY_GUIDANCE' })).toBe(next);
  });
});
