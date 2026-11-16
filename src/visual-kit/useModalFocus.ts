import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Foco y teclado de una ventana modal: al abrirse el foco entra en ella, Tab da la vuelta dentro
 * (no se escapa al juego de atrás), Escape la cierra y al cerrarse el foco vuelve a donde estaba.
 * Devuelve la referencia que hay que poner en el contenedor del diálogo.
 */
export function useModalFocus<T extends HTMLElement>(active: boolean, onEscape?: () => void): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const escape = useRef(onEscape);
  escape.current = onEscape;

  useEffect(() => {
    if (!active) return undefined;
    const container = ref.current;
    if (!container) return undefined;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const items = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter((element) => element.offsetParent !== null || element === document.activeElement);
    // Si ya hay algo con foco dentro (autoFocus), se respeta; si no, entra el primero.
    if (!container.contains(document.activeElement)) {
      const first = container.querySelector<HTMLElement>('[data-autofocus]') ?? items()[0];
      if (first) first.focus(); else { container.tabIndex = -1; container.focus(); }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && escape.current) {
        event.stopPropagation();
        escape.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const list = items();
      if (list.length === 0) { event.preventDefault(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      if (!container.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    container.addEventListener('keydown', onKey);
    return () => {
      container.removeEventListener('keydown', onKey);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [active]);

  return ref;
}
