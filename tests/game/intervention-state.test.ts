import { describe, expect, it } from 'vitest';
import { applyAction, createMission } from '../../src/game';
import { getInterventionPanelMode } from '../../src/features/space-minigames/interventionState';
import type { GameSetup } from '../../src/game';

const setup: GameSetup = {
  mode: 'SOLO',
  city: 'AREQUIPA',
  destination: 'MOON',
  completedEarthMissions: ['M1', 'M2', 'M3'],
  selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY'],
  selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
  scenarioId: 'H1_INTERVENTION_UI_TEST',
  difficulty: 'CALM',
};

describe('estado visual de intervenciones', () => {
  it('prioriza el resumen de no intervenir sobre una vista previa anterior', () => {
    const skipped = applyAction(createMission(setup), { type: 'SKIP_INTERVENTION' });

    expect(getInterventionPanelMode(skipped, 'REPAIR_PANELS')).toBe('SKIPPED');
  });
});
