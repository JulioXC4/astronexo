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
  await page.waitForSelector('[data-destination]');
  if (destination === 'MARS') await page.click('[data-destination="MARS"]');
  await assertScreenHealthy(page, 'destino');
  await page.click('.destination-selection__confirm');
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
  await page.waitForSelector('.city-selection__confirm');
  if (city === 'TROMSO') {
    await page.locator('.city-selection__switcher [role=radio]').nth(1).click();
  }
  await page.click('.city-selection__confirm');
}

export async function passAvatarAndBriefing(page) {
  await page.waitForSelector('.asel-char');
  await page.click('button.pixel-btn--primary');
  await page.waitForSelector('.briefing-stage');
  await page.locator('.briefing-dialog-box__controls .pixel-btn--secondary').last().click();
  await page.click('.briefing-dialog-box__controls .pixel-btn--primary');
  await page.waitForSelector('.earth-base-facility');
}

// Cada entrenamiento termina en el botón «Confirmar costo de N punto(s)…» (decisión con costo).
async function confirmTraining(page) {
  await page.waitForSelector('button:has-text("Confirmar costo de"), button:has-text("Pagar")');
  await page.click('button:has-text("Confirmar costo de"), button:has-text("Pagar")');
}

export const TRAININGS = {
  // Arequipa
  // Rompecabezas de energía: orientar a 16°, cerrar el circuito, repartir (Comunicaciones 4 + Refugio 5) y pasar la noche.
  // La reserva nocturna la calcula el juego (≈58 % → costo 1), por lo que `reserve` ya no se controla desde fuera.
  SOLAR_DETECTIVE: async (page) => {
    await setSliderValue(page, '#tilt-angle-slider', 16);
    await page.click('[data-sd="close"]');
    const add = (system, times) => page.locator(`[data-system="${system}"] .sd-system__steps button:nth-child(2)`).click({ clickCount: times, delay: 40 });
    await add('communications', 4);
    await add('shelter', 5);
    await page.click('[data-sd="night"]');
    await page.waitForSelector('[data-sd="claim"]', { timeout: 20000 });
    await page.click('[data-sd="claim"]');
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
  // Operación Refugio: alarma → tripulación por la ruta libre → energía de respaldo → compuerta → antena → llegada.
  SOLAR_WATCH: async (page, { event = 0 } = {}) => {
    await page.waitForSelector('.storm-brief');
    await page.locator('.storm-brief .mg-choice').nth(1).locator('button').nth(event).click();
    await page.click('.storm-start');
    await page.click('[data-station="alarm"]');
    for (const crew of ['A', 'B']) {
      await page.click(`[data-crew="${crew}"]`);
      await page.locator(`[data-crew="${crew}"] ~ .storm-routes [data-route="free"]`).click();
    }
    await page.click('[data-station="backup"]');
    await page.click('[data-station="hatch"]');
    await page.click('[data-station="telemetry"]');
    await page.click('.storm-impact');
    await page.waitForSelector('.storm-finish', { timeout: 15000 });
    await page.click('.storm-finish');
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
  await page.click('.emap-panel__start');
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

/** Ejecuta una intervención real desde el menú compacto usando su alternativa accesible. */
export async function performIntervention(page, labels) {
  await page.click('.intervention-menu-trigger');
  for (const label of labels) {
    const option = page.locator(`button.intervention-option:not([disabled]):has-text("${label}")`).first();
    if (await option.count()) {
      await option.click();
      await solveInterventionPuzzle(page, label);
      const confirm = page.locator('.intervention-console button.pixel-button--confirm');
      await confirm.waitFor({ state: 'visible' });
      await confirm.click();
      return label;
    }
  }
  await page.click('.intervention-menu-scrim');
  throw new Error(`Ninguna intervención estaba disponible: ${labels.join(', ')}`);
}

async function solveInterventionPuzzle(page, label) {
  if (label === 'Reparar paneles') {
    const tiles = page.locator('.circuit-tile');
    await tiles.nth(0).click(); await tiles.nth(3).click();
    await tiles.nth(0).click(); await tiles.nth(1).click(); await tiles.nth(1).click();
  } else if (label === 'Limpiar paneles') {
    const cells = page.locator('.solar-cell'); await cells.nth(1).click(); await cells.nth(4).click();
  } else if (label === 'Parchar fuga') {
    await page.locator('.compartment').nth(1).click();
    await page.locator('.damage-point').nth(0).click(); await page.locator('.damage-point').nth(1).click();
  } else if (label === 'Reciclar oxígeno') {
    await page.locator('.eclss-board article').nth(0).locator('.port').click(); await page.click('.eclss-machine .port:has-text("Entrada de agua")');
    await page.locator('.eclss-board article').nth(1).locator('.port').click(); await page.click('.eclss-machine .port:has-text("Entrada eléctrica")');
    await page.click('.eclss-machine .port:has-text("Salida de O₂")'); await page.click('.eclss-board article:nth-child(4) .port');
  } else if (label === 'Reforzar refugio') {
    await page.locator('.material-card').first().click();
    const zones = page.locator('.shelter-zone'); await zones.nth(0).click(); await zones.nth(1).click(); await zones.nth(2).click();
  } else if (label === 'Hacer ciencia') {
    await page.locator('.sample-rack .science-sample').nth(0).click();
    await page.locator('.instrument').nth(0).click(); await page.locator('.classification-grid button').nth(0).click();
    await page.locator('.sample-rack .science-sample').nth(1).click();
    const sample = await page.locator('.science-sample--active').innerText();
    await page.locator('.instrument').nth(/Anortosita/i.test(sample) ? 1 : 2).click();
    await page.locator('.classification-grid button').nth(/Anortosita/i.test(sample) ? 1 : 2).click();
  } else if (label === 'Gestionar invernadero') {
    const trays = page.locator('.plant-tray'); await trays.nth(0).click(); await trays.nth(1).click();
    await page.click('.greenhouse-decision button:has-text("MANTENER")');
  } else if (label === 'Consultar a Tierra') {
    await page.locator('.problem-grid button').first().click();
    const facts = page.locator('.message-builder>div button'); await facts.nth(0).click(); await facts.nth(1).click();
    await page.click('.transmit-button');
  } else {
    throw new Error(`No existe solucionador E2E para ${label}`);
  }
}

export async function performScienceIntervention(page) {
  return performIntervention(page, ['Hacer ciencia']);
}

export async function performSurvivalIntervention(page) {
  return performIntervention(page, [
    'Reparar paneles', 'Limpiar paneles', 'Parchar fuga', 'Reciclar oxígeno', 'Reforzar refugio', 'Gestionar invernadero',
  ]);
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
