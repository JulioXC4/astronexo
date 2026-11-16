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
    // Y al salir también: si la pantalla siguiente no tiene radio propia, el
    // niño no debe seguir viendo a Chispa hablando de la pantalla anterior
    // (p. ej. explicando el huerto cuando ya está en la Luna).
    return () => radio.clear();
    // Solo al entrar: el texto no cambia mientras dura la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
