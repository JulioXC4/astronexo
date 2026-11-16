import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Radio, X } from '@phosphor-icons/react';
import { useI18n } from '../../i18n';
import { msSinceLastSound, playSound } from '../audio';
import { RADIO_PORTRAITS, type RadioMessage } from './radioTiming';

/** Esquinas donde puede ir el globo, en orden de preferencia (ver `radio.css`). */
const CORNERS = ['tr', 'br', 'bl', 'tl'] as const;

/**
 * Elige la esquina donde el globo tape menos: un objetivo resaltado (`[data-target]`) pesa mucho
 * y cada control (botón, perilla, campo) que quede debajo suma. Así el niño casi nunca tiene que
 * cerrar el globo para ver qué pulsar. Con empate gana la esquina de preferencia (`CORNERS`).
 */
function placeAwayFromTargets(bubble: HTMLElement) {
  if (document.documentElement.dataset.radioAnchor) return; // pantallas con zona propia (guardia)
  const controls = Array.from(document.querySelectorAll<HTMLElement>(
    'button, [role="button"], [role="slider"], input, select, a[href], [data-target], [data-radio-avoid]',
  ))
    .filter((element) => !element.closest('.radio-bubble') && !element.classList.contains('radio-replay'))
    .map((element) => ({ rect: element.getBoundingClientRect(), weight: element.hasAttribute('data-target') ? 50 : element.hasAttribute('data-radio-avoid') ? 5 : 1 }))
    .filter(({ rect }) => rect.width > 0 && rect.height > 0);
  let best: (typeof CORNERS)[number] = 'tr';
  let bestScore = Infinity;
  for (const corner of CORNERS) {
    bubble.dataset.corner = corner;
    const box = bubble.getBoundingClientRect();
    const score = controls.reduce((sum, { rect, weight }) => (
      box.left < rect.right && box.right > rect.left && box.top < rect.bottom && box.bottom > rect.top ? sum + weight : sum
    ), 0);
    if (score < bestScore) { best = corner; bestScore = score; }
    if (score === 0) break;
  }
  bubble.dataset.corner = best;
}

/** Velocidad del efecto máquina de escribir. */
const TYPE_MS = 20;

interface RadioBubbleProps {
  readonly message: RadioMessage | null;
  readonly onDismiss?: () => void;
}

/**
 * El globo de radio de la esquina superior derecha: la cara de quien habla y
 * una o dos frases. Sustituye a las cajas de instrucciones: nada detiene el
 * juego, y se puede cerrar con la X o con Escape.
 */
export function RadioBubble({ message, onDismiss }: RadioBubbleProps) {
  const { t } = useI18n();
  const [typed, setTyped] = useState('');
  const bubbleRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (message && bubbleRef.current) placeAwayFromTargets(bubbleRef.current);
  }, [message]);

  useEffect(() => {
    if (!message) { setTyped(''); return undefined; }
    // El aviso de peligro no se apila sobre otro efecto que acaba de sonar (alerta de guardia, batería…).
    if (message.tone !== 'danger') playSound('radio');
    else if (msSinceLastSound() > 500) playSound('alarm');
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setTyped(message.text); return undefined; }
    setTyped('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(message.text.slice(0, index));
      if (index >= message.text.length) window.clearInterval(timer);
    }, TYPE_MS);
    return () => window.clearInterval(timer);
  }, [message]);

  if (!message) return null;

  return <aside
    key={message.id}
    ref={bubbleRef}
    data-corner="tr"
    className={`radio-bubble radio-bubble--${message.tone}`}
    role="status"
    aria-live={message.tone === 'danger' ? 'assertive' : 'polite'}
  >
    <span className="radio-bubble__signal" aria-hidden="true" />
    <img
      className="radio-bubble__portrait"
      src={RADIO_PORTRAITS[message.speaker]}
      alt={t(`radio.speakers.${message.speaker}`)}
    />
    <div className="radio-bubble__copy">
      <strong>{t(`radio.speakers.${message.speaker}`)}</strong>
      {/* El texto completo va al lector de pantalla; el tecleo es solo visual. */}
      <p aria-hidden="true">{typed}</p>
      <p className="radio-bubble__sr">{message.text}</p>
    </div>
    {onDismiss && <button type="button" className="radio-bubble__close" onClick={onDismiss} aria-label={t('radio.close')} title={t('radio.close')}>
      <X weight="bold" aria-hidden="true" />
    </button>}
  </aside>;
}

/** Aparece cuando no hay globo: vuelve a decir las últimas ayudas de la pantalla. */
export function RadioReplayButton({ onReplay }: { readonly onReplay: () => void }) {
  const { t } = useI18n();
  return <button type="button" className="radio-replay" onClick={onReplay} aria-label={t('radio.replay')} title={t('radio.replay')}>
    <Radio weight="fill" aria-hidden="true" />
    <span>{t('radio.replay')}</span>
  </button>;
}
