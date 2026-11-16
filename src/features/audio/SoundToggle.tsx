import { useEffect, useId, useRef, useState } from 'react';
import { SpeakerHigh, SpeakerLow, SpeakerNone, SpeakerSlash } from '@phosphor-icons/react';
import { useI18n } from '../../i18n';
import { getVolume, isMuted, playSound, setMuted, setVolume, subscribeMuted, subscribeVolume } from './sound';
import './sound-control.css';

/**
 * Control de sonido. Vive junto al selector de idioma. El icono abre un panel pequeño con una
 * barra para subir o bajar el volumen y un botón para silenciar. El panel no es una ventana
 * modal: se cierra al tocar fuera, con Escape o al volver a tocar el icono.
 */
export function SoundToggle({ className = '' }: { readonly className?: string }) {
  const { t } = useI18n();
  const [off, setOff] = useState(() => isMuted());
  const [volume, setLocalVolume] = useState(() => getVolume());
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  // Varios iconos (uno por pantalla) siempre muestran lo mismo.
  useEffect(() => subscribeMuted(setOff), []);
  useEffect(() => subscribeVolume(setLocalVolume), []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); }
    };
    document.addEventListener('pointerdown', onPointer, true);
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  function toggleMute() {
    const next = !off;
    // El aviso de apagado suena antes de silenciar; el de encendido, después.
    if (next) playSound('toggleOff');
    setMuted(next);
    setOff(next);
    if (!next) playSound('toggleOn');
  }

  function changeVolume(value: number) {
    setVolume(value / 100);
    setLocalVolume(value / 100);
    // Subir el volumen con el sonido apagado lo vuelve a encender.
    if (off && value > 0) { setMuted(false); setOff(false); }
  }

  const silent = off || volume <= 0;
  const Icon = silent ? SpeakerSlash : volume < 0.34 ? SpeakerNone : volume < 0.67 ? SpeakerLow : SpeakerHigh;
  const percent = Math.round(volume * 100);

  return <span ref={rootRef} className={`sound-control ${className}`}>
    <button
      type="button"
      className="sound-toggle"
      aria-expanded={open}
      aria-controls={panelId}
      aria-pressed={silent}
      title={t('sound.volume')}
      aria-label={t('sound.volume')}
      onClick={() => setOpen((value) => !value)}
    >
      <Icon weight="fill" aria-hidden="true" />
    </button>
    {/* data-radio-block: mientras se ajusta el volumen, la radio espera (antes un globo lo tapaba). */}
    {open && <span id={panelId} className="sound-panel" role="group" aria-label={t('sound.volume')} data-radio-block="true">
      <button
        type="button"
        className="sound-panel__mute"
        aria-pressed={off}
        title={t(off ? 'sound.on' : 'sound.off')}
        aria-label={t(off ? 'sound.on' : 'sound.off')}
        onClick={toggleMute}
      >
        {off ? <SpeakerSlash weight="fill" aria-hidden="true" /> : <SpeakerHigh weight="fill" aria-hidden="true" />}
      </button>
      <input
        type="range"
        className="sound-panel__slider"
        min={0}
        max={100}
        step={5}
        value={off ? 0 : percent}
        aria-label={t('sound.volume')}
        aria-valuetext={`${off ? 0 : percent}%`}
        style={{ ['--fill' as string]: `${off ? 0 : percent}%` }}
        onChange={(event) => changeVolume(Number(event.target.value))}
        onPointerUp={() => playSound('click')}
        onKeyUp={(event) => { if (event.key.startsWith('Arrow')) playSound('click'); }}
      />
      <output className="sound-panel__value">{off ? 0 : percent}%</output>
    </span>}
  </span>;
}
