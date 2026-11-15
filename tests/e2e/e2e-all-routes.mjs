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
} from './helpers.mjs';

const ROUTES = [
  {
    id: 'r1', city: 'AREQUIPA', destination: 'MOON', viewport: { width: 1366, height: 768 },
    modules: [0, 1, 2], retry: true,
    trainings: [[0, 'SOLAR_DETECTIVE', { reserve: 55 }], [2, 'ALTITUDE_ACCLIMATIZATION', { pressure: 72 }], [4, 'CLOUDS_SUNS', { city: 'AREQUIPA' }]],
  },
  {
    id: 'r2', city: 'AREQUIPA', destination: 'MARS', viewport: { width: 1600, height: 900 },
    modules: [2, 3, 4],
    trainings: [[2, 'ALTITUDE_ACCLIMATIZATION', { pressure: 80 }], [4, 'CLOUDS_SUNS', { city: 'AREQUIPA', reserve: recommendedCloudsReserve('AREQUIPA') + 15 }], [0, 'SOLAR_DETECTIVE', { reserve: 40 }]],
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

    let reached = await playFiveTurns(page);
    await page.waitForSelector('.results-hero');
    await assertScreenHealthy(page, 'informe');
    const first = await readOutcome(page);
    console.log(`  guardia: ${reached} turno(s), resultado ${first}`);
    // Fuente NASA visible en el informe (detalles del informe)
    await page.click('.results-details summary');
    const report = await page.locator('.results-details').innerText();
    if (!report.includes('NASA DONKI') || !report.includes('NASA POWER')) throw new Error('El informe no cita las fuentes NASA.');
    await screenshot(page, `${route.id}_03_results.png`);

    if (route.retry) {
      await page.click('button:has-text("REINTENTAR")');
      await page.waitForSelector('.mission-clock');
      if (await page.locator('.module-picker__button').count()) throw new Error('El reintento volvió a mostrar el constructor.');
      reached = await playFiveTurns(page);
      await page.waitForSelector('.results-hero');
      console.log(`  reintento: ${reached} turno(s), resultado ${await readOutcome(page)}`);
    }

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
  if (outcomes.includes('COMPLETADA')) throw new Error(`Una guardia pasiva no debería completar la misión: ${outcomes.join(', ')}`);
  console.log('\n🎉 E2E rutas JD OK:', outcomes.join(', '));
} finally {
  await browser.close();
}
