/**
 * E2E del flujo JD: destino → constructor 3/5 → estación en preparación → ciudad → avatar → briefing →
 * 3 entrenamientos (con avance de obra) → despegue → llegada → monitoreo → guardia de 5 turnos →
 * informe → regreso → siguiente aventura.
 *
 * Requiere `pnpm dev` en http://localhost:5173/ (o E2E_BASE_URL) y Chrome instalado.
 */
import {
  launchBrowser, newMonitoredPage, screenshot, assertScreenHealthy, startFromWelcome, chooseDestination,
  buildStation, passStationPrep, chooseCity, passAvatarAndBriefing, completeTraining, flyAndMonitor,
  playFiveTurns, readOutcome, returnToWelcome, failOnProblems, recommendedCloudsReserve,
  performScienceIntervention, performSurvivalIntervention, openKidReport,
} from './helpers.mjs';

const ROUTES = [
  {
    id: 'r1', city: 'AREQUIPA', destination: 'MOON', viewport: { width: 1366, height: 768 },
    modules: [0, 2, 4], victory: true,
    trainings: [[0, 'SOLAR_DETECTIVE'], [2, 'ALTITUDE_ACCLIMATIZATION', { pressure: 72 }], [4, 'CLOUDS_SUNS', { city: 'AREQUIPA' }]],
  },
  {
    id: 'r2', city: 'AREQUIPA', destination: 'MARS', viewport: { width: 1600, height: 900 },
    modules: [2, 3, 4],
    trainings: [[2, 'ALTITUDE_ACCLIMATIZATION', { pressure: 80 }], [4, 'CLOUDS_SUNS', { city: 'AREQUIPA', reserve: recommendedCloudsReserve('AREQUIPA') + 15 }], [0, 'SOLAR_DETECTIVE']],
  },
  {
    id: 'r3', city: 'TROMSO', destination: 'MOON', viewport: { width: 1024, height: 768 },
    modules: [0, 1, 3],
    trainings: [[0, 'DARK_MONTHS_RESERVE'], [1, 'ARCTIC_GREENHOUSE'], [2, 'SOLAR_WATCH', { event: 0 }]],
  },
  {
    id: 'r4', city: 'TROMSO', destination: 'MARS', viewport: { width: 1280, height: 800 },
    modules: [1, 3, 4],
    trainings: [[0, 'DARK_MONTHS_RESERVE'], [2, 'SOLAR_WATCH', { event: 1 }], [4, 'CLOUDS_SUNS', { city: 'TROMSO' }]],
  },
];

async function runRoute(browser, route) {
  const label = `${route.city}→${route.destination}`;
  console.log(`\n>>> ${route.id.toUpperCase()}: ${label} (${route.viewport.width}x${route.viewport.height})`);
  const { context, page, problems } = await newMonitoredPage(browser, route.viewport, label);
  try {
    await startFromWelcome(page);
    await chooseDestination(page, route.destination);
    const builtNames = await buildStation(page, route.modules);
    await screenshot(page, `${route.id}_01_builder_done.png`);
    await passStationPrep(page);
    await chooseCity(page, route.city);
    await passAvatarAndBriefing(page);

    // 5 instalaciones por ciudad; se completan exactamente 3 distintas
    if ((await page.locator('.earth-base-facility').count()) !== 5) throw new Error('El mapa debe mostrar 5 instalaciones.');
    await assertScreenHealthy(page, 'mapa');
    for (const [position, [index, id, options]] of route.trainings.entries()) {
      console.log(`  entrenamiento ${position + 1}/3: ${id}`);
      await completeTraining(page, index, id, options, position === 2);
    }

    // Viaje → llegada → monitoreo (sin constructor) → guardia
    await flyAndMonitor(page, { destination: route.destination, modules: builtNames });
    await screenshot(page, `${route.id}_02_guard_start.png`);

    const realActions = route.victory ? {
      1: performSurvivalIntervention,
      2: performScienceIntervention,
      3: performScienceIntervention,
      4: performSurvivalIntervention,
      5: performSurvivalIntervention,
    } : undefined;
    // r3 sale a explorar de verdad (y pide rescate); el resto se queda en la base.
    const reached = await playFiveTurns(page, { actOnTurn: realActions, explore: route.id === 'r3' ? 'rescue' : 'stay' });
    await page.waitForSelector('.results-hero');
    await assertScreenHealthy(page, 'informe');
    const first = await readOutcome(page);
    console.log(`  guardia: ${reached} turno(s), resultado ${first}`);
    // Informe para niños (pantalla siguiente al veredicto) y, dentro, el informe completo con las fuentes NASA.
    await openKidReport(page);
    await page.click('.results-details summary');
    const report = await page.locator('.results-details').innerText();
    if (!report.includes('NASA DONKI') || !report.includes('NASA POWER')) throw new Error('El informe no cita las fuentes NASA.');
    if (!/históric/i.test(report) || !/simulad/i.test(report)) throw new Error('El informe no diferencia datos históricos de reglas simuladas.');
    const preparation = page.locator('.preparation-report');
    if (await preparation.getAttribute('data-city') !== route.city) throw new Error('El informe no conservó la ciudad.');
    if (await preparation.getAttribute('data-destination') !== route.destination) throw new Error('El informe no conservó el destino.');
    if (await preparation.locator('[data-training-id]').count() !== 3) throw new Error('El informe no conservó los tres entrenamientos.');
    if (await page.locator('.module-report [data-module-id]').count() !== 3) throw new Error('El informe no conservó los tres módulos.');
    const toolCount = await preparation.locator('[data-tool-id]').evaluateAll((items) => items.reduce((sum, item) => sum + Number(item.getAttribute('data-tool-count')), 0));
    if (toolCount !== 3) throw new Error('El informe no conservó las tres herramientas.');
    if (await preparation.locator('[data-tool-count="2"]').count() && !report.includes('cada recompensa aplicó su beneficio')) {
      throw new Error('La recompensa duplicada no tiene explicación visual.');
    }
    if (route.victory && first !== 'COMPLETADA') throw new Error(`La ruta con acciones reales no logró la victoria: ${first}.`);
    if (route.victory && report.includes('No se realizaron intervenciones')) throw new Error('La victoria no registró intervenciones reales.');
    await screenshot(page, `${route.id}_03_results.png`);

    await returnToWelcome(page);
    failOnProblems(problems);
    console.log(`  ✓ ${label}`);
    return first;
  } catch (error) {
    await screenshot(page, `${route.id}_error.png`).catch(() => undefined);
    throw error;
  } finally {
    await context.close();
  }
}

const browser = await launchBrowser();
try {
  const outcomes = [];
  for (const route of ROUTES) outcomes.push(await runRoute(browser, route));
  // «No intervenir» durante cinco turnos nunca debe dar una misión completada: informe parcial o interrupción.
  const passiveOutcomes = outcomes.filter((_, index) => !ROUTES[index].victory);
  if (passiveOutcomes.includes('COMPLETADA')) throw new Error(`Una guardia pasiva no debería completar la misión: ${passiveOutcomes.join(', ')}`);
  console.log('\n🎉 E2E rutas JD OK:', outcomes.join(', '));
} finally {
  await browser.close();
}
