import { describe, expect, it } from 'vitest';
import { evaluatePolarAllocation, evaluateSolarEnergy } from '../../src/features/earth/minigames/challengeRules';
import { AREQUIPA_SOLAR_RECORDS } from '../../src/data/nasa/powerData';
import { calculateTrainingCost } from '../../src/features/earth/trainingOutcome';

describe('Earth gameplay: decisions change visible outcomes', () => {
  it('shows an outage for a poor polar distribution and keeps all systems alive after correction', () => {
    const failed = evaluatePolarAllocation(40, 35, 25);
    const corrected = evaluatePolarAllocation(55, 30, 15);
    expect(failed.allocated).toBe(100);
    expect(failed.heatingSafe).toBe(false);
    expect(failed.success).toBe(false);
    expect(corrected.success).toBe(true);
    expect(calculateTrainingCost('DARK_MONTHS_RESERVE', 55)).toBe(1);
  });

  it('shows a different day or night consequence for each extreme reserve decision', () => {
    const irradiance = AREQUIPA_SOLAR_RECORDS.days[0].irradianceKwhPerM2;
    const low = evaluateSolarEnergy(irradiance, 16, 20);
    const balanced = evaluateSolarEnergy(irradiance, 16, 50);
    const high = evaluateSolarEnergy(irradiance, 16, 80);
    expect(low.nightPowered).toBe(false);
    expect(high.dayPowered).toBe(false);
    expect(balanced.dayPowered && balanced.nightPowered).toBe(true);
    expect(low.daytimeKwh).toBeGreaterThan(balanced.daytimeKwh);
    expect(high.storedKwh).toBeGreaterThan(balanced.storedKwh);
    expect(calculateTrainingCost('SOLAR_DETECTIVE', 50)).toBe(1);
  });
});
