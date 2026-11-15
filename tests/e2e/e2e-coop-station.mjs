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

async function runCoopStationE2ETest() {
  console.log('🚀 [E2E] Starting Local Station Mode (Cooperative) Test...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => { localStorage.setItem('astronexo_lang_v3', 'es'); });
  const page = await context.newPage();

  try {
    // 1. Welcome Screen
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log('✓ Reached Welcome Screen');
    await takeScreenshot(page, 'station_01_welcome.png');

    // 2. Open Station Mode from Welcome Screen
    const stationBtn = page.locator('button:has-text("Modo Estación"), button:has-text("Station Mode")');
    await stationBtn.waitFor({ state: 'visible' });
    await stationBtn.click();

    // Click inside dialog to open the Station Mode modal
    const classroomModalBtn = page.locator('button.welcome__dialog-action').first();
    await classroomModalBtn.waitFor({ state: 'visible' });
    await classroomModalBtn.click();

    // 3. Station Mode Modal: Tab 1 (Room & Mission)
    await page.waitForSelector('.station-modal');
    console.log('✓ Station Mode Modal opened');

    // Set Team name
    const teamInput = page.locator('input.callsign-box__input').nth(1);
    await teamInput.fill('Equipo Cóndor');

    // Choose Destination: Mars
    const marsBtn = page.locator('button:has-text("Marte"), button:has-text("Mars")');
    await marsBtn.click();

    // Advance to Tab 2: Crew
    const nextToCrewBtn = page.locator('button:has-text("Siguiente"), button:has-text("Next")');
    await nextToCrewBtn.click();
    console.log('✓ Moved to Tab 2: Crew & Roles');

    // 4. Tab 2: Test Cadets count and Aliases
    // Switch to 5 cadets then back to 4
    const fiveCadetsBtn = page.locator('button:has-text("5 Cadetes"), button:has-text("5 Cadets")');
    await fiveCadetsBtn.click();
    console.log('✓ Switched to 5 cadets');

    const fourCadetsBtn = page.locator('button:has-text("4 Cadetes"), button:has-text("4 Cadets")');
    await fourCadetsBtn.click();
    console.log('✓ Switched to 4 cadets');

    // Advance to Tab 3: Launch
    const nextToLaunchBtn = page.locator('button:has-text("Siguiente"), button:has-text("Next")');
    await nextToLaunchBtn.click();
    console.log('✓ Moved to Tab 3: Launch & Guide');
    await takeScreenshot(page, 'station_02_modal_launch_tab.png');

    // 5. Click "Launch Cooperative Mission"
    const launchCoopBtn = page.locator('button.earth-action-btn:has-text("Iniciar Misión Cooperativa"), button:has-text("Iniciar Misión Cooperativa")');
    await launchCoopBtn.waitFor({ state: 'visible' });
    await launchCoopBtn.click();
    console.log('✓ Launched Cooperative Mission');

    // 6. Base Builder View (3 modules must be built)
    await page.waitForSelector('.module-card');
    console.log('✓ Base Builder View rendered with 5 module blueprints');
    await page.locator('.module-card').nth(0).locator('button').click();
    await page.locator('.module-card').nth(1).locator('button').click();
    await page.locator('.module-card').nth(2).locator('button').click();
    await takeScreenshot(page, 'station_03_base_builder.png');

    // Click "Confirmar y Construir"
    await page.click('button.builder-start');
    console.log('✓ 3 Modules confirmed and built');

    // 7. Handle Turn Transition (Base construida · Guardia lista)
    await page.waitForSelector('.turn-transition button');
    await page.click('.turn-transition button');

    // 8. Cooperative Turn 1
    await page.waitForSelector('.coop-role-bar');
    console.log('✓ Coop Role Bar & Space Mission Control loaded');
    await takeScreenshot(page, 'station_04_turn_1.png');

    // Loop through 5 turns
    for (let turn = 1; turn <= 5; turn++) {
      console.log(`--- Playing Turn ${turn}/5 ---`);

      // Verify active player header exists
      await page.waitForSelector('.coop-role-bar');

      // Click "No intervenir" to trigger group deliberation
      const skipAction = page.locator('button.intervention-option--skip');
      await skipAction.waitFor({ state: 'visible' });
      await skipAction.click();

      // Group Decision Dialog appears for collective agreement
      const confirmDialogBtn = page.locator('.group-decision-dialog button.pixel-button--primary');
      await confirmDialogBtn.waitFor({ state: 'visible' });
      if (turn === 1) {
        await takeScreenshot(page, 'station_05_group_decision_dialog.png');
      }
      await confirmDialogBtn.click();
      console.log(`  ✓ Turn ${turn}: Group decision confirmed`);

      // Advance turn: Click "FINALIZAR TURNO"
      const advanceBtn = page.locator('footer.turn-controls button');
      await page.waitForFunction(() => !document.querySelector('footer.turn-controls button')?.hasAttribute('disabled'));
      await advanceBtn.click();
      console.log(`  ✓ Turn ${turn}: Advanced`);

      // Handle intermediate turn transition
      await page.waitForSelector('.turn-transition button');
      await page.click('.turn-transition button');
    }

    // 9. Cooperative Results Screen
    await page.waitForSelector('.coop-results-shell');
    console.log('✓ Reached Collective Results Screen');
    await takeScreenshot(page, 'station_06_collective_results.png');

    // Click "ENTREGAR INFORME" to view final Earth return
    const submitReportBtn = page.locator('button:has-text("ENTREGAR INFORME")');
    await submitReportBtn.waitFor({ state: 'visible' });
    await submitReportBtn.click();

    // 10. Earth Return Screen
    await page.waitForSelector('.earth-screen');
    console.log('✓ Reached Earth Return Screen');
    await takeScreenshot(page, 'station_07_earth_return.png');

    // Proceed to Next Adventure Screen
    const nextAdventureBtn = page.locator('button:has-text("Ver Análisis")');
    await nextAdventureBtn.waitFor({ state: 'visible' });
    await nextAdventureBtn.click();

    // 11. Next Adventure Screen
    await page.waitForSelector('button:has-text("Volver a la Bienvenida")');
    console.log('✓ Reached Next Adventure Screen');
    await takeScreenshot(page, 'station_08_next_adventure.png');

    // Return to Welcome Screen
    const homeBtn = page.locator('button:has-text("Volver a la Bienvenida")');
    await homeBtn.click();
    await page.waitForSelector('.welcome');
    console.log('✓ Successfully returned to Welcome Screen. Full cycle verified!');

    console.log('🎉 [E2E] Local Cooperative Station Mode test PASSED flawlessly!');
  } catch (err) {
    console.error('❌ [E2E] Test failed with error:', err);
    await takeScreenshot(page, 'station_error.png');
    throw err;
  } finally {
    await browser.close();
  }
}

runCoopStationE2ETest();