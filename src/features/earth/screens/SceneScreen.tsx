import type { ReactNode } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { LanguageSelector, useI18n } from '../../../i18n';
import './earth.css';
import './earth-map.css';
import './scene-screen.css';
import { SoundToggle } from '../../audio';

/** Fondos de escena compartidos por las pantallas narrativas (mismas ilustraciones que el resto del juego). */
export const SCENE_BACKGROUNDS = {
  academy: '/assets/scenes/landing/poster.webp',
  briefingRoom: '/assets/pixel-art/academy-briefing-room.webp',
  moon: '/assets/scenes/destinations/moon.webp',
  mars: '/assets/scenes/destinations/mars.webp',
  moonBuilder: '/assets/space/backgrounds/moon-base-builder.webp',
  marsBuilder: '/assets/space/backgrounds/mars-base-builder.webp',
  moonControl: '/assets/space/backgrounds/moon-control.webp',
  marsControl: '/assets/space/backgrounds/mars-control.webp',
} as const;

interface SceneScreenProps {
  /** Ilustración de fondo (ver `SCENE_BACKGROUNDS`). */
  readonly background: string;
  readonly children: ReactNode;
  /** Botón «Volver» de la barra superior. */
  readonly onBack?: () => void;
  /** Texto de la etiqueta central de la barra superior (p. ej. el título de la pantalla). */
  readonly status?: ReactNode;
}

/**
 * Carcasa común de las pantallas narrativas de la Tierra y del viaje: ilustración a pantalla completa,
 * barra superior pixel art (volver · etiqueta · idioma) y paneles con el mismo lenguaje visual que
 * el constructor, la selección de astronauta y el briefing. Así ninguna pantalla se queda con otro diseño.
 */
export function SceneScreen({ background, children, onBack, status }: SceneScreenProps) {
  const { t } = useI18n();
  return <div className="earth-screen scene-screen">
    <div className="scene-bg" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
    <header className="emap-hud">
      {onBack
        ? <button type="button" className="emap-hud__back" onClick={onBack}>
          <ArrowLeft weight="bold" aria-hidden="true" />
          <span>{t('common.back')}</span>
        </button>
        : <span />}
      {status ? <div className="emap-hud__status"><span className="emap-hud__route">{status}</span></div> : <span />}
      <div className="emap-hud__tools"><span className="hud-audio-lang"><SoundToggle /><LanguageSelector variant="hud" plain /></span></div>
    </header>
    {children}
  </div>;
}
