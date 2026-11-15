import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  STORAGE_KEY,
  en,
  es,
  qu,
  no,
} from '../../src/i18n';

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
    expect(template).toBe('Confirm Base in {city}');
    const formatted = template.replace('{city}', 'Arequipa');
    expect(formatted).toBe('Confirm Base in Arequipa');
  });

  it('incluye la etiqueta del botón de inicio del constructor en los cuatro idiomas', () => {
    for (const dictionary of [en, es, qu, no]) {
      expect(dictionary.baseBuilder.confirmBaseBtn).toBeTruthy();
    }
  });
});
