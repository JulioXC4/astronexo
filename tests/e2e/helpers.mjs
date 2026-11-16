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
  await page.click('button.pixel-btn--primary');
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
  await page.waitForSelector('.city-selection__switcher');
  if (city === 'TROMSO') await page.click('.city-selection__switcher button[data-city="TROMSO"]');
  await page.click('button.city-selection__confirm');
}

export async function passAvatarAndBriefing(page) {
  await page.waitForSelector('button:has-text("Elegir a")');
  await page.click('button:has-text("Elegir a")');
  await page.waitForSelector('.briefing-stage');
  // Los diálogos avanzan con «Siguiente»; el último botón lleva al mapa.
  for (let i = 0; i < 6; i++) {
    const next = page.locator('button:has-text("Siguiente")').first();
    if (await next.count() && await next.isVisible().catch(() => false)) { await next.click(); await page.waitForTimeout(200); } else break;
  }
  await page.click('button:has-text("Entrar al Mapa"), button:has-text("Ir al mapa")');
  await page.waitForSelector('.earth-base-facility');
}

/** Lleva una perilla a un valor con las flechas del teclado (es un control accesible: role=slider). */
async function setDial(page, label, target) {
  const dial = page.locator(`svg[role="slider"][aria-label="${label}"]`).first();
  await dial.waitFor({ state: 'visible' });
  await dial.focus();
  for (let i = 0; i < 160; i++) {
    const now = Number(await dial.getAttribute('aria-valuenow'));
    if (now === target) return;
    const before = now;
    await page.keyboard.press(now < target ? 'ArrowRight' : 'ArrowLeft');
    const after = Number(await dial.getAttribute('aria-valuenow'));
    // El paso de la perilla puede no caer justo en el objetivo: basta con quedar al otro lado.
    if (after === before || (before < target) !== (after < target)) return;
  }
}

// Los entrenamientos de la Tierra ya no tienen «Verificar»: al quedar bien aparece «¡Consigue tu kit!».
async function claimKit(page) {
  await page.waitForSelector('.training__kit');
  await page.click('.training__kit');
}

export const TRAININGS = {
  // Arequipa
  SOLAR_DETECTIVE: async (page) => {
    const sprites = page.locator('.solar-game__sprite-button');
    await sprites.nth(0).click(); // gira el panel hacia el sol
    await sprites.nth(1).click(); // cierra el interruptor
    const pour = async (system, cells) => {
      await page.click(`.solar-game__system-main:has-text("${system}")`);
      for (let i = 0; i < cells; i++) await page.locator('.solar-game__energy-cells button.is-full').first().click();
    };
    await pour('Comunicaciones', 4);
    await pour('Refugio', 5);
    await page.click('.solar-game__primary'); // simular día y noche
    await page.waitForSelector('.solar-game__game-actions .solar-game__primary:has-text("kit"), .solar-game__game-actions .solar-game__primary:has-text("Reclam"), .solar-game__game-actions .solar-game__primary:has-text("Obtener")', { timeout: 20000 });
    await page.click('.solar-game__game-actions .solar-game__primary');
  },
  ALTITUDE_ACCLIMATIZATION: async (page, { pressure = 72 } = {}) => {
    await setDial(page, 'Presión de la cámara', pressure);
    for (let i = 0; i < 3; i++) await page.locator('.chamber__seal').nth(i).click();
    await claimKit(page);
  },
  ECLSS_TRAINING: async (page) => {
    await setDial(page, 'Potencia de la máquina', 300);
    await setDial(page, 'Agua reciclada', 88);
    await page.click('.train-switch button'); // limpiador de aire
    await claimKit(page);
  },
  VEGGIE_LAB: async (page) => {
    await setDial(page, 'Color de la luz', 70);
    await page.click('.train-choice__row button:has-text("Media")');
    await claimKit(page);
  },
  // Tromsø
  DARK_MONTHS_RESERVE: async (page) => {
    // 4 baterías en calefacción se congelan: se pasa una de radio a calefacción.
    await page.click('.polar__place--radio');
    await page.click('.polar__place--heat');
    await claimKit(page);
  },
  ARCTIC_GREENHOUSE: async (page) => {
    await setDial(page, 'Calor de la Tierra', 52);
    await page.click('.train-switch button'); // cerrar la cúpula
    await claimKit(page);
  },
  SOLAR_WATCH: async (page, { event = 0 } = {}) => {
    await page.waitForSelector('.storm-brief__choices');
    await page.locator('.storm-brief__choices').nth(1).locator('button').nth(event).click();
    await page.click('.storm-brief .storm-primary');
    const machine = page.locator('.storm-machine__sprite');
    await machine.click(); // alarma
    for (const crew of [0, 1]) await page.locator('.storm-routes > div').nth(crew).locator('button').first().click();
    await page.click('.storm-backup');
    await page.locator('.storm-station-tab').nth(1).click();
    await machine.click(); // refugio
    await page.locator('.storm-station-tab').nth(2).click();
    await machine.click(); // telemetría
    await page.click('.storm-controls .storm-primary'); // simular llegada
    await page.waitForSelector('.storm-result.is-success .storm-primary', { timeout: 8000 });
    await page.click('.storm-result.is-success .storm-primary');
  },
  // Común: usa los valores POWER de la ciudad (power.json) para decidir la reserva
  CLOUDS_SUNS: async (page, { city, reserve } = {}) => {
    await setDial(page, 'Energía que guardas', reserve ?? recommendedCloudsReserve(city));
    await claimKit(page);
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
    await page.locator('.compartment[data-low-pressure="true"]').click();
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
    // La luz va a las dos plantas pequeñas; la crecida (data-mature) puede esperar.
    const small = page.locator('.plant-tray[data-mature="false"]'); await small.nth(0).click(); await small.nth(1).click();
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

/**
 * La salida a explorar aparece tras los turnos 2 y 4. `stay` se queda en la base;
 * `rescue` sale a pie y pide rescate al instante (prueba todo el trayecto sin depender del tiempo real).
 */
async function handleExploration(page, mode) {
  if (mode === 'stay') {
    await page.click('.explore-card button:has-text("Quedarme")');
    return;
  }
  // Con menos de 25 de Energía u Oxígeno la salida a pie está desactivada: es la regla del juego.
  if (await page.locator('.explore-card button:has-text("Salir a pie")').isDisabled()) {
    console.log('    (sin recursos para salir a pie: se queda en la base, como pide la regla)');
    await page.click('.explore-card button:has-text("Quedarme")');
    return;
  }
  await page.click('.explore-card button:has-text("Salir a pie")');
  await page.waitForSelector('.explore__canvas');
  await page.click('.explore__controls button:has-text("rescate")');
  await page.waitForSelector('.explore-report');
  await assertScreenHealthy(page, 'informe de la salida');
  await page.click('.explore-report button.pixel-button--primary');
}

/** Cinco turnos. `act` opcional permite una acción en el turno; por defecto «No intervenir». */
export async function playFiveTurns(page, { coop = false, actOnTurn, explore = 'stay' } = {}) {
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
    // Cada turno cierra con el resumen «Qué pasó»; de ahí se sigue.
    await page.waitForSelector('.turn-summary__next');
    await assertScreenHealthy(page, `resumen del turno ${turn}`);
    await page.click('.turn-summary__next');
    const stage = await Promise.race([
      page.waitForSelector('.explore-start').then(() => 'explore'),
      page.waitForSelector('.turn-transition button').then(() => 'transition'),
    ]);
    if (stage === 'explore') {
      if (![2, 4].includes(turn)) throw new Error(`La salida a explorar solo debe aparecer tras los turnos 2 y 4, no tras el ${turn}.`);
      await handleExploration(page, explore);
      await page.waitForSelector('.turn-transition button');
    } else if ([2, 4].includes(turn) && !(await page.locator('.results-hero, .coop-results-shell').count())) {
      throw new Error(`Faltó la salida a explorar tras el turno ${turn}.`);
    }
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
