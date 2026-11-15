import { isValidModuleSelection } from '../../game';
import type { ModuleId } from '../../game';

export type ModuleSlots = readonly [ModuleId | null, ModuleId | null, ModuleId | null];

export const EMPTY_MODULE_SLOTS: ModuleSlots = [null, null, null];

export function placeModuleInSlot(slots: ModuleSlots, slotIndex: number, moduleId: ModuleId): ModuleSlots {
  if (slotIndex < 0 || slotIndex > 2) return slots;
  const withoutDuplicate = slots.map((current) => current === moduleId ? null : current) as [
    ModuleId | null, ModuleId | null, ModuleId | null,
  ];
  withoutDuplicate[slotIndex] = moduleId;
  return withoutDuplicate;
}

export function removeModuleFromSlot(slots: ModuleSlots, slotIndex: number): ModuleSlots {
  if (slotIndex < 0 || slotIndex > 2 || slots[slotIndex] === null) return slots;
  const next: [ModuleId | null, ModuleId | null, ModuleId | null] = [...slots];
  next[slotIndex] = null;
  return next;
}

export function selectedModulesFromSlots(slots: ModuleSlots) {
  return slots.filter((module): module is ModuleId => module !== null);
}

export function isCompleteBase(slots: ModuleSlots) {
  return isValidModuleSelection(selectedModulesFromSlots(slots));
}
