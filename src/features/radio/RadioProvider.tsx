import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { resolveMessage, useI18n } from '../../i18n';
import { RADIO_TIMING, canInterrupt, visibleDurationMs, type RadioMessage, type RadioSpeaker, type RadioTone } from './radioTiming';
import { RadioBubble, RadioReplayButton } from './RadioBubble';
import './radio.css';

interface RadioInput {
  readonly speaker?: RadioSpeaker;
  /** Mejor una referencia `msg('clave')` que un texto ya traducido: así sigue el idioma activo. */
  readonly text: string;
  readonly tone?: RadioTone;
  /** Clave de pista: con el mismo valor, el mensaje solo sale una vez por pantalla. */
  readonly once?: string;
  /** Aviso de una acción del jugador: va al frente de la cola. */
  readonly front?: boolean;
  /** Minijuego o pantalla dueña de la ayuda (ver `RadioMessage.scope`). */
  readonly scope?: string;
}

interface RadioApi {
  /**
   * Encola un mensaje. Vuelve en silencio si ya se dijo esta pista, si el mismo texto
   * ya está en pantalla o en la cola, o si salió hace poco (un evento, un solo aviso).
   */
  readonly say: (input: RadioInput) => void;
  /** Vacía la cola y quita el globo (al cambiar de pantalla). */
  readonly clear: () => void;
  /** Cierra el globo que está en pantalla. */
  readonly dismiss: () => void;
  /** Vuelve a decir las últimas ayudas de esta pantalla. */
  readonly replay: () => void;
}

const NOOP_API: RadioApi = { say: () => undefined, clear: () => undefined, dismiss: () => undefined, replay: () => undefined };
const RadioContext = createContext<RadioApi | null>(null);

/** Sin proveedor el juego no se rompe: los mensajes se descartan. */
export function useRadio(): RadioApi {
  return useContext(RadioContext) ?? NOOP_API;
}

/**
 * Lo que cuenta como «ventana importante»: cualquier diálogo modal o una ayuda con la marca
 * `data-radio-block`. Mientras haya una, la radio calla y su cola espera.
 * Así los avisos secundarios nunca compiten con un modal por la atención.
 */
export const RADIO_BLOCKER_SELECTOR = '[role="dialog"][aria-modal="true"], [data-radio-block="true"]';

/** Un mismo texto no se repite antes de esto (salvo con `replay`). */
const DUPLICATE_WINDOW_MS = 20000;
/** Cuántas ayudas recuerda «Repetir ayuda». */
const HISTORY_LIMIT = 3;
/** Tras cerrarse una ventana importante, la radio espera un poco antes de seguir. */
const RESUME_DELAY_MS = 900;

let counter = 0;

/** Las ayudas se pueden silenciar al cerrarlas; los avisos de peligro y las respuestas a una acción, no. */
const isHelp = (message: Pick<RadioMessage, 'tone' | 'front'>) => message.tone !== 'danger' && !message.front;

export function RadioProvider({ children }: { readonly children: ReactNode }) {
  const { t } = useI18n();
  const [queue, setQueue] = useState<readonly RadioMessage[]>([]);
  const [current, setCurrent] = useState<RadioMessage | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [historySize, setHistorySize] = useState(0);
  const saidOnce = useRef<Set<string>>(new Set());
  const recent = useRef<Map<string, number>>(new Map());
  const history = useRef<RadioMessage[]>([]);
  const currentRef = useRef<RadioMessage | null>(null);
  const shownAt = useRef<number>(0);
  const started = useRef<boolean>(false);
  /** Tras interrumpir por peligro o tras una ventana importante, el siguiente sale casi de inmediato. */
  const fastNext = useRef<boolean>(false);
  const resumeNext = useRef<boolean>(false);
  /**
   * Minijuegos cuyas ayudas el niño ya cerró: no vuelven a salir solas en toda la partida
   * (sí con «Repetir ayuda», que es voluntario). Antes, cerrar el globo solo daba paso a la
   * siguiente ayuda de la cola, y al volver a entrar al minijuego todo empezaba otra vez.
   */
  const mutedScopes = useRef<Set<string>>(new Set());
  /** Pantalla sin ámbito propio en la que el niño cerró la ayuda (se reinicia al cambiar de pantalla). */
  const screenMuted = useRef<boolean>(false);
  currentRef.current = current;

  const enqueue = useCallback((message: RadioMessage) => {
    // El peligro pasa al frente de la cola; lo demás espera su turno.
    setQueue((pending) => (message.tone === 'danger' || message.front ? [message, ...pending] : [...pending, message]));
  }, []);

  const say = useCallback((input: RadioInput) => {
    if (input.once) {
      if (saidOnce.current.has(input.once)) return;
      saidOnce.current.add(input.once);
    }
    const now = Date.now();
    const lastSaid = recent.current.get(input.text);
    if (lastSaid !== undefined && now - lastSaid < DUPLICATE_WINDOW_MS) return;
    if (currentRef.current?.text === input.text) return;
    recent.current.set(input.text, now);
    counter += 1;
    const message: RadioMessage = {
      id: `radio-${counter}`,
      speaker: input.speaker ?? 'ALBA',
      text: input.text,
      tone: input.tone ?? 'normal',
      once: input.once,
      front: input.front,
      scope: input.scope,
    };
    // Ayuda de un minijuego (o pantalla) que el niño ya cerró: no se dice sola, pero queda
    // guardada para «Repetir ayuda».
    const muted = input.scope ? mutedScopes.current.has(input.scope) : screenMuted.current;
    if (isHelp(message) && muted) {
      if (!history.current.some((item) => item.text === message.text)) {
        history.current = [...history.current, message].slice(-HISTORY_LIMIT);
        setHistorySize(history.current.length);
      }
      return;
    }
    // Un texto idéntico que ya espera en la cola no se encola dos veces.
    setQueue((pending) => {
      if (pending.some((item) => item.text === message.text)) return pending;
      return message.tone === 'danger' || message.front ? [message, ...pending] : [...pending, message];
    });
    // Las ayudas que se pueden repetir: no los avisos de peligro ni las pistas de una sola acción.
    if (message.tone !== 'danger' && !history.current.some((item) => item.text === message.text)) {
      history.current = [...history.current, message].slice(-HISTORY_LIMIT);
      setHistorySize(history.current.length);
    }
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    setCurrent(null);
    saidOnce.current = new Set();
    recent.current = new Map();
    history.current = [];
    setHistorySize(0);
    started.current = false;
    fastNext.current = false;
    resumeNext.current = false;
    screenMuted.current = false;
  }, []);

  const dismiss = useCallback(() => {
    setCurrent(null);
  }, []);

  /**
   * El niño cerró el globo (X o Escape): entendió o no quiere más ayuda. Se quitan las demás
   * ayudas pendientes de ese minijuego y no vuelven a salir solas. Los avisos de peligro siguen.
   */
  const userDismiss = useCallback(() => {
    const closing = currentRef.current;
    setCurrent(null);
    if (!closing || !isHelp(closing)) return;
    if (closing.scope) mutedScopes.current.add(closing.scope);
    else screenMuted.current = true;
    setQueue((pending) => pending.filter((item) => !isHelp(item)
      || (closing.scope ? item.scope !== closing.scope : Boolean(item.scope))));
  }, []);

  const replay = useCallback(() => {
    const again = history.current;
    if (again.length === 0) return;
    setQueue([]);
    setCurrent(null);
    fastNext.current = true;
    for (const message of again) {
      counter += 1;
      enqueue({ ...message, id: `radio-${counter}`, front: false });
    }
  }, [enqueue]);

  // Una ventana importante (modal o ayuda) manda: la radio calla y espera.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    let frame = 0;
    const check = () => {
      frame = 0;
      setBlocked(document.querySelector(RADIO_BLOCKER_SELECTOR) !== null);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(check);
    };
    check();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-modal', 'role', 'data-radio-block'],
    });
    return () => {
      observer.disconnect();
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  // Si se abre una ventana importante con un globo en pantalla, el globo vuelve a la cola
  // (se dirá completo después, no se pierde). Al cerrarse la ventana, la cola sigue sola.
  const wasBlocked = useRef(false);
  useEffect(() => {
    if (blocked && currentRef.current) {
      const paused = currentRef.current;
      setQueue((pending) => [paused, ...pending]);
      setCurrent(null);
    }
    if (wasBlocked.current && !blocked) resumeNext.current = true;
    wasBlocked.current = blocked;
  }, [blocked]);

  // Un aviso de peligro puede echar al globo en pantalla, pero solo si este ya
  // lleva el tiempo protegido; nada más interrumpe.
  useEffect(() => {
    if (blocked || !current || queue.length === 0) return undefined;
    const next = queue[0];
    if (next.tone !== 'danger' && !next.front) return undefined;
    const interrupt = () => { fastNext.current = true; setCurrent(null); };
    const shownFor = Date.now() - shownAt.current;
    if (canInterrupt(next.tone, shownFor, next.front)) { interrupt(); return undefined; }
    // Aún no pasaron 2,8 s: se espera justo lo que falta y entonces interrumpe.
    const timer = window.setTimeout(interrupt, RADIO_TIMING.protectedMs - shownFor);
    return () => window.clearTimeout(timer);
  }, [queue, current, blocked]);

  // Saca el siguiente de la cola respetando la espera inicial y la pausa entre globos.
  useEffect(() => {
    if (blocked || current || queue.length === 0) return undefined;
    const delay = fastNext.current
      ? 150
      : resumeNext.current ? RESUME_DELAY_MS
        : started.current ? RADIO_TIMING.gapMs : RADIO_TIMING.firstDelayMs;
    const timer = window.setTimeout(() => {
      started.current = true;
      fastNext.current = false;
      resumeNext.current = false;
      setQueue((pending) => {
        if (pending.length === 0) return pending;
        setCurrent(pending[0]);
        shownAt.current = Date.now();
        return pending.slice(1);
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [current, queue, blocked]);

  // Lo retira cuando se cumple su duración (medida sobre el texto ya traducido, no sobre la clave).
  // `t` no entra en las dependencias: cambiar de idioma no reinicia el reloj del globo.
  const translateRef = useRef(t);
  translateRef.current = t;
  useEffect(() => {
    if (!current) return undefined;
    const timer = window.setTimeout(() => setCurrent(null), visibleDurationMs(resolveMessage(current.text, translateRef.current)));
    return () => window.clearTimeout(timer);
  }, [current]);

  // El globo flota sobre la pantalla. Se avisa mientras está visible para que
  // lo que haya debajo (la banda de «Tu misión» de los entrenamientos) se
  // aparte y no quede texto tapado a medias.
  useEffect(() => {
    const { body } = document;
    if (current) body.setAttribute('data-radio', 'on');
    else body.removeAttribute('data-radio');
    return () => body.removeAttribute('data-radio');
  }, [current]);

  // Escape cierra el globo (solo si no hay una ventana importante que lo use).
  useEffect(() => {
    if (!current || blocked) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') userDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, blocked, userDismiss]);

  const api = useMemo<RadioApi>(() => ({ say, clear, dismiss, replay }), [say, clear, dismiss, replay]);
  const canReplay = historySize > 0 && !current && queue.length === 0 && !blocked;

  return <RadioContext.Provider value={api}>
    {children}
    <RadioBubble message={blocked ? null : current} onDismiss={userDismiss} />
    {canReplay && <RadioReplayButton onReplay={replay} />}
  </RadioContext.Provider>;
}
