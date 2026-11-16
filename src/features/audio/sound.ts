/**
 * Sonido del juego.
 *
 * El proyecto no tenía ni un byte de audio: `public/assets/audio/` solo
 * contenía un `.gitkeep`. Para no bloquear esto esperando a que Diseño entregue
 * los archivos, los efectos se sintetizan con WebAudio (no pesan nada y no
 * añaden dependencias). Cuando existan los .mp3 reales basta con rellenar
 * `SAMPLE_PATHS`: si el archivo está, suena; si no, se sintetiza.
 */
export type SoundId =
  | 'click'
  | 'success'
  | 'error'
  | 'reward'
  | 'alarm'
  | 'radio'
  | 'step';

/** Cuando Diseño entregue los archivos, se listan aquí y tienen prioridad. */
const SAMPLE_PATHS: Partial<Record<SoundId, string>> = {};

interface Tone {
  readonly freq: number;
  readonly to?: number;
  readonly ms: number;
  readonly type?: OscillatorType;
  readonly gain?: number;
  /** Retraso respecto al inicio, para formar arpegios. */
  readonly at?: number;
}

const RECIPES: Readonly<Record<SoundId, readonly Tone[]>> = {
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

const STORAGE_KEY = 'astronexo_sound_v1';
let context: AudioContext | null = null;
let muted = readMuted();

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
  muted = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? 'off' : 'on');
  } catch {
    // Sin almacenamiento el silencio dura solo esta sesión; no es un error.
  }
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  // Los navegadores suspenden el audio hasta el primer gesto del usuario.
  if (context.state === 'suspended') void context.resume();
  return context;
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
  gain.gain.exponentialRampToValueAtTime(tone.gain ?? 0.18, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(end + 0.02);
}

/** Reproduce un efecto. Nunca lanza: si el audio no está disponible, calla. */
export function playSound(id: SoundId) {
  if (muted) return;
  try {
    const sample = SAMPLE_PATHS[id];
    if (sample) {
      const audio = new Audio(sample);
      audio.volume = 0.5;
      void audio.play().catch(() => undefined);
      return;
    }
    const ctx = getContext();
    if (!ctx) return;
    for (const tone of RECIPES[id]) playTone(ctx, tone);
  } catch {
    // El sonido es un adorno: si falla, el juego sigue igual.
  }
}
