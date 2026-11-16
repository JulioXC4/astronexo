import { useCallback, useRef } from 'react';
import { playSound, type SoundId } from '../../../audio';

/**
 * Efectos para controles continuos (diales, deslizadores): suena como máximo una vez
 * cada `gapMs`, y solo cuando la persona mueve el control, nunca por render.
 */
export function useThrottledSound(gapMs = 350) {
  const last = useRef(0);
  return useCallback((id: SoundId) => {
    const now = performance.now();
    if (now - last.current < gapMs) return;
    last.current = now;
    playSound(id);
  }, [gapMs]);
}
