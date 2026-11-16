/**
 * E2E: las ayudas de radio no se repiten.
 * - Un globo entra UNA vez (su animación de entrada no se reinicia mientras está a la vista).
 * - La presentación del mapa sale solo la primera vez (no al volver de un entrenamiento).
 * - La meta de la guardia sale solo en el primer turno.
 * - Abrir y cerrar la ventana de un minijuego no hace que el último globo se repita.
 *
 * Requiere el servidor de desarrollo en http://localhost:5173/ (o E2E_BASE_URL) y Chrome.
 */
import {
  launchBrowser, newMonitoredPage, failOnProblems, startFromWelcome, chooseDestination, buildStation,
  passStationPrep, chooseCity, passAvatarAndBriefing, completeTraining, flyAndMonitor, performSurvivalIntervention,
} from './helpers.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await launchBrowser();
try {
  const { context, page, problems } = await newMonitoredPage(browser, { width: 1366, height: 768 }, 'radio-repeat');
  await context.addInitScript(() => {
    window.__radio = [];
    const log = (kind, el) => window.__radio.push({ kind, text: el.querySelector('.radio-bubble__sr')?.textContent ?? '' });
    new MutationObserver((mutations) => {
      for (const m of mutations) for (const n of m.addedNodes) {
        if (n.nodeType === 1 && n.classList?.contains('radio-bubble')) log('show', n);
      }
    }).observe(document, { childList: true, subtree: true });
    document.addEventListener('animationstart', (e) => {
      if (e.target.classList?.contains('radio-bubble') && e.animationName.startsWith('radio-in')) log('enter', e.target);
    }, true);
  });
  const take = () => page.evaluate(() => window.__radio.splice(0));
  const shows = (list, fragment) => list.filter((item) => item.kind === 'show' && item.text.includes(fragment)).length;

  await startFromWelcome(page);
  await chooseDestination(page, 'MOON');
  const modules = await buildStation(page);
  await passStationPrep(page);
  await chooseCity(page, 'AREQUIPA');
  await passAvatarAndBriefing(page);
  await page.waitForTimeout(9000);
  let log = await take();
  assert(shows(log, 'edificio') === 1, `La presentación del mapa debía salir 1 vez; salió ${shows(log, 'edificio')}.`);
  const enters = log.filter((item) => item.kind === 'enter').length;
  const showsTotal = log.filter((item) => item.kind === 'show').length;
  assert(enters <= showsTotal, `El globo repitió su entrada ${enters} veces para ${showsTotal} mensajes.`);
  console.log('  ✓ un globo entra una sola vez');

  // Volver de un entrenamiento: no se repite la presentación del mapa.
  await page.locator('.earth-base-facility').nth(1).click();
  await page.click('.emap-panel__start');
  await page.waitForTimeout(1500);
  await page.click('.earth-screen__back-btn');
  await page.waitForSelector('.earth-base-facility');
  await page.waitForTimeout(8000);
  log = await take();
  assert(shows(log, 'edificio') === 0, 'La presentación del mapa se repitió al volver de un entrenamiento.');
  console.log('  ✓ la presentación del mapa no se repite al volver');

  for (const [index, id] of [[1, 'ECLSS_TRAINING'], [2, 'ALTITUDE_ACCLIMATIZATION'], [3, 'VEGGIE_LAB']]) {
    await completeTraining(page, index, id, {}, id === 'VEGGIE_LAB');
  }
  await flyAndMonitor(page, { destination: 'MOON', modules });
  await page.waitForTimeout(6000);
  log = await take();
  assert(shows(log, 'Ciencia') === 1, 'La meta de la guardia no salió (o salió repetida) en el turno 1.');

  // Abrir y cerrar la ventana de un minijuego varias veces: el último globo no se repite.
  for (let i = 0; i < 3; i++) {
    await page.click('.intervention-menu-trigger');
    await page.locator('button.intervention-option:not([disabled])').first().click();
    await page.waitForSelector('.intervention-console');
    await page.waitForTimeout(800);
    await page.click('.intervention-console .intervention-close');
    await page.waitForTimeout(2500);
  }
  log = await take();
  assert(shows(log, 'Ciencia') === 0, 'La meta de la guardia se repitió al abrir y cerrar el minijuego.');
  console.log('  ✓ abrir y cerrar un minijuego no repite el último globo');

  // Turno 2: la meta no se vuelve a decir.
  await performSurvivalIntervention(page);
  await page.click('footer.turn-controls button');
  await page.waitForSelector('.turn-summary__next');
  await page.click('.turn-summary__next');
  await page.waitForSelector('.turn-transition button');
  await page.click('.turn-transition button', { timeout: 2000 }).catch(() => {}); // el cartel también sigue solo
  await page.waitForSelector('.mission-clock');
  await page.waitForTimeout(7000);
  log = await take();
  assert(shows(log, 'Ciencia') === 0, 'La meta de la guardia se repitió en el turno 2.');
  console.log('  ✓ la meta de la guardia sale solo en el primer turno');

  failOnProblems(problems);
  await context.close();
  console.log('\n🎉 E2E ayudas sin repetición OK');
} finally {
  await browser.close();
}
