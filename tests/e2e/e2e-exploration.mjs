/**
 * E2E de la salida a explorar (maqueta v12.1 de JD): aparece tras el turno 2, se maneja con el teclado,
 * recoge hallazgos, se vuelve a la base, sale el informe y la guardia sigue con los recursos actualizados.
 *
 * Requiere `pnpm dev` en http://localhost:5173/ (o E2E_BASE_URL) y Chrome instalado.
 */
import {
  launchBrowser, newMonitoredPage, screenshot, assertScreenHealthy, startFromWelcome, chooseDestination,
  buildStation, passStationPrep, chooseCity, passAvatarAndBriefing, completeTraining, flyAndMonitor,
  skipIntervention, failOnProblems, recommendedCloudsReserve,
} from './helpers.mjs';

const hold = async (page, key, ms) => { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); };
const text = (locator) => locator.innerText().then((value) => value.replace(/\s+/g, ' ').trim());

const browser = await launchBrowser();
const { context, page, problems } = await newMonitoredPage(browser, { width: 1366, height: 800 }, 'exploracion');
try {
  await startFromWelcome(page);
  await chooseDestination(page, 'MOON');
  const modules = await buildStation(page, [0, 2, 4]);
  await passStationPrep(page);
  await chooseCity(page, 'AREQUIPA');
  await passAvatarAndBriefing(page);
  await completeTraining(page, 0, 'SOLAR_DETECTIVE', {}, false);
  await completeTraining(page, 2, 'ALTITUDE_ACCLIMATIZATION', { pressure: 72 }, false);
  await completeTraining(page, 4, 'CLOUDS_SUNS', { city: 'AREQUIPA' }, true);
  await flyAndMonitor(page, { destination: 'MOON', modules });

  // --- turno 1: no hay salida
  await skipIntervention(page);
  await page.waitForFunction(() => !document.querySelector('footer.turn-controls button')?.hasAttribute('disabled'));
  await page.click('footer.turn-controls button');
  await page.waitForSelector('.turn-summary__next');
  if (!(await text(page.locator('.turn-summary'))).includes('Qué pasó')) throw new Error('Falta el resumen del turno.');
  await page.click('.turn-summary__next');
  await page.waitForSelector('.turn-transition button');
  if (await page.locator('.explore-start').count()) throw new Error('La salida no debe aparecer tras el turno 1.');
  await page.click('.turn-transition button', { timeout: 2000 }).catch(() => {}); // el cartel también sigue solo
  await page.waitForSelector('.mission-clock');

  // --- turno 2: sí aparece
  await skipIntervention(page);
  await page.waitForFunction(() => !document.querySelector('footer.turn-controls button')?.hasAttribute('disabled'));
  await page.click('footer.turn-controls button');
  await page.waitForSelector('.turn-summary__next');
  await page.click('.turn-summary__next');
  await page.waitForSelector('.explore-start');
  await assertScreenHealthy(page, 'salida a explorar');
  const cards = await page.locator('.explore-card h2').allInnerTexts();
  if (cards.length !== 3) throw new Error(`Debe ofrecer 3 tarjetas, hay ${cards.length}.`);
  const batteries = await page.locator('.explore-card__batteries button').allInnerTexts();
  if (batteries.join('|') !== 'Batería 20|Batería 35|Batería 50') throw new Error(`Baterías inesperadas: ${batteries}`);
  if (!(await text(page.locator('.explore-start'))).includes('Día lunar 6')) throw new Error('La salida debe mostrar el reloj del turno que terminó (Día lunar 6).');
  await screenshot(page, 'x1_tarjetas.png');

  // --- rover con batería 35: la Energía de la base baja 35 al partir
  await page.click('.explore-card__batteries button:has-text("35")');
  await page.waitForSelector('.explore__canvas');
  const energyAtStart = Number((await page.locator('[role="meter"][aria-label="ENERGÍA"]').first().getAttribute('aria-valuenow')));
  console.log(`  Energía al partir (con 35 de batería ya apartada): ${energyAtStart}`);

  // --- manejar con el teclado hacia el montón de regolito y recogerlo
  await hold(page, 'ArrowUp', 670);
  await hold(page, 'ArrowRight', 880);
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Space'); await page.waitForTimeout(220); }
  const panel = await text(page.locator('.explore__panel'));
  console.log(`  panel: ${panel.slice(0, 160)}`);
  if (!/Margen para volver/.test(panel)) throw new Error('Falta la barra «Margen para volver».');
  await screenshot(page, 'x2_mapa.png');

  // --- pedir rescate para cerrar sin depender del tiempo real, y mirar el informe
  await page.click('.explore__controls button:has-text("rescate")');
  await page.waitForSelector('.explore-report');
  await assertScreenHealthy(page, 'informe de la salida');
  const report = await text(page.locator('.explore-report__box'));
  if (!report.includes('Día lunar 6')) throw new Error('El informe debe llevar el reloj del turno 2.');
  if (!report.includes('Rescate')) throw new Error('El informe debe decir que hubo rescate.');
  if (!/antes/i.test(report) || !/después/i.test(report)) throw new Error('El informe debe mostrar Antes y Después.');
  if (/cambio/i.test(report)) throw new Error('El informe no lleva columna de cambio (decisión de JD).');
  await screenshot(page, 'x3_informe.png');

  // --- continuar: transición al día siguiente y la guardia sigue
  await page.click('.explore-report button.pixel-button--primary');
  await page.waitForSelector('.turn-transition button');
  if (!(await text(page.locator('.turn-transition'))).toUpperCase().includes('DÍA LUNAR 10')) throw new Error('La transición debe anunciar el nuevo reloj.');
  await page.click('.turn-transition button', { timeout: 2000 }).catch(() => {}); // el cartel también sigue solo
  await page.waitForSelector('.mission-clock');
  if (!(await text(page.locator('.mission-clock'))).includes('3')) throw new Error('Debe seguir el turno 3.');
  await screenshot(page, 'x4_turno3.png');

  failOnProblems(problems);
  console.log('\n🎉 E2E exploración OK');
} catch (error) {
  await screenshot(page, 'x_error.png').catch(() => undefined);
  throw error;
} finally {
  await context.close();
  await browser.close();
}
