import { useEffect } from 'react';
import { useRadio } from './RadioProvider';
import type { RadioSpeaker } from './radioTiming';

interface ScreenLine {
  readonly speaker: RadioSpeaker;
  readonly text: string;
}

/**
 * Al entrar a una pantalla, un personaje la presenta por radio. Se descarta lo
 * que quedaba de la pantalla anterior para que nunca hable «de otra cosa».
 * Así el niño siempre tiene a alguien que le dice qué hacer, en una o dos frases.
 */
export function useScreenRadio(lines: readonly ScreenLine[]) {
  const radio = useRadio();
  useEffect(() => {
    radio.clear();
    for (const line of lines) radio.say(line);
    // Al salir de la pantalla, lo que no llegó a decirse se descarta: nunca «habla de otra cosa».
    return () => radio.clear();
    // Solo al entrar: el texto no cambia mientras dura la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Para las pantallas que usan `useRadio().say` directamente: al salir, la cola de radio
 * se vacía. Sin esto, un aviso pendiente de la pantalla anterior saldría en la siguiente.
 */
export function useRadioLeave() {
  const radio = useRadio();
  useEffect(() => () => radio.clear(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
}

/**
 * Mueve el globo de radio a otra zona mientras dura la pantalla, para que nunca tape lo
 * importante (p. ej. las barras de recursos de la guardia). Zonas en `radio.css`.
 */
export function useRadioAnchor(anchor: 'guard') {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.radioAnchor = anchor;
    return () => { if (root.dataset.radioAnchor === anchor) delete root.dataset.radioAnchor; };
  }, [anchor]);
}
