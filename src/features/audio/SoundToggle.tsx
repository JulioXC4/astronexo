import { useState } from 'react';
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { useI18n } from '../../i18n';
import { isMuted, playSound, setMuted } from './sound';

/** Botón de silencio. Vive junto al selector de idioma. */
export function SoundToggle({ className = '' }: { readonly className?: string }) {
  const { t } = useI18n();
  const [off, setOff] = useState(() => isMuted());

  return <button
    type="button"
    className={`sound-toggle ${className}`}
    aria-pressed={off}
    title={t(off ? 'sound.on' : 'sound.off')}
    aria-label={t(off ? 'sound.on' : 'sound.off')}
    onClick={() => {
      const next = !off;
      // El aviso de apagado suena antes de silenciar; el de encendido, después.
      if (next) playSound('toggleOff');
      setMuted(next);
      setOff(next);
      if (!next) playSound('toggleOn');
    }}
  >
    {off ? <SpeakerSlash weight="fill" aria-hidden="true" /> : <SpeakerHigh weight="fill" aria-hidden="true" />}
  </button>;
}
