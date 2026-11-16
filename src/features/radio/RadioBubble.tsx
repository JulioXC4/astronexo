import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { playSound } from '../audio';
import { RADIO_PORTRAITS, type RadioMessage } from './radioTiming';

/** Velocidad del efecto máquina de escribir. */
const TYPE_MS = 26;

interface RadioBubbleProps {
  readonly message: RadioMessage | null;
}

/**
 * El globo de radio de la esquina superior derecha: la cara de quien habla y
 * una o dos frases. Sustituye a las cajas de instrucciones: aquí nada detiene
 * el juego ni tapa el escenario.
 */
export function RadioBubble({ message }: RadioBubbleProps) {
  const { t } = useI18n();
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!message) { setTyped(''); return; }
    playSound(message.tone === 'danger' ? 'alarm' : 'radio');
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setTyped(message.text); return; }
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
  </aside>;
}
