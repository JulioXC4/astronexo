/**
 * Efectos de sonido del juego.
 *
 * Un solo `AudioContext` para toda la aplicación. Los efectos reales (OGG de
 * `public/assets/audio/sfx/`) se descargan la primera vez que se necesitan, se
 * decodifican una vez y se reutilizan como `AudioBuffer`. Si un archivo no
 * existe o el navegador no lee OGG, los siete efectos del núcleo se sintetizan
 * con WebAudio; el resto simplemente calla (el sonido es un adorno).
 *
 * Nada suena antes de la primera interacción del usuario, y todo respeta el
 * botón de silencio (`SoundToggle`) y la visibilidad de la pestaña.
 */
import { SFX_FILES, VOLUME, audioUrl, type LoopSoundId, type SoundId } from './mediaCatalog';

export type { SoundId, LoopSoundId } from './mediaCatalog';

interface Tone {
  readonly freq: number;
  readonly to?: number;
  readonly ms: number;
  readonly type?: OscillatorType;
  readonly gain?: number;
  /** Retraso respecto al inicio, para formar arpegios. */
  readonly at?: number;
}

/** Respaldo sintetizado de los siete efectos del núcleo. */
const SYNTH: Partial<Record<SoundId, readonly Tone[]>> = {
  click: [{ freq: 440, ms: 55, type: 'square', gain: 0.16 }],
  // Arpegio ascendente: el premio suena a premio.
  success: [
    { freq: 523, ms: 110, gain: 0.2 },
    { freq: 659, ms: 110, gain: 0.2, at: 90 },
    { freq: 784, ms: 200, gain: 0.22, at: 180 },
  ],
  error: [{ freq: 220, to: 140, ms: 240, type: 'sawtooth', gain: 0.16 }],
  reward: [
    { freq: 784, ms: 90, gain: 0.2 },
    { freq: 1047, ms: 90, gain: 0.2, at: 80 },
    { freq: 1319, ms: 260, gain: 0.22, at: 160 },
  ],
  alarm: [
    { freq: 740, ms: 180, type: 'square', gain: 0.15 },
    { freq: 560, ms: 180, type: 'square', gain: 0.15, at: 200 },
  ],
  radio: [{ freq: 1200, to: 900, ms: 90, type: 'triangle', gain: 0.1 }],
  step: [{ freq: 180, ms: 45, type: 'triangle', gain: 0.1 }],
};

/** Separación mínima entre dos disparos del mismo efecto: evita duplicados. */
const MIN_GAP_MS: Partial<Record<SoundId, number>> = {
  step: 110, stepMars: 110, stepRegolith: 110, dialogueBlip: 45, click: 60,
};
const DEFAULT_GAP_MS = 80;

/** Si un efecto tarda en cargar, se descarta pasado este tiempo (ya no encajaría con la acción). */
const LATE_PLAY_MS = 700;

const STORAGE_KEY = 'astronexo_sound_v1';
let context: AudioContext | null = null;
let muted = readMuted();
let unlocked = false;
let oggSupported: boolean | null = null;

const buffers = new Map<string, AudioBuffer>();
const loading = new Map<string, Promise<AudioBuffer | null>>();
const failed = new Set<string>();
const lastPlayed = new Map<SoundId, number>();
let lastAnyPlayedAt = -Infinity;
const pendingPreload: SoundId[] = [];

const muteListeners = new Set<(muted: boolean) => void>();

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'off';
  } catch {
    return false;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean) {
  if (next === muted) return;
  muted = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? 'off' : 'on');
  } catch {
    // Sin almacenamiento el silencio dura solo esta sesión; no es un error.
  }
  if (next) stopActiveLoops(); else restartDesiredLoops();
  for (const listener of muteListeners) listener(next);
}

// ── Volumen general (0–1), además del silencio ──────────────────────────────
const VOLUME_KEY = 'astronexo_volume_v1';
const DEFAULT_VOLUME = 0.8;
let masterVolume = readVolume();
const volumeListeners = new Set<(volume: number) => void>();

function readVolume(): number {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    const value = raw === null ? NaN : Number(raw);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

/** Volumen general elegido por el jugador (multiplica música, ambiente y efectos). */
export function getVolume(): number {
  return masterVolume;
}

export function setVolume(next: number) {
  const value = Math.round(Math.min(1, Math.max(0, next)) * 100) / 100;
  if (value === masterVolume) return;
  masterVolume = value;
  try {
    window.localStorage.setItem(VOLUME_KEY, String(value));
  } catch {
    // Sin almacenamiento el volumen dura solo esta sesión.
  }
  // Los bucles que ya suenan cambian al momento.
  const ctx = context;
  for (const [id, loop] of activeLoops) {
    const target = Math.max(0.0001, VOLUME.sfx * (desiredLoops.get(id) ?? 1) * masterVolume);
    if (ctx) loop.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.03);
  }
  for (const listener of volumeListeners) listener(value);
}

/** Avisa cuando cambia el volumen general (lo usan la música y el control de volumen). */
export function subscribeVolume(listener: (volume: number) => void): () => void {
  volumeListeners.add(listener);
  return () => { volumeListeners.delete(listener); };
}

/** Avisa cuando cambia el silencio (lo usa el reproductor de música). */
export function subscribeMuted(listener: (muted: boolean) => void): () => void {
  muteListeners.add(listener);
  return () => { muteListeners.delete(listener); };
}

/** Milisegundos desde el último efecto disparado (para no duplicar el click genérico). */
export function msSinceLastSound(): number {
  return performance.now() - lastAnyPlayedAt;
}

function supportsOgg(): boolean {
  if (oggSupported === null) {
    try {
      oggSupported = new Audio().canPlayType('audio/ogg; codecs="vorbis"') !== '';
    } catch {
      oggSupported = false;
    }
  }
  return oggSupported;
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  if (context.state === 'suspended' && !document.hidden) void context.resume();
  return context;
}

/** Primera interacción del usuario: desde aquí el navegador permite sonar. */
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  getContext();
  const queued = pendingPreload.splice(0);
  preloadSounds(queued);
}

export function isAudioUnlocked(): boolean {
  return unlocked;
}

/** Pausa/reanuda todos los efectos con la visibilidad de la pestaña. */
export function setSfxSuspended(suspended: boolean) {
  if (!context) return;
  if (suspended) void context.suspend().catch(() => undefined);
  else void context.resume().catch(() => undefined);
}

function loadBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  const ready = buffers.get(url);
  if (ready) return Promise.resolve(ready);
  if (failed.has(url)) return Promise.resolve(null);
  const pending = loading.get(url);
  if (pending) return pending;
  const task = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.arrayBuffer();
    })
    .then((data) => ctx.decodeAudioData(data))
    .then((buffer) => { buffers.set(url, buffer); return buffer; })
    .catch(() => { failed.add(url); return null; })
    .finally(() => { loading.delete(url); });
  loading.set(url, task);
  return task;
}

/** Descarga por adelantado los efectos de una pantalla (sin reproducirlos). */
export function preloadSounds(ids: readonly SoundId[]) {
  if (!supportsOgg()) return;
  if (!unlocked) {
    pendingPreload.push(...ids);
    return;
  }
  const ctx = getContext();
  if (!ctx) return;
  for (const id of ids) for (const rel of SFX_FILES[id]) void loadBuffer(ctx, audioUrl(rel));
}

function playTone(ctx: AudioContext, tone: Tone) {
  const start = ctx.currentTime + (tone.at ?? 0) / 1000;
  const end = start + tone.ms / 1000;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tone.type ?? 'sine';
  osc.frequency.setValueAtTime(tone.freq, start);
  if (tone.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.to), end);
  // Envolvente corta: evita el chasquido al cortar la onda.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, (tone.gain ?? 0.18) * masterVolume), start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

/** Efectos que están sonando ahora, por id: permite cortar los largos al salir de la pantalla. */
const playing = new Map<SoundId, Set<{ readonly source: AudioBufferSourceNode; readonly gain: GainNode }>>();

function playBuffer(ctx: AudioContext, buffer: AudioBuffer, volume: number, id: SoundId) {
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = volume * masterVolume;
  source.connect(gain).connect(ctx.destination);
  const entry = { source, gain };
  const set = playing.get(id) ?? new Set();
  set.add(entry);
  playing.set(id, set);
  source.onended = () => { set.delete(entry); };
  source.start();
}

/** Corta con un fundido corto un efecto largo (p. ej. el motor del despegue) que sigue sonando. */
export function stopSound(id: SoundId, fadeMs = 150) {
  const set = playing.get(id);
  if (!set || !context) return;
  const ctx = context;
  for (const { source, gain } of set) {
    try {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + fadeMs / 1000);
      source.stop(ctx.currentTime + fadeMs / 1000 + 0.02);
    } catch {
      // Ya había terminado.
    }
  }
  set.clear();
}

function playSynth(ctx: AudioContext, id: SoundId) {
  for (const tone of SYNTH[id] ?? []) playTone(ctx, tone);
}

export interface PlaySoundOptions {
  /** Multiplicador 0–1 sobre el volumen estándar de efectos. */
  readonly volume?: number;
}

/**
 * Reproduce un efecto. Nunca lanza: si el audio no está disponible, calla.
 * Llamar cuando OCURRE la acción (un handler o un cambio de estado), no en cada render.
 */
export function playSound(id: SoundId, options: PlaySoundOptions = {}) {
  if (muted || !unlocked || masterVolume <= 0) return;
  try {
    const now = performance.now();
    if (now - (lastPlayed.get(id) ?? -Infinity) < (MIN_GAP_MS[id] ?? DEFAULT_GAP_MS)) return;
    lastPlayed.set(id, now);
    lastAnyPlayedAt = now;
    const ctx = getContext();
    if (!ctx) return;
    const volume = VOLUME.sfx * (options.volume ?? 1);
    const variants = SFX_FILES[id] as readonly string[];
    const url = audioUrl(variants[Math.floor(Math.random() * variants.length)]);

    if (!supportsOgg() || failed.has(url)) {
      playSynth(ctx, id);
      return;
    }
    const ready = buffers.get(url);
    if (ready) {
      playBuffer(ctx, ready, volume, id);
      return;
    }
    // Aún no descargado: el núcleo suena sintetizado ahora; el resto, si llega a tiempo.
    const hasSynth = Boolean(SYNTH[id]);
    if (hasSynth) playSynth(ctx, id);
    void loadBuffer(ctx, url).then((buffer) => {
      if (!buffer || hasSynth || muted || performance.now() - now > LATE_PLAY_MS) return;
      playBuffer(ctx, buffer, volume, id);
    });
  } catch {
    // El sonido es un adorno: si falla, el juego sigue igual.
  }
}

// ── Bucles de efecto (motor del rover) ──────────────────────────────────────
interface ActiveLoop { readonly source: AudioBufferSourceNode; readonly gain: GainNode }
const desiredLoops = new Map<LoopSoundId, number>();
const activeLoops = new Map<LoopSoundId, ActiveLoop>();

function launchLoop(id: LoopSoundId, volume: number) {
  if (activeLoops.has(id) || muted || !unlocked) return;
  const ctx = getContext();
  if (!ctx || !supportsOgg()) return;
  const url = audioUrl(SFX_FILES[id][0]);
  void loadBuffer(ctx, url).then((buffer) => {
    // Pudo haberse detenido, silenciado o duplicado mientras cargaba.
    if (!buffer || !desiredLoops.has(id) || activeLoops.has(id) || muted) return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(Math.max(0.0001, VOLUME.sfx * volume * masterVolume), ctx.currentTime + 0.08);
    source.connect(gain).connect(ctx.destination);
    source.start();
    activeLoops.set(id, { source, gain });
  });
}

function haltLoop(id: LoopSoundId) {
  const active = activeLoops.get(id);
  if (!active) return;
  activeLoops.delete(id);
  const ctx = context;
  try {
    if (ctx) {
      active.gain.gain.cancelScheduledValues(ctx.currentTime);
      active.gain.gain.setValueAtTime(active.gain.gain.value, ctx.currentTime);
      active.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      active.source.stop(ctx.currentTime + 0.1);
    } else {
      active.source.stop();
    }
  } catch {
    // Ya estaba detenido.
  }
}

function stopActiveLoops() {
  for (const id of [...activeLoops.keys()]) haltLoop(id);
}

function restartDesiredLoops() {
  for (const [id, volume] of desiredLoops) launchLoop(id, volume);
}

/** Inicia un bucle (idempotente). Llamar `stopLoop` al detenerse, salir o cambiar de pantalla. */
export function startLoop(id: LoopSoundId, options: PlaySoundOptions = {}) {
  const volume = options.volume ?? 1;
  desiredLoops.set(id, volume);
  launchLoop(id, volume);
}

export function stopLoop(id: LoopSoundId) {
  desiredLoops.delete(id);
  haltLoop(id);
}
