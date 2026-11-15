import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173/';
export const SCREENSHOT_DIR = path.resolve('tests/e2e/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const TUTORIAL_STEPS = ['welcome.solo', 'map.pin', 'map.tool', 'map.counter', 'guard.actions', 'guard.alerts', 'guard.resources', 'intervention.first'];

/** Valores diarios POWER guardados en el snapshot; sirven para calcular la reserva que pide «Nubes y soles». */
export function recommendedCloudsReserve(cityId) {
  const file = JSON.parse(fs.readFileSync(path.resolve('src/data/nasa/snapshots/power.json'), 'utf8'));
  const values = file.cities?.[cityId]?.days?.map((day) => day.value);
  if (!values) throw new Error(`power.json no tiene datos de ${cityId}`);
  const best = Math.max(...values);
  return Math.round((values.reduce((sum, value) => sum + (1 - value / best), 0) / values.length) * 100);
}

export async function launchBrowser() {
  // Usa Chrome ya instalado (channel: 'chrome'); no descarga navegadores.
  return chromium.launch({ channel: 'chrome', headless: true });
}

/** Contexto con español, tutorial completado y vigilancia de errores JS, recursos fallidos e imágenes rotas. */
export async function newMonitoredPage(browser, viewport, label) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((steps) => {
    localStorage.setItem('astronexo_lang_v3', 'es');
    localStorage.setItem('astronexo_tutorial_v1', JSON.stringify(Object.fromEntries(steps.map((id) => [id, true]))));
  }, TUTORIAL_STEPS);
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(`[${label}] pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`[${label}] console.error: ${message.text()}`);
  });
  page.on('requestfailed', (request) => problems.push(`[${label}] request failed: ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`[${label}] HTTP ${response.status()}: ${response.url()}`);
  });
  return { context, page, problems };
}

export async function screenshot(page, filename) {
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: true });
  console.log(`[Screenshot] ${filename}`);
}

/** Falla si hay imágenes <img>/<image> rotas, claves de traducción visibles o placeholders {x} sin resolver. */
export async function assertScreenHealthy(page, where) {
  const report = await page.evaluate(() => {
    const broken = [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src);
    const text = document.body.innerText;
    const rawKeys = text.match(/\b(?:common|destinations|cities|baseBuilder|stationPrep|construction|monitor|nasaSources|nasaStatus|minigames|station|results|map|tools|spaceGame)\.[A-Za-z]+(?:\.[A-Za-z_]+)*\b/g) ?? [];
    const placeholders = text.match(/\{[A-Za-z]+\}/g) ?? [];
    return { broken, rawKeys, placeholders, undefinedText: /\bundefined\b|\bNaN\b|\[object Object\]/.test(text) };
  });
  const issues = [];
  if (report.broken.length) issues.push(`imágenes rotas: ${report.broken.join(', ')}`);
  if (report.rawKeys.length) issues.push(`claves técnicas visibles: ${report.rawKeys.join(', ')}`);
  if (report.placeholders.length) issues.push(`placeholders visibles: ${report.placeholders.join(', ')}`);
  if (report.undefinedText) issues.push('texto "undefined"/"NaN" visible');
  if (issues.length) throw new Error(`[${where}] ${issues.join(' | ')}`);
}

export async function setSliderValue(page, selector, value) {
  await page.waitForSelector(selector);
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, value: String(value) });
}

// ---------------------------------------------------------------- Pasos del flujo JD

export async function startFromWelcome(page) {
  await page.goto(BASE_URL);
  await page.waitForSelector('.welcome__play');
  await assertScreenHealthy(page, 'welcome');
  await page.click('.welcome__play');
}

export async function chooseDestination(page, destination) {
  await page.waitForSelector('.destination-card');
  if (destination === 'MARS') await page.click('.destination-card:has-text("Marte")');
  await assertScreenHealthy(page, 'destino');
  await page.click('button.earth-action-btn');
}

/** Paso 3: construir 3 de 5 módulos ANTES de elegir la ciudad. Devuelve los nombres elegidos. */
export async function buildStation(page, indexes = [0, 1, 2]) {
  await page.waitForSelector('.module-picker__button');
  if ((await page.locator('.module-picker__button').count()) !== 5) throw new Error('El constructor debe ofrecer 5 módulos.');
  const names = [];
  for (const index of indexes) {
    const button = page.locator('.module-picker__button').nth(index);
    names.push((await button.locator('span').first().innerText()).trim());
    await button.click();
  }
  await assertScreenHealthy(page, 'constructor');
  if (await page.locator('button.builder-start').isDisabled()) throw new Error('El constructor no habilitó la confirmación con 3 módulos.');
  await page.click('button.builder-start');
  return names;
}

export async function passStationPrep(page) {
  await page.waitForSelector('button:has-text("Elegir mi base de entrenamiento")');
  await assertScreenHealthy(page, 'estación en preparación');
  await page.click('button:has-text("Elegir mi base de entrenamiento")');
}

export async function chooseCity(page, city) {
  if (city === 'TROMSO') {
    await page.waitForSelector('button.callsign-chip:has-text("Tromsø")');
    await page.click('button.callsign-chip:has-text("Tromsø")');
    await page.click('button.earth-action-btn:has-text("Confirmar Base en Tromsø")');
  } else {
    await page.waitForSelector('button.earth-action-btn:has-text("Confirmar Base en Arequipa")');
    await page.click('button.earth-action-btn:has-text("Confirmar Base en Arequipa")');
  }
}

export async function passAvatarAndBriefing(page) {
  await page.waitForSelector('.avatar-card');
  await page.click('button.earth-action-btn');
  await page.waitForSelector('.briefing-portrait');
  await page.click('button.earth-action-btn');
  await page.waitForSelector('.earth-base-facility');
}

// Cada entrenamiento termina en el botón «Confirmar costo de N punto(s)…» (decisión con costo).
async function confirmTraining(page) {
  await page.waitForSelector('button:has-text("Confirmar costo de"), button:has-text("Pagar")');
  await page.click('button:has-text("Confirmar costo de"), button:has-text("Pagar")');
}

export const TRAININGS = {
  // Arequipa
  SOLAR_DETECTIVE: async (page, { reserve = 55 } = {}) => {
    await setSliderValue(page, '#tilt-angle-slider', 16);
    await setSliderValue(page, '#solar-reserve-slider', reserve);
    await page.click('button:has-text("Cerrar Interruptor")');
    await confirmTraining(page);
  },
  ALTITUDE_ACCLIMATIZATION: async (page, { pressure = 72 } = {}) => {
    await setSliderValue(page, '#pressure-slider', pressure);
    await page.click('button:has-text("Sello Principal")');
    await page.click('button:has-text("Escotilla Exterior")');
    await page.click('button:has-text("Retorno N₂")');
    await page.click('button:has-text("Verificar Hermeticidad")');
    await confirmTraining(page);
  },
  // Tromsø
  DARK_MONTHS_RESERVE: async (page) => {
    // Calefacción ≥50% (55% → costo 1), cultivos ≥20%, telemetría ≥10%; el total debe sumar 100%.
    await setSliderValue(page, '#polar-heat', 55);
    await setSliderValue(page, '#polar-crops', 30);
    await setSliderValue(page, '#polar-radio', 15);
    await page.click('button:has-text("Simular Noche Continua")');
    await confirmTraining(page);
  },
  ARCTIC_GREENHOUSE: async (page) => {
    await page.click('button:has-text("Auto-Calibrar")');
    await page.click('span:has-text("Aislamiento Térmico Cúpula:") + button'); // la cúpula debe quedar aislada
    await page.click('button:has-text("Verificar Ciclo Ártico")');
    await confirmTraining(page);
  },
  SOLAR_WATCH: async (page, { event = 0 } = {}) => {
    await page.waitForSelector('.callsign-chip');
    await page.locator('.callsign-chip').nth(event).click();
    await page.click('button:has-text("1. Sonar Alarma de Evacuación")');
    await page.waitForSelector('button:has-text("2. Cerrar Compuerta Blindada"):not([disabled])');
    await page.click('button:has-text("2. Cerrar Compuerta Blindada")');
    await page.waitForSelector('button:has-text("3. Blindar Telemetría"):not([disabled])');
    await page.click('button:has-text("3. Blindar Telemetría")');
    await page.click('button:has-text("Simular Llegada de la Tormenta Solar")');
    await confirmTraining(page);
  },
  // Común: usa los valores POWER de la ciudad (power.json) para decidir la reserva
  CLOUDS_SUNS: async (page, { city, reserve } = {}) => {
    await setSliderValue(page, '#clouds-reserve', reserve ?? recommendedCloudsReserve(city));
    await page.click('button:has-text("Probar la reserva")');
    await confirmTraining(page);
  },
};

/** Abre la instalación `index` del mapa, la completa y atraviesa la transición de obra. */
export async function completeTraining(page, index, id, options, isLast) {
  await page.waitForSelector('.earth-base-facility');
  await page.locator('.earth-base-facility').nth(index).click();
  await page.click('button:has-text("Ejecutar Misión")');
  await TRAININGS[id](page, options);
  await page.waitForSelector('.pixel-kicker:has-text("AVANCE DE OBRA")');
  await assertScreenHealthy(page, `obra tras ${id}`);
  await page.click(isLast ? 'button:has-text("Ir al despegue")' : 'button:has-text("Seguir entrenando")');
}

export async function flyAndMonitor(page, { destination, modules }) {
  await page.waitForSelector('button:has-text("Aproximarse a")');
  await page.click('button:has-text("Aproximarse a")');
  await page.waitForSelector('button:has-text("Tomar el Mando de la Base")');
  await page.click('button:has-text("Tomar el Mando de la Base")');
  // Monitoreo inicial: módulos, recursos, herramientas y clima espacial NASA
  await page.waitForSelector('.pixel-kicker:has-text("REVISIÓN DE SISTEMAS")');
  await assertScreenHealthy(page, 'monitoreo');
  const text = await page.locator('main.earth-card').innerText();
  for (const name of modules) {
    if (!text.includes(name)) throw new Error(`El monitoreo no muestra el módulo construido «${name}».`);
  }
  if (!text.includes('NASA DONKI') || !text.includes('km/s')) throw new Error('El monitoreo no muestra el evento NASA DONKI.');
  if (await page.locator('.module-picker__button').count()) throw new Error('El constructor reapareció tras aterrizar.');
  await page.click('button:has-text("Iniciar guardia")');
  await page.waitForSelector('.mission-clock');
  if (await page.locator('.module-picker__button').count()) throw new Error('El constructor reapareció al iniciar la guardia.');
}

/** Menú compacto «Acciones» → «No intervenir» → confirmar. */
export async function skipIntervention(page) {
  await page.click('.intervention-menu-trigger');
  await page.click('button.intervention-option--skip');
  await page.click('button.pixel-button--confirm');
}

/** Cinco turnos. `act` opcional permite una acción en el turno; por defecto «No intervenir». */
export async function playFiveTurns(page, { coop = false, actOnTurn } = {}) {
  for (let turn = 1; turn <= 5; turn++) {
    await page.waitForSelector('.mission-clock');
    if (actOnTurn?.[turn]) await actOnTurn[turn](page);
    else await skipIntervention(page);
    if (coop) {
      const confirm = page.locator('.group-decision-dialog button.pixel-button--primary');
      await confirm.waitFor({ state: 'visible' });
      await confirm.click();
    }
    await page.waitForFunction(() => !document.querySelector('footer.turn-controls button')?.hasAttribute('disabled'));
    await page.click('footer.turn-controls button');
    await page.waitForSelector('.turn-transition button');
    await page.click('.turn-transition button');
    // Si la misión termina antes del turno 5 (interrupción), el informe aparece en lugar del siguiente turno.
    const next = await Promise.race([
      page.waitForSelector('.mission-clock').then(() => 'turn', () => 'turn'),
      page.waitForSelector('.results-hero, .coop-results-shell').then(() => 'result', () => 'result'),
    ]);
    if (next === 'result' || (await page.locator('.results-hero, .coop-results-shell').count())) return turn;
  }
  return 5;
}

export async function readOutcome(page) {
  const text = await page.locator('.results-hero, .coop-results-shell').first().innerText();
  if (/INTERRUMPIDA/i.test(text)) return 'INTERRUMPIDA';
  if (/INCOMPLETA/i.test(text)) return 'INCOMPLETA'; // 5 turnos sin alcanzar el objetivo científico (resultado parcial)
  if (/COMPLETADA/i.test(text)) return 'COMPLETADA';
  throw new Error(`El informe no indica resultado: ${text.slice(0, 120)}`);
}

export async function returnToWelcome(page) {
  await page.click('button:has-text("VOLVER A LA TIERRA"), button:has-text("ENTREGAR INFORME")');
  await page.waitForSelector('button:has-text("Ver Análisis y Próxima Aventura")');
  await page.click('button:has-text("Ver Análisis y Próxima Aventura")');
  await page.waitForSelector('button:has-text("Volver a la Bienvenida")');
  await page.click('button:has-text("Volver a la Bienvenida")');
  await page.waitForSelector('.welcome__play');
}

export function failOnProblems(problems) {
  if (problems.length) throw new Error(`Errores de navegador:\n${[...new Set(problems)].join('\n')}`);
}
