export type SystemId = 'communications' | 'laboratory' | 'shelter';
export type Allocation = Record<SystemId, number>;

// Each game unit represents 1 kWh. Equipment demands are educational assumptions.
export const UNIT_KWH = 1;
export const DEMAND = {
  communications: 4, // 2 units by day, 2 at night
  laboratory: 4, // optional daytime experiments
  shelter: 5, // mandatory night heating and lighting
} as const;

export const EMPTY_ALLOCATION: Allocation = { communications: 0, laboratory: 0, shelter: 0 };

export function captureEnergy(irradianceKwhPerM2: number, angle: number) {
  const orientation = Math.max(0.6, Math.cos((Math.abs(angle - 16) * Math.PI) / 180));
  const kwh = Number((irradianceKwhPerM2 * orientation * 0.22 * 10).toFixed(2));
  return { kwh, units: Math.floor(kwh / UNIT_KWH), efficiencyPercent: Math.round(orientation * 100) };
}

export function assignedUnits(allocation: Allocation) {
  return allocation.communications + allocation.laboratory + allocation.shelter;
}

export function allocate(allocation: Allocation, system: SystemId, change: number, budget: number): Allocation {
  const next = Math.max(0, Math.min(DEMAND[system], allocation[system] + change));
  if (assignedUnits(allocation) - allocation[system] + next > budget) return allocation;
  return { ...allocation, [system]: next };
}

export function nightEnergy(allocation: Allocation) {
  return Math.max(0, allocation.communications - 2) + allocation.shelter;
}

export function evaluate(allocation: Allocation, budget: number, circuitClosed: boolean) {
  const communicationsDay = allocation.communications >= 2;
  const communicationsNight = allocation.communications >= DEMAND.communications;
  const shelterNight = allocation.shelter >= DEMAND.shelter;
  const passed = circuitClosed && communicationsDay && communicationsNight && shelterNight;
  const excellent = passed && allocation.laboratory >= 3;
  const perfect = excellent && allocation.laboratory >= DEMAND.laboratory && budget - assignedUnits(allocation) <= 1;
  const grade = perfect ? 'perfect' : excellent ? 'excellent' : passed ? 'passed' : 'failed';
  const reservePercent = budget === 0 ? 0 : Math.round(nightEnergy(allocation) / budget * 100);
  return { passed, grade, reservePercent, communicationsDay, communicationsNight, shelterNight };
}

export function remainingNightEnergy(allocation: Allocation, tick: number) {
  const communicationsNight = Math.max(0, allocation.communications - 2);
  const shelter = allocation.shelter;
  return Math.max(0, communicationsNight + shelter - Math.min(tick, 2) - Math.min(Math.max(tick - 2, 0), 5));
}

/** Remaining assigned energy after each of the seven simulated night intervals. */
export function nightSystemEnergy(allocation: Allocation, tick: number) {
  const interval = Math.max(0, Math.min(7, Math.floor(tick)));
  return {
    communications: Math.max(0, allocation.communications - 2 - Math.min(interval, 2)),
    shelter: Math.max(0, allocation.shelter - Math.max(0, interval - 2)),
  };
}
