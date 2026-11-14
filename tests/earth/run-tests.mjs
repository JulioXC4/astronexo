import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

// Cargar módulos TS directamente a través de Vite
const { isValidBackpack, TOOL_CATALOG } = await viteServer.ssrLoadModule('./src/game/contracts/types.ts');
const { AREQUIPA_SOLAR_RECORDS, TROMSO_SOLAR_RECORDS } = await viteServer.ssrLoadModule('./src/data/nasa/powerData.ts');
const { DONKI_HISTORICAL_EVENTS, DEFAULT_DONKI_EVENT } = await viteServer.ssrLoadModule('./src/data/nasa/donkiData.ts');
const { buildVerifiedNasaDataset } = await viteServer.ssrLoadModule('./src/features/nasa/adapters.ts');
const { SUPPORTED_CITIES, DEFAULT_CITY } = await viteServer.ssrLoadModule('./src/data/nasa/cities.ts');
const { AVATAR_OPTIONS, DEFAULT_AVATAR } = await viteServer.ssrLoadModule('./src/data/avatars.ts');
const { getMissionsForCity } = await viteServer.ssrLoadModule('./src/data/missions.ts');

test('Contratos - TOOL_CATALOG y regla 3 de 4 en mochila', () => {
  assert.equal(TOOL_CATALOG.length, 4, 'El catálogo debe tener exactamente 4 herramientas');

  // Válido: exactamente 3 herramientas distintas del catálogo
  assert.equal(isValidBackpack(['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT']), true);
  assert.equal(isValidBackpack(['LIFE_SUPPORT', 'SHELTER_KIT', 'CROP_KIT']), true);

  // Inválido: solo 2 herramientas
  assert.equal(isValidBackpack(['FOLDING_PANELS', 'LIFE_SUPPORT']), false);

  // Inválido: 4 herramientas
  assert.equal(isValidBackpack(['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT', 'CROP_KIT']), false);

  // Inválido: herramientas duplicadas
  assert.equal(isValidBackpack(['FOLDING_PANELS', 'FOLDING_PANELS', 'LIFE_SUPPORT']), false);

  // Inválido: herramienta no perteneciente al catálogo
  assert.equal(isValidBackpack(['FOLDING_PANELS', 'LIFE_SUPPORT', 'INVALID_ITEM']), false);
});

test('NASA POWER - Verificación de datos históricos solares en Arequipa y Tromsø', () => {
  // Arequipa
  assert.equal(AREQUIPA_SOLAR_RECORDS.cityId, 'AREQUIPA');
  assert.equal(AREQUIPA_SOLAR_RECORDS.days.length, 3, 'Arequipa debe tener 3 días históricos representativos');
  assert.equal(AREQUIPA_SOLAR_RECORDS.optimalTiltDegrees, 16);

  for (const day of AREQUIPA_SOLAR_RECORDS.days) {
    assert.ok(day.date.match(/^\d{4}-\d{2}-\d{2}$/), `Fecha inválida: ${day.date}`);
    assert.ok(day.irradianceKwhPerM2 > 0, `Irradiancia debe ser positiva: ${day.irradianceKwhPerM2}`);
    assert.equal(day.observation.source, 'POWER');
    assert.equal(day.observation.parameter, 'ALLSKY_SFC_SW_DWN');
    assert.equal(day.observation.unit, 'kW-hr/m²/day');
    assert.ok(day.observation.sourceUrl.includes('power.larc.nasa.gov'));
    assert.deepEqual(day.observation.coordinates, { latitude: -16.4090, longitude: -71.5375 });
  }

  // Tromsø
  assert.equal(TROMSO_SOLAR_RECORDS.cityId, 'TROMSO');
  assert.equal(TROMSO_SOLAR_RECORDS.days.length, 3, 'Tromsø debe tener 3 días históricos representativos');
  assert.equal(TROMSO_SOLAR_RECORDS.optimalTiltDegrees, 68);

  for (const day of TROMSO_SOLAR_RECORDS.days) {
    assert.ok(day.date.match(/^\d{4}-\d{2}-\d{2}$/), `Fecha inválida: ${day.date}`);
    assert.ok(day.irradianceKwhPerM2 >= 0, `Irradiancia Tromsø: ${day.irradianceKwhPerM2}`);
    assert.equal(day.observation.source, 'POWER');
    assert.deepEqual(day.observation.coordinates, { latitude: 69.6492, longitude: 18.9553 });
  }
});

test('NASA DONKI - Verificación de eventos históricos de clima espacial', () => {
  assert.ok(DONKI_HISTORICAL_EVENTS.length >= 2, 'Deben haber al menos 2 eventos históricos DONKI');

  const cmeEvent = DONKI_HISTORICAL_EVENTS.find((e) => e.eventType === 'CME');
  assert.ok(cmeEvent, 'Debe existir un evento histórico CME');
  assert.equal(cmeEvent.eventId, '2024-05-10T06:54:00-CME-001');
  assert.ok(cmeEvent.sourceUrl.includes('ccmc.gsfc.nasa.gov/DONKI'));
  assert.equal(cmeEvent.recommendedAction.outcomeType, 'CORRECT');

  const flareEvent = DONKI_HISTORICAL_EVENTS.find((e) => e.eventType === 'FLR');
  assert.ok(flareEvent, 'Debe existir un evento de llamarada solar FLR');
  assert.equal(flareEvent.eventId, '2024-02-22T22:08:00-FLR-001');

  assert.equal(DEFAULT_DONKI_EVENT.eventId, '2024-05-10T06:54:00-CME-001');
});

test('Misiones V3.0 - 5 misiones por ciudad (3 comunes, 2 específicas)', () => {
  const arequipaMissions = getMissionsForCity('AREQUIPA');
  const tromsoMissions = getMissionsForCity('TROMSO');

  assert.equal(arequipaMissions.length, 5, 'Arequipa debe tener exactamente 5 misiones');
  assert.equal(tromsoMissions.length, 5, 'Tromsø debe tener exactamente 5 misiones');

  // Misiones específicas de Arequipa
  assert.ok(arequipaMissions.some(m => m.id === 'ALTITUDE_ACCLIMATIZATION'), 'Arequipa debe tener aclimatación de altura');
  assert.ok(arequipaMissions.some(m => m.id === 'VEGGIE_LAB'), 'Arequipa debe tener laboratorio de cultivos áridos');

  // Misiones específicas de Tromsø
  assert.ok(tromsoMissions.some(m => m.id === 'DARK_MONTHS_RESERVE'), 'Tromsø debe tener reserva de meses oscuros');
  assert.ok(tromsoMissions.some(m => m.id === 'ARCTIC_GREENHOUSE'), 'Tromsø debe tener invernadero ártico');

  // Misiones comunes
  const arequipaIds = new Set(arequipaMissions.map(m => m.id));
  const commonInBoth = tromsoMissions.filter(m => arequipaIds.has(m.id));
  assert.equal(commonInBoth.length, 3, 'Deben compartir exactamente 3 misiones comunes');

  // Cada misión debe proporcionar una herramienta de catálogo
  const validToolIds = TOOL_CATALOG.map(t => t.id);
  for (const m of [...arequipaMissions, ...tromsoMissions]) {
    assert.ok(validToolIds.includes(m.targetTool), `Herramienta ${m.targetTool} debe ser de TOOL_CATALOG`);
    assert.ok(m.effectOnSpaceMission.length > 0, 'Debe describir efecto espacial');
    assert.ok(m.costDescription.length > 0, 'Debe describir costo de la decisión');
  }
});

test('Adaptadores NASA - Generación de dataset verificado para SpaceGame', () => {
  const verifiedDataset = buildVerifiedNasaDataset(0, 'AREQUIPA');

  assert.equal(verifiedDataset.validation, 'VERIFIED');
  assert.equal(verifiedDataset.observations.length, 2, 'Debe contener 1 observación POWER y 1 DONKI');

  const sources = verifiedDataset.observations.map((o) => o.source);
  assert.ok(sources.includes('POWER'));
  assert.ok(sources.includes('DONKI'));
  assert.ok(verifiedDataset.note?.includes('NASA POWER'));
});

test('Ciudades V3.0 - Solo Arequipa y Tromsø', () => {
  assert.equal(SUPPORTED_CITIES.length, 2, 'Solo deben existir 2 ciudades oficiales');
  assert.equal(DEFAULT_CITY.id, 'AREQUIPA');
  assert.ok(SUPPORTED_CITIES.some((c) => c.id === 'AREQUIPA'));
  assert.ok(SUPPORTED_CITIES.some((c) => c.id === 'TROMSO'));
  assert.equal(SUPPORTED_CITIES.some((c) => c.id === 'LIMA'), false, 'Lima no debe estar en V3.0');

  assert.equal(DEFAULT_AVATAR.id, 'ALBA');
  assert.ok(AVATAR_OPTIONS.length >= 4, 'Debe haber al menos 4 avatares de cadete');
});

test.after(async () => {
  await viteServer.close();
});
