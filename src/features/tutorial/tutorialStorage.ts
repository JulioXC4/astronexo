const STORAGE_KEY = 'astronexo_tutorial_v1';

type TutorialProgress = Record<string, true>;

function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readTutorialProgress(storage: Storage | null = browserStorage()): TutorialProgress {
  if (!storage) return {};
  try {
    const value: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, true] => entry[1] === true),
    );
  } catch {
    return {};
  }
}

export function isTutorialComplete(stepIds: readonly string[], storage: Storage | null = browserStorage()) {
  const progress = readTutorialProgress(storage);
  return stepIds.every((stepId) => progress[stepId] === true);
}

export function markTutorialSteps(stepIds: readonly string[], storage: Storage | null = browserStorage()) {
  if (!storage) return;
  try {
    const progress = readTutorialProgress(storage);
    for (const stepId of stepIds) progress[stepId] = true;
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The tutorial stays usable when storage is unavailable or full.
  }
}

