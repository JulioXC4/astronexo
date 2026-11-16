import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Radio, X } from '@phosphor-icons/react';
import { resolveMessage, useI18n } from '../../i18n';
import { msSinceLastSound, playSound } from '../audio';
import { RADIO_PORTRAITS, type RadioMessage } from './radioTiming';

/** Esquinas donde puede ir el globo, en orden de preferencia (ver `radio.css`). */
const CORNERS = ['tr', 'br', 'bl', 'tl'] as const;

/**
 * Elige la esquina donde el globo tape menos: un objetivo resaltado (`[data-target]`) pesa mucho
 * y cada control (botón, perilla, campo) que quede debajo suma. Así el niño casi nunca tiene que
 * cerrar el globo para ver qué pulsar. Con empate gana la esquina de preferencia (`CORNERS`).
 */
function cornerScores(bubble: HTMLElement) {
  const controls = Array.from(document.querySelectorAll<HTMLElement>(
    // Además de lo que se toca, las tarjetas de datos de los minijuegos (`.mg-card`): antes el globo
    // tapaba, por ejemplo, el día más oscuro de «Nubes y soles».
    'button, [role="button"], [role="slider"], input, select, a[href], [data-target], [data-radio-avoid], .mg-card',
  ))
    .filter((element) => !element.closest('.radio-bubble') && !element.classList.contains('radio-replay'))
    .map((element) => ({
      rect: element.getBoundingClientRect(),
      weight: element.hasAttribute('data-target') ? 50 : element.hasAttribute('data-radio-avoid') || element.classList.contains('mg-card') ? 5 : 1,
    }))
    .filter(({ rect }) => rect.width > 0 && rect.height > 0);
  const original = bubble.dataset.corner;
  const scores = CORNERS.map((corner) => {
    bubble.dataset.corner = corner;
    const box = bubble.getBoundingClientRect();
    return controls.reduce((sum, { rect, weight }) => (
      box.left < rect.right && box.right > rect.left && box.top < rect.bottom && box.bottom > rect.top ? sum + weight : sum
    ), 0);
  });
  if (original) bubble.dataset.corner = original;
  return scores;
}

function setCorner(bubble: HTMLElement, corner: (typeof CORNERS)[number]) {
  bubble.dataset.corner = corner;
  // «Repetir ayuda» aparece después en la misma esquina: nunca encima de lo que el globo evitó.
  document.documentElement.dataset.radioCorner = corner;
}

function placeAwayFromTargets(bubble: HTMLElement) {
  if (document.documentElement.dataset.radioAnchor) return; // pantallas con zona propia (guardia)
  const scores = cornerScores(bubble);
  // Con empate gana la esquina de preferencia (el orden de CORNERS).
  const best = scores.indexOf(Math.min(...scores));
  setCorner(bubble, CORNERS[best]);
}

/**
 * La pantalla puede cambiar debajo del globo (se cierra una tarjeta de inicio y aparece un
 * contador justo donde estaba). Si lo de debajo ahora importa más, el globo se muda una vez.
 */
function moveIfCovering(bubble: HTMLElement) {
  if (document.documentElement.dataset.radioAnchor) return;
  const scores = cornerScores(bubble);
  const current = CORNERS.indexOf(bubble.dataset.corner as (typeof CORNERS)[number]);
  const best = scores.indexOf(Math.min(...scores));
  if (current >= 0 && scores[current] >= 5 && scores[best] < scores[current]) setCorner(bubble, CORNERS[best]);
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
  // Se traduce aquí, al dibujar: si el niño cambia de idioma, el globo cambia con él.
  const text = message ? resolveMessage(message.text, t) : '';

  useLayoutEffect(() => {
    if (message && bubbleRef.current) placeAwayFromTargets(bubbleRef.current);
  }, [message]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setInterval(() => { if (bubbleRef.current) moveIfCovering(bubbleRef.current); }, 600);
    return () => window.clearInterval(timer);
  }, [message]);

  // El sonido suena una vez por globo (no al cambiar de idioma).
  useEffect(() => {
    if (!message) return;
    // El aviso de peligro no se apila sobre otro efecto que acaba de sonar (alerta de guardia, batería…).
    if (message.tone !== 'danger') playSound('radio');
    else if (msSinceLastSound() > 500) playSound('alarm');
  }, [message]);

  useEffect(() => {
    if (!message) { setTyped(''); return undefined; }
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setTyped(text); return undefined; }
    setTyped('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, TYPE_MS);
    return () => window.clearInterval(timer);
  }, [message, text]);

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
      <p className="radio-bubble__sr">{text}</p>
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
