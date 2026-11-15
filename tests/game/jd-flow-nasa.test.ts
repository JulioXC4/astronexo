import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildEarthV3Setup } from '../../src/features/earth/earthToSpace';
import { createTrainingOutcome } from '../../src/features/earth/trainingOutcome';
import { getMissionsForCity } from '../../src/data/missions';
import { applyPowerSnapshot, AREQUIPA_SOLAR_RECORDS, TROMSO_SOLAR_RECORDS } from '../../src/data/nasa/powerData';
import { applyDonkiSnapshot, DEFAULT_DONKI_EVENT, pickSnapshotCme } from '../../src/data/nasa/donkiData';
import { buildSpaceWeatherContext, difficultyForCmeSpeed } from '../../src/features/nasa/spaceWeather';
import { recommendedReservePercent, reserveMismatch } from '../../src/features/earth/minigames/CloudsSunsGame';
import { SoloSpaceGame } from '../../src/features/space/SoloSpaceGame';
import { I18nProvider } from '../../src/i18n';
import {
  advanceTurn, applyAction, createMission, getMissionResult, isValidGameSetup, isValidPreBuildGameSetup,
} from '../../src/game';
import type { City, Destination, GameSetup, ModuleId } from '../../src/game';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const MODULES: readonly ModuleId[] = ['SOLAR_STORAGE', 'REINFORCED_LIFE_SUPPORT', 'STORM_SHELTER'];

function route(city: City, destination: Destination, picks: readonly number[] = [0, 1, 2]): GameSetup {
  const missions = getMissionsForCity(city);
  const chosen = picks.map((index) => missions[index]);
  const outcomes = chosen.map((mission) => createTrainingOutcome(
    mission.id, `Decisión ${mission.id}`, 'energy', 1, 'Costo de prueba.',
  ));
  return buildEarthV3Setup({
    city, destination, avatarId: 'ALBA', fictionalName: 'Cóndor',
    completedMissions: chosen.map((mission) => mission.id),
    earnedTools: chosen.map((mission) => mission.targetTool),
    selectedModules: MODULES, trainingOutcomes: outcomes,
  });
}

describe('Flujo JD: preparación conservada hasta la guardia', () => {
  it.each([
    ['AREQUIPA', 'MOON'], ['AREQUIPA', 'MARS'], ['TROMSO', 'MOON'], ['TROMSO', 'MARS'],
  ] as const)('%s → %s conserva módulos, ciudad, destino, herramientas y entrenamiento', (city, destination) => {
    const setup = route(city, destination);
    expect(setup.selectedModules).toEqual(MODULES);
    expect(setup.city).toBe(city);
    expect(setup.destination).toBe(destination);
    expect(setup.selectedTools).toHaveLength(3);
    expect(setup.earthProfile?.outcomes).toHaveLength(3);
    expect(setup.earthProfile?.trainings).toHaveLength(3);
    expect(isValidGameSetup(setup)).toBe(true);
    const mission = createMission(setup);
    expect(mission.selectedModules).toEqual(MODULES);
    expect(mission.setup.earthProfile?.fictionalName).toBe('Cóndor');
  });

  it('exige tres módulos válidos antes de crear la preparación', () => {
    const missions = getMissionsForCity('AREQUIPA').slice(0, 3);
    const base = {
      city: 'AREQUIPA', destination: 'MOON', avatarId: 'ALBA', fictionalName: 'Cóndor',
      completedMissions: missions.map((mission) => mission.id),
      earnedTools: missions.map((mission) => mission.targetTool),
    } as const;
    expect(() => buildEarthV3Setup({ ...base, selectedModules: [] })).toThrow();
    expect(() => buildEarthV3Setup({ ...base, selectedModules: ['SOLAR_STORAGE', 'SOLAR_STORAGE', 'GREENHOUSE'] })).toThrow();
    expect(() => buildEarthV3Setup({ ...base, selectedModules: ['SOLAR_STORAGE', 'GREENHOUSE'] })).toThrow();
  });

  it('el catálogo JD ofrece cinco entrenamientos por ciudad con herramienta válida', () => {
    for (const city of ['AREQUIPA', 'TROMSO'] as const) {
      const missions = getMissionsForCity(city);
      expect(missions).toHaveLength(5);
      expect(new Set(missions.map((mission) => mission.id)).size).toBe(5);
      expect(missions.filter((mission) => !mission.isCitySpecific)).toHaveLength(2);
    }
  });

  it('la guardia arranca sin volver a mostrar el constructor cuando ya hay tres módulos', () => {
    const wrap = (setup: GameSetup) => renderToString(
      createElement(I18nProvider, null, createElement(SoloSpaceGame, { setup, onFinish: () => undefined })),
    );
    const complete = wrap(route('TROMSO', 'MARS'));
    expect(complete).not.toContain('builder-shell');
    const preBuild = wrap({ ...route('TROMSO', 'MARS'), selectedModules: [] });
    expect(isValidPreBuildGameSetup({ ...route('TROMSO', 'MARS'), selectedModules: [] })).toBe(true);
    expect(preBuild).toContain('builder-shell'); // compatibilidad con la ruta de demostración
  });

  it('cinco turnos acumulan consecuencias; la interrupción conserva puntuación parcial', () => {
    let state = createMission(route('AREQUIPA', 'MOON'));
    for (let guard = 0; guard < 5 && state.outcome === 'IN_PROGRESS'; guard++) {
      state = advanceTurn(applyAction(state, { type: 'SKIP_INTERVENTION' }));
    }
    expect(state.completedTurns).toBeLessThanOrEqual(5);
    const result = getMissionResult(state);
    expect(result).not.toBeNull();
    expect(result!.score.total).toBeGreaterThanOrEqual(0);
    expect(result!.turnsReached).toBeLessThanOrEqual(5);
    expect(result!.finalState.setup.spaceWeather?.event.eventType).toBe('CME');
  });
});

describe('NASA DONKI: evento real separado de la regla simulada', () => {
  it('fija la dificultad con bandas reproducibles de velocidad CME', () => {
    expect(difficultyForCmeSpeed(1018).difficulty).toBe('STORMY');
    expect(difficultyForCmeSpeed(717).difficulty).toBe('ACTIVE');
    expect(difficultyForCmeSpeed(300).difficulty).toBe('CALM');
    expect(buildSpaceWeatherContext()).toEqual(buildSpaceWeatherContext());
  });

  it('el GameSetup trae el evento original y la regla aplicada, y la dificultad sale de la regla', () => {
    const setup = route('TROMSO', 'MOON');
    const weather = setup.spaceWeather!;
    expect(weather.event.value).toBe(DEFAULT_DONKI_EVENT.observation.value);
    expect(weather.event.sourceUrl).toBe(DEFAULT_DONKI_EVENT.sourceUrl);
    expect(weather.rule.ruleId).toBe('CME_SPEED_BANDS_V1');
    expect(setup.difficulty).toBe(weather.rule.difficulty);
    const result = (() => {
      let state = createMission(setup);
      while (state.outcome === 'IN_PROGRESS') state = advanceTurn(applyAction(state, { type: 'SKIP_INTERVENTION' }));
      return getMissionResult(state)!;
    })();
    expect(result.score.difficultyFactor).toBe(1.15);
  });

  it('un snapshot válido actualiza la CME y uno inválido se ignora', () => {
    const valid = {
      fetchedAt: '2026-11-15', requestUrl: 'https://api.nasa.gov/DONKI/CME?startDate=2024-05-09',
      events: [{ activityID: 'X-CME-1', type: 'CME' as const, startTime: '2024-05-10T07:12:00Z', value: 1100, unit: 'km/s', link: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/1/-1' }],
    };
    const updated = applyDonkiSnapshot(DEFAULT_DONKI_EVENT, valid);
    expect(updated.observation.status).toBe('UPDATED');
    expect(updated.observation.value).toBe(1100);
    const bad = { ...valid, events: [{ ...valid.events[0], value: -5 }] };
    expect(pickSnapshotCme(bad)).toBeNull();
    expect(applyDonkiSnapshot(DEFAULT_DONKI_EVENT, bad)).toBe(DEFAULT_DONKI_EVENT);
    expect(pickSnapshotCme({ ...valid, events: [{ ...valid.events[0], link: 'https://evil.example/x' }] })).toBeNull();
    expect(pickSnapshotCme({ ...valid, fetchedAt: null })).toBeNull();
  });
});

describe('NASA POWER: trazabilidad, snapshot y respaldo', () => {
  const local = TROMSO_SOLAR_RECORDS;
  const dates = local.days.map((day) => day.date);

  it('cada registro conserva valor, unidad, fecha, ciudad, coordenadas, fuente, URL, obtención y estado', () => {
    for (const dataset of [AREQUIPA_SOLAR_RECORDS, TROMSO_SOLAR_RECORDS]) {
      for (const day of dataset.days) {
        const o = day.observation;
        expect(o.source).toBe('POWER');
        expect(o.parameter).toBe('ALLSKY_SFC_SW_DWN');
        expect(typeof o.value).toBe('number');
        expect(o.unit).toContain('kW-hr');
        expect(o.observedAt).toBe(day.date);
        expect(o.cityId).toBe(dataset.cityId);
        expect(o.coordinates).toBeDefined();
        expect(o.sourceUrl).toContain('power.larc.nasa.gov/api/temporal/daily/point');
        expect(o.fetchedAt).toBeTruthy();
        expect(['HISTORICAL', 'UPDATED', 'FALLBACK']).toContain(o.status);
      }
    }
  });

  it('un snapshot completo marca UPDATED, uno con -999 marca FALLBACK y sin snapshot es histórico', () => {
    const file = {
      fetchedAt: '2026-11-15',
      cities: { TROMSO: { days: dates.map((date, index) => ({ date, value: index + 0.5, requestUrl: `https://power.larc.nasa.gov/api/temporal/daily/point?start=${date.replaceAll('-', '')}` })) } },
    };
    const updated = applyPowerSnapshot(local, file);
    expect(updated.days.every((day) => day.observation.status === 'UPDATED')).toBe(true);
    expect(updated.days[1].irradianceKwhPerM2).toBe(1.5);
    expect(updated.days[1].observation.value).toBe(1.5);

    const broken = { ...file, cities: { TROMSO: { ...file.cities.TROMSO, days: file.cities.TROMSO.days.map((d, i) => (i === 0 ? { ...d, value: -999 } : d)) } } };
    const fallback = applyPowerSnapshot(local, broken);
    expect(fallback.days.every((day) => day.observation.status === 'FALLBACK')).toBe(true);
    expect(fallback.days.map((day) => day.irradianceKwhPerM2)).toEqual(local.days.map((day) => day.irradianceKwhPerM2));

    const none = applyPowerSnapshot(local, { fetchedAt: null, cities: {} });
    expect(none.days.every((day) => day.observation.status === 'HISTORICAL')).toBe(true);
  });

  it('Nubes y soles usa los valores POWER de la ciudad para decidir la reserva', () => {
    const arequipa = AREQUIPA_SOLAR_RECORDS.days.map((day) => day.irradianceKwhPerM2);
    const tromso = TROMSO_SOLAR_RECORDS.days.map((day) => day.irradianceKwhPerM2);
    expect(recommendedReservePercent(arequipa)).toBeLessThan(recommendedReservePercent(tromso));
    expect(reserveMismatch(recommendedReservePercent(tromso), tromso)).toBe(0);
    expect(reserveMismatch(50, arequipa)).toBeGreaterThan(25);
  });
});

describe('Seguridad: la clave NASA no se expone', () => {
  function files(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : files(path);
      return /\.(ts|tsx|mjs|js|json|css|html)$/.test(entry.name) ? [path] : [];
    });
  }

  it('no hay VITE_NASA_API_KEY, claves literales ni uso de NASA_API_KEY dentro de src/', () => {
    for (const file of files(join(root, 'src'))) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/VITE_NASA/);
      expect(text, file).not.toMatch(/NASA_API_KEY/);
      expect(text, file).not.toMatch(/api_key=(?!REDACTED)[A-Za-z0-9]{20,}/);
    }
  });

  it('el script solo lee la clave de process.env y los snapshots no la contienen', () => {
    const script = readFileSync(join(root, 'scripts/update-nasa-snapshots.mjs'), 'utf8');
    expect(script).toContain('process.env.NASA_API_KEY');
    expect(script).not.toMatch(/api_key=[A-Za-z0-9]{20,}/);
    for (const name of ['power.json', 'donki.json']) {
      expect(readFileSync(join(root, 'src/data/nasa/snapshots', name), 'utf8')).not.toMatch(/api_key/i);
    }
    const dist = join(root, 'dist');
    if (existsSync(dist)) {
      for (const file of files(dist)) expect(readFileSync(file, 'utf8'), file).not.toMatch(/api_key=[A-Za-z0-9]{20,}/);
    }
  });
});
