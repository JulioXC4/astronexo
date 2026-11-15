import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  STORAGE_KEY,
  resolveTranslation,
  en,
  es,
  qu,
  no,
} from '../../src/i18n';

const dictionaries = { en, es, qu, no };

function flattenStrings(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.entries(value).reduce<Record<string, string>>((result, [key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return Object.assign(result, flattenStrings(child, path));
  }, {});
}

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

function findFixedSpanishJsx(source: string, fileName: string): string[] {
  const tree = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const spanish = /[áéíóúüñ¿¡]|\b(?:volver|misión|herramienta|objetivo|costo|oxígeno|energía|escudo|alerta|disponible|completada|bloqueada|bodega|equipo|invernadero|estación|turno|despegue|reiniciar|confirmar|ejecutar|cerrar|cargar|consecuencia)\b/i;
  const findings: string[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const text = node.getText(tree).replace(/\s+/g, ' ').trim();
      if (text && spanish.test(text)) findings.push(`${fileName}: ${text}`);
    }
    if (ts.isJsxAttribute(node)
      && ['aria-label', 'title', 'placeholder', 'alt'].includes(node.name.getText(tree))
      && node.initializer && ts.isStringLiteral(node.initializer)
      && spanish.test(node.initializer.text)) {
      findings.push(`${fileName}: ${node.name.getText(tree)}="${node.initializer.text}"`);
    }
    ts.forEachChild(node, visit);
  };

  visit(tree);
  return findings;
}

describe('Internationalization dictionaries and UI copy', () => {
  it('supports EN, ES, QU, and NO, with English as the default and fallback', () => {
    expect(SUPPORTED_LANGUAGES.map(({ code }) => code)).toEqual(['en', 'es', 'qu', 'no']);
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(FALLBACK_LANGUAGE).toBe('en');
    expect(STORAGE_KEY).toBe('astronexo_lang_v3');
  });

  it('marks only English and Spanish as reviewed', () => {
    expect(SUPPORTED_LANGUAGES.filter((language) => !language.isDraft).map(({ code }) => code)).toEqual(['en', 'es']);
    expect(SUPPORTED_LANGUAGES.filter((language) => language.isDraft).map(({ code }) => code)).toEqual(['qu', 'no']);
  });

  it('keeps English and Spanish dictionary paths and interpolation variables in parity', () => {
    const enStrings = flattenStrings(en);
    const esStrings = flattenStrings(es);
    expect(Object.keys(esStrings).sort()).toEqual(Object.keys(enStrings).sort());
    for (const key of Object.keys(enStrings)) {
      expect(esStrings[key], `interpolation mismatch at ${key}`).toBeTruthy();
      expect(placeholders(esStrings[key]), `interpolation mismatch at ${key}`).toEqual(placeholders(enStrings[key]));
    }
  });

  it('keeps QU and NO as sparse drafts with no obsolete dictionary paths', () => {
    const canonicalPaths = new Set(Object.keys(flattenStrings(en)));
    const coverages: Record<string, number> = {};
    for (const language of ['qu', 'no'] as const) {
      const draft = flattenStrings(dictionaries[language]);
      expect(Object.keys(draft).every((key) => canonicalPaths.has(key))).toBe(true);
      coverages[language] = Object.keys(draft).length / canonicalPaths.size;
      expect(coverages[language]).toBeGreaterThan(0);
      expect(coverages[language]).toBeLessThan(1);
    }
    expect(resolveTranslation(dictionaries, 'qu', 'station.mockup.previewNotice')).toBe(en.station.mockup.previewNotice);
    expect(resolveTranslation(dictionaries, 'no', 'earthMissions.preparationSaved', { cost: 2, resource: 'Energy' }))
      .toBe(en.earthMissions.preparationSaved.replace('{cost}', '2').replace('{resource}', 'Energy'));
  });

  it('falls back in English for a missing draft key and interpolates values', () => {
    expect(resolveTranslation(dictionaries, 'qu', 'missionControl.turnLabel', { turn: 2, maxTurns: 5 }))
      .toBe('TURN 2/5');
  });

  it('does not contain fixed Spanish labels in configured screens or their map labels', () => {
    const targets = [
      'src/features/mission-control/MissionControlView.tsx',
      'src/features/mission-control/AlertCard.tsx',
      'src/features/mission-control/ModuleCameras.tsx',
      'src/features/mission-results/MissionResultsView.tsx',
      'src/features/base-builder/BaseBuilderView.tsx',
      'src/features/space-minigames/InterventionDock.tsx',
      'src/features/space-minigames/InterventionGesture.tsx',
      'src/features/earth/minigames/SolarDetectiveGame.tsx',
      'src/features/earth/minigames/DarkMonthsGame.tsx',
      'src/features/earth/minigames/SolarWatchGame.tsx',
      'src/features/earth/minigames/AltitudeAcclimatizationGame.tsx',
      'src/features/earth/minigames/EclssTrainingGame.tsx',
      'src/features/earth/minigames/VeggieLabGame.tsx',
      'src/features/earth/minigames/ArcticGreenhouseGame.tsx',
      'src/features/earth/screens/LearnScreen.tsx',
      'src/features/earth/screens/EarthReturnScreen.tsx',
      'src/features/earth/screens/NextAdventureScreen.tsx',
      'src/features/earth/screens/StationModeModal.tsx',
      'src/features/earth/screens/PreparationMapScreen.tsx',
      'src/features/earth/screens/BackpackScreen.tsx',
      'src/features/earth/screens/DepartureScreen.tsx',
      'src/features/earth/screens/ArrivalScreen.tsx',
      'src/visual-kit/EarthBaseScene.tsx',
    ];
    const findings = targets.flatMap((relativePath) => {
      const absolutePath = resolve(process.cwd(), relativePath);
      return findFixedSpanishJsx(readFileSync(absolutePath, 'utf8'), relativePath);
    });
    expect(findings).toEqual([]);
  });
});
