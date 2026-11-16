import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4173/';
const outputDir = process.env.SCREENSHOT_DIR ?? '/tmp/astronexo-animated-scenes-review';
fs.mkdirSync(outputDir, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function seed(context, language = 'es') {
  await context.addInitScript(({ language }) => {
    localStorage.setItem('astronexo_lang_v3', language);
    localStorage.setItem('astronexo_tutorial_v1', JSON.stringify({ 'welcome.solo': true }));
  }, { language });
}

async function assertImagesLoaded(page) {
  const broken = await page.locator('img').evaluateAll((images) => images
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map((image) => image.getAttribute('src')));
  assert(broken.length === 0, `Broken images: ${broken.join(', ')}`);
}

async function screenshot(page, name) {
  const file = path.join(outputDir, name);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[capture] ${file}`);
}

/** El flujo actual empieza por destino y constructor; la selección de ciudad llega después. */
async function reachCitySelection(page) {
  await page.locator('.welcome__play').click();
  await page.locator('.destination-selection__confirm').click();
  await page.locator('.module-picker__button').first().waitFor();
  for (const index of [0, 1, 2]) await page.locator('.module-picker__button').nth(index).click();
  await page.locator('button.builder-start').click();
  await page.locator('.earth-action-btn, .city-selection__confirm').first().waitFor();
  if (await page.locator('.earth-action-btn').count()) await page.locator('.earth-action-btn').click().catch(() => {});
  await page.locator('.city-selection__confirm').waitFor();
}

async function openLanding(context, viewportName) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedResponses = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('.welcome__play').waitFor();
  await assertImagesLoaded(page);
  await page.waitForFunction(() => document.querySelector('.welcome__scene .pixel-scene__overlay'), undefined, { timeout: 5_000 });
  await page.waitForTimeout(220);
  await screenshot(page, `${viewportName}-landing.png`);
  return { page, consoleErrors, pageErrors, failedResponses };
}

const browser = await chromium.launch({
  executablePath: '/opt/google/chrome/chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const desktop = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await seed(desktop);
  const desktopRun = await openLanding(desktop, 'desktop');
  const { page } = desktopRun;
  await reachCitySelection(page);
  await assertImagesLoaded(page);
  assert(await page.locator('[data-city="AREQUIPA"]').getAttribute('aria-checked') === 'true', 'Arequipa should be selected initially');
  await screenshot(page, 'desktop-arequipa.png');

  await page.locator('[data-city="TROMSO"]').click();
  await page.waitForTimeout(3_100);
  assert(await page.locator('[data-city="TROMSO"]').getAttribute('aria-checked') === 'true', 'Tromsø click did not select the scene');
  assert(await page.locator('.city-selection__scene--tromso .pixel-scene__overlay').count() === 1, 'Tromsø aurora overlay did not enter its animated state');
  await screenshot(page, 'desktop-tromso.png');

  await page.locator('[data-city="TROMSO"]').press('ArrowLeft');
  assert(await page.locator('[data-city="AREQUIPA"]').getAttribute('aria-checked') === 'true', 'Arrow-key selection did not return to Arequipa');
  await page.locator('.city-selection__science summary').click();
  assert(await page.locator('.city-selection__science').getAttribute('open') !== null, 'NASA POWER details did not expand');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 1, `Desktop horizontal overflow: ${overflow}px`);
  await page.locator('.city-selection__confirm').click();
  await page.locator('.asel-char').first().waitFor(); // tras la ciudad llega la selección de astronauta
  assert(desktopRun.pageErrors.length === 0, `Page errors: ${desktopRun.pageErrors.join(' | ')}`);
  const relevantResponses = desktopRun.failedResponses.filter((item) => item.includes('/assets/scenes/'));
  assert(relevantResponses.length === 0, `Scene asset responses failed: ${relevantResponses.join(' | ')}`);
  if (desktopRun.failedResponses.length) console.log(`[existing response warnings] ${desktopRun.failedResponses.join(' | ')}`);
  await desktop.close();

  const tablet = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true });
  await seed(tablet, 'en');
  const tabletRun = await openLanding(tablet, 'tablet');
  await reachCitySelection(tabletRun.page);
  await tabletRun.page.locator('[data-city="TROMSO"]').tap();
  await tabletRun.page.waitForTimeout(700);
  await assertImagesLoaded(tabletRun.page);
  const tabletOverflow = await tabletRun.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(tabletOverflow <= 1, `Tablet horizontal overflow: ${tabletOverflow}px`);
  await screenshot(tabletRun.page, 'tablet-tromso.png');
  assert(tabletRun.pageErrors.length === 0, `Tablet page errors: ${tabletRun.pageErrors.join(' | ')}`);
  const tabletSceneFailures = tabletRun.failedResponses.filter((item) => item.includes('/assets/scenes/'));
  assert(tabletSceneFailures.length === 0, `Tablet scene asset responses failed: ${tabletSceneFailures.join(' | ')}`);
  await tablet.close();

  const reduced = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  await seed(reduced);
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' });
  const reducedSrc = await reducedPage.locator('.welcome__scene .pixel-scene__poster').getAttribute('src');
  assert(reducedSrc?.endsWith('/assets/scenes/landing/poster.webp'), `Reduced motion did not use the poster: ${reducedSrc}`);
  await reducedPage.waitForTimeout(1_200);
  assert(await reducedPage.locator('.welcome__scene .pixel-scene__poster').getAttribute('src') === reducedSrc, 'Reduced-motion scene changed frames');
  assert(await reducedPage.locator('.welcome__scene .pixel-scene__base').count() === 0, 'Reduced-motion scene rendered an active base frame');
  assert(await reducedPage.locator('.welcome__scene .pixel-scene__overlay').count() === 0, 'Reduced-motion scene rendered animated overlays');
  await screenshot(reducedPage, 'reduced-motion-landing.png');
  await reduced.close();

  console.log('Animated scene review passed.');
} finally {
  await browser.close();
}
