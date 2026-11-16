/**
 * Revisión visual y funcional de la pantalla inmersiva de destino (Luna / Marte).
 * Requiere el juego en marcha (BASE_URL, por defecto http://127.0.0.1:5173/) y Chrome instalado.
 * Capturas en SCREENSHOT_DIR (por defecto /tmp/astronexo-destination-review).
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:5173/';
const outputDir = process.env.SCREENSHOT_DIR ?? '/tmp/astronexo-destination-review';
fs.mkdirSync(outputDir, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function open(browser, viewport, { language = 'es', reducedMotion = 'no-preference', touch = false } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion, hasTouch: touch });
  await context.addInitScript(({ language }) => {
    localStorage.setItem('astronexo_lang_v3', language);
    localStorage.setItem('astronexo_tutorial_v1', JSON.stringify({ 'welcome.solo': true }));
  }, { language });
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error' && !/403|Failed to load resource/.test(message.text())) problems.push(`console: ${message.text()}`); });
  await page.goto(baseUrl);
  await page.locator('.welcome__play').click();
  await page.locator('.destination-selection__confirm').waitFor();
  return { context, page, problems };
}

async function assertImagesLoaded(page) {
  const broken = await page.locator('img').evaluateAll((images) => images
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map((image) => image.getAttribute('src')));
  assert(broken.length === 0, `Imágenes rotas: ${broken.join(', ')}`);
}

async function screenshot(page, name) {
  const file = path.join(outputDir, name);
  await page.screenshot({ path: file });
  console.log(`[captura] ${file}`);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  // Escritorio: Luna por defecto, cambio a Marte, teclado, detalles y avance al constructor
  {
    const { context, page, problems } = await open(browser, { width: 1366, height: 768 });
    await assertImagesLoaded(page);
    assert(await page.locator('[data-destination="MOON"]').getAttribute('aria-checked') === 'true', 'La Luna debe estar seleccionada al inicio');
    assert(await page.locator('.destination-selection__scene--moon.is-active').count() === 1, 'La escena lunar debe estar activa');
    assert(await page.locator('[data-destination]').count() === 2, 'Debe haber dos opciones de destino ([data-destination])');
    await screenshot(page, 'desktop-moon.png');

    await page.locator('[data-destination="MARS"]').click();
    await page.waitForTimeout(900);
    assert(await page.locator('[data-destination="MARS"]').getAttribute('aria-checked') === 'true', 'Clic en Marte no lo seleccionó');
    assert(await page.locator('.destination-selection__scene--mars.is-active').count() === 1, 'La escena marciana debe activarse');
    assert((await page.locator('.destination-selection__info h2').innerText()).includes('Marte'), 'La ficha debe mostrar Marte');
    await screenshot(page, 'desktop-mars.png');

    await page.locator('[data-destination="MARS"]').press('ArrowLeft');
    assert(await page.locator('[data-destination="MOON"]').getAttribute('aria-checked') === 'true', 'Las flechas deben volver a la Luna');
    await page.locator('.destination-selection__science summary').click();
    assert(await page.locator('.destination-selection__science').getAttribute('open') !== null, 'Los datos del destino no se expandieron');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(overflow <= 1, `Desborde horizontal: ${overflow}px`);

    await page.locator('[data-destination="MARS"]').click();
    await page.locator('.destination-selection__confirm').click();
    await page.locator('.module-picker__button').first().waitFor();
    assert((await page.locator('body').innerText()).toUpperCase().includes('MARTE'), 'El constructor debe reflejar Marte');
    assert(problems.length === 0, `Problemas: ${problems.join(' | ')}`);
    await context.close();
  }

  // Tableta táctil en inglés
  {
    const { context, page, problems } = await open(browser, { width: 1024, height: 768 }, { language: 'en', touch: true });
    await page.locator('[data-destination="MARS"]').tap();
    await page.waitForTimeout(700);
    assert((await page.locator('.destination-selection__info h2').innerText()).includes('Mars'), 'La ficha en inglés debe mostrar Mars');
    await assertImagesLoaded(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(overflow <= 1, `Desborde horizontal en tableta: ${overflow}px`);
    await screenshot(page, 'tablet-mars.png');
    assert(problems.length === 0, `Problemas en tableta: ${problems.join(' | ')}`);
    await context.close();
  }

  // Móvil
  {
    const { context, page } = await open(browser, { width: 390, height: 844 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(overflow <= 1, `Desborde horizontal en móvil: ${overflow}px`);
    const confirm = await page.locator('.destination-selection__confirm').boundingBox();
    assert(confirm && confirm.y + confirm.height <= 844 + 1 && confirm.x >= 0, 'El botón de confirmar debe verse completo en móvil');
    await screenshot(page, 'mobile-moon.png');
    await context.close();
  }

  // Movimiento reducido: el cambio de destino no debe animarse
  {
    const { context, page } = await open(browser, { width: 1280, height: 720 }, { reducedMotion: 'reduce' });
    await page.locator('[data-destination="MARS"]').click();
    const duration = await page.locator('.destination-selection__scene--mars').evaluate((element) => getComputedStyle(element).transitionDuration);
    assert(/^0s(, 0s)*$|0\.01ms/.test(duration) || parseFloat(duration) < 0.05, `Con movimiento reducido la transición debe ser inmediata (${duration})`);
    await context.close();
  }

  console.log('Destination scene review passed.');
} finally {
  await browser.close();
}
