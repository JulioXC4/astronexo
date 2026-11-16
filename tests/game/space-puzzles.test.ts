import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  COMMUNICATION_PROBLEMS,
  PANEL_CIRCUIT_START,
  PANEL_DUST_START,
  applyCleaner,
  isCommunicationMessageRelevant,
  isEclssComplete,
  isGreenhouseLightingReady,
  isOxygenLeakResolved,
  isPanelCircuitComplete,
  isScienceClassificationValid,
  isScienceObservationValid,
  isShelterProtected,
  scienceSamples,
  solarCapturePercent,
} from '../../src/features/space-minigames/puzzleRules';

describe('reglas puras de los puzles G1–G8', () => {
  it('G1 exige continuidad lógica y limita la solución a dos repuestos', () => {
    const solved = PANEL_CIRCUIT_START.map((tile, index) => ({
      ...tile,
      damaged: index === 0 || index === 3 ? false : tile.damaged,
      rotation: index === 0 ? 2 : index === 1 ? 2 : tile.rotation,
    }));
    expect(isPanelCircuitComplete(PANEL_CIRCUIT_START)).toBe(false);
    expect(isPanelCircuitComplete(solved)).toBe(true);
    expect(isPanelCircuitComplete(solved.map((tile, index) => index === 3 ? { ...tile, damaged: true } : tile))).toBe(false);
  });

  it('G2 alcanza cobertura con dos aplicaciones adyacentes', () => {
    const once = applyCleaner(PANEL_DUST_START, 1);
    const twice = applyCleaner(once, 4);
    expect(solarCapturePercent(once)).toBeLessThan(85);
    expect(solarCapturePercent(twice)).toBeGreaterThanOrEqual(85);
  });

  it('G3 requiere aislar el compartimento correcto antes de los dos parches', () => {
    expect(isOxygenLeakResolved(0, 1, [true, true])).toBe(false);
    expect(isOxygenLeakResolved(1, 1, [true, false])).toBe(false);
    expect(isOxygenLeakResolved(1, 1, [true, true])).toBe(true);
  });

  it('G4 valida las tres conexiones ECLSS', () => {
    expect(isEclssComplete(new Set(['WATER>ELECTROLYZER_WATER', 'POWER>ELECTROLYZER_POWER']))).toBe(false);
    expect(isEclssComplete(new Set(['WATER>ELECTROLYZER_WATER', 'POWER>ELECTROLYZER_POWER', 'ELECTROLYZER_OXYGEN>TANK']))).toBe(true);
  });

  it('G5 exige tres coberturas y ambas zonas de tripulación', () => {
    expect(isShelterProtected([0, 1, 3])).toBe(false);
    expect(isShelterProtected([0, 1, 2])).toBe(true);
  });

  it('G6 usa muestras planetarias distintas y exige evidencia correcta', () => {
    const moon = scienceSamples('MOON');
    const mars = scienceSamples('MARS');
    expect(moon).toHaveLength(3);
    expect(mars).toHaveLength(3);
    expect(moon[1].sample).toBe('ANORTHOSITE');
    expect(mars[1].sample).toBe('MARS_SEDIMENTARY');
    expect(isScienceObservationValid(mars[1], 'GRAIN_IMAGER')).toBe(true);
    expect(isScienceClassificationValid(mars[1], 'VOLCANIC_ROCK')).toBe(false);
  });

  it('G7 requiere dos bandejas iluminadas, las de las plantas pequeñas', () => {
    expect(isGreenhouseLightingReady(new Set([0]))).toBe(false);
    expect(isGreenhouseLightingReady(new Set([0, 2]))).toBe(true);
    // La planta crecida no necesita la luz: encenderla ya no vale (antes valía cualquier par).
    expect(isGreenhouseLightingReady(new Set([0, 1]))).toBe(false);
    expect(isGreenhouseLightingReady(new Set([0, 1]), 2)).toBe(true);
    expect(isGreenhouseLightingReady(new Set([1, 2]), 2)).toBe(false);
  });

  it('G8 acepta solo dos datos pertinentes al problema', () => {
    const energy = COMMUNICATION_PROBLEMS.ENERGY_GUIDANCE;
    expect(isCommunicationMessageRelevant(energy.choice, energy.relevantFacts)).toBe(true);
    expect(isCommunicationMessageRelevant(energy.choice, ['ENERGY_LEVEL', 'CREW_MENU'])).toBe(false);
  });

  it('los ocho componentes solo preparan la acción y no mutan ni avanzan MissionState', () => {
    const files = [
      'PanelRepairGame.tsx', 'PanelCleaningGame.tsx', 'OxygenPatchGame.tsx', 'OxygenRecycleGame.tsx',
      'ShelterProtectionGame.tsx', 'ScienceResearchGame.tsx', 'GreenhouseGame.tsx', 'EarthCommunicationGame.tsx',
    ];
    for (const file of files) {
      const source = readFileSync(join(process.cwd(), 'src/features/space-minigames', file), 'utf8');
      expect(source, file).toContain('onReadyChange');
      expect(source, file).not.toContain('applyAction(');
      expect(source, file).not.toContain('advanceTurn(');
    }
  });

  it('el modal mantiene scroll y adaptación para escritorio y tablet', () => {
    const css = readFileSync(join(process.cwd(), 'src/features/space/space-game.css'), 'utf8');
    expect(css).toMatch(/\.intervention-console\s*\{[^}]*max-height:calc\(100dvh - 2rem\)[^}]*overflow:auto/);
    expect(css).toContain('@media (max-width:820px)');
    expect(css).toContain('.sample-rack');
    expect(css).toContain('.communication-scene');
  });
});
