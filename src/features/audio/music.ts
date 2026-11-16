/**
 * Música de fondo y ambientes: un único reproductor global.
 *
 * - Una sola pista de música y un solo ambiente activos; cada canal reutiliza
 *   dos elementos `<audio>` (nunca se crean elementos por render).
 * - Cambio de pista con crossfade corto (400 ms). Si la pista pedida ya suena,
 *   no se reinicia.
 * - Los componentes no tocan el reproductor: declaran la escena con
 *   `useAudioScene`. Varias llamadas en el mismo ciclo (salir de una pantalla y
 *   entrar a otra) se agrupan, así que no hay corte entre pantallas que
 *   comparten pista.
 * - Nada suena antes de la primera interacción, en silencio o con la pestaña oculta.
 */
import { useEffect } from 'react';
import {
  AMBIENT_FILES, MUSIC_FILES, VOLUME, audioUrl,
  type AmbientId, type MusicId, type SoundId,
} from './mediaCatalog';
import {
  isAudioUnlocked, isMuted, msSinceLastSound, playSound, preloadSounds,
  setSfxSuspended, subscribeMuted, unlockAudio, getVolume, subscribeVolume,
} from './sound';

const FADE_MS = 400;
const FADE_STEP_MS = 40;

function canPlayNow(): boolean {
  return isAudioUnlocked() && !isMuted() && !document.hidden;
}

/** Cambia el volumen de un elemento en pasos; un fundido nuevo cancela el anterior. */
const fades = new WeakMap<HTMLAudioElement, number>();
function fadeTo(element: HTMLAudioElement, target: number, ms: number, done?: () => void) {
  const running = fades.get(element);
  if (running !== undefined) window.clearInterval(running);
  const from = element.volume;
  const steps = Math.max(1, Math.round(ms / FADE_STEP_MS));
  let step = 0;
  const timer = window.setInterval(() => {
    step += 1;
    element.volume = Math.min(1, Math.max(0, from + (target - from) * (step / steps)));
    if (step >= steps) {
      window.clearInterval(timer);
      fades.delete(element);
      done?.();
    }
  }, FADE_STEP_MS);
  fades.set(element, timer);
}

/** Suelta el archivo: deja de descargar y libera memoria. */
function release(element: HTMLAudioElement) {
  const running = fades.get(element);
  if (running !== undefined) window.clearInterval(running);
  fades.delete(element);
  element.pause();
  element.removeAttribute('src');
  element.load();
}

class Channel {
  private readonly slots: [HTMLAudioElement | null, HTMLAudioElement | null] = [null, null];
  private active = -1;
  private loadedUrl: string | null = null;
  private desiredUrl: string | null = null;

  constructor(private readonly volume: number) {}

  private element(index: 0 | 1): HTMLAudioElement {
    let element = this.slots[index];
    if (!element) {
      element = new Audio();
      element.loop = true;
      element.preload = 'auto';
      this.slots[index] = element;
    }
    return element;
  }

  /** Pista deseada (o `null` para silencio). Se aplica en cuanto el entorno lo permite. */
  set(url: string | null) {
    this.desiredUrl = url;
    this.reconcile();
  }

  /** Reconcilia lo deseado con lo que realmente suena. */
  reconcile() {
    if (!canPlayNow()) {
      for (const element of this.slots) element?.pause();
      return;
    }
    if (this.desiredUrl === this.loadedUrl) {
      const current = this.active >= 0 ? this.slots[this.active] : null;
      if (current?.paused) this.start(current, false);
      return;
    }
    const outgoing = this.active >= 0 ? this.slots[this.active] : null;
    if (this.desiredUrl === null) {
      this.loadedUrl = null;
      this.active = -1;
      if (outgoing) fadeTo(outgoing, 0, FADE_MS, () => release(outgoing));
      return;
    }
    const nextIndex: 0 | 1 = this.active === 0 ? 1 : 0;
    const incoming = this.element(nextIndex);
    release(incoming);
    incoming.loop = true;
    incoming.src = this.desiredUrl;
    incoming.volume = 0;
    this.loadedUrl = this.desiredUrl;
    this.active = nextIndex;
    if (outgoing) fadeTo(outgoing, 0, FADE_MS, () => release(outgoing));
    this.start(incoming, true);
  }

  /** Aplica al momento el volumen general a la pista que suena (sin reiniciarla). */
  applyVolume() {
    const current = this.active >= 0 ? this.slots[this.active] : null;
    if (!current) return;
    const running = fades.get(current);
    if (running !== undefined) { window.clearInterval(running); fades.delete(current); }
    current.volume = Math.min(1, this.volume * getVolume());
  }

  private start(element: HTMLAudioElement, fadeIn: boolean) {
    const target = Math.min(1, this.volume * getVolume());
    if (!fadeIn) element.volume = target;
    element.play().then(() => {
      if (fadeIn && element === this.slots[this.active]) fadeTo(element, target, FADE_MS);
    }).catch(() => {
      // Autoplay bloqueado o archivo ausente: se reintenta en la siguiente interacción.
    });
  }

  pause() {
    for (const element of this.slots) element?.pause();
  }
}

const musicChannel = new Channel(VOLUME.music);
const ambientChannel = new Channel(VOLUME.ambient);
// Mover el volumen general cambia la música y el ambiente al momento.
subscribeVolume(() => {
  musicChannel.applyVolume();
  ambientChannel.applyVolume();
  if (stinger) stinger.volume = Math.min(1, VOLUME.music * 1.6 * getVolume());
});

// ── Fanfarria de victoria (una sola vez) ────────────────────────────────────
let stinger: HTMLAudioElement | null = null;
let stingerToken = 0;

function cancelStinger() {
  stingerToken += 1;
  if (stinger) release(stinger);
}

function playVictoryThen(next: MusicId | null) {
  cancelStinger();
  if (!canPlayNow()) {
    musicChannel.set(next ? audioUrl(MUSIC_FILES[next]) : null);
    return;
  }
  const token = stingerToken;
  musicChannel.set(null);
  stinger ??= new Audio();
  stinger.loop = false;
  stinger.src = audioUrl(MUSIC_FILES.victory);
  stinger.volume = Math.min(1, VOLUME.music * 1.6 * getVolume());
  const resume = () => {
    if (token !== stingerToken) return;
    if (stinger) release(stinger);
    musicChannel.set(next ? audioUrl(MUSIC_FILES[next]) : null);
  };
  stinger.onended = resume;
  stinger.onerror = resume;
  stinger.play().catch(resume);
}

// ── Escenas ─────────────────────────────────────────────────────────────────
export interface AudioScene {
  readonly music?: MusicId | null;
  readonly ambient?: AmbientId | null;
  /** Fanfarria que suena una vez antes de la música (solo `victory`). */
  readonly intro?: 'victory';
  /** Efectos de la pantalla que conviene descargar por adelantado. */
  readonly preload?: readonly SoundId[];
}

const scenes = new Map<symbol, AudioScene>();
let appliedKey: string | null = null;
let applyQueued = false;

function sceneKey(scene: AudioScene | undefined): string {
  return `${scene?.music ?? ''}|${scene?.ambient ?? ''}|${scene?.intro ?? ''}`;
}

function applyScene() {
  applyQueued = false;
  // La escena registrada más recientemente manda.
  const scene = [...scenes.values()].pop();
  const key = sceneKey(scene);
  if (scene?.preload) preloadSounds(scene.preload);
  if (key === appliedKey) return;
  const previousMusic = appliedKey?.split('|')[0] ?? '';
  appliedKey = key;
  const music = scene?.music ?? null;
  ambientChannel.set(scene?.ambient ? audioUrl(AMBIENT_FILES[scene.ambient]) : null);
  if (scene?.intro === 'victory') {
    playVictoryThen(music);
    return;
  }
  // Misma pista que ya suena: no se toca (no se reinicia ni se hace crossfade).
  if ((music ?? '') === previousMusic && !stinger?.src) return;
  cancelStinger();
  musicChannel.set(music ? audioUrl(MUSIC_FILES[music]) : null);
}

function queueApply() {
  if (applyQueued) return;
  applyQueued = true;
  queueMicrotask(applyScene);
}

function registerScene(scene: AudioScene): symbol {
  const id = Symbol('audio-scene');
  scenes.set(id, scene);
  queueApply();
  return id;
}

function unregisterScene(id: symbol) {
  scenes.delete(id);
  queueApply();
}

/**
 * Declara la música y el ambiente de la pantalla montada. Al desmontarse la
 * escena se retira; si no queda ninguna, el audio se apaga con fundido.
 */
export function useAudioScene(scene: AudioScene | null) {
  const music = scene?.music ?? null;
  const ambient = scene?.ambient ?? null;
  const intro = scene?.intro;
  const preloadKey = scene?.preload?.join(',') ?? '';
  const active = scene !== null;
  useEffect(() => {
    if (!active) return undefined;
    const id = registerScene({
      music, ambient, intro,
      preload: preloadKey ? (preloadKey.split(',') as SoundId[]) : undefined,
    });
    return () => unregisterScene(id);
  }, [active, music, ambient, intro, preloadKey]);
}

// ── Ciclo de vida global ────────────────────────────────────────────────────
function reconcileAll() {
  musicChannel.reconcile();
  ambientChannel.reconcile();
  if (stinger) {
    if (canPlayNow()) { if (stinger.src && stinger.paused && !stinger.ended) void stinger.play().catch(() => undefined); }
    else stinger.pause();
  }
}

const CORE_SOUNDS: readonly SoundId[] = [
  'click', 'success', 'error', 'reward', 'alarm', 'radio', 'step',
  'cardSelect', 'panelOpen', 'panelClose', 'dialogueNext', 'notification',
];

let initialised = false;

/** Se llama una vez al montar la aplicación. Idempotente. */
export function initAudio() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;

  const unlock = () => {
    const first = !isAudioUnlocked();
    unlockAudio();
    // Los efectos de uso general se descargan tras la primera interacción (pocos KB).
    if (first) preloadSounds(CORE_SOUNDS);
    reconcileAll();
  };
  for (const type of ['pointerdown', 'keydown', 'touchstart'] as const) {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  }
  if (navigator.userActivation?.hasBeenActive) unlockAudio();

  document.addEventListener('visibilitychange', () => {
    setSfxSuspended(document.hidden);
    reconcileAll();
  });
  subscribeMuted(() => reconcileAll());

  // Click genérico de interfaz: solo si ningún efecto específico sonó en este mismo gesto.
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('button, [role="button"], a[href], summary')) return;
    if (target.closest('[data-silent]')) return;
    if (msSinceLastSound() < 60) return;
    playSound('click');
  });
}
