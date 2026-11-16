/**
 * E2E del sistema de avisos: un modal manda sobre la radio, la radio se puede cerrar y repetir,
 * y la ayuda de un minijuego vive dentro de su ventana (sin duplicarse por radio).
 *
 * Requiere `pnpm dev` en http://localhost:5173/ (o E2E_BASE_URL) y Chrome instalado.
 */
import { launchBrowser, newMonitoredPage, screenshot, failOnProblems, BASE_URL } from './helpers.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function enterGuard(page) {
  await page.goto(BASE_URL);
  await page.waitForSelector('.welcome__play');
  await page.locator('button:has-text("Modo Estación"), button:has-text("Station Mode")').first().click();
  await page.locator('button.welcome__dialog-action').first().click();
  await page.waitForSelector('.station-modal');
  await page.locator('input.callsign-box__input').nth(1).fill('Equipo Radio');
  await page.locator('button:has-text("Siguiente"), button:has-text("Next")').first().click();
  await page.locator('button:has-text("4 Cadetes"), button:has-text("4 Cadets")').click();
  await page.locator('button:has-text("Siguiente"), button:has-text("Next")').first().click();
  await page.click('button.earth-action-btn:has-text("Iniciar Misión Cooperativa")');
  await page.waitForSelector('.module-picker__button');
  for (const index of [0, 1, 2]) await page.locator('.module-picker__button').nth(index).click();
  await page.click('button.builder-start');
  await page.waitForSelector('.turn-transition button');
  await page.locator('.turn-transition button').click({ timeout: 3000 }).catch(() => undefined);
  await page.waitForSelector('.mission-clock');
}

const browser = await launchBrowser();
try {
  // --- Guardia (escritorio y tablet): globo cerrable, repetible y subordinado al modal ---
  for (const [label, viewport] of [['escritorio', { width: 1280, height: 800 }], ['tablet', { width: 1024, height: 768 }]]) {
    const { context, page, problems } = await newMonitoredPage(browser, viewport, `radio-${label}`);
    await enterGuard(page);

    await page.waitForSelector('.radio-bubble', { timeout: 8000 });
    assert(await page.locator('.radio-bubble__close').isVisible(), `${label}: el globo de radio no tiene un botón visible para cerrarlo.`);
    const box = await page.locator('.radio-bubble').boundingBox();
    for (const selector of ['.resource-rack', '.alerts-monitor', '.mission-bottom-bar']) {
      const other = await page.locator(selector).first().boundingBox();
      const overlaps = box.x < other.x + other.width && box.x + box.width > other.x
        && box.y < other.y + other.height && box.y + box.height > other.y;
      assert(!overlaps, `${label}: el globo de radio tapa ${selector}.`);
    }
    await screenshot(page, `radio_guard_bubble_${label}.png`);

    await page.click('.radio-bubble__close');
    await page.waitForSelector('.radio-bubble', { state: 'detached' });
    await page.waitForSelector('.radio-replay');
    await page.click('.radio-replay');
    await page.waitForSelector('.radio-bubble', { timeout: 5000 });
    // Escape también cierra el globo.
    await page.keyboard.press('Escape');
    await page.waitForSelector('.radio-bubble', { state: 'detached' });
    console.log(`  ✓ ${label}: globo cerrable y repetible, sin tapar barras, alertas ni botones`);

    // Un modal importante tiene prioridad: con el minijuego abierto no hay globo, y la ayuda está dentro.
    await page.click('.intervention-menu-trigger');
    await page.locator('button.intervention-option:not([disabled])').first().click();
    await page.waitForSelector('.intervention-console .console-guide');
    await page.waitForTimeout(3200);
    assert((await page.locator('.radio-bubble').count()) === 0, `${label}: hay un globo de radio sobre el modal del minijuego.`);
    assert((await page.locator('.radio-replay').count()) === 0, `${label}: hay un botón de radio sobre el modal del minijuego.`);
    assert((await page.locator('.intervention-console .console-guide').count()) >= 1, `${label}: el minijuego no muestra su ayuda dentro de la ventana.`);
    const focused = await page.evaluate(() => Boolean(document.activeElement?.closest('.intervention-console')));
    assert(focused, `${label}: el foco no entró en la ventana del minijuego.`);
    await screenshot(page, `radio_modal_priority_${label}.png`);
    await page.keyboard.press('Escape');
    await page.waitForSelector('.intervention-console', { state: 'detached' });
    console.log(`  ✓ ${label}: el modal manda sobre la radio, el foco entra y Escape lo cierra`);
    failOnProblems(problems);
    await context.close();
  }

  // --- Ayuda (tutorial): mientras está abierta, la radio calla; Escape la cierra ---
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => localStorage.setItem('astronexo_lang_v3', 'es'));
  const home = await ctx.newPage();
  const errors = [];
  home.on('pageerror', (error) => errors.push(error.message));
  await home.goto(BASE_URL);
  await home.waitForSelector('.welcome__play');
  await home.waitForSelector('.tutorial-coach__dialog', { timeout: 5000 }).catch(async () => {
    await home.click('.tutorial-help-button');
    await home.waitForSelector('.tutorial-coach__dialog');
  });
  await home.waitForTimeout(3500);
  assert((await home.locator('.radio-bubble').count()) === 0, 'La radio habla mientras la ayuda está abierta.');
  assert(await home.locator('.tutorial-coach__close').isVisible(), 'La ayuda no tiene botón visible para cerrarla.');
  await screenshot(home, 'radio_help_priority.png');
  await home.keyboard.press('Escape');
  await home.waitForSelector('.tutorial-coach__dialog', { state: 'detached' });
  // La portada ya no saluda por radio (la introducción presenta el juego), y cerrar la ayuda
  // no debe empezar la partida: se sigue en la portada, sin video ni globo.
  await home.waitForTimeout(4000);
  assert((await home.locator('.radio-bubble').count()) === 0, 'La portada no debería mostrar un globo de radio.');
  assert((await home.locator('.cinematic').count()) === 0, 'Cerrar la ayuda empezó la partida.');
  assert(await home.locator('.welcome__play').isVisible(), 'Cerrar la ayuda sacó al niño de la portada.');
  console.log('  ✓ la ayuda manda sobre la radio, se cierra con Escape y no empieza el juego');
  assert(errors.length === 0, `Errores de página: ${errors.join(' | ')}`);
  await ctx.close();
  console.log('🎉 E2E avisos y modales OK');
} finally {
  await browser.close();
}
