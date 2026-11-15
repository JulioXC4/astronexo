import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5173/';
const SCREENSHOT_DIR = path.resolve('tests/e2e/screenshots');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function takeScreenshot(page, filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[Screenshot] ${filename}`);
}

async function setSliderValue(page, selector, value) {
  await page.waitForSelector(selector);
  await page.evaluate(({ selector, value }) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`Slider element not found: ${selector}`);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { selector, value });
}

async function runTest() {
  console.log('=== STARTING ASTRONAUTA JUNIOR E2E SUITE ===');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  try {
    // -------------------------------------------------------------
    // ROUTE 1: Arequipa -> Luna (Viewport 1366 x 768)
    // -------------------------------------------------------------
    console.log('\n>>> TESTING ROUTE 1: Arequipa -> Luna (1366x768)');
    {
      const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
      const page = await context.newPage();
      await page.goto(BASE_URL);

      // P1: Welcome Screen
      await page.waitForSelector('.welcome__play');
      await takeScreenshot(page, 'r1_01_welcome.png');
      await page.click('.welcome__play');

      // P2: City Selection (Arequipa)
      await page.waitForSelector('button.earth-action-btn');
      await takeScreenshot(page, 'r1_02_city_selection.png');
      await page.click('button.earth-action-btn'); // Default is Arequipa

      // P3: Destination Selection (Luna)
      await page.waitForSelector('.destination-card');
      await takeScreenshot(page, 'r1_03_destination.png');
      await page.click('button.earth-action-btn');

      // P4: Avatar Selection
      await page.waitForSelector('.avatar-card');
      await takeScreenshot(page, 'r1_04_avatar.png');
      await page.click('button.earth-action-btn');

      // P5: Narrative Briefing
      await page.waitForSelector('.briefing-portrait');
      await takeScreenshot(page, 'r1_05_briefing.png');
      await page.click('button.earth-action-btn');

      // P6: Preparation Map (Arequipa - 5 facilities)
      await page.waitForSelector('.earth-base-facility');
      const facilitiesCount = await page.locator('.earth-base-facility').count();
      console.log(`Route 1: Facilities count on map: ${facilitiesCount}`);
      if (facilitiesCount !== 5) throw new Error(`Expected 5 facilities on map, found ${facilitiesCount}`);
      await takeScreenshot(page, 'r1_06_map_initial.png');

      // Mission 1: SOLAR_DETECTIVE (Decision: reserve 45% -> cost: 2 energy)
      console.log('Route 1: Completing Mission 1 (Solar Detective, 45% reserve)');
      await page.locator('.earth-base-facility').nth(0).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await page.waitForSelector('button:has-text("Cerrar Interruptor")');
      await page.click('button:has-text("Cerrar Interruptor")');
      await page.waitForSelector('button:has-text("Confirmar costo de 2 punto(s) de Energía")');
      await takeScreenshot(page, 'r1_07_solar_detective.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Back on Map - Verify 1 completed
      await page.waitForSelector('.earth-base-facility');
      console.log('Route 1: 1/3 missions completed');

      // Mission 2: ALTITUDE_ACCLIMATIZATION (Decision: 72 kPa -> cost: 1 oxygen)
      console.log('Route 1: Completing Mission 2 (Altitude Acclimatization, 72 kPa)');
      await page.locator('.earth-base-facility').nth(1).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await setSliderValue(page, '#pressure-slider', '72');
      await page.click('button:has-text("Sello Principal")');
      await page.click('button:has-text("Escotilla Exterior")');
      await page.click('button:has-text("Retorno N₂")');
      await page.click('button:has-text("Verificar Hermeticidad")');
      await page.waitForSelector('button:has-text("Confirmar costo de 1 punto(s) de Oxígeno")');
      await takeScreenshot(page, 'r1_08_altitude.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Back on Map - Verify 2 completed
      await page.waitForSelector('.earth-base-facility');
      console.log('Route 1: 2/3 missions completed');

      // Mission 3: SOLAR_WATCH (Decision: CME Event 1 -> cost: 2 energy)
      console.log('Route 1: Completing Mission 3 (Solar Watch, Event 1)');
      await page.locator('.earth-base-facility').nth(2).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await page.waitForSelector('button:has-text("1. Sonar Alarma de Evacuación")');
      await page.click('button:has-text("1. Sonar Alarma de Evacuación")');
      await page.waitForSelector('button:has-text("2. Cerrar Compuerta Blindada"):not([disabled])');
      await page.click('button:has-text("2. Cerrar Compuerta Blindada")');
      await page.waitForSelector('button:has-text("3. Blindar Telemetría"):not([disabled])');
      await page.click('button:has-text("3. Blindar Telemetría")');
      await page.click('button:has-text("Simular Llegada de la Tormenta Solar")');
      await page.waitForSelector('button:has-text("Confirmar costo de 2 punto(s) de Energía")');
      await takeScreenshot(page, 'r1_09_solar_watch.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Back on Map - Verify 3 completed and locked status
      await page.waitForSelector('button:has-text("¡Proceder al Despegue")');
      await takeScreenshot(page, 'r1_10_map_completed_3_of_3.png');
      console.log('Route 1: 3/3 missions completed. Proceeding to launch.');
      await page.click('button:has-text("¡Proceder al Despegue")');

      // P7: Departure (Liftoff)
      await page.waitForSelector('button:has-text("Aproximarse a")');
      await takeScreenshot(page, 'r1_11_departure.png');
      await page.click('button:has-text("Aproximarse a")');

      // P8: Arrival Screen
      await page.waitForSelector('button:has-text("Tomar el Mando de la Base")');
      await takeScreenshot(page, 'r1_12_arrival.png');
      await page.click('button:has-text("Tomar el Mando de la Base")');

      // P10: Base Builder View
      await page.waitForSelector('.module-card');
      console.log('Route 1: In Base Builder View');
      const moduleCards = await page.locator('.module-card').count();
      if (moduleCards !== 5) throw new Error(`Expected 5 module cards, found ${moduleCards}`);
      // Select 3 modules: slots 0, 1, 2
      await page.locator('.module-card').nth(0).locator('button').click();
      await page.locator('.module-card').nth(1).locator('button').click();
      await page.locator('.module-card').nth(2).locator('button').click();
      await takeScreenshot(page, 'r1_13_base_builder.png');
      await page.click('button.builder-start');

      // TurnTransition: "Base construida · Guardia lista"
      await page.waitForSelector('.turn-transition button');
      await page.click('.turn-transition button');

      // P11-P12: Space Guard (Turns 1-5)
      for (let turn = 1; turn <= 5; turn++) {
        console.log(`Route 1: Space Guard Turn ${turn}/5`);
        await page.waitForSelector('.mission-clock');
        await takeScreenshot(page, `r1_14_space_turn_${turn}.png`);

        if (turn === 1) {
          const consultBtn = page.locator('button.intervention-option:has-text("G8")');
          if (await consultBtn.isEnabled()) {
            await consultBtn.click();
            await page.waitForSelector('button.choice-control:has-text("ENERGÍA")');
            await page.click('button.choice-control:has-text("ENERGÍA")');
            await page.click('button.pixel-button--confirm');
          } else {
            await page.click('button.intervention-option--skip');
          }
        } else if (turn === 2) {
          const recycleBtn = page.locator('button.intervention-option:has-text("G4")');
          if (await recycleBtn.isEnabled()) {
            await recycleBtn.click();
            await page.waitForSelector('button.text-button:has-text("completar ciclo")');
            await page.click('button.text-button:has-text("completar ciclo")');
            await page.click('button.pixel-button--confirm');
          } else {
            await page.click('button.intervention-option--skip');
          }
        } else {
          await page.click('button.intervention-option--skip');
        }

        const advanceBtn = page.locator('footer.turn-controls button');
        await page.waitForFunction(() => !document.querySelector('footer.turn-controls button')?.hasAttribute('disabled'));
        await advanceBtn.click();

        await page.waitForSelector('.turn-transition button');
        await page.click('.turn-transition button');
      }

      // P13-P14: Mission Results View
      await page.waitForSelector('.results-banner');
      await takeScreenshot(page, 'r1_15_results.png');
      console.log('Route 1: Mission Results rendered successfully.');
      await page.click('button:has-text("ENTREGAR INFORME")');

      // Earth Return Screen
      await page.waitForSelector('button:has-text("Ver Análisis y Próxima Aventura")');
      await takeScreenshot(page, 'r1_16_earth_return.png');
      await page.click('button:has-text("Ver Análisis y Próxima Aventura")');

      // Next Adventure Screen
      await page.waitForSelector('button:has-text("Volver a la Bienvenida")');
      await takeScreenshot(page, 'r1_17_next_adventure.png');
      await page.click('button:has-text("Volver a la Bienvenida")');

      // Back on Welcome screen - verify reset!
      await page.waitForSelector('.welcome__play');
      console.log('Route 1: Successfully returned to Welcome screen. Clean state verified!');
      await context.close();
    }

    // -------------------------------------------------------------
    // ROUTE 2: Arequipa -> Marte (Viewport 1600 x 900)
    // -------------------------------------------------------------
    console.log('\n>>> TESTING ROUTE 2: Arequipa -> Marte (1600x900)');
    {
      const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
      const page = await context.newPage();
      await page.goto(BASE_URL);

      // P1 Welcome
      await page.waitForSelector('.welcome__play');
      await page.click('.welcome__play');

      // P2 City: Select Arequipa
      await page.waitForSelector('button.earth-action-btn');
      await page.click('button.earth-action-btn');

      // P3 Destination: Select MARTE
      await page.waitForSelector('.destination-card');
      await page.click('.destination-card:has-text("Marte")');
      await takeScreenshot(page, 'r2_01_destination_mars.png');
      await page.click('button.earth-action-btn');

      // P4 Avatar: Confirm
      await page.waitForSelector('.avatar-card');
      await page.click('button.earth-action-btn');

      // P5 Briefing
      await page.waitForSelector('.briefing-portrait');
      await page.click('button.earth-action-btn');

      // P6 Map (Arequipa for Mars): Complete 3 distinct missions with DIFFERENT decisions (RF-69)
      await page.waitForSelector('.earth-base-facility');

      // Mission 1: SOLAR_DETECTIVE with 55% reserve (Different decision: cost 1 instead of 2)
      console.log('Route 2: Mission 1 (Solar Detective with 55% reserve -> cost 1)');
      await page.locator('.earth-base-facility').nth(0).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await setSliderValue(page, '#solar-reserve-slider', '55');
      await page.click('button:has-text("Cerrar Interruptor")');
      await page.waitForSelector('button:has-text("Confirmar costo de 1 punto(s) de Energía")');
      await takeScreenshot(page, 'r2_02_solar_detective_decision2.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Mission 2: ALTITUDE_ACCLIMATIZATION with 80 kPa (Different decision: cost 2 instead of 1)
      console.log('Route 2: Mission 2 (Altitude Acclimatization with 80 kPa -> cost 2)');
      await page.locator('.earth-base-facility').nth(1).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await setSliderValue(page, '#pressure-slider', '80');
      await page.click('button:has-text("Sello Principal")');
      await page.click('button:has-text("Escotilla Exterior")');
      await page.click('button:has-text("Retorno N₂")');
      await page.click('button:has-text("Verificar Hermeticidad")');
      await page.waitForSelector('button:has-text("Confirmar costo de 2 punto(s) de Oxígeno")');
      await takeScreenshot(page, 'r2_03_altitude_decision2.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Mission 3: SOLAR_WATCH with CME Event 2 (Different decision: cost 1 instead of 2)
      console.log('Route 2: Mission 3 (Solar Watch with CME Event 2 -> cost 1)');
      await page.locator('.earth-base-facility').nth(2).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await page.waitForSelector('.callsign-chip');
      // Select 2nd CME event
      await page.locator('.callsign-chip').nth(1).click();
      await page.click('button:has-text("1. Sonar Alarma de Evacuación")');
      await page.waitForSelector('button:has-text("2. Cerrar Compuerta Blindada"):not([disabled])');
      await page.click('button:has-text("2. Cerrar Compuerta Blindada")');
      await page.waitForSelector('button:has-text("3. Blindar Telemetría"):not([disabled])');
      await page.click('button:has-text("3. Blindar Telemetría")');
      await page.click('button:has-text("Simular Llegada de la Tormenta Solar")');
      await page.waitForSelector('button:has-text("Confirmar costo de 1 punto(s) de Energía")');
      await takeScreenshot(page, 'r2_04_solar_watch_decision2.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Proceed to launch
      await page.waitForSelector('button:has-text("¡Proceder al Despegue")');
      await page.click('button:has-text("¡Proceder al Despegue")');

      // Departure
      await page.waitForSelector('button:has-text("Aproximarse a")');
      await takeScreenshot(page, 'r2_05_departure_mars.png');
      await page.click('button:has-text("Aproximarse a")');

      // Arrival on Mars
      await page.waitForSelector('button:has-text("Tomar el Mando de la Base Marciana")');
      await takeScreenshot(page, 'r2_06_arrival_mars.png');
      await page.click('button:has-text("Tomar el Mando de la Base Marciana")');

      // Base Builder (Choose 3 different modules: slots 2, 3, 4)
      await page.waitForSelector('.module-card');
      await page.locator('.module-card').nth(2).locator('button').click();
      await page.locator('.module-card').nth(3).locator('button').click();
      await page.locator('.module-card').nth(4).locator('button').click();
      await takeScreenshot(page, 'r2_07_base_builder_mars.png');
      await page.click('button.builder-start');

      // Transition
      await page.waitForSelector('.turn-transition button');
      await page.click('.turn-transition button');

      // Space Guard (5 turns on Mars)
      for (let turn = 1; turn <= 5; turn++) {
        console.log(`Route 2: Mars Space Guard Turn ${turn}/5`);
        await page.waitForSelector('.mission-clock');

        if (turn === 1) {
          const greenhouseBtn = page.locator('button.intervention-option:has-text("G7")');
          if (await greenhouseBtn.isEnabled()) {
            await greenhouseBtn.click();
            await page.waitForSelector('button.choice-control:has-text("MANTENER")');
            await page.click('button.choice-control:has-text("MANTENER")');
            await page.click('button.pixel-button--confirm');
          } else {
            await page.click('button.intervention-option--skip');
          }
        } else if (turn === 2) {
          const shelterBtn = page.locator('button.intervention-option:has-text("G5")');
          if (await shelterBtn.isEnabled()) {
            await shelterBtn.click();
            await page.waitForSelector('button.text-button:has-text("colocar regolito")');
            await page.click('button.text-button:has-text("colocar regolito")');
            await page.click('button.pixel-button--confirm');
          } else {
            await page.click('button.intervention-option--skip');
          }
        } else {
          await page.click('button.intervention-option--skip');
        }

        const advanceBtn = page.locator('footer.turn-controls button');
        await page.waitForFunction(() => !document.querySelector('footer.turn-controls button')?.hasAttribute('disabled'));
        await advanceBtn.click();

        await page.waitForSelector('.turn-transition button');
        await page.click('.turn-transition button');
      }

      // Results
      await page.waitForSelector('.results-banner');
      await takeScreenshot(page, 'r2_08_results_mars.png');
      await page.click('button:has-text("ENTREGAR INFORME")');

      // Earth return & Next adventure
      await page.waitForSelector('button:has-text("Ver Análisis y Próxima Aventura")');
      await page.click('button:has-text("Ver Análisis y Próxima Aventura")');
      await page.waitForSelector('button:has-text("Volver a Jugar")');
      await page.click('button:has-text("Volver a Jugar")');

      await page.waitForSelector('.welcome__play');
      console.log('Route 2: Completed successfully and cleanly reset!');
      await context.close();
    }

    // -------------------------------------------------------------
    // ROUTE 3: Tromsø -> Luna (Tablet 1024 x 768)
    // -------------------------------------------------------------
    console.log('\n>>> TESTING ROUTE 3: Tromsø -> Luna (1024x768 Tablet)');
    {
      const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
      const page = await context.newPage();
      await page.goto(BASE_URL);

      // P1 Welcome
      await page.waitForSelector('.welcome__play');
      await page.click('.welcome__play');

      // P2 City: Select TROMSO
      await page.waitForSelector('button.callsign-chip:has-text("Tromsø")');
      await page.click('button.callsign-chip:has-text("Tromsø")');
      await takeScreenshot(page, 'r3_01_city_tromso.png');
      await page.click('button.earth-action-btn:has-text("Confirmar Base en Tromsø")');

      // P3 Destination: Luna
      await page.waitForSelector('.destination-card');
      await page.click('button.earth-action-btn');

      // P4 Avatar
      await page.waitForSelector('.avatar-card');
      await page.click('button.earth-action-btn');

      // P5 Briefing
      await page.waitForSelector('.briefing-portrait');
      await page.click('button.earth-action-btn');

      // P6 Map Tromsø - Verify 5 facilities
      await page.waitForSelector('.earth-base-facility');
      const facilitiesCount = await page.locator('.earth-base-facility').count();
      console.log(`Route 3: Tromsø facilities count: ${facilitiesCount}`);
      if (facilitiesCount !== 5) throw new Error(`Expected 5 facilities in Tromsø, found ${facilitiesCount}`);
      await takeScreenshot(page, 'r3_02_map_tromso.png');

      // Mission 1: DARK_MONTHS_RESERVE
      console.log('Route 3: Mission 1 (Dark Months Reserve)');
      await page.locator('.earth-base-facility').nth(0).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await page.waitForSelector('button:has-text("Simular Noche Continua")');
      await page.click('button:has-text("Simular Noche Continua")');
      await page.waitForSelector('button:has-text("Confirmar costo de")');
      await takeScreenshot(page, 'r3_03_dark_months.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Mission 2: ARCTIC_GREENHOUSE
      console.log('Route 3: Mission 2 (Arctic Greenhouse)');
      await page.locator('.earth-base-facility').nth(1).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await page.waitForSelector('button:has-text("Auto-Calibrar")');
      await page.click('button:has-text("Auto-Calibrar")');
      await page.click('button:has-text("Verificar Ciclo Ártico")');
      await page.waitForSelector('button:has-text("Confirmar costo de")');
      await takeScreenshot(page, 'r3_04_arctic_greenhouse.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Mission 3: SOLAR_WATCH
      console.log('Route 3: Mission 3 (Solar Watch)');
      await page.locator('.earth-base-facility').nth(2).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await page.waitForSelector('button:has-text("1. Sonar Alarma de Evacuación")');
      await page.click('button:has-text("1. Sonar Alarma de Evacuación")');
      await page.waitForSelector('button:has-text("2. Cerrar Compuerta Blindada"):not([disabled])');
      await page.click('button:has-text("2. Cerrar Compuerta Blindada")');
      await page.waitForSelector('button:has-text("3. Blindar Telemetría"):not([disabled])');
      await page.click('button:has-text("3. Blindar Telemetría")');
      await page.click('button:has-text("Simular Llegada de la Tormenta Solar")');
      await page.waitForSelector('button:has-text("Confirmar costo de")');
      await takeScreenshot(page, 'r3_05_solar_watch_tromso.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Proceed to launch
      await page.waitForSelector('button:has-text("¡Proceder al Despegue")');
      await page.click('button:has-text("¡Proceder al Despegue")');

      // Departure & Arrival
      await page.waitForSelector('button:has-text("Aproximarse a")');
      await page.click('button:has-text("Aproximarse a")');
      await page.waitForSelector('button:has-text("Tomar el Mando de la Base Lunar")');
      await page.click('button:has-text("Tomar el Mando de la Base Lunar")');

      // Base Builder (Select slots 0, 1, 3)
      await page.waitForSelector('.module-card');
      await page.locator('.module-card').nth(0).locator('button').click();
      await page.locator('.module-card').nth(1).locator('button').click();
      await page.locator('.module-card').nth(3).locator('button').click();
      await takeScreenshot(page, 'r3_06_base_builder_tablet.png');
      await page.click('button.builder-start');

      // Transition
      await page.waitForSelector('.turn-transition button');
      await page.click('.turn-transition button');

      // Space Guard (5 turns)
      for (let turn = 1; turn <= 5; turn++) {
        console.log(`Route 3: Space Guard Turn ${turn}/5`);
        await page.waitForSelector('.mission-clock');

        if (turn === 1) {
          const researchBtn = page.locator('button.intervention-option:has-text("G6")');
          if (await researchBtn.isEnabled()) {
            await researchBtn.click();
            await page.waitForSelector('button.text-button:has-text("completar ciclo")');
            await page.click('button.text-button:has-text("completar ciclo")');
            await page.click('button.pixel-button--confirm');
          } else {
            await page.click('button.intervention-option--skip');
          }
        } else {
          await page.click('button.intervention-option--skip');
        }

        const advanceBtn = page.locator('footer.turn-controls button');
        await page.waitForFunction(() => !document.querySelector('footer.turn-controls button')?.hasAttribute('disabled'));
        await advanceBtn.click();

        await page.waitForSelector('.turn-transition button');
        await page.click('.turn-transition button');
      }

      // Results
      await page.waitForSelector('.results-banner');
      await takeScreenshot(page, 'r3_07_results_tablet.png');
      await page.click('button:has-text("ENTREGAR INFORME")');

      // Return & Restart
      await page.waitForSelector('button:has-text("Ver Análisis y Próxima Aventura")');
      await page.click('button:has-text("Ver Análisis y Próxima Aventura")');
      await page.waitForSelector('button:has-text("Volver a la Bienvenida")');
      await page.click('button:has-text("Volver a la Bienvenida")');

      await page.waitForSelector('.welcome__play');
      console.log('Route 3: Completed successfully on Tablet!');
      await context.close();
    }

    // -------------------------------------------------------------
    // ROUTE 4: Tromsø -> Marte (Viewport 1280 x 800)
    // -------------------------------------------------------------
    console.log('\n>>> TESTING ROUTE 4: Tromsø -> Marte (1280x800)');
    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await page.goto(BASE_URL);

      // P1 Welcome
      await page.waitForSelector('.welcome__play');
      await page.click('.welcome__play');

      // P2 City: Tromsø
      await page.waitForSelector('button.callsign-chip:has-text("Tromsø")');
      await page.click('button.callsign-chip:has-text("Tromsø")');
      await page.click('button.earth-action-btn:has-text("Confirmar Base en Tromsø")');

      // P3 Destination: Marte
      await page.waitForSelector('.destination-card');
      await page.click('.destination-card:has-text("Marte")');
      await page.click('button.earth-action-btn');

      // P4 Avatar
      await page.waitForSelector('.avatar-card');
      await page.click('button.earth-action-btn');

      // P5 Briefing
      await page.waitForSelector('.briefing-portrait');
      await page.click('button.earth-action-btn');

      // P6 Map Tromsø: Select missions 1 (Dark Months), 2 (Arctic Greenhouse), and 4 (ECLSS Training)
      await page.waitForSelector('.earth-base-facility');

      // Mission 1: DARK_MONTHS_RESERVE
      console.log('Route 4: Mission 1 (Dark Months)');
      await page.locator('.earth-base-facility').nth(0).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await page.waitForSelector('button:has-text("Simular Noche Continua")');
      await page.click('button:has-text("Simular Noche Continua")');
      await page.waitForSelector('button:has-text("Confirmar costo de")');
      await page.click('button:has-text("Confirmar costo de")');

      // Mission 2: ARCTIC_GREENHOUSE
      console.log('Route 4: Mission 2 (Arctic Greenhouse)');
      await page.locator('.earth-base-facility').nth(1).click();
      await page.click('button:has-text("Ejecutar Misión")');
      await page.waitForSelector('button:has-text("Auto-Calibrar")');
      await page.click('button:has-text("Auto-Calibrar")');
      await page.click('button:has-text("Verificar Ciclo Ártico")');
      await page.waitForSelector('button:has-text("Confirmar costo de")');
      await page.click('button:has-text("Confirmar costo de")');

      // Mission 3: ECLSS_TRAINING (4th facility on Tromsø map)
      console.log('Route 4: Mission 3 (ECLSS Training)');
      await page.locator('.earth-base-facility').nth(3).click();
      await page.click('button:has-text("Ejecutar Misión")');
      // Set electrolysis to 350W
      await setSliderValue(page, '#watts-slider', '350');
      // Activate scrubber
      await page.click('button:has-text("Scrubber APAGADO")');
      // Set water recycle to 90%
      await setSliderValue(page, '#water-recycle-slider', '90');
      await page.click('button:has-text("Verificar Circuito ECLSS")');
      await page.waitForSelector('button:has-text("Confirmar costo de")');
      await takeScreenshot(page, 'r4_01_eclss_tromso.png');
      await page.click('button:has-text("Confirmar costo de")');

      // Proceed to launch
      await page.waitForSelector('button:has-text("¡Proceder al Despegue")');
      await page.click('button:has-text("¡Proceder al Despegue")');

      // Departure & Arrival
      await page.waitForSelector('button:has-text("Aproximarse a")');
      await page.click('button:has-text("Aproximarse a")');
      await page.waitForSelector('button:has-text("Tomar el Mando de la Base Marciana")');
      await page.click('button:has-text("Tomar el Mando de la Base Marciana")');

      // Base Builder
      await page.waitForSelector('.module-card');
      await page.locator('.module-card').nth(1).locator('button').click();
      await page.locator('.module-card').nth(2).locator('button').click();
      await page.locator('.module-card').nth(4).locator('button').click();
      await page.click('button.builder-start');

      // Transition
      await page.waitForSelector('.turn-transition button');
      await page.click('.turn-transition button');

      // Space Guard (5 turns)
      for (let turn = 1; turn <= 5; turn++) {
        console.log(`Route 4: Mars Space Guard Turn ${turn}/5`);
        await page.waitForSelector('.mission-clock');

        await page.click('button.intervention-option--skip');

        const advanceBtn = page.locator('footer.turn-controls button');
        await page.waitForFunction(() => !document.querySelector('footer.turn-controls button')?.hasAttribute('disabled'));
        await advanceBtn.click();

        await page.waitForSelector('.turn-transition button');
        await page.click('.turn-transition button');
      }

      // Results
      await page.waitForSelector('.results-banner');
      await takeScreenshot(page, 'r4_02_results_mars.png');
      await page.click('button:has-text("ENTREGAR INFORME")');

      // Return & Restart
      await page.waitForSelector('button:has-text("Ver Análisis y Próxima Aventura")');
      await page.click('button:has-text("Ver Análisis y Próxima Aventura")');
      await page.waitForSelector('button:has-text("Volver a la Bienvenida")');
      await page.click('button:has-text("Volver a la Bienvenida")');

      await page.waitForSelector('.welcome__play');
      console.log('Route 4: Completed successfully!');
      await context.close();
    }

    console.log('\n=== ALL 4 ROUTES COMPLETED AND VERIFIED SUCCESSFULLY! ===');
  } finally {
    await browser.close();
  }
}

runTest().catch((err) => {
  console.error('E2E TEST FAILURE:', err);
  process.exit(1);
});
