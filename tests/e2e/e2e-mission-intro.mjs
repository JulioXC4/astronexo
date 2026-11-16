/**
 * Minicinemática introductoria: «Jugar ahora» → video → 4 escenas → DESTINO.
 * Comprueba avance manual, «Saltar introducción», navegación única, idiomas, movimiento
 * reducido y que la introducción no se corte en 1366×768, 1920×1080 y tablet horizontal.
 */
import {
  launchBrowser, newMonitoredPage, screenshot, assertScreenHealthy, skipCinematic, failOnProblems, BASE_URL,
} from './helpers.mjs';

const VIEWPORTS = [
  { label: '1366', viewport: { width: 1366, height: 768 } },
  { label: '1920', viewport: { width: 1920, height: 1080 } },
  { label: 'tablet', viewport: { width: 1180, height: 820 } },
];

/** Al salir rápido de la bienvenida el navegador cancela fotogramas de su escena animada: no es un error. */
function realProblems(problems) {
  return problems.filter((p) => !/scenes\/landing\/frame-\d+\.webp/.test(p) && !/videos\//.test(p) && !/Failed to load resource: net::ERR_FAILED/.test(p));
}

async function assertNoClipping(page, label) {
  const issues = await page.evaluate(() => {
    const out = [];
    const root = document.querySelector('.mission-intro');
    if (!root) return ['sin .mission-intro'];
    const vw = window.innerWidth; const vh = window.innerHeight;
    for (const el of root.querySelectorAll('button, .mission-intro__title, .mission-intro__line, figcaption, .mi-chip, .mi-alert__text, .mi-gauge__label, .mi-rewards__label')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.bottom > vh + 1 || r.left < -1 || r.top < -1) out.push(`fuera de pantalla: ${el.className} "${el.textContent?.trim().slice(0, 30)}"`);
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') out.push(`texto cortado: ${el.className}`);
    }
    if (/\bintro\.[a-z]/.test(root.innerText)) out.push('clave i18n visible');
    if (/Texto no disponible|Text unavailable/.test(root.innerText)) out.push('texto no disponible');
    for (const img of root.querySelectorAll('img')) if (img.complete && img.naturalWidth === 0) out.push(`imagen rota: ${img.src}`);
    return out;
  });
  if (issues.length) throw new Error(`${label}: ${issues.join(' | ')}`);
}

async function waitImages(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('.mission-intro img')].every((img) => img.complete), null, { timeout: 8000 });
  await page.waitForTimeout(900); // animaciones de entrada
}

async function fullIntro(browser, { label, viewport }) {
  const { context, page, problems } = await newMonitoredPage(browser, viewport, `intro-${label}`);
  try {
    await page.goto(BASE_URL);
    await page.waitForSelector('.welcome__play');
    if (label === '1366') await screenshot(page, 'intro_00_welcome.png');
    await page.click('.welcome__play');
    await page.waitForSelector('.cinematic .mi-recruit');
    if (label === '1366') { await page.waitForTimeout(1200); await screenshot(page, 'intro_00_recruit_caption.png'); }
    await skipCinematic(page);
    await page.waitForSelector('.mission-intro');
    if (await page.locator('[data-destination]').count()) throw new Error('El destino apareció antes de la introducción.');
    if (await page.locator('.tutorial-coach .tutorial-coach__card, .radio-bubble').count()) throw new Error('Onboarding o radio superpuesto a la introducción.');
    const scenes = ['destination', 'base', 'training', 'space'];
    for (let i = 0; i < scenes.length; i += 1) {
      await page.waitForSelector(`.mission-intro--${scenes[i]}`);
      const progress = (await page.locator('.mission-intro__progress span').innerText()).trim();
      if (progress !== `${i + 1}/4`) throw new Error(`Progreso ${progress} en la escena ${i + 1}`);
      await waitImages(page);
      await assertNoClipping(page, `${label} escena ${i + 1}`);
      await assertScreenHealthy(page, `intro ${label} ${i + 1}`);
      await screenshot(page, `intro_${label}_${i + 1}_${scenes[i]}.png`);
      // Avance manual: la escena no cambia sola mientras el niño lee.
      if (i === 0) {
        await page.waitForTimeout(3000);
        if (!(await page.locator('.mission-intro--destination').count())) throw new Error('La escena avanzó sola.');
      }
      const button = page.locator('.mission-intro__next');
      if (i === 3 && !/ELIGE TU DESTINO/.test(await button.innerText())) throw new Error('Falta «¡ELIGE TU DESTINO!»');
      if (i < 3) await button.click();
    }
    // Doble clic en el botón final: una sola navegación y el segundo clic no pulsa nada del destino.
    await page.locator('.mission-intro__next').dblclick();
    await page.waitForSelector('[data-destination]');
    await page.waitForTimeout(600);
    if (await page.locator('.mission-intro').count()) throw new Error('La introducción siguió montada.');
    if (!(await page.locator('[data-destination]').count())) throw new Error('El doble clic saltó más allá de DESTINO.');
    failOnProblems(realProblems(problems));
    console.log(`  ✓ introducción completa ${label}`);
  } finally {
    await context.close();
  }
}

async function skipPath(browser) {
  const { context, page, problems } = await newMonitoredPage(browser, { width: 1366, height: 768 }, 'intro-skip');
  try {
    await page.goto(BASE_URL);
    await page.click('.welcome__play');
    await skipCinematic(page);
    await page.waitForSelector('.mission-intro--destination');
    await page.locator('.mission-intro__next').click();
    await page.waitForSelector('.mission-intro--base');
    // Teclado: Tab hasta «Saltar introducción» y Enter.
    await page.locator('.mission-intro__skip').focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-destination]');
    if (await page.locator('.mission-intro').count()) throw new Error('Saltar no cerró la introducción.');
    failOnProblems(realProblems(problems));
    console.log('  ✓ «Saltar introducción» llega a DESTINO');
  } finally {
    await context.close();
  }
}

/** La introducción en inglés, por el camino normal («Play now» → video → introducción). */
async function introEnglish(browser) {
  const { context, page, problems } = await newMonitoredPage(browser, { width: 1366, height: 768 }, 'intro-en');
  try {
    await page.addInitScript(() => localStorage.setItem('astronexo_lang_v3', 'en'));
    await page.goto(BASE_URL);
    if (await page.locator('button:has-text("Watch intro")').count()) throw new Error('El botón «Watch intro» de la bienvenida debía quitarse.');
    await page.click('.welcome__play');
    await skipCinematic(page);
    await page.waitForSelector('.mission-intro--destination');
    for (let i = 0; i < 3; i += 1) await page.locator('.mission-intro__next').click();
    await waitImages(page);
    await assertNoClipping(page, 'en escena 4');
    await screenshot(page, 'intro_en_4_space.png');
    await page.locator('.mission-intro__next:has-text("CHOOSE YOUR DESTINATION")').click();
    await page.waitForSelector('[data-destination]');
    failOnProblems(realProblems(problems));
    console.log('  ✓ introducción en inglés (sin botón «Watch intro»)');
  } finally {
    await context.close();
  }
}

async function reducedMotionAndBrokenVideo(browser) {
  const { context, page, problems } = await newMonitoredPage(browser, { width: 1180, height: 820 }, 'intro-reduced', { reducedMotion: 'reduce' });
  try {
    await page.route('**/assets/videos/**', (route) => route.abort());
    await page.goto(BASE_URL);
    await page.click('.welcome__play');
    await page.waitForSelector('.mission-intro--destination', { timeout: 10000 });
    const line = await page.locator('.mission-intro__line').innerText();
    if (!line.includes('Luna')) throw new Error('Con movimiento reducido falta el diálogo.');
    await waitImages(page);
    await screenshot(page, 'intro_reduced_1.png');
    await page.locator('.mission-intro__skip').click();
    await page.waitForSelector('[data-destination]');
    failOnProblems(realProblems(problems));
    console.log('  ✓ movimiento reducido / video caído');
  } finally {
    await context.close();
  }
}

async function brokenVideoMotion(browser) {
  const { context, page, problems } = await newMonitoredPage(browser, { width: 1366, height: 768 }, 'intro-video-error');
  try {
    await page.route('**/assets/videos/**', (route) => route.abort());
    await page.goto(BASE_URL);
    await page.click('.welcome__play');
    await page.waitForSelector('.mission-intro--destination', { timeout: 12000 });
    failOnProblems(realProblems(problems));
    console.log('  ✓ si el video falla, la introducción aparece igual');
  } finally {
    await context.close();
  }
}

const browser = await launchBrowser();
let failed = false;
for (const run of [
  ...VIEWPORTS.map((v) => () => fullIntro(browser, v)),
  () => skipPath(browser),
  () => introEnglish(browser),
  () => reducedMotionAndBrokenVideo(browser),
  () => brokenVideoMotion(browser),
]) {
  try { await run(); } catch (error) { failed = true; console.error('  ✗', error.message); }
}
await browser.close();
if (failed) process.exit(1);
