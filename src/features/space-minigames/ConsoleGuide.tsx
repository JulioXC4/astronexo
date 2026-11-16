import { RADIO_PORTRAITS, type RadioSpeaker } from '../radio';
import { useI18n } from '../../i18n';
import './console-guide.css';

interface ConsoleGuideProps {
  /** Quién habla (la tarea la dicta Chispa). */
  readonly speaker: RadioSpeaker;
  readonly text: string;
  readonly tone?: 'normal' | 'good' | 'tip';
}

/**
 * La ayuda de un minijuego que vive DENTRO de su ventana modal: el personaje, una frase grande.
 * Dentro de un modal la ayuda no sale por radio (la radio calla bajo un modal), así que
 * la instrucción nunca se repite ni compite con otra notificación.
 */
export function ConsoleGuide({ speaker, text, tone = 'normal' }: ConsoleGuideProps) {
  const { t } = useI18n();
  return <div className={`console-guide console-guide--${tone}`} role="note">
    <img className="console-guide__portrait" src={RADIO_PORTRAITS[speaker]} alt="" />
    <p><strong>{t(`radio.speakers.${speaker}`)}:</strong> {text}</p>
  </div>;
}
