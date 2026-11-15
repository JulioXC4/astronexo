import { describe, expect, it } from 'vitest';
import {
  H2_TOOL_CATALOG,
  advanceTurn,
  applyAction,
  createMission,
} from '../../src/game';
import type { GameSetup, SelectedTools } from '../../src/game';

const TOOL_MISSIONS = {
  SPARE_PARTS_KIT: 'M1', EARLY_WARNING: 'M2', GROW_TRAY: 'M3',
  EXTRA_BATTERY: 'M4', WATER_RECYCLER: 'M5', THERMAL_INSULATION: 'M5',
} as const;

function setup(selectedTools: SelectedTools): GameSetup {
  const tromso = selectedTools.includes('THERMAL_INSULATION');
  return {
    mode: 'SOLO', city: tromso ? 'TROMSO' : 'AREQUIPA', destination: 'MOON',
    completedEarthMissions: selectedTools.map((tool) => TOOL_MISSIONS[
      tool as keyof typeof TOOL_MISSIONS
    ]),
    selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
    scenarioId: 'H2_TOOL_EFFECTS', difficulty: 'CALM', selectedTools,
  };
}

describe('herramientas terrestres', () => {
  it('publica los seis identificadores v1.1', () => {
    expect(H2_TOOL_CATALOG.map((tool) => tool.id)).toEqual([
      'SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY',
      'EXTRA_BATTERY', 'WATER_RECYCLER', 'THERMAL_INSULATION',
    ]);
  });

  it('Batería mejora la reserva; bandeja y aislamiento no inventan recursos iniciales', () => {
    const baseline = createMission(setup(['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY']));
    const battery = createMission(setup(['SPARE_PARTS_KIT', 'EARLY_WARNING', 'EXTRA_BATTERY']));
    const insulated = createMission(setup(['SPARE_PARTS_KIT', 'EARLY_WARNING', 'THERMAL_INSULATION']));
    expect(battery.energy).toBe(baseline.energy + 18);
    expect(baseline.foodSupply).toBe(72);
    expect(insulated.shield).toBe(60);
  });

  it('Kit de repuestos cubre una sola reparación completa', () => {
    const withKit = createMission(setup(['SPARE_PARTS_KIT', 'GROW_TRAY', 'EXTRA_BATTERY']));
    const withoutKit = createMission(setup(['EARLY_WARNING', 'GROW_TRAY', 'EXTRA_BATTERY']));
    const repairedWithKit = applyAction(withKit, { type: 'REPAIR_PANELS' });
    const repairedWithoutKit = applyAction(withoutKit, { type: 'REPAIR_PANELS' });
    expect(withKit.energy - repairedWithKit.energy).toBe(0);
    expect(withoutKit.energy - repairedWithoutKit.energy).toBe(5);
    expect(repairedWithKit.sparePartsCharges).toBe(0);
    const secondTurn = {
      ...repairedWithKit,
      actionTakenThisTurn: false,
      activeAlerts: withKit.activeAlerts,
    };
    const secondRepair = applyAction(secondTurn, { type: 'REPAIR_PANELS' });
    expect(secondTurn.energy - secondRepair.energy).toBe(5);
  });

  it('Alerta temprana anticipa un evento sin reducir consecuencias ignoradas', () => {
    const warned = { ...createMission(setup(['EARLY_WARNING', 'SPARE_PARTS_KIT', 'GROW_TRAY'])), shield: 60 };
    const plain = { ...createMission(setup(['THERMAL_INSULATION', 'SPARE_PARTS_KIT', 'GROW_TRAY'])), shield: 60 };
    const warnedNext = advanceTurn(applyAction(warned, { type: 'SKIP_INTERVENTION' }));
    const plainNext = advanceTurn(applyAction(plain, { type: 'SKIP_INTERVENTION' }));
    expect(warned.earlyWarningForecast?.turn).toBe(2);
    expect(warned.earlyWarningForecast?.title).toBeTruthy();
    expect(warnedNext.unresolvedEvents.map((event) => event.resourceDelta))
      .toEqual(plainNext.unresolvedEvents.map((event) => event.resourceDelta));
    expect(warnedNext.earlyWarningCharges).toBe(0);
  });

  it('Reciclador de agua reduce consumo y mejora G4', () => {
    const recycled = createMission(setup(['WATER_RECYCLER', 'SPARE_PARTS_KIT', 'GROW_TRAY']));
    const plain = createMission(setup(['EXTRA_BATTERY', 'SPARE_PARTS_KIT', 'GROW_TRAY']));
    const recycledNext = advanceTurn(applyAction(recycled, { type: 'SKIP_INTERVENTION' }));
    const plainNext = advanceTurn(applyAction(plain, { type: 'SKIP_INTERVENTION' }));
    expect(recycled.oxygen - recycledNext.oxygen).toBeLessThan(plain.oxygen - plainNext.oxygen);
    expect(recycled.foodSupply - recycledNext.foodSupply).toBeLessThan(plain.foodSupply - plainNext.foodSupply);

    const recycledAction = applyAction({ ...recycled, oxygen: 50 }, { type: 'RECYCLE_OXYGEN' });
    expect(recycledAction.oxygen).toBe(75);
  });

  it('Bandeja mejora mantener cultivos y aislamiento reduce consumo energético por frío', () => {
    const tray = createMission(setup(['GROW_TRAY', 'SPARE_PARTS_KIT', 'EXTRA_BATTERY']));
    const plainFood = createMission(setup(['EARLY_WARNING', 'SPARE_PARTS_KIT', 'EXTRA_BATTERY']));
    const trayAction = applyAction({ ...tray, foodSupply: 50 }, {
      type: 'MANAGE_GREENHOUSE', choiceId: 'MAINTAIN_CROPS',
    });
    const plainAction = applyAction({ ...plainFood, foodSupply: 50 }, {
      type: 'MANAGE_GREENHOUSE', choiceId: 'MAINTAIN_CROPS',
    });
    expect(trayAction.foodSupply).toBe(plainAction.foodSupply + 4);

    const insulated = createMission(setup(['THERMAL_INSULATION', 'SPARE_PARTS_KIT', 'GROW_TRAY']));
    const plainEnergy = createMission(setup(['EARLY_WARNING', 'SPARE_PARTS_KIT', 'GROW_TRAY']));
    const insulatedNext = advanceTurn(applyAction(insulated, { type: 'SKIP_INTERVENTION' }));
    const plainNext = advanceTurn(applyAction(plainEnergy, { type: 'SKIP_INTERVENTION' }));
    expect(insulatedNext.energy).toBe(plainNext.energy + 2);
  });
});
