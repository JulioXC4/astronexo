import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../../i18n';
import { VIDEO_POSTERS, videoUrl, type VideoId } from './mediaCatalog';
import './cinematic.css';

/** Máximo que se espera a que el video empiece antes de seguir sin él. */
const START_TIMEOUT_MS = 8000;
/** Margen sobre la duración real para el caso de que `ended` no llegue. */
const END_SLACK_MS = 2500;

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** Suelta el archivo para que el navegador deje de descargarlo y libere memoria. */
function releaseVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.removeAttribute('src');
  video.load();
}

/** Avisa a Chrome/Edge/Firefox de que pronto se pedirá este video. No lo reproduce ni lo monta. */
const warmed = new Set<VideoId>();
export function warmVideo(id: VideoId) {
  if (warmed.has(id) || typeof document === 'undefined') return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (prefersReducedMotion() || connection?.saveData) return;
  warmed.add(id);
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'video';
  link.href = videoUrl(id);
  document.head.appendChild(link);
}

interface CinematicTransitionProps {
  readonly video: VideoId;
  /** Se llama exactamente una vez: al terminar, al saltar, si falla o con movimiento reducido. */
  readonly onDone: () => void;
  /** Texto opcional superpuesto al video (p. ej. la frase de bienvenida de Alba). No altera su duración. */
  readonly caption?: ReactNode;
}

/**
 * Transición de video a pantalla completa: sin audio propio, sin controles y con «Saltar» siempre a mano.
 * Se monta solo en el momento de reproducirse y libera el video al desmontarse.
 * Con `prefers-reduced-motion` no se reproduce: avanza de inmediato.
 */
export function CinematicTransition({ video, onDone, caption }: CinematicTransitionProps) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (reduced) { finish(); return undefined; }
    const element = videoRef.current;
    if (!element) return undefined;
    let endTimer: number | undefined;
    const startTimer = window.setTimeout(finish, START_TIMEOUT_MS);
    const onPlaying = () => window.clearTimeout(startTimer);
    const onMetadata = () => {
      if (Number.isFinite(element.duration)) {
        endTimer = window.setTimeout(finish, element.duration * 1000 + END_SLACK_MS);
      }
    };
    element.addEventListener('playing', onPlaying);
    element.addEventListener('loadedmetadata', onMetadata);
    element.play().catch(finish);
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') finish(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
      element.removeEventListener('playing', onPlaying);
      element.removeEventListener('loadedmetadata', onMetadata);
      window.removeEventListener('keydown', onKey);
      releaseVideo(element);
    };
  }, [reduced, finish]);

  if (reduced) return null;
  const poster = VIDEO_POSTERS[video];
  return <div
    className="cinematic"
    role="dialog"
    aria-modal="true"
    aria-label={t('common.skip')}
    style={poster ? { backgroundImage: `url(${poster})` } : undefined}
  >
    <video
      ref={videoRef}
      className="cinematic__video"
      src={videoUrl(video)}
      poster={poster || undefined}
      muted
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onEnded={finish}
      onError={finish}
    />
    {caption}
    <button type="button" className="cinematic__skip" data-silent onClick={finish} autoFocus>
      {t('common.skip')}
    </button>
  </div>;
}

function isSafariWithoutAlpha(): boolean {
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/chrome|chromium|android|edg|firefox/i.test(ua);
}

/**
 * Cortinilla de alarma para abrir una emergencia importante. Es un WebM con transparencia:
 * se superpone al juego (no bloquea clics) y dura ~1 s. Safari no pinta el alfa de WebM, así
 * que allí se omite en lugar de mostrar un fondo negro.
 */
export function AlarmWipe({ onDone }: { readonly onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const [skip] = useState(() => prefersReducedMotion() || isSafariWithoutAlpha());

  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, []);

  useEffect(() => {
    if (skip) { finish(); return undefined; }
    const element = videoRef.current;
    if (!element) return undefined;
    const failsafe = window.setTimeout(finish, 2500);
    element.play().catch(finish);
    return () => {
      window.clearTimeout(failsafe);
      releaseVideo(element);
    };
  }, [skip, finish]);

  if (skip) return null;
  return <video
    ref={videoRef}
    className="alarm-wipe"
    src={videoUrl('alarmWipe')}
    muted
    playsInline
    preload="auto"
    aria-hidden="true"
    tabIndex={-1}
    onEnded={finish}
    onError={finish}
  />;
}
