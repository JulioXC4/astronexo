import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

// Cargar módulos TS directamente a través de Vite
const { isValidBackpack, TOOL_CATALOG } = await viteServer.ssrLoadModule('./src/game/contracts/types.ts');
const { LIMA_SOLAR_RECORDS } = await viteServer.ssrLoadModule('./src/data/nasa/powerData.ts');
const { DONKI_HISTORICAL_EVENTS, DEFAULT_DONKI_EVENT } = await viteServer.ssrLoadModule('./src/data/nasa/donkiData.ts');
const { buildVerifiedNasaDataset } = await viteServer.ssrLoadModule('./src/features/nasa/adapters.ts');
const { SUPPORTED_CITIES, DEFAULT_CITY } = await viteServer.ssrLoadModule('./src/data/nasa/cities.ts');
const { AVATAR_OPTIONS, DEFAULT_AVATAR } = await viteServer.ssrLoadModule('./src/data/avatars.ts');

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

test('NASA POWER - Verificación de datos históricos solares en Lima', () => {
  assert.equal(LIMA_SOLAR_RECORDS.cityId, 'LIMA');
  assert.equal(LIMA_SOLAR_RECORDS.days.length, 3, 'Deben existir exactamente 3 días históricos para comparar');

  for (const day of LIMA_SOLAR_RECORDS.days) {
    assert.ok(day.date.match(/^\d{4}-\d{2}-\d{2}$/), `Fecha inválida: ${day.date}`);
    assert.ok(day.irradianceKwhPerM2 > 0, `Irradiancia debe ser positiva: ${day.irradianceKwhPerM2}`);
    assert.equal(day.observation.source, 'POWER');
    assert.equal(day.observation.parameter, 'ALLSKY_SFC_SW_DWN');
    assert.equal(day.observation.unit, 'kW-hr/m²/day');
    assert.ok(day.observation.sourceUrl.includes('power.larc.nasa.gov'));
    assert.deepEqual(day.observation.coordinates, { latitude: -12.0464, longitude: -77.0428 });
  }

  // Comprobar variación estacional real: verano > equinoccio > invierno
  const [verano, equinoccio, invierno] = LIMA_SOLAR_RECORDS.days;
  assert.ok(verano.irradianceKwhPerM2 > equinoccio.irradianceKwhPerM2, 'Verano debe tener mayor radiación que equinoccio');
  assert.ok(equinoccio.irradianceKwhPerM2 > invierno.irradianceKwhPerM2, 'Equinoccio debe tener mayor radiación que invierno');
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

test('Adaptadores NASA - Generación de dataset verificado para SpaceGame', () => {
  const verifiedDataset = buildVerifiedNasaDataset(0);

  assert.equal(verifiedDataset.validation, 'VERIFIED');
  assert.equal(verifiedDataset.observations.length, 2, 'Debe contener 1 observación POWER y 1 DONKI');

  const sources = verifiedDataset.observations.map((o) => o.source);
  assert.ok(sources.includes('POWER'));
  assert.ok(sources.includes('DONKI'));
  assert.ok(verifiedDataset.note?.includes('NASA POWER'));
});

test('Ciudades y Avatares - Valores predeterminados y estructura', () => {
  assert.equal(DEFAULT_CITY.id, 'LIMA');
  assert.ok(SUPPORTED_CITIES.some((c) => c.id === 'LIMA'));
  assert.ok(SUPPORTED_CITIES.some((c) => c.id === 'AREQUIPA'));

  assert.equal(DEFAULT_AVATAR.id, 'ALBA');
  assert.ok(AVATAR_OPTIONS.length >= 4, 'Debe haber al menos 4 avatares de cadete');
});

test.after(async () => {
  await viteServer.close();
});
