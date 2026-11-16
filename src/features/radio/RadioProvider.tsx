import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { RADIO_TIMING, canInterrupt, visibleDurationMs, type RadioMessage, type RadioSpeaker, type RadioTone } from './radioTiming';
import { RadioBubble } from './RadioBubble';
import './radio.css';

interface RadioInput {
  readonly speaker?: RadioSpeaker;
  readonly text: string;
  readonly tone?: RadioTone;
  /** Clave de pista: con el mismo valor, el mensaje solo sale una vez por pantalla. */
  readonly once?: string;
  /** Aviso de una acción del jugador: va al frente de la cola. */
  readonly front?: boolean;
}

interface RadioApi {
  /** Encola un mensaje. Vuelve en silencio si ya se dijo esta pista. */
  readonly say: (input: RadioInput) => void;
  /** Vacía la cola y quita el globo (al cambiar de pantalla). */
  readonly clear: () => void;
}

const RadioContext = createContext<RadioApi | null>(null);

/** Sin proveedor el juego no se rompe: los mensajes se descartan. */
export function useRadio(): RadioApi {
  return useContext(RadioContext) ?? { say: () => undefined, clear: () => undefined };
}

let counter = 0;

export function RadioProvider({ children }: { readonly children: ReactNode }) {
  const [queue, setQueue] = useState<readonly RadioMessage[]>([]);
  const [current, setCurrent] = useState<RadioMessage | null>(null);
  const saidOnce = useRef<Set<string>>(new Set());
  const shownAt = useRef<number>(0);
  const started = useRef<boolean>(false);
  /** Tras interrumpir por peligro, el aviso sale casi de inmediato. */
  const fastNext = useRef<boolean>(false);

  const say = useCallback((input: RadioInput) => {
    if (input.once) {
      if (saidOnce.current.has(input.once)) return;
      saidOnce.current.add(input.once);
    }
    counter += 1;
    const message: RadioMessage = {
      id: `radio-${counter}`,
      speaker: input.speaker ?? 'ALBA',
      text: input.text,
      tone: input.tone ?? 'normal',
      once: input.once,
      front: input.front,
    };
    // El peligro pasa al frente de la cola; lo demás espera su turno.
    setQueue((pending) => (message.tone === 'danger' || message.front ? [message, ...pending] : [...pending, message]));
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    setCurrent(null);
    saidOnce.current = new Set();
    started.current = false;
    fastNext.current = false;
  }, []);

  // Un aviso de peligro puede echar al globo en pantalla, pero solo si este ya
  // lleva el tiempo protegido; nada más interrumpe.
  useEffect(() => {
    if (!current || queue.length === 0) return undefined;
    const next = queue[0];
    if (next.tone !== 'danger' && !next.front) return undefined;
    const interrupt = () => { fastNext.current = true; setCurrent(null); };
    const shownFor = Date.now() - shownAt.current;
    if (canInterrupt(next.tone, shownFor, next.front)) { interrupt(); return undefined; }
    // Aún no pasaron 2,8 s: se espera justo lo que falta y entonces interrumpe.
    const timer = window.setTimeout(interrupt, RADIO_TIMING.protectedMs - shownFor);
    return () => window.clearTimeout(timer);
  }, [queue, current]);

  // Saca el siguiente de la cola respetando la espera inicial y la pausa entre globos.
  useEffect(() => {
    if (current || queue.length === 0) return;
    const delay = fastNext.current
      ? 150
      : started.current ? RADIO_TIMING.gapMs : RADIO_TIMING.firstDelayMs;
    const timer = window.setTimeout(() => {
      started.current = true;
      fastNext.current = false;
      setQueue((pending) => {
        if (pending.length === 0) return pending;
        setCurrent(pending[0]);
        shownAt.current = Date.now();
        return pending.slice(1);
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [current, queue]);

  // Lo retira cuando se cumple su duración.
  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => setCurrent(null), visibleDurationMs(current.text));
    return () => window.clearTimeout(timer);
  }, [current]);

  // El globo flota sobre la pantalla. Se avisa mientras está visible para que
  // lo que haya debajo (p. ej. la banda de «Tu misión») se aparte y no quede
  // texto tapado a medias.
  useEffect(() => {
    const { body } = document;
    if (current) body.setAttribute('data-radio', 'on');
    else body.removeAttribute('data-radio');
    return () => body.removeAttribute('data-radio');
  }, [current]);

  const api = useMemo<RadioApi>(() => ({ say, clear }), [say, clear]);

  return <RadioContext.Provider value={api}>
    {children}
    <RadioBubble message={current} />
  </RadioContext.Provider>;
}
