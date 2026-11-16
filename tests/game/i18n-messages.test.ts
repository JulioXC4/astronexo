import { describe, expect, it } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  hasMessage,
  msg,
  resolveMessage,
  translate,
  type SupportedLanguage,
} from '../../src/i18n';
import { MODULE_CATALOG } from '../../src/game/config/modules';
import { INTERVENTIONS } from '../../src/game/config/interventions';
import { ALL_EARTH_MISSIONS } from '../../src/data/missions';
import { AREQUIPA_SOLAR_RECORDS, TROMSO_SOLAR_RECORDS } from '../../src/data/nasa/powerData';
import { advanceTurn, applyAction, createMission, getMissionResult } from '../../src/game';
import type { AlertKind, GameSetup, MissionResult, MissionState } from '../../src/game';

const languages = SUPPORTED_LANGUAGES.map((language) => language.code);
const translator = (language: SupportedLanguage) =>
  (key: string, params?: Record<string, string | number>) => translate(language, key, params);

const ALERT_KINDS: readonly AlertKind[] = [
  'PANEL_DAMAGE', 'DUSTY_PANELS', 'OXYGEN_LEAK', 'ENERGY_SHORTAGE', 'RADIATION_RISK',
  'GREENHOUSE_STRAIN', 'SCIENCE_OPPORTUNITY', 'MARS_DUST_STORM', 'COMMUNICATION_WINDOW',
];

function setup(destination: 'MOON' | 'MARS'): GameSetup {
  return {
    mode: 'SOLO',
    city: 'AREQUIPA',
    destination,
    completedEarthMissions: ['M1', 'M2', 'M3'],
    selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY'],
    selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
    scenarioId: 'H2_REPRODUCIBLE',
    difficulty: 'CALM',
    earthProfile: {
      avatarId: 'ALBA',
      fictionalName: 'Cóndor',
      trainings: ['SOLAR_DETECTIVE', 'ALTITUDE_ACCLIMATIZATION', 'CLOUDS_SUNS'].map((id) => ({
        id,
        name: msg(`map.facilities.${id}.name`),
        costDescription: msg(`map.facilities.${id}.cost`),
        effectOnSpaceMission: msg(`map.facilities.${id}.effect`),
      })),
    },
  } as GameSetup;
}

/** Juega cinco turnos: unos con intervención y otros ignorando alertas, para generar todo tipo de mensajes. */
function playAll(destination: 'MOON' | 'MARS'): { states: MissionState[]; result: MissionResult } {
  let state = createMission(setup(destination));
  const states = [state];
  for (let turn = 0; state.outcome === 'IN_PROGRESS' && turn < 12; turn += 1) {
    const alert = state.activeAlerts[0];
    state = turn % 2 === 0 && alert
      ? applyAction(state, { type: 'REPAIR_PANELS', targetId: alert.id })
      : applyAction(state, { type: 'SKIP_INTERVENTION' });
    states.push(state);
    state = advanceTurn(state);
    states.push(state);
  }
  const result = getMissionResult(state);
  if (!result) throw new Error('la guardia debe terminar en cinco turnos');
  return { states, result };
}

describe('mensajes traducibles del motor (msg / resolveMessage)', () => {
  it('un texto normal pasa igual y una referencia se traduce al idioma activo', () => {
    expect(resolveMessage('Hola', translator('en'))).toBe('Hola');
    expect(hasMessage(msg('hud.energy'))).toBe(true);
    expect(resolveMessage(msg('hud.energy'), translator('en'))).toBe('Energy');
    expect(resolveMessage(msg('hud.energy'), translator('es'))).toBe('Energía');
  });

  it('resuelve referencias incrustadas en frases y parámetros que son otras referencias', () => {
    const nested = msg('engine.alertConsequence', { alert: msg('alerts.OXYGEN_LEAK.title'), level: 2 });
    expect(resolveMessage(nested, translator('en'))).toBe('Oxygen leak applied level 2 consequences.');
    expect(resolveMessage(nested, translator('es'))).toBe('Fuga de oxígeno aplicó consecuencias de nivel 2.');
    expect(resolveMessage(`1) ${msg('hud.food')} 2) ${msg('hud.oxygen')}`, translator('en'))).toBe('1) Food 2) Oxygen');
  });

  it('cambiar de idioma cambia el mismo mensaje guardado sin volver a jugar', () => {
    const stored = msg('engine.cause.oxygen');
    const rendered = languages.map((language) => resolveMessage(stored, translator(language)));
    expect(new Set(rendered).size).toBe(languages.length);
  });
});

describe('todo el texto que el motor guarda se traduce en los cuatro idiomas', () => {
  for (const destination of ['MOON', 'MARS'] as const) {
    it(`guardia en ${destination}: sin marcadores sueltos ni textos no disponibles`, () => {
      const { states, result } = playAll(destination);
      const texts = [
        ...states.flatMap((state) => [
          ...state.decisions.map((decision) => decision.summary),
          ...state.unresolvedEvents.map((event) => event.summary),
          ...state.moduleOperations.map((operation) => operation.summary),
          ...state.activeAlerts.flatMap((alert) => [alert.title, alert.description, alert.consequencePreview]),
          state.lastFeedback?.message ?? '',
          state.communicationResponse ?? '',
        ]),
        result.interruptionCause ?? '',
        ...result.helpfulDecisions,
        ...result.harmfulDecisions,
        ...result.causeAndEffect,
        ...result.configurationConsequences,
        ...result.moduleReport.flatMap((entry) => [...entry.benefitsProvided, ...entry.relatedConsequences]),
      ].filter(Boolean);
      expect(texts.length).toBeGreaterThan(8);

      for (const language of languages) {
        for (const text of texts) {
          const resolved = resolveMessage(text, translator(language));
          expect(resolved, `${language}: ${text}`).not.toMatch(/[⟦⟧]/);
          expect(resolved, `${language}: ${text}`).not.toMatch(/Text unavailable|Texto no disponible|\{\w+\}/);
          // Fuera del español no debe quedar prosa española escrita a mano.
          if (language !== 'es') {
            expect(resolved, `${language}: ${text}`).not.toMatch(/\b(aplicó|atendida|Respuesta simulada|El balance incluye|Costo terrestre)\b/);
          }
        }
      }
    });
  }

  it('los textos del motor en inglés salen en inglés', () => {
    const { result } = playAll('MOON');
    const english = result.harmfulDecisions.map((text) => resolveMessage(text, translator('en'))).join(' ');
    expect(english).toMatch(/applied level \d consequences/);
  });
});

describe('claves dinámicas que el motor y la interfaz construyen en tiempo de ejecución', () => {
  const required: string[] = [
    ...ALERT_KINDS.flatMap((kind) => [`alerts.${kind}.title`, `alerts.${kind}.description`, `alertSkip.${kind}`]),
    ...MODULE_CATALOG.flatMap((module) => [`baseBuilder.modules.${module.id}.name`, `baseBuilder.modules.${module.id}.benefit`]),
    ...INTERVENTIONS.map((intervention) => `interventions.items.${intervention.id}.label`),
    ...Object.keys(ALL_EARTH_MISSIONS).flatMap((id) => [`map.facilities.${id}.name`, `map.facilities.${id}.cost`, `map.facilities.${id}.effect`]),
    ...[...AREQUIPA_SOLAR_RECORDS.days, ...TROMSO_SOLAR_RECORDS.days].map((day) => `powerDates.${day.date}`),
    ...Object.values(ALL_EARTH_MISSIONS).map((mission) => `tools.${mission.targetTool}.label`),
    'trainingOutcomes.explanation',
    ...['ALTITUDE_ACCLIMATIZATION', 'ARCTIC_GREENHOUSE', 'CLOUDS_SUNS', 'DARK_MONTHS_RESERVE', 'ECLSS_TRAINING', 'SOLAR_WATCH', 'VEGGIE_LAB']
      .flatMap((id) => [`trainingOutcomes.${id}.decision`, `trainingOutcomes.${id}.limitation`]),
  ];

  it('existen en inglés, español, quechua y noruego', () => {
    const missing: string[] = [];
    for (const language of languages) {
      for (const key of required) {
        const value = translate(language, key);
        if (value === 'Text unavailable' || value === 'Texto no disponible') missing.push(`${language}:${key}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
