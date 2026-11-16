/**
 * E2E del Modo Estación (cooperativo local, un solo motor y un solo estado de misión).
 *  A) «Recorrido completo del grupo»: pasa por destino, constructor 3/5, ciudad, 3 entrenamientos,
 *     viaje y monitoreo antes de la guardia cooperativa (sin herramientas ficticias).
 *  B) Demostración rápida docente: guardia directa con constructor propio (sin backend).
 *
 * Requiere `pnpm dev` en http://localhost:5173/ (o E2E_BASE_URL) y Chrome instalado.
 */
import {
  launchBrowser, newMonitoredPage, screenshot, assertScreenHealthy, startFromWelcome, chooseDestination,
  buildStation, passStationPrep, chooseCity, passAvatarAndBriefing, completeTraining, flyAndMonitor,
  playFiveTurns, readOutcome, returnToWelcome, failOnProblems, BASE_URL, skipCinematic, skipMissionIntro,
} from './helpers.mjs';

async function openStationModal(page) {
  await page.goto(BASE_URL);
  await page.waitForSelector('.welcome__play');
  await page.locator('button:has-text("Modo Estación"), button:has-text("Station Mode")').first().click();
  await page.locator('button.welcome__dialog-action').first().click();
  await page.waitForSelector('.station-modal');
}

/** Pestañas 1→3 del modal con un grupo de 4 cadetes (prueba el cambio de tamaño 5→4). */
async function configureGroup(page, team) {
  await page.locator('input.callsign-box__input').nth(1).fill(team);
  await page.locator('button:has-text("Siguiente"), button:has-text("Next")').first().click();
  await page.locator('button:has-text("5 Cadetes"), button:has-text("5 Cadets")').click();
  await page.locator('button:has-text("4 Cadetes"), button:has-text("4 Cadets")').click();
  const roles = await page.locator('.station-modal').innerText();
  if (!/Comandante|Commander/i.test(roles)) throw new Error('El modal no muestra los roles del grupo.');
  await page.locator('button:has-text("Siguiente"), button:has-text("Next")').first().click();
  await assertScreenHealthy(page, 'modal estación');
}

async function coopGuardAndResults(page, label) {
  await page.waitForSelector('.coop-role-bar');
  await assertScreenHealthy(page, `${label}: guardia cooperativa`);
  const reached = await playFiveTurns(page, { coop: true });
  await page.waitForSelector('.coop-results-shell');
  await assertScreenHealthy(page, `${label}: resultados colectivos`);
  console.log(`  guardia cooperativa: ${reached} turno(s), resultado ${await readOutcome(page)}`);
  return reached;
}

async function fullRoute(browser) {
  console.log('\n>>> A) Recorrido completo del grupo (Tromsø → Marte)');
  const { context, page, problems } = await newMonitoredPage(browser, { width: 1440, height: 900 }, 'coop-ruta');
  try {
    await openStationModal(page);
    await configureGroup(page, 'Equipo Cóndor');
    await page.click('button:has-text("Recorrido completo del grupo")');
    await skipCinematic(page);
    await skipMissionIntro(page);

    await chooseDestination(page, 'MARS');
    const modules = await buildStation(page, [0, 2, 3]);
    await passStationPrep(page);
    await chooseCity(page, 'TROMSO');
    await passAvatarAndBriefing(page);
    await completeTraining(page, 0, 'DARK_MONTHS_RESERVE', undefined, false);
    await completeTraining(page, 1, 'ARCTIC_GREENHOUSE', undefined, false);
    await completeTraining(page, 4, 'CLOUDS_SUNS', { city: 'TROMSO' }, true);
    await flyAndMonitor(page, { destination: 'MARS', modules });

    await coopGuardAndResults(page, 'ruta completa');
    await screenshot(page, 'station_full_route_results.png');

    // Reintento del equipo: mismo estado de preparación, sin constructor
    await page.click('button:has-text("REINTENTAR")');
    await page.waitForSelector('.coop-role-bar');
    if (await page.locator('.module-picker__button').count()) throw new Error('El reintento cooperativo volvió a mostrar el constructor.');
    await coopGuardAndResults(page, 'reintento');

    await returnToWelcome(page);
    failOnProblems(problems);
    console.log('  ✓ recorrido completo cooperativo');
  } catch (error) {
    await screenshot(page, 'station_full_route_error.png').catch(() => undefined);
    throw error;
  } finally {
    await context.close();
  }
}

async function quickDemo(browser) {
  console.log('\n>>> B) Demostración rápida docente');
  const { context, page, problems } = await newMonitoredPage(browser, { width: 1440, height: 900 }, 'coop-demo');
  try {
    await openStationModal(page);
    await configureGroup(page, 'Equipo Halcón');
    await page.click('button.earth-action-btn:has-text("Iniciar Misión Cooperativa")');

    await page.waitForSelector('.module-picker__button');
    for (const index of [0, 1, 2]) await page.locator('.module-picker__button').nth(index).click();
    await page.click('button.builder-start');
    await page.waitForSelector('.turn-transition button');
    await page.click('.turn-transition button');

    await coopGuardAndResults(page, 'demo');
    await returnToWelcome(page);
    failOnProblems(problems);
    console.log('  ✓ demostración rápida');
  } catch (error) {
    await screenshot(page, 'station_demo_error.png').catch(() => undefined);
    throw error;
  } finally {
    await context.close();
  }
}

const browser = await launchBrowser();
try {
  await fullRoute(browser);
  await quickDemo(browser);
  console.log('\n🎉 E2E Modo Estación OK');
} finally {
  await browser.close();
}
