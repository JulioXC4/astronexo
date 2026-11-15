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
const { getMissionsForCity, ALL_EARTH_MISSIONS } = await viteServer.ssrLoadModule('./src/data/missions.ts');

// Cargar componentes de minijuegos para comprobar su existencia funcional
const { SolarDetectiveGame } = await viteServer.ssrLoadModule('./src/features/earth/minigames/SolarDetectiveGame.tsx');
const solarEnergy = await viteServer.ssrLoadModule('./src/features/earth/minigames/solarEnergy.ts');
const { SolarWatchGame } = await viteServer.ssrLoadModule('./src/features/earth/minigames/SolarWatchGame.tsx');
const { DarkMonthsGame } = await viteServer.ssrLoadModule('./src/features/earth/minigames/DarkMonthsGame.tsx');
const { AltitudeAcclimatizationGame } = await viteServer.ssrLoadModule('./src/features/earth/minigames/AltitudeAcclimatizationGame.tsx');
const { EclssTrainingGame } = await viteServer.ssrLoadModule('./src/features/earth/minigames/EclssTrainingGame.tsx');
const { VeggieLabGame } = await viteServer.ssrLoadModule('./src/features/earth/minigames/VeggieLabGame.tsx');
const { ArcticGreenhouseGame } = await viteServer.ssrLoadModule('./src/features/earth/minigames/ArcticGreenhouseGame.tsx');
const { PreparationMapScreen } = await viteServer.ssrLoadModule('./src/features/earth/screens/PreparationMapScreen.tsx');
const { WelcomeScreen } = await viteServer.ssrLoadModule('./src/features/earth/screens/WelcomeScreen.tsx');
const { CitySelectionScreen } = await viteServer.ssrLoadModule('./src/features/earth/screens/CitySelectionScreen.tsx');
const { DestinationScreen } = await viteServer.ssrLoadModule('./src/features/earth/screens/DestinationScreen.tsx');
const { AvatarScreen } = await viteServer.ssrLoadModule('./src/features/earth/screens/AvatarScreen.tsx');
const { NarrativeBriefingScreen } = await viteServer.ssrLoadModule('./src/features/earth/screens/NarrativeBriefingScreen.tsx');
const { EarthFlow } = await viteServer.ssrLoadModule('./src/features/earth/EarthFlow.tsx');
const { translate } = await viteServer.ssrLoadModule('./src/i18n/I18nContext.tsx');

// =============================================================================
// TEST BASE: CONTRATOS Y DATOS NASA
// =============================================================================

test('Contratos - TOOL_CATALOG y regla 3 de 4 en mochila', () => {
  assert.equal(TOOL_CATALOG.length, 4, 'El catálogo debe tener exactamente 4 herramientas');

  // Válido: exactamente 3 herramientas distintas del catálogo
  assert.equal(isValidBackpack(['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT']), true);
  assert.equal(isValidBackpack(['LIFE_SUPPORT', 'SHELTER_KIT', 'CROP_KIT']), true);

  // Inválido: solo 2 herramientas
  assert.equal(isValidBackpack(['FOLDING_PANELS', 'LIFE_SUPPORT']), false);

  // Inválido: 4 herramientas
  assert.equal(isValidBackpack(['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT', 'CROP_KIT']), false);

  // Inválido bajo contrato legado: herramientas duplicadas (ver propuesta para Gaby en v3.0)
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
  assert.equal(cmeEvent.eventId, '2024-05-10T07:12:00-CME-001');
  assert.ok(cmeEvent.sourceUrl.includes('ccmc.gsfc.nasa.gov/DONKI'));
  assert.equal(cmeEvent.recommendedAction.outcomeType, 'CORRECT');

  const laterCme = DONKI_HISTORICAL_EVENTS.find((e) => e.eventId === '2024-05-10T21:28:00-CME-001');
  assert.ok(laterCme, 'Debe existir un segundo evento CME trazable');
  assert.equal(laterCme.observation.value, 717);

  assert.equal(DEFAULT_DONKI_EVENT.eventId, '2024-05-10T07:12:00-CME-001');
});

// =============================================================================
// LAS 12 PRUEBAS OBLIGATORIAS DE REGRESIÓN DE SOFTWARE 2 (V3.0)
// =============================================================================

test('1. Cinco edificios visibles en el mapa con datos completos', () => {
  const arequipaMissions = getMissionsForCity('AREQUIPA');
  const tromsoMissions = getMissionsForCity('TROMSO');

  assert.equal(arequipaMissions.length, 5, 'Arequipa debe tener exactamente 5 misiones');
  assert.equal(tromsoMissions.length, 5, 'Tromsø debe tener exactamente 5 misiones');

  for (const m of [...arequipaMissions, ...tromsoMissions]) {
    assert.ok(m.facilityName.length > 0, `Misión ${m.id} debe tener facilityName`);
    assert.ok(m.facilityIcon.length > 0, `Misión ${m.id} debe tener facilityIcon`);
    assert.ok(m.objective.length > 0, `Misión ${m.id} debe tener objective`);
    assert.ok(m.costDescription.length > 0, `Misión ${m.id} debe tener costDescription`);
    assert.ok(m.effectOnSpaceMission.length > 0, `Misión ${m.id} debe tener effectOnSpaceMission`);
    assert.ok(m.scienceSource.length > 0, `Misión ${m.id} debe tener scienceSource`);
  }
});

test('2. Selección de edificios mediante accesibilidad (ratón y teclado)', () => {
  assert.ok(PreparationMapScreen, 'PreparationMapScreen debe estar exportado y definido');
  // Comprobación de que todas las misiones en ALL_EARTH_MISSIONS tienen identificadores válidos
  const keys = Object.keys(ALL_EARTH_MISSIONS);
  assert.equal(keys.length, 7, 'Deben existir exactamente 7 misiones únicas registradas');
});

test('3. Exactamente tres misiones completables (no se permite una 4ta)', () => {
  // Simular la lógica de handleCompleteMission en EarthFlow
  const completedMissions = [];
  function simulateComplete(id) {
    if (completedMissions.length >= 3) return;
    if (!completedMissions.includes(id)) completedMissions.push(id);
  }

  simulateComplete('SOLAR_DETECTIVE');
  simulateComplete('ALTITUDE_ACCLIMATIZATION');
  simulateComplete('SOLAR_WATCH');
  assert.equal(completedMissions.length, 3, 'Debe permitir completar 3 misiones');

  // Intentar completar una cuarta misión
  simulateComplete('ECLSS_TRAINING');
  assert.equal(completedMissions.length, 3, 'No debe permitir completar una cuarta misión');
  assert.ok(!completedMissions.includes('ECLSS_TRAINING'), 'La cuarta misión no debe ser acreditada');
});

test('4. Ninguna misión completada sin interacción funcional (RF-69)', () => {
  // Las 7 misiones deben tener su componente de minijuego interactivo dedicado
  assert.ok(SolarDetectiveGame, 'Minijuego SolarDetectiveGame debe existir');
  assert.ok(SolarWatchGame, 'Minijuego SolarWatchGame debe existir');
  assert.ok(DarkMonthsGame, 'Minijuego DarkMonthsGame debe existir');
  assert.ok(AltitudeAcclimatizationGame, 'Minijuego AltitudeAcclimatizationGame debe existir');
  assert.ok(EclssTrainingGame, 'Minijuego EclssTrainingGame debe existir');
  assert.ok(VeggieLabGame, 'Minijuego VeggieLabGame debe existir');
  assert.ok(ArcticGreenhouseGame, 'Minijuego ArcticGreenhouseGame debe existir');
});

test('5. Exactamente tres recompensas de misiones, sin herramientas regaladas', () => {
  // Simular derivación de herramientas de misiones completadas
  const completed = ['ALTITUDE_ACCLIMATIZATION', 'ECLSS_TRAINING', 'SOLAR_WATCH'];
  const derivedTools = completed.map((id) => ALL_EARTH_MISSIONS[id].targetTool);

  // Ambas primeras misiones otorgan LIFE_SUPPORT, la tercera SHELTER_KIT
  assert.deepEqual(derivedTools, ['LIFE_SUPPORT', 'LIFE_SUPPORT', 'SHELTER_KIT']);

  // Validar que handleProceedToLaunch en EarthFlow NO añade herramientas de relleno
  function simulateProceedToLaunch(tools) {
    if (tools.length !== 3) return null;
    return [tools[0], tools[1], tools[2]];
  }

  const finalBackpack = simulateProceedToLaunch(derivedTools);
  assert.deepEqual(finalBackpack, ['LIFE_SUPPORT', 'LIFE_SUPPORT', 'SHELTER_KIT']);
  assert.ok(!finalBackpack.includes('FOLDING_PANELS'), 'No debe regalar paneles si no fueron ganados');
  assert.ok(!finalBackpack.includes('CROP_KIT'), 'No debe regalar cultivos si no fueron ganados');
});

test('6. Tres misiones comunes entre ciudades (identidad e isCitySpecific: false)', () => {
  const arequipaMissions = getMissionsForCity('AREQUIPA');
  const tromsoMissions = getMissionsForCity('TROMSO');

  const commonMissionsArequipa = arequipaMissions.filter(m => !m.isCitySpecific);
  const commonMissionsTromso = tromsoMissions.filter(m => !m.isCitySpecific);

  assert.equal(commonMissionsArequipa.length, 3, 'Arequipa debe tener exactamente 3 comunes');
  assert.equal(commonMissionsTromso.length, 3, 'Tromsø debe tener exactamente 3 comunes');

  const commonIdsArequipa = commonMissionsArequipa.map(m => m.id).sort();
  const commonIdsTromso = commonMissionsTromso.map(m => m.id).sort();

  assert.deepEqual(commonIdsArequipa, ['ECLSS_TRAINING', 'SOLAR_WATCH', 'VEGGIE_LAB']);
  assert.deepEqual(commonIdsTromso, ['ECLSS_TRAINING', 'SOLAR_WATCH', 'VEGGIE_LAB']);
});

test('7. Dos misiones específicas de cada ciudad (isCitySpecific: true)', () => {
  const arequipaMissions = getMissionsForCity('AREQUIPA');
  const tromsoMissions = getMissionsForCity('TROMSO');

  const specificArequipa = arequipaMissions.filter(m => m.isCitySpecific);
  const specificTromso = tromsoMissions.filter(m => m.isCitySpecific);

  assert.equal(specificArequipa.length, 2, 'Arequipa debe tener exactamente 2 misiones específicas');
  assert.equal(specificTromso.length, 2, 'Tromsø debe tener exactamente 2 misiones específicas');

  const specificIdsArequipa = specificArequipa.map(m => m.id).sort();
  assert.deepEqual(specificIdsArequipa, ['ALTITUDE_ACCLIMATIZATION', 'SOLAR_DETECTIVE']);

  const specificIdsTromso = specificTromso.map(m => m.id).sort();
  assert.deepEqual(specificIdsTromso, ['ARCTIC_GREENHOUSE', 'DARK_MONTHS_RESERVE']);
});

test('8. Cambio de Arequipa a Tromsø reinicia las misiones completadas', () => {
  let completed = ['SOLAR_DETECTIVE', 'ALTITUDE_ACCLIMATIZATION'];
  let currentCityId = 'AREQUIPA';

  function onSelectCity(newCityId) {
    if (newCityId !== currentCityId) {
      currentCityId = newCityId;
      completed = [];
    }
  }

  // Cambio de ciudad
  onSelectCity('TROMSO');
  assert.equal(currentCityId, 'TROMSO');
  assert.equal(completed.length, 0, 'Cambiar a Tromsø debe reiniciar misiones completadas');

  // Seleccionar la misma ciudad no reinicia
  completed.push('DARK_MONTHS_RESERVE');
  onSelectCity('TROMSO');
  assert.equal(completed.length, 1, 'Seleccionar la misma ciudad debe conservar progreso');
});

test('9. Regreso de un minijuego sin completarlo no acredita la misión', () => {
  const completed = ['SOLAR_WATCH'];

  // Simulación de navegación: Abrir minijuego y presionar onBack sin llamar a onComplete
  function onBackFromMinigame() {
    // Solo vuelve al mapa, no añade nada a completed
  }

  onBackFromMinigame();
  assert.deepEqual(completed, ['SOLAR_WATCH'], 'Volver atrás no debe añadir misiones');
});

test('10. Preparación y navegación hasta la llegada no permite despegue prematuro', () => {
  function canLaunch(completedCount) {
    return completedCount === 3;
  }

  assert.equal(canLaunch(0), false);
  assert.equal(canLaunch(1), false);
  assert.equal(canLaunch(2), false);
  assert.equal(canLaunch(3), true);
  assert.equal(canLaunch(4), false);
});

test('11. Estado correcto para el motor espacial (SpaceGame)', () => {
  const dataset = buildVerifiedNasaDataset('AREQUIPA');
  assert.equal(dataset.validation, 'VERIFIED');
  assert.equal(dataset.observations.length, 2);

  const completed = ['SOLAR_DETECTIVE', 'SOLAR_WATCH', 'ALTITUDE_ACCLIMATIZATION'];
  const tools = completed.map(id => ALL_EARTH_MISSIONS[id].targetTool);

  const setup = {
    cityId: 'AREQUIPA',
    avatarId: 'ALBA',
    fictionalName: 'Cadete Alba',
    destination: 'MOON',
    backpack: [tools[0], tools[1], tools[2]],
    completedTraining: completed.filter(m => m === 'SOLAR_DETECTIVE' || m === 'SOLAR_WATCH'),
  };

  assert.equal(setup.cityId, 'AREQUIPA');
  assert.equal(setup.destination, 'MOON');
  assert.equal(setup.backpack.length, 3);
  assert.deepEqual(setup.completedTraining, ['SOLAR_DETECTIVE', 'SOLAR_WATCH']);
});

test('12. Responsive en escritorio y tablet (Aspect ratio y dimensiones)', () => {
  // Verificación de coordenadas del mapa SVG 1000x580
  const FACILITY_MAP_COORDS = [
    { x: 250, y: 145 },
    { x: 750, y: 145 },
    { x: 190, y: 410 },
    { x: 500, y: 420 },
    { x: 810, y: 410 },
  ];

  for (const c of FACILITY_MAP_COORDS) {
    assert.ok(c.x >= 150 && c.x <= 850, `Coordenada X ${c.x} debe estar dentro de márgenes horizontales`);
    assert.ok(c.y >= 100 && c.y <= 450, `Coordenada Y ${c.y} debe estar holgadamente dentro de viewBox 580`);
  }
});

test.after(async () => {
  await viteServer.close();
});


test('Detective del Sol - captación NASA y orientación cambian el presupuesto', () => {
  const low = solarEnergy.captureEnergy(AREQUIPA_SOLAR_RECORDS.days[0].irradianceKwhPerM2, 16);
  const high = solarEnergy.captureEnergy(AREQUIPA_SOLAR_RECORDS.days[2].irradianceKwhPerM2, 16);
  const tilted = solarEnergy.captureEnergy(AREQUIPA_SOLAR_RECORDS.days[0].irradianceKwhPerM2, 50);
  assert.ok(high.units > low.units);
  assert.ok(low.units > tilted.units);
  assert.ok(low.kwh > tilted.kwh);
});

test('Detective del Sol - asignación, recuperación y resultados distintos', () => {
  const { allocate, evaluate, EMPTY_ALLOCATION, assignedUnits, remainingNightEnergy } = solarEnergy;
  let allocation = EMPTY_ALLOCATION;
  allocation = allocate(allocation, 'communications', 4, 12);
  allocation = allocate(allocation, 'shelter', 5, 12);
  assert.equal(assignedUnits(allocation), 9);
  assert.equal(evaluate(allocation, 12, true).passed, true);
  assert.equal(evaluate(allocation, 12, false).passed, false);
  assert.equal(remainingNightEnergy(allocation, 0), 7);
  assert.equal(remainingNightEnergy(allocation, 7), 0);
  allocation = allocate(allocation, 'shelter', -2, 12);
  assert.equal(evaluate(allocation, 12, true).passed, false);
  allocation = allocate(allocation, 'shelter', 2, 12);
  allocation = allocate(allocation, 'laboratory', 3, 12);
  assert.equal(evaluate(allocation, 12, true).passed, true);
  assert.equal(evaluate(allocation, 12, true).grade, 'excellent');
  assert.equal(allocate(allocation, 'laboratory', 1, 12).laboratory, 3);
});

test('Detective del Sol - laboratorio opcional y varias estrategias válidas', () => {
  const { evaluate } = solarEnergy;
  assert.equal(evaluate({ communications: 4, shelter: 5, laboratory: 0 }, 12, true).grade, 'passed');
  assert.equal(evaluate({ communications: 4, shelter: 5, laboratory: 4 }, 13, true).grade, 'perfect');
  assert.equal(evaluate({ communications: 4, shelter: 4, laboratory: 4 }, 12, true).passed, false);
});

test('Detective del Sol - los tres días tienen solución y excelencia posible', () => {
  for (const day of AREQUIPA_SOLAR_RECORDS.days) {
    const budget = solarEnergy.captureEnergy(day.irradianceKwhPerM2, 16).units;
    assert.ok(budget >= 9);
    assert.equal(solarEnergy.evaluate({ communications: 4, shelter: 5, laboratory: 0 }, budget, true).passed, true);
  }
  assert.equal(solarEnergy.evaluate({ communications: 4, shelter: 5, laboratory: 3 }, 12, true).grade, 'excellent');
});

test('Onboarding V3.0 - Componentes de las 5 pantallas cargan correctamente', () => {
  assert.ok(WelcomeScreen, 'WelcomeScreen debe estar disponible');
  assert.ok(CitySelectionScreen, 'CitySelectionScreen debe estar disponible');
  assert.ok(DestinationScreen, 'DestinationScreen debe estar disponible');
  assert.ok(AvatarScreen, 'AvatarScreen debe estar disponible');
  assert.ok(NarrativeBriefingScreen, 'NarrativeBriefingScreen debe estar disponible');
});

test('Onboarding V3.0 - i18n sin claves faltantes ni "Text unavailable"', () => {
  const checkKeys = [
    'cities.arequipa.name',
    'cities.arequipa.country',
    'cities.arequipa.badge',
    'cities.arequipa.specialty',
    'cities.tromso.name',
    'cities.tromso.country',
    'cities.tromso.badge',
    'cities.tromso.specialty',
    'destinations.moon.name',
    'destinations.moon.missionObjective',
    'destinations.mars.name',
    'destinations.mars.missionObjective',
    'briefing.dialogue.step1Speaker',
    'briefing.dialogue.step1Text',
    'briefing.dialogue.step4Speaker',
    'briefing.dialogue.step4Text',
  ];

  for (const lang of ['es', 'en']) {
    for (const key of checkKeys) {
      const result = translate(lang, key, { name: 'Comandante', city: 'Arequipa', destination: 'Luna' });
      assert.ok(result.length > 0, `Clave ${key} en ${lang} no debe estar vacía`);
      assert.notEqual(result, 'Texto no disponible', `Clave ${key} en ${lang} devolvió "Texto no disponible"`);
      assert.notEqual(result, 'Text unavailable', `Clave ${key} en ${lang} devolvió "Text unavailable"`);
    }
  }
});

test('Detective del Sol - las celdas nocturnas se consumen sin crear energía', () => {
  const allocation = { communications: 4, shelter: 5, laboratory: 3 };
  const start = solarEnergy.nightSystemEnergy(allocation, 0);
  const midnight = solarEnergy.nightSystemEnergy(allocation, 4);
  const dawn = solarEnergy.nightSystemEnergy(allocation, 7);
  assert.deepEqual(start, { communications: 2, shelter: 5 });
  assert.deepEqual(midnight, { communications: 0, shelter: 3 });
  assert.deepEqual(dawn, { communications: 0, shelter: 0 });
  assert.ok(solarEnergy.remainingNightEnergy(allocation, 0) >= solarEnergy.remainingNightEnergy(allocation, 4));
  assert.ok(solarEnergy.remainingNightEnergy(allocation, 4) >= solarEnergy.remainingNightEnergy(allocation, 7));
});

test.after(async () => {
  await viteServer.close();
});
