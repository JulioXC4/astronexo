import { describe, expect, it } from 'vitest';
import {
  H2_TOOL_CATALOG,
  advanceTurn,
  applyAction,
  createMission,
} from '../../src/game';
import type { GameSetup, SelectedTools } from '../../src/game';

const common = {
  mode: 'SOLO', city: 'AREQUIPA', destination: 'MOON',
  completedEarthMissions: ['M1', 'M2', 'M3'], selectedModules: [],
  scenarioId: 'H2_TOOL_EFFECTS', difficulty: 'CALM',
} as const;

function setup(selectedTools: SelectedTools): GameSetup {
  return { ...common, selectedTools };
}

describe('herramientas terrestres', () => {
  it('publica los seis identificadores v1.1', () => {
    expect(H2_TOOL_CATALOG.map((tool) => tool.id)).toEqual([
      'SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY',
      'EXTRA_BATTERY', 'WATER_RECYCLER', 'THERMAL_INSULATION',
    ]);
  });

  it('Batería, bandeja y aislamiento modifican recursos iniciales', () => {
    const baseline = createMission(setup(['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY']));
    const battery = createMission(setup(['SPARE_PARTS_KIT', 'EARLY_WARNING', 'EXTRA_BATTERY']));
    const insulated = createMission(setup(['SPARE_PARTS_KIT', 'EARLY_WARNING', 'THERMAL_INSULATION']));
    expect(battery.energy).toBe(baseline.energy + 18);
    expect(baseline.foodSupply).toBe(86);
    expect(insulated.shield).toBe(75);
  });

  it('Kit de repuestos reduce el costo de G1', () => {
    const withKit = createMission(setup(['SPARE_PARTS_KIT', 'GROW_TRAY', 'EXTRA_BATTERY']));
    const withoutKit = createMission(setup(['EARLY_WARNING', 'GROW_TRAY', 'EXTRA_BATTERY']));
    const repairedWithKit = applyAction(withKit, { type: 'REPAIR_PANELS' });
    const repairedWithoutKit = applyAction(withoutKit, { type: 'REPAIR_PANELS' });
    expect(withKit.energy - repairedWithKit.energy).toBe(3);
    expect(withoutKit.energy - repairedWithoutKit.energy).toBe(5);
  });

  it('Alerta temprana reduce la primera consecuencia ignorada', () => {
    const warned = { ...createMission(setup(['EARLY_WARNING', 'SPARE_PARTS_KIT', 'GROW_TRAY'])), shield: 60 };
    const plain = { ...createMission(setup(['THERMAL_INSULATION', 'SPARE_PARTS_KIT', 'GROW_TRAY'])), shield: 60 };
    const warnedNext = advanceTurn(applyAction(warned, { type: 'SKIP_INTERVENTION' }));
    const plainNext = advanceTurn(applyAction(plain, { type: 'SKIP_INTERVENTION' }));
    expect(warnedNext.energy + warnedNext.oxygen).toBeGreaterThan(plainNext.energy + plainNext.oxygen);
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
});
