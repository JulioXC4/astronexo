import { describe, expect, it } from 'vitest';
import {
  advanceTurn,
  applyAction,
  createMission,
  getModuleWarnings,
} from '../../src/game';
import type { GameSetup, ModuleId } from '../../src/game';
import {
  EMPTY_MODULE_SLOTS,
  isCompleteBase,
  placeModuleInSlot,
  removeModuleFromSlot,
  selectedModulesFromSlots,
} from '../../src/features/base-builder/selection';

function setup(selectedModules: readonly ModuleId[]): GameSetup {
  return {
    mode: 'SOLO', city: 'AREQUIPA', destination: 'MOON',
    completedEarthMissions: ['M1', 'M2', 'M4'],
    selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'EXTRA_BATTERY'],
    selectedModules, scenarioId: 'H3_MODULE_RULES', difficulty: 'CALM',
  };
}

const commonModules = ['SOLAR_STORAGE', 'REINFORCED_LIFE_SUPPORT', 'STORM_SHELTER'] as const;

function closeQuietTurn(selectedModules: readonly ModuleId[], statePatch = {}) {
  const initial = { ...createMission(setup(selectedModules)), activeAlerts: [], ...statePatch };
  return advanceTurn(applyAction(initial, { type: 'SKIP_INTERVENTION' }));
}

describe('constructor P10 y módulos H3', () => {
  it('permite exactamente tres de cinco, reemplaza y nunca duplica', () => {
    let slots = placeModuleInSlot(EMPTY_MODULE_SLOTS, 0, 'SOLAR_STORAGE');
    slots = placeModuleInSlot(slots, 1, 'GREENHOUSE');
    slots = placeModuleInSlot(slots, 2, 'SCIENCE_LAB');
    expect(isCompleteBase(slots)).toBe(true);
    expect(selectedModulesFromSlots(slots)).toHaveLength(3);

    const moved = placeModuleInSlot(slots, 1, 'SOLAR_STORAGE');
    expect(selectedModulesFromSlots(moved)).toEqual(['SOLAR_STORAGE', 'SCIENCE_LAB']);
    expect(isCompleteBase(moved)).toBe(false);
    expect(removeModuleFromSlot(moved, 2)).toEqual([null, 'SOLAR_STORAGE', null]);
  });

  it('P10 y P11 conservan la misma configuración de tres módulos', () => {
    const selected = [...commonModules];
    const state = createMission(setup(selected));
    expect(state.setup.selectedModules).toEqual(selected);
    expect(state.selectedModules).toEqual(selected);
  });

  it('Paneles/baterías separa reserva de una bonificación ligada a la generación real', () => {
    const initial = createMission(setup(commonModules));
    expect(initial.energy).toBe(94);
    const next = closeQuietTurn(commonModules);
    const solar = next.moduleOperations.filter((operation) => operation.moduleId === 'SOLAR_STORAGE');
    expect(solar.some((operation) => operation.phase === 'SETUP' && operation.benefit.energy === 12)).toBe(true);
    expect(solar.some((operation) => operation.phase === 'TURN' && operation.benefit.energy === 3)).toBe(true);

    const lowLight = closeQuietTurn(commonModules, { turn: 5, solarEfficiency: 10 });
    const lowLightOperation = lowLight.moduleOperations.find((operation) =>
      operation.moduleId === 'SOLAR_STORAGE' && operation.phase === 'TURN');
    expect(lowLightOperation?.benefit.energy).toBe(0);

    const noLight = closeQuietTurn(commonModules, { solarEfficiency: 0 });
    const noLightOperation = noLight.moduleOperations.find((operation) =>
      operation.moduleId === 'SOLAR_STORAGE' && operation.phase === 'TURN');
    expect(noLightOperation?.benefit.energy).toBe(0);
  });

  it('Soporte vital mejora oxígeno y cobra una vez por turno', () => {
    const next = closeQuietTurn(commonModules);
    const operation = next.moduleOperations.filter((item) =>
      item.moduleId === 'REINFORCED_LIFE_SUPPORT' && item.phase === 'TURN');
    expect(next.oxygen).toBe(76);
    expect(operation).toHaveLength(1);
    expect(operation[0].cost.energy).toBe(-1);
    expect(operation[0].benefit.oxygen).toBe(1);
  });

  it('Refugio reduce exposición nueva sin borrar la acumulada', () => {
    const next = closeQuietTurn(commonModules, { radiationExposure: 50, shield: 0 });
    expect(next.radiationExposure).toBe(53);
    expect(next.moduleOperations.some((item) =>
      item.moduleId === 'STORM_SHELTER' && item.benefit.radiationExposure === -2)).toBe(true);
  });

  it('Invernadero solo consume y produce cuando está activo', () => {
    const modules = ['SOLAR_STORAGE', 'GREENHOUSE', 'STORM_SHELTER'] as const;
    const active = closeQuietTurn(modules);
    const suspended = closeQuietTurn(modules, { greenhouseActive: false });
    const activeOps = active.moduleOperations.filter((item) => item.moduleId === 'GREENHOUSE');
    const suspendedOps = suspended.moduleOperations.filter((item) => item.moduleId === 'GREENHOUSE');
    expect(activeOps).toHaveLength(1);
    expect(activeOps[0].cost.energy).toBe(-1);
    expect(activeOps[0].benefit.foodSupply).toBe(3);
    expect(suspendedOps).toHaveLength(0);
    expect(active.foodSupply).toBeGreaterThan(suspended.foodSupply);
  });

  it('Laboratorio mejora una investigación y cobra solo el costo operativo del turno', () => {
    const modules = ['SOLAR_STORAGE', 'SCIENCE_LAB', 'STORM_SHELTER'] as const;
    const initial = createMission(setup(modules));
    const researched = applyAction(initial, { type: 'RUN_RESEARCH' });
    expect(researched.scienceProgress).toBe(35);
    expect(researched.moduleOperations.filter((item) =>
      item.moduleId === 'SCIENCE_LAB' && item.phase === 'ACTION')).toHaveLength(1);
    const next = advanceTurn(researched);
    const turnCosts = next.moduleOperations.filter((item) =>
      item.moduleId === 'SCIENCE_LAB' && item.phase === 'TURN');
    expect(turnCosts).toHaveLength(1);
    expect(turnCosts[0].cost.energy).toBe(-2);
  });

  it('las cámaras pueden derivar advertencias reales de las alertas', () => {
    const state = createMission(setup(commonModules));
    expect(getModuleWarnings(state)).toContain('SOLAR_STORAGE');
    expect(getModuleWarnings(state)).not.toContain('GREENHOUSE');
  });

  it('reintentar crea una misión limpia con la misma configuración', () => {
    const initial = createMission(setup(commonModules));
    const played = advanceTurn(applyAction(initial, { type: 'SKIP_INTERVENTION' }));
    const retried = createMission(played.setup);
    expect(retried).toEqual(initial);
    expect(retried).not.toBe(initial);
  });
});
