import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, it, expect, vi } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  STORAGE_KEY,
  en,
  es,
  qu,
  no,
  translate,
} from '../../src/i18n';

type StringDictionary = Record<string, string>;

function flattenStrings(value: unknown, prefix = '', target: StringDictionary = {}): StringDictionary {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return target;
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') target[path] = child;
    else flattenStrings(child, path, target);
  }
  return target;
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.[tj]sx?$/.test(entry.name) ? [path] : [];
  });
}

interface TranslationCall {
  readonly file: string;
  readonly line: number;
  readonly key: string;
  readonly params: ReadonlySet<string>;
}

function translationCalls(): TranslationCall[] {
  const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '../../src');
  return sourceFiles(srcRoot).flatMap((file) => {
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const calls: TranslationCall[] = [];
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node)
        && ts.isIdentifier(node.expression)
        && node.expression.text === 't'
        && ts.isStringLiteralLike(node.arguments[0])) {
        const params = new Set<string>();
        const paramsArgument = node.arguments[1];
        if (paramsArgument && ts.isObjectLiteralExpression(paramsArgument)) {
          for (const property of paramsArgument.properties) {
            if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
              params.add(property.name.getText(source).replace(/^['"]|['"]$/g, ''));
            }
          }
        }
        calls.push({
          file,
          line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
          key: node.arguments[0].text,
          params,
        });
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    return calls;
  });
}

const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);

describe('Sistema de Internacionalización (i18n) v3.0', () => {
  it('soporta exactamente los cuatro idiomas requeridos: en, es, qu, no', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(4);
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(['en', 'es', 'qu', 'no']);
  });

  it('define inglés como idioma principal y predeterminado (RF-01)', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(FALLBACK_LANGUAGE).toBe('en');
    expect(STORAGE_KEY).toBe('astronexo_lang_v3');
  });

  it('marca inglés y español como verificados y estables', () => {
    const enInfo = SUPPORTED_LANGUAGES.find((l) => l.code === 'en')!;
    const esInfo = SUPPORTED_LANGUAGES.find((l) => l.code === 'es')!;

    expect(enInfo.isDraft).toBe(false);
    expect(esInfo.isDraft).toBe(false);
  });

  it('marca quechua y noruego como borradores pedagógicos pendientes de validación', () => {
    const quInfo = SUPPORTED_LANGUAGES.find((l) => l.code === 'qu')!;
    const noInfo = SUPPORTED_LANGUAGES.find((l) => l.code === 'no')!;

    expect(quInfo.isDraft).toBe(true);
    expect(quInfo.varietyLabel).toContain('Quechua Sureño');
    expect(quInfo.draftNotice).toBeDefined();

    expect(noInfo.isDraft).toBe(true);
    expect(noInfo.varietyLabel).toContain('Bokmål');
    expect(noInfo.draftNotice).toBeDefined();
  });

  it('contiene diccionarios completos y estructurados para cada idioma', () => {
    const requiredSections = [
      'common',
      'welcome',
      'cities',
      'destinations',
      'avatars',
      'briefing',
      'map',
      'minigames',
      'flight',
      'baseBuilder',
      'missionControl',
      'interventions',
      'results',
      'return',
      'nextAdventure',
      'learn',
      'station',
      'languageSelector',
    ];

    for (const section of requiredSections) {
      expect(en).toHaveProperty(section);
      expect(es).toHaveProperty(section);
      expect(qu).toHaveProperty(section);
      expect(no).toHaveProperty(section);
    }
  });

  it('preserva identificadores técnicos y de contratos sin traducir internamente', () => {
    // Los contratos del motor deben permanecer inalterados
    expect(en.destinations.moon.name).toContain('Moon');
    expect(es.destinations.moon.name).toContain('Luna');
    expect(qu.destinations.moon.name).toContain('Killa');
    expect(no.destinations.moon.name).toContain('Månen');
  });

  it('soporta interpolación de parámetros en plantillas dinámicas', () => {
    const template = en.cities.confirmBase;
    expect(template).toBe('Train in {city}');
    const formatted = template.replace('{city}', 'Arequipa');
    expect(formatted).toBe('Train in Arequipa');
  });

  it('incluye las etiquetas usadas por el constructor y el informe en los cuatro idiomas', () => {
    for (const dictionary of [en, es, qu, no]) {
      expect(dictionary.baseBuilder.confirmBaseBtn).toBeTruthy();
      expect(dictionary.results.scoreLabel).toBeTruthy();
      expect(dictionary.results.finalReportTitle).toBeTruthy();
    }
  });

  it('mantiene las claves y placeholders aprobados sincronizados entre inglés y español', () => {
    const english = flattenStrings(en);
    const spanish = flattenStrings(es);

    expect(Object.keys(english).sort()).toEqual(Object.keys(spanish).sort());
    for (const key of Object.keys(english)) {
      expect(placeholders(english[key]).sort(), key).toEqual(placeholders(spanish[key]).sort());
    }
  });

  it('quechua y noruego tienen las mismas claves y marcadores que inglés: nunca se mezclan idiomas', () => {
    const english = flattenStrings(en);
    for (const [name, dictionary] of [['es', es], ['qu', qu], ['no', no]] as const) {
      const translated = flattenStrings(dictionary);
      const missing = Object.keys(english).filter((key) => !(key in translated));
      const extra = Object.keys(translated).filter((key) => !(key in english));
      expect(missing, `${name}: claves sin traducir`).toEqual([]);
      expect(extra, `${name}: claves que ya no existen en inglés`).toEqual([]);
      for (const key of Object.keys(english)) {
        expect(placeholders(translated[key]).sort(), `${name}:${key}`).toEqual(placeholders(english[key]).sort());
        expect(translated[key].trim().length, `${name}:${key} vacío`).toBeGreaterThan(0);
      }
    }
  });

  it('valida automáticamente todas las claves literales y sus interpolaciones en src', () => {
    const english = flattenStrings(en);
    const spanish = flattenStrings(es);
    const failures: string[] = [];

    for (const call of translationCalls()) {
      const location = `${call.file}:${call.line}`;
      if (!english[call.key] || !spanish[call.key]) {
        failures.push(`${location} usa una clave inexistente: ${call.key}`);
        continue;
      }
      const missingParams = placeholders(english[call.key]).filter((name) => !call.params.has(name));
      if (missingParams.length > 0) {
        failures.push(`${location} no interpola ${missingParams.join(', ')} en ${call.key}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it('nunca devuelve claves crudas ni placeholders sin resolver', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(translate('en', 'test.missing.translation')).toBe('Text unavailable');
    expect(translate('es', 'test.missing.translation')).toBe('Texto no disponible');
    expect(translate('en', 'avatars.confirmAvatar')).toBe('Choose');
    expect(translate('en', 'avatars.confirmAvatar')).not.toMatch(/\{\w+\}/);
    expect(warning).toHaveBeenCalled();
    warning.mockRestore();
  });
});
