import { describe, expect, it } from 'vitest';
import {
  ARCTIC_FACILITY_POSITIONS,
  FACILITY_POSITIONS,
  MAP_HEIGHT,
  MAP_WIDTH,
  computeSceneLayout,
  facilityLayoutFor,
} from '../../src/visual-kit/earthMapLayout';
import { alertTips, earnedMedals, resourceRanOut, starsFor } from '../../src/features/mission-results/kidReportRules';
import { TRAINING_SETTLE_MS } from '../../src/features/earth/minigames/TrainingFrame';
import { msg, resolveMessage, translate } from '../../src/i18n';

describe('Mapa de Tromsø: cada edificio en su plataforma', () => {
  // Rectángulos (lienzo lógico 1000 × 563) de la cara superior de las plataformas dibujadas en
  // arctic-research-base.webp, medidos con una cuadrícula sobre el fondo.
  const ARCTIC_PADS = [
    { x0: 165, x1: 350, y0: 135, y1: 235 },
    { x0: 555, x1: 730, y0: 135, y1: 235 },
    { x0: 68, x1: 265, y0: 290, y1: 400 },
    { x0: 630, x1: 825, y0: 295, y1: 400 },
    { x0: 320, x1: 570, y0: 390, y1: 520 },
  ];

  it('Tromsø usa sus propias posiciones (no las de Arequipa) y edificios más grandes', () => {
    const arctic = facilityLayoutFor('TROMSO');
    expect(arctic.positions).toBe(ARCTIC_FACILITY_POSITIONS);
    expect(arctic.scale).toBeGreaterThan(1);
    expect(facilityLayoutFor('AREQUIPA').positions).toBe(FACILITY_POSITIONS);
    expect(facilityLayoutFor('AREQUIPA').scale).toBe(1);
  });

  it('el centro de cada edificio cae dentro de su plataforma', () => {
    ARCTIC_FACILITY_POSITIONS.forEach(({ x, y }, index) => {
      const pad = ARCTIC_PADS[index];
      expect(x).toBeGreaterThan(pad.x0);
      expect(x).toBeLessThan(pad.x1);
      expect(y).toBeGreaterThan(pad.y0);
      expect(y).toBeLessThan(pad.y1);
    });
  });

  it('los marcadores numerados nunca se recortan en 16:9', () => {
    const { safe, positions, scale } = facilityLayoutFor('TROMSO');
    const layout = computeSceneLayout(1920, 1080, safe);
    for (const { y } of positions) {
      const pinTop = layout.y + (y - 110 * scale) * layout.scale;
      expect(pinTop).toBeGreaterThanOrEqual(-1);
    }
    expect(layout.width / layout.height).toBeCloseTo(MAP_WIDTH / MAP_HEIGHT, 3);
  });
});

describe('Entrenamientos: victoria una sola vez', () => {
  it('espera a que la solución se quede quieta antes de celebrar', () => {
    // Al girar una perilla se cruza la zona verde varias veces por segundo: tiene que haber pausa.
    expect(TRAINING_SETTLE_MS).toBeGreaterThanOrEqual(300);
    expect(TRAINING_SETTLE_MS).toBeLessThanOrEqual(800);
  });
});

describe('Informe para niños', () => {
  const base = {
    outcome: 'COMPLETED' as const,
    scientificObjectiveAchieved: true,
    score: { total: 80 },
    finalState: { energy: 50, oxygen: 50, foodSupply: 50, radiationExposure: 10 },
  };

  it('da 3 estrellas a una misión completa con buena puntuación', () => {
    expect(starsFor(base as never)).toBe(3);
  });
  it('da 2 estrellas si logró la ciencia con puntuación media o sin ciencia pero con 50+', () => {
    expect(starsFor({ ...base, score: { total: 60 } } as never)).toBe(2);
    expect(starsFor({ ...base, scientificObjectiveAchieved: false, score: { total: 55 } } as never)).toBe(2);
  });
  it('si se acabó un recurso (aire, energía, comida o radiación al límite) da 1 estrella', () => {
    expect(starsFor({ ...base, outcome: 'INTERRUPTED', score: { total: 99 }, finalState: { ...base.finalState, oxygen: 0 } } as never)).toBe(1);
    expect(starsFor({ ...base, outcome: 'INTERRUPTED', finalState: { ...base.finalState, radiationExposure: 100 } } as never)).toBe(1);
  });
  it('llegar al turno 5 sin la ciencia no cuenta como quedarse sin recursos', () => {
    const short = { ...base, outcome: 'INTERRUPTED', scientificObjectiveAchieved: false, score: { total: 55 } };
    expect(resourceRanOut(short.finalState as never)).toBe(false);
    expect(starsFor(short as never)).toBe(2);
  });
  it('«Para la próxima» agrupa por alerta y nombra el recurso que más perdió', () => {
    const tips = alertTips([
      { id: 'a', sourceAlertId: '1', alertKind: 'OXYGEN_LEAK', turn: 1, summary: '', resourceDelta: { oxygen: -8 } },
      { id: 'b', sourceAlertId: '2', alertKind: 'OXYGEN_LEAK', turn: 2, summary: '', resourceDelta: { oxygen: -14 } },
      { id: 'c', sourceAlertId: '3', alertKind: 'SOLAR_PANEL_DAMAGE', turn: 2, summary: '', resourceDelta: { energy: -5 } },
      { id: 'd', sourceAlertId: '4', turn: 3, summary: '', resourceDelta: { energy: -50 } }, // sin tipo: se ignora
    ] as never);
    expect(tips).toEqual([
      { kind: 'OXYGEN_LEAK', resourceLabelKey: 'missionControl.oxygen', lost: 22 },
      { kind: 'SOLAR_PANEL_DAMAGE', resourceLabelKey: 'missionControl.energy', lost: 5 },
    ]);
  });
  it('las medallas reflejan tripulación, ciencia, recursos y exploración', () => {
    const finalState = { energy: 50, oxygen: 45, shield: 60, foodSupply: 50, radiationExposure: 0, explorations: [], starsFound: ['G1'] };
    expect(earnedMedals({ outcome: 'COMPLETED', scientificObjectiveAchieved: false, finalState } as never))
      .toEqual({ crew: true, science: false, keeper: true, explorer: true });
    expect(earnedMedals({ outcome: 'INTERRUPTED', scientificObjectiveAchieved: false, finalState: { ...finalState, oxygen: 0, starsFound: [] } } as never))
      .toEqual({ crew: false, science: false, keeper: false, explorer: false });
  });
});

describe('Ayudas de radio en el idioma activo', () => {
  it('una referencia msg() se traduce al idioma que esté activo al mostrarse', () => {
    const ref = msg('radio.turnDone');
    expect(resolveMessage(ref, (key, params) => translate('es', key, params))).toMatch(/Finalizar turno/);
    expect(resolveMessage(ref, (key, params) => translate('en', key, params))).toMatch(/End turn/);
  });

  it('las referencias anidadas (recurso dentro del aviso) también cambian de idioma', () => {
    const ref = msg('radio.resourceLow', { resource: msg('missionControl.oxygen'), value: 12 });
    const es = resolveMessage(ref, (key, params) => translate('es', key, params));
    const en = resolveMessage(ref, (key, params) => translate('en', key, params));
    expect(es).toContain('12');
    expect(en).toContain('12');
    expect(es).not.toEqual(en);
  });

  it('las claves nuevas existen en los cuatro idiomas', () => {
    const keys = [
      'training.goalsTitle', 'training.winTitle', 'training.backToGreen', 'training.kitShort', 'training.goals.polar.heat',
      'missionControl.turnDoneTitle', 'missionControl.turnDoneBody', 'radio.turnDone', 'interventions.stepDone',
      'alerts.attend', 'kidReport.title', 'kidReport.medals.keeper.name', 'kidReport.level.critical',
    ];
    for (const lang of ['es', 'en', 'qu', 'no'] as const) {
      for (const key of keys) {
        const text = translate(lang, key, { closed: 1, limit: 450, count: 2, missing: 3, title: 'x', alert: 'y' });
        expect(text, `${lang}:${key}`).not.toMatch(/Texto no disponible|Text unavailable/);
      }
    }
  });
});
