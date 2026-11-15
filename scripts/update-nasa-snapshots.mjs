#!/usr/bin/env node
/**
 * Actualiza los snapshots locales de NASA POWER y NASA DONKI.
 *
 *   node scripts/update-nasa-snapshots.mjs            # POWER y DONKI
 *   node scripts/update-nasa-snapshots.mjs --power    # solo POWER (no requiere clave)
 *   node scripts/update-nasa-snapshots.mjs --donki    # solo DONKI (requiere NASA_API_KEY)
 *
 * - La clave de NASA Open APIs se lee SOLO de la variable de entorno local NASA_API_KEY.
 *   Nunca se escribe en archivos, logs ni URLs guardadas; no existe VITE_NASA_API_KEY.
 * - Si una petición falla o devuelve datos inválidos, el snapshot anterior NO se modifica
 *   y el juego sigue usando el respaldo histórico local (sin inventar cifras).
 * - Coordenadas y fechas se leen de src/data/nasa/cities.ts y powerData.ts.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAP_DIR = join(root, 'src', 'data', 'nasa', 'snapshots');
const args = new Set(process.argv.slice(2));
const doPower = args.has('--power') || !args.has('--donki');
const doDonki = args.has('--donki') || !args.has('--power');
const KEY = process.env.NASA_API_KEY ?? '';

/** Quita la clave de cualquier texto antes de mostrarlo o guardarlo. */
function redact(text) {
  let out = String(text).replace(/([?&]api_key=)[^&\s]*/gi, '$1REDACTED');
  if (KEY) out = out.split(KEY).join('REDACTED');
  return out;
}

async function getJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} en ${redact(url)}`);
  return response.json();
}

async function loadCities() {
  const source = await readFile(join(root, 'src', 'data', 'nasa', 'cities.ts'), 'utf8');
  const cities = {};
  for (const match of source.matchAll(/id:\s*'(AREQUIPA|TROMSO)'[\s\S]*?latitude:\s*(-?[\d.]+),\s*longitude:\s*(-?[\d.]+)/g)) {
    cities[match[1]] = { latitude: Number(match[2]), longitude: Number(match[3]) };
  }
  return cities;
}

async function loadPowerDates() {
  const source = await readFile(join(root, 'src', 'data', 'nasa', 'powerData.ts'), 'utf8');
  const sections = { AREQUIPA: 'AREQUIPA_LOCAL_RECORDS', TROMSO: 'TROMSO_LOCAL_RECORDS' };
  const dates = {};
  for (const [city, name] of Object.entries(sections)) {
    const start = source.indexOf(`const ${name}`);
    const end = city === 'AREQUIPA' ? source.indexOf('const TROMSO_LOCAL_RECORDS') : source.indexOf('interface PowerSnapshotCity');
    dates[city] = [...source.slice(start, end).matchAll(/^\s{6}date:\s*'(\d{4}-\d{2}-\d{2})'/gm)].map((m) => m[1]);
  }
  return dates;
}

async function updatePower() {
  const cities = await loadCities();
  const dates = await loadPowerDates();
  const result = { fetchedAt: new Date().toISOString().slice(0, 10), cities: {} };
  for (const [cityId, { latitude, longitude }] of Object.entries(cities)) {
    const wanted = dates[cityId];
    if (!wanted || wanted.length !== 3) throw new Error(`No se encontraron tres fechas locales para ${cityId}.`);
    // Una consulta por fecha: la URL guardada reproduce exactamente ese registro.
    const days = [];
    for (const date of wanted) {
      const compact = date.replaceAll('-', '');
      const url = 'https://power.larc.nasa.gov/api/temporal/daily/point'
        + `?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${longitude}&latitude=${latitude}`
        + `&start=${compact}&end=${compact}&format=JSON`;
      const json = await getJson(url);
      days.push({ date, value: json?.properties?.parameter?.ALLSKY_SFC_SW_DWN?.[compact], requestUrl: url });
    }
    if (days.some((d) => typeof d.value !== 'number' || !Number.isFinite(d.value) || d.value < 0 || d.value > 12)) {
      throw new Error(`POWER devolvió valores faltantes o inválidos para ${cityId}; snapshot sin cambios.`);
    }
    result.cities[cityId] = { days };
    console.log(`POWER ${cityId}: ${days.map((d) => `${d.date}=${d.value}`).join(', ')}`);
  }
  await writeFile(join(SNAP_DIR, 'power.json'), `${JSON.stringify(result, null, 2)}\n`);
}

async function updateDonki() {
  if (!KEY) {
    console.warn('DONKI omitido: define la variable de entorno local NASA_API_KEY (no se lee de ningún archivo).');
    return;
  }
  const startDate = '2024-05-09';
  const endDate = '2024-05-12';
  const base = 'https://api.nasa.gov/DONKI';
  const q = (kind) => `${base}/${kind}?startDate=${startDate}&endDate=${endDate}&api_key=${encodeURIComponent(KEY)}`;
  const [cme, flr, gst] = await Promise.all([getJson(q('CME')), getJson(q('FLR')), getJson(q('GST'))]);
  const events = [];
  for (const item of Array.isArray(cme) ? cme : []) {
    const analyses = (item.cmeAnalyses ?? []).filter((a) => typeof a.speed === 'number' && a.speed > 0);
    const best = analyses.find((a) => a.isMostAccurate) ?? analyses[0];
    if (best) events.push({ activityID: item.activityID, type: 'CME', startTime: item.startTime, value: best.speed, unit: 'km/s', link: item.link });
  }
  for (const item of Array.isArray(flr) ? flr : []) {
    if (item.classType) events.push({ activityID: item.flrID, type: 'FLR', startTime: item.beginTime, value: item.classType, unit: 'GOES class', link: item.link });
  }
  for (const item of Array.isArray(gst) ? gst : []) {
    const kp = Math.max(...(item.allKpIndex ?? []).map((k) => k.kpIndex).filter(Number.isFinite));
    if (Number.isFinite(kp)) events.push({ activityID: item.gstID, type: 'GST', startTime: item.startTime, value: kp, unit: 'Kp', link: item.link });
  }
  if (!events.some((e) => e.type === 'CME')) throw new Error('DONKI no devolvió ninguna CME con velocidad válida; snapshot sin cambios.');
  const snapshot = {
    fetchedAt: new Date().toISOString().slice(0, 10),
    requestUrl: `${base}/{CME,FLR,GST}?startDate=${startDate}&endDate=${endDate}`,
    events,
  };
  const text = `${JSON.stringify(snapshot, null, 2)}\n`;
  if (text.includes(KEY)) throw new Error('Abortado: el snapshot contendría la clave.');
  await writeFile(join(SNAP_DIR, 'donki.json'), text);
  console.log(`DONKI: ${events.length} evento(s) guardados (${events.filter((e) => e.type === 'CME').length} CME).`);
}

let failed = false;
for (const [enabled, name, run] of [[doPower, 'POWER', updatePower], [doDonki, 'DONKI', updateDonki]]) {
  if (!enabled) continue;
  try {
    await run();
  } catch (error) {
    failed = true;
    console.error(`${name}: ${redact(error instanceof Error ? error.message : error)}`);
  }
}
process.exitCode = failed ? 1 : 0;
