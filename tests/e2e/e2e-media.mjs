/**
 * E2E de multimedia: videos de transición, música y ambientes.
 *
 * Verifica, con el flujo real del juego:
 *  - La portada no descarga ni reproduce nada antes de la primera interacción.
 *  - Cada transición usa el video de SU ciudad y SU destino, uno a la vez, solo MP4 (salvo la alarma).
 *  - «Saltar» avanza y libera el video (no queda ningún <video> montado).
 *  - Con movimiento reducido no se monta ninguna cinemática.
 *  - La música cambia por pantalla sin reiniciar la misma pista y el silencio detiene todo.
 *
 * Requiere el juego en http://localhost:5173/ (o E2E_BASE_URL) y Chrome instalado.
 */
import {
  launchBrowser, newMonitoredPage, assertScreenHealthy, chooseDestination, buildStation, passStationPrep,
  chooseCity, passAvatarAndBriefing, completeTraining, playFiveTurns, readOutcome, failOnProblems,
  recommendedCloudsReserve, skipCinematic, skipMissionIntro, BASE_URL, performScienceIntervention, performSurvivalIntervention, openKidReport,
} from './helpers.mjs';

const ROUTES = [
  {
    city: 'AREQUIPA', destination: 'MARS', viewport: { width: 1366, height: 768 }, modules: [2, 3, 4],
    trainings: [[2, 'ALTITUDE_ACCLIMATIZATION', { pressure: 80 }], [4, 'CLOUDS_SUNS', { city: 'AREQUIPA', reserve: recommendedCloudsReserve('AREQUIPA') + 15 }], [0, 'SOLAR_DETECTIVE']],
    videos: ['reclutamiento-academia-atardecer', 'despegue-arequipa', 'viaje-marte', 'llegada-marte', 'regreso-tierra-arequipa'],
    music: ['01-tema-principal-bienvenida', '02-seleccion-ciudad-destino-avatar', '08-construccion-base', '03-briefing-radio', '04-mapa-arequipa', '06-minijuego', '09-viaje-espacial', '11-base-marte', '14-resultado-final'],
    ambient: ['A1-cabina-espacial'],
  },
  {
    // Victoria con acciones reales: la fanfarria suena una sola vez y luego el tema de resultado.
    city: 'AREQUIPA', destination: 'MOON', viewport: { width: 1366, height: 768 }, modules: [0, 2, 4], victory: true,
    trainings: [[0, 'SOLAR_DETECTIVE'], [2, 'ALTITUDE_ACCLIMATIZATION', { pressure: 72 }], [4, 'CLOUDS_SUNS', { city: 'AREQUIPA' }]],
    videos: ['reclutamiento-academia-atardecer', 'despegue-arequipa', 'viaje-luna', 'llegada-luna', 'regreso-tierra-arequipa'],
    music: ['01-tema-principal-bienvenida', '02-seleccion-ciudad-destino-avatar', '08-construccion-base', '03-briefing-radio', '04-mapa-arequipa', '06-minijuego', '09-viaje-espacial', '10-base-luna', '13-victoria', '14-resultado-final'],
    ambient: ['A1-cabina-espacial'],
  },
  {
    city: 'TROMSO', destination: 'MOON', viewport: { width: 1280, height: 800 }, modules: [0, 1, 3],
    trainings: [[0, 'DARK_MONTHS_RESERVE'], [1, 'ARCTIC_GREENHOUSE'], [2, 'SOLAR_WATCH', { event: 0 }]],
    videos: ['reclutamiento-academia-atardecer', 'despegue-tromso', 'viaje-luna', 'llegada-luna', 'regreso-tierra-tromso'],
    music: ['01-tema-principal-bienvenida', '02-seleccion-ciudad-destino-avatar', '08-construccion-base', '03-briefing-radio', '05-mapa-tromso', '06-minijuego', '09-viaje-espacial', '10-base-luna', '14-resultado-final'],
    ambient: ['A4-noche-polar', 'A1-cabina-espacial'],
  },
];

const base = (src) => src.split('/').pop().replace(/\.(ogg|mp4|webm|mp3)$/, '');

/** Observa, desde antes de que cargue la página, cada <video> montado y cada reproducción de audio. */
async function instrument(context) {
  await context.addInitScript(() => {
    window.__videos = [];
    window.__plays = [];
    window.__mediaEls = new Set();
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function play(...args) {
      window.__mediaEls.add(this);
      // El atributo src es el pedido; currentSrc se actualiza tarde y aún mostraría la pista anterior.
      window.__plays.push({ src: this.getAttribute('src') || this.currentSrc, tag: this.tagName });
      return originalPlay.apply(this, args);
    };
    new MutationObserver(() => {
      for (const video of document.querySelectorAll('video')) {
        const src = video.getAttribute('src');
        if (src && window.__videos[window.__videos.length - 1] !== src) window.__videos.push(src);
      }
    }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  });
}

const dedupe = (items) => items.filter((item, index) => index === 0 || items[index - 1] !== item);
const isSubsequence = (needle, haystack) => {
  let i = 0;
  for (const item of haystack) if (item === needle[i]) i += 1;
  return i === needle.length;
};

async function playingTracks(page) {
  return page.evaluate(() => [...window.__mediaEls]
    .filter((element) => !element.paused && element.getAttribute('src'))
    .map((element) => element.getAttribute('src')));
}

async function checkWelcomeSilence(browser) {
  const { context, page, problems } = await newMonitoredPage(browser, { width: 1280, height: 800 }, 'portada');
  await instrument(context);
  const media = [];
  page.on('request', (request) => { if (/\/assets\/(audio|videos)\//.test(request.url())) media.push(request.url()); });
  await page.goto(BASE_URL);
  await page.waitForSelector('.welcome__play');
  await page.waitForTimeout(1500);
  if (media.length) throw new Error(`La portada descargó multimedia antes de interactuar: ${media.join(', ')}`);
  if ((await page.evaluate(() => window.__plays.length)) !== 0) throw new Error('Se reprodujo audio antes de la primera interacción.');
  // Primera interacción: arranca el tema principal, y ningún video.
  await page.mouse.click(8, 8);
  await page.waitForFunction(() => window.__plays.some((play) => play.src.includes('01-tema-principal-bienvenida')), null, { timeout: 5000 });
  if (media.some((url) => url.includes('/videos/'))) throw new Error('La portada pidió un video.');
  console.log('  ✓ portada: sin multimedia antes de interactuar; tema principal tras el primer clic');

  // Silencio: todo se detiene y el botón sigue respondiendo.
  // El icono abre el control de volumen; el silencio está dentro.
  await page.click('.sound-toggle');
  await page.click('.sound-panel__mute');
  await page.waitForTimeout(300);
  if ((await playingTracks(page)).length) throw new Error('El silencio no detuvo la música.');
  await page.click('.sound-panel__mute');
  await page.waitForTimeout(600);
  if (!(await playingTracks(page)).some((src) => src.includes('01-tema-principal-bienvenida'))) throw new Error('La música no volvió al quitar el silencio.');
  console.log('  ✓ silencio detiene y reanuda la música');
  failOnProblems(problems);
  await context.close();
}

async function runRoute(browser, route, { reduced = false } = {}) {
  const label = `${route.city}→${route.destination}${reduced ? ' (movimiento reducido)' : ''}`;
  console.log(`\n>>> ${label}`);
  const { context, page, problems } = await newMonitoredPage(browser, route.viewport, label, reduced ? { reducedMotion: 'reduce' } : {});
  await instrument(context);
  const requestedVideos = [];
  page.on('request', (request) => { if (request.url().includes('/assets/videos/')) requestedVideos.push(request.url().split('/').pop()); });
  try {
    await page.goto(BASE_URL);
    await page.waitForSelector('.welcome__play');
    await page.click('.welcome__play');
    // El video de reclutamiento: un solo <video>, con «Saltar» visible desde el primer momento.
    if (!reduced) {
      await page.waitForSelector('.cinematic video');
      if ((await page.locator('video').count()) !== 1) throw new Error('Hay más de un video montado a la vez.');
      await page.waitForSelector('.cinematic__skip');
    }
    await skipCinematic(page);
    if (await page.locator('.cinematic').count()) throw new Error('«Saltar» no cerró la cinemática (o no liberó el video).');
    await skipMissionIntro(page);
    await chooseDestination(page, route.destination);
    const builtNames = await buildStation(page, route.modules);
    await passStationPrep(page);
    await chooseCity(page, route.city);
    await passAvatarAndBriefing(page);
    await assertScreenHealthy(page, 'mapa');
    for (const [position, [index, id, options]] of route.trainings.entries()) {
      await completeTraining(page, index, id, options, position === 2);
    }

    // Despegue: la cuenta atrás no cambia; tras la ignición entra el video de SU ciudad, y luego el del viaje.
    await page.waitForSelector('button:has-text("Aproximarse a")');
    if (!reduced) {
      await page.waitForSelector('.cinematic video', { timeout: 8000 });
      const departure = await page.getAttribute('.cinematic video', 'src');
      if (!departure.includes(route.videos[1])) throw new Error(`Video de despegue incorrecto: ${departure}`);
      await skipCinematic(page);
      await page.waitForSelector('.cinematic video', { timeout: 4000 });
      const travel = await page.getAttribute('.cinematic video', 'src');
      if (!travel.includes(route.videos[2])) throw new Error(`Video de viaje incorrecto: ${travel}`);
      await skipCinematic(page);
    }
    await page.click('button:has-text("Aproximarse a")');
    if (!reduced) {
      await page.waitForSelector('.cinematic video', { timeout: 4000 });
      const arrival = await page.getAttribute('.cinematic video', 'src');
      if (!arrival.includes(route.videos[3])) throw new Error(`Video de llegada incorrecto: ${arrival}`);
      await skipCinematic(page);
    }
    await page.waitForSelector('button:has-text("Tomar el Mando de la Base")');
    await page.click('button:has-text("Tomar el Mando de la Base")');
    await page.waitForSelector('.pixel-kicker:has-text("REVISIÓN DE SISTEMAS")');
    for (const name of builtNames) {
      if (!(await page.locator('main.earth-card').innerText()).includes(name)) throw new Error(`Falta el módulo ${name}.`);
    }
    await page.click('button:has-text("Iniciar guardia")');
    await page.waitForSelector('.mission-clock');
    const realActions = route.victory ? {
      1: performSurvivalIntervention, 2: performScienceIntervention, 3: performScienceIntervention,
      4: performSurvivalIntervention, 5: performSurvivalIntervention,
    } : undefined;
    await playFiveTurns(page, { actOnTurn: realActions, explore: 'stay' });
    await page.waitForSelector('.results-hero');
    const outcome = await readOutcome(page);
    if (route.victory && outcome !== 'COMPLETADA') throw new Error(`La ruta de victoria terminó como ${outcome}.`);

    // El informe termina → cinemática de regreso → pantalla de Tierra.
    await openKidReport(page);
    await page.click('button:has-text("VOLVER A LA TIERRA"), button:has-text("ENTREGAR INFORME")');
    if (!reduced) {
      await page.waitForSelector('.cinematic video', { timeout: 4000 });
      const back = await page.getAttribute('.cinematic video', 'src');
      if (!back.includes(route.videos[4])) throw new Error(`Video de regreso incorrecto: ${back}`);
      if (await page.locator('button:has-text("Volver a la Bienvenida")').count()) throw new Error('La pantalla siguiente apareció antes que el video.');
      await skipCinematic(page);
    }
    await page.waitForSelector('button:has-text("Volver a la Bienvenida")');
    if (await page.locator('video').count()) throw new Error('Quedó un <video> montado tras el regreso.');

    // Videos vistos y música/ambiente reproducidos, en orden.
    const allVideos = (await page.evaluate(() => window.__videos)).map(base);
    // La cortinilla de alarma es un overlay aparte: solo aparece al abrir una emergencia importante.
    const seenVideos = allVideos.filter((name) => name !== 'entrada-minijuego-alarma');
    console.log(`  cortinilla de emergencia: ${allVideos.length - seenVideos.length} vez/veces`);
    const expectedVideos = reduced ? [] : route.videos;
    if (JSON.stringify(dedupe(seenVideos)) !== JSON.stringify(expectedVideos)) {
      throw new Error(`Videos vistos: ${seenVideos.join(', ')} (esperados: ${expectedVideos.join(', ')})`);
    }
    const strayWebm = requestedVideos.filter((name) => name.endsWith('.webm') && !name.startsWith('entrada-minijuego-alarma'));
    if (strayWebm.length) throw new Error(`Se pidió WebM además de MP4: ${strayWebm.join(', ')}`);
    const plays = await page.evaluate(() => window.__plays.filter((play) => play.tag === 'AUDIO').map((play) => play.src));
    const music = plays.filter((src) => src.includes('/music/')).map(base);
    const ambient = plays.filter((src) => src.includes('/ambient/')).map(base);
    if (!isSubsequence(route.music, music)) throw new Error(`Música en orden incorrecto.\n  vista: ${dedupe(music).join(' → ')}\n  esperada (subsecuencia): ${route.music.join(' → ')}`);
    if (!isSubsequence(route.ambient, ambient)) throw new Error(`Ambientes: ${dedupe(ambient).join(' → ')} (esperado: ${route.ambient.join(' → ')})`);
    // Una pista que ya suena no se reinicia al cambiar de componente.
    const victories = music.filter((name) => name === '13-victoria').length;
    if (victories > (route.victory ? 1 : 0)) throw new Error(`La fanfarria de victoria sonó ${victories} veces.`);
    const restarted = music.filter((name, index) => index > 0 && music[index - 1] === name);
    if (restarted.length) throw new Error(`Pista reiniciada sin cambiar de pantalla: ${restarted.join(', ')}`);
    console.log(`  música: ${dedupe(music).join(' → ')}`);
    console.log(`  ambiente: ${dedupe(ambient).join(' → ') || '(ninguno)'}`);
    console.log(`  videos: ${dedupe(seenVideos).join(' → ') || '(ninguno)'}`);
    failOnProblems(problems);
    console.log(`  ✓ ${label}`);
  } finally {
    await context.close();
  }
}

const browser = await launchBrowser();
try {
  await checkWelcomeSilence(browser);
  await runRoute(browser, ROUTES[0]);
  await runRoute(browser, ROUTES[1]);
  await runRoute(browser, ROUTES[2]);
  await runRoute(browser, ROUTES[2], { reduced: true });
  console.log('\n🎉 E2E multimedia OK');
} finally {
  await browser.close();
}
