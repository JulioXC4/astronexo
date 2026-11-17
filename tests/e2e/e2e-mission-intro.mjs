/**
 * Minicinemática introductoria: «Jugar ahora» → video → apertura → 4 escenas → DESTINO.
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
const SCENES = ['opening', 'training', 'destination', 'base', 'space'];

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
    for (const el of root.querySelectorAll('button, .mission-intro__title, .mission-intro__subtitle, .mission-intro__line, figcaption, .mi-chip, .mi-alert__text, .mi-gauge__label, .mi-rewards__label')) {
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

async function welcomeTrailer(browser) {
  const { context, page, problems } = await newMonitoredPage(browser, { width: 320, height: 640 }, 'welcome-trailer');
  try {
    const embed = 'https://www.youtube-nocookie.com/embed/9l9FvGKSMEo?autoplay=0&playsinline=1';
    const external = 'https://youtu.be/9l9FvGKSMEo';
    await context.route(embed, (route) => route.fulfill({ contentType: 'text/html', body: '<p>Video unavailable</p>' }));
    await context.route(external, (route) => route.fulfill({ contentType: 'text/html', body: '<p>YouTube</p>' }));
    await page.addInitScript(() => {
      const tracks = [];
      window.Audio = new Proxy(window.Audio, {
        construct(target, args) {
          const track = Reflect.construct(target, args);
          tracks.push(track);
          return track;
        },
      });
      window.welcomeMusic = () => tracks.find((track) => track.src.includes('01-tema-principal-bienvenida'));
    });
    await page.goto(BASE_URL);
    const actions = page.locator('.welcome__secondary');
    const trigger = actions.getByRole('button', { name: 'Ver tráiler' });
    const dialog = page.getByRole('dialog', { name: 'Ver tráiler' });
    const trailerBounds = await trigger.boundingBox();
    const stationBounds = await actions.getByRole('button', { name: 'Modo Estación' }).boundingBox();
    if (Math.abs(trailerBounds.height - stationBounds.height) > 1 || trailerBounds.y !== stationBounds.y) {
      throw new Error('«Ver tráiler» debe compartir altura y fila con «Modo Estación».');
    }
    await page.locator('.welcome__wordmark').click();
    const music = await page.waitForFunction(() => {
      const track = window.welcomeMusic();
      return track && !track.paused && track.currentTime > 0.2 && track;
    }, null, { timeout: 8000 });
    if (await page.locator('.welcome__trailer-player').count()) throw new Error('El video se monta antes de pulsar «Ver tráiler».');
    await trigger.click();
    await dialog.locator('iframe').contentFrame().getByText('Video unavailable').waitFor();
    await page.waitForFunction((track) => track.paused, music, { timeout: 3000 });
    const pausedAt = await music.evaluate((track) => track.currentTime);
    const [tab] = await Promise.all([
      context.waitForEvent('page'),
      dialog.getByRole('link', { name: /Abrir en YouTube/ }).click(),
    ]);
    await tab.waitForURL(external);
    await tab.close();
    if (!(await music.evaluate((track, time) => track.paused && Math.abs(track.currentTime - time) < 0.05, pausedAt))) {
      throw new Error('La música avanzó con el tráiler abierto.');
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    await page.waitForFunction((track) => !track.paused, music, { timeout: 3000 });
    if (await music.evaluate((track) => track.currentTime) < pausedAt - 0.05) throw new Error('La música se reinició al cerrar el tráiler.');
    await page.waitForFunction((button) => document.activeElement === button, await trigger.elementHandle());
    await trigger.click();
    await dialog.getByRole('button', { name: 'Cerrar' }).click();
    await dialog.waitFor({ state: 'detached' });
    await page.locator('.welcome__play').waitFor();
    failOnProblems(realProblems(problems));
    console.log('  ✓ tráiler, enlace externo y pausa de la música');
  } finally {
    await context.close();
  }
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
    for (let i = 0; i < SCENES.length; i += 1) {
      const scene = SCENES[i];
      await page.waitForSelector(`.mission-intro--${scene}`);
      const progress = (await page.locator('.mission-intro__progress span').innerText()).trim();
      if (progress !== `${i + 1}/${SCENES.length}`) throw new Error(`Progreso ${progress} en la escena ${i + 1}`);
      await waitImages(page);
      await assertNoClipping(page, `${label} escena ${i + 1}`);
      await assertScreenHealthy(page, `intro ${label} ${i + 1}`);
      await screenshot(page, `intro_${label}_${i + 1}_${scene}.png`);
      // Avance manual: la escena no cambia sola mientras el niño lee.
      if (scene === 'training') {
        await page.waitForTimeout(3000);
        if (!(await page.locator('.mission-intro--training').count())) throw new Error('La escena avanzó sola.');
      }
      const button = page.locator('.mission-intro__next');
      if (scene === 'space' && !/ELIGE TU DESTINO/.test(await button.innerText())) throw new Error('Falta «¡ELIGE TU DESTINO!»');
      if (scene !== 'space') await button.click();
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
    await page.waitForSelector('.mission-intro--opening');
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
    await page.waitForSelector('.mission-intro--opening');
    for (const scene of SCENES.slice(0, -1)) {
      await page.locator(`.mission-intro--${scene} .mission-intro__next`).click();
    }
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
  const { context, page, problems } = await newMonitoredPage(browser, { width: 320, height: 640 }, 'intro-reduced', { reducedMotion: 'reduce' });
  try {
    await page.route('**/assets/videos/**', (route) => route.abort());
    await page.goto(BASE_URL);
    await page.click('.welcome__play');
    await page.waitForSelector('.mission-intro--opening', { timeout: 10000 });
    await assertNoClipping(page, 'apertura en móvil');
    await page.waitForTimeout(5000);
    const opening = page.locator('.mission-intro--opening');
    if (!(await opening.count())) throw new Error('La apertura avanzó sin pulsar «Siguiente».');
    await opening.locator('.mission-intro__next').click();
    await page.waitForSelector('.mission-intro--training', { timeout: 1200 });
    const line = await page.locator('.mission-intro__line').innerText();
    if (!line.includes('NASA')) throw new Error('Con movimiento reducido falta el diálogo de entrenamiento.');
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
    await page.waitForSelector('.mission-intro--opening', { timeout: 12000 });
    failOnProblems(realProblems(problems));
    console.log('  ✓ si el video falla, la introducción aparece igual');
  } finally {
    await context.close();
  }
}

const browser = await launchBrowser();
let failed = false;
for (const run of [
  () => welcomeTrailer(browser),
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
