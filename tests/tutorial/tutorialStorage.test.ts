import { describe, expect, it } from 'vitest';
import {
  isTutorialComplete,
  markTutorialSteps,
  readTutorialProgress,
} from '../../src/features/tutorial/tutorialStorage';
import { translate } from '../../src/i18n/I18nContext';

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

describe('tutorial progress', () => {
  it('stores only completed tutorial step identifiers', () => {
    const storage = memoryStorage();

    markTutorialSteps(['map.pin', 'map.tool'], storage);

    expect(readTutorialProgress(storage)).toEqual({ 'map.pin': true, 'map.tool': true });
    expect(isTutorialComplete(['map.pin', 'map.tool'], storage)).toBe(true);
    expect(isTutorialComplete(['map.pin', 'map.counter'], storage)).toBe(false);
  });

  it('preserves earlier progress when another guide is completed', () => {
    const storage = memoryStorage();

    markTutorialSteps(['welcome.solo'], storage);
    markTutorialSteps(['guard.resources'], storage);

    expect(readTutorialProgress(storage)).toEqual({
      'welcome.solo': true,
      'guard.resources': true,
    });
  });

  it('recovers safely from invalid stored data', () => {
    const storage = memoryStorage();
    storage.setItem('astronexo_tutorial_v1', '{not-json');

    expect(readTutorialProgress(storage)).toEqual({});
    expect(isTutorialComplete(['welcome.solo'], storage)).toBe(false);
  });

  it('falls back to validated English copy for draft languages', () => {
    expect(translate('qu', 'tutorial.help')).toBe('Help');
    expect(translate('no', 'tutorial.guard.actions')).toBe('Tap Actions, check each repair cost, and choose one.');
  });
});
