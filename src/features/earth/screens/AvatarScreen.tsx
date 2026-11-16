import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { AVATAR_OPTIONS, type AvatarOption } from '../../../data/avatars';
import { useI18n, LanguageSelector } from '../../../i18n';
import { useScreenRadio } from '../../radio';
import { playSound, SoundToggle } from '../../audio';
import { computeSceneLayout, MAP_HEIGHT, MAP_WIDTH, type SafeZone } from '../../../visual-kit/earthMapLayout';
import './earth.css';
import './earth-map.css';
import './avatar-select.css';
import { CHARACTER_SPRITES } from '../../../assets/characterSprites';

interface AvatarScreenProps {
  readonly cityName: string;
  readonly destination: string;
  readonly initialAvatarId: string;
  readonly initialFictionalName: string;
  readonly onConfirmProfile: (avatar: AvatarOption, fictionalName: string) => void;
  readonly onBack: () => void;
}

const BACKGROUND = '/assets/pixel-art/academy-briefing-room.webp';

const AVATAR_SPRITES: Record<string, string> = {
  ALBA: CHARACTER_SPRITES.ALBA,
  LEO: CHARACTER_SPRITES.LEO,
  AURORA: CHARACTER_SPRITES.AURORA,
  NICO: CHARACTER_SPRITES.NICO,
};

const AVATAR_ACCENTS: Record<string, string> = {
  ALBA: '#4ec3d9',
  LEO: '#5bbd78',
  AURORA: '#bd92d0',
  NICO: '#f6c15b',
};

/** Centros horizontales (lienzo lógico 1000 × 563) de los cuatro astronautas, repartidos alrededor del emblema del suelo. */
const CAST_X = [300, 433, 567, 700] as const;
/** Zona que nunca se recorta: el elenco completo y la pantalla holográfica. */
const AVATAR_SAFE_ZONE: SafeZone = { x0: 190, x1: 810, y0: 100, y1: 540 };
/** Alto (px) que ocupa la barra inferior en tabletas; el escenario se encuadra por encima. */
const DOCK_RESERVE = 132;
const DOCK_RESERVE_PHONE = 214;

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false));
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** Selección de astronauta: el elenco posa en la sala de la academia y la ficha se proyecta en la pantalla holográfica. */
const CALLSIGN_KEYS = ['explorer', 'captain', 'guardian'] as const;

export function AvatarScreen({
  cityName,
  destination,
  initialAvatarId,
  initialFictionalName,
  onConfirmProfile,
  onBack,
}: AvatarScreenProps) {
  const { t } = useI18n();
  // Sin globo de radio: el título de la pantalla ya dice qué hacer (antes el globo lo repetía).
  useScreenRadio([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatarId || AVATAR_OPTIONS[0].id);
  const suggestions = CALLSIGN_KEYS.map((key) => t(`callsigns.${key}`));
  // Mientras el niño no escriba ni elija nada, el apodo por defecto sigue al idioma activo.
  const [typedCallsign, setCallsign] = useState<string | null>(initialFictionalName || null);
  const callsign = typedCallsign ?? suggestions[0];

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const compact = useMediaQuery('(max-width: 1200px), (max-aspect-ratio: 4/3)');
  const phone = useMediaQuery('(max-width: 640px)');
  const reserve = compact ? (phone ? DOCK_RESERVE_PHONE : DOCK_RESERVE) : 0;

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSize((previous) => (previous.width === rect.width && previous.height === rect.height ? previous : { width: rect.width, height: rect.height }));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () => computeSceneLayout(size.width, Math.max(1, size.height - reserve), AVATAR_SAFE_ZONE),
    [size.width, size.height, reserve],
  );
  const measured = size.width > 0 && size.height > 0;
  const bottomGap = measured ? size.height - (layout.y + layout.height) : 0;

  const selectedAvatar = AVATAR_OPTIONS.find((avatar) => avatar.id === selectedAvatarId) ?? AVATAR_OPTIONS[0];
  const accent = AVATAR_ACCENTS[selectedAvatar.id] ?? '#f6c15b';
  const selectedAvatarName = t(`avatars.profiles.${selectedAvatar.id}.name`);
  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');

  function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    playSound('avatarConfirm');
    onConfirmProfile(selectedAvatar, callsign.trim() || t('avatars.defaultCallsign'));
  }

  /** Flechas: recorren el elenco como un grupo de opciones (patrón radiogroup). */
  function handleCastKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    if (!forward && !backward) return;
    event.preventDefault();
    const index = AVATAR_OPTIONS.findIndex((avatar) => avatar.id === selectedAvatarId);
    const next = AVATAR_OPTIONS[(index + (forward ? 1 : -1) + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length];
    setSelectedAvatarId(next.id);
    requestAnimationFrame(() => containerRef.current?.querySelector<HTMLElement>(`[data-avatar-id="${next.id}"]`)?.focus());
  }

  const stageStyle: CSSProperties = measured
    ? { left: layout.x, top: layout.y, width: layout.width, height: layout.height, ['--u' as string]: `${layout.scale}px`, ['--accent' as string]: accent }
    : { left: 0, top: 0, width: '100%', height: '100%', ['--u' as string]: '1px', ['--accent' as string]: accent };

  return (
    <div ref={containerRef} className="emap asel" data-compact={compact || undefined} data-letterbox-y={bottomGap > 2 || layout.letterboxY || undefined} data-gap-top={(measured && layout.y > 2) || undefined}>
      <div className="asel__ambient" style={{ backgroundImage: `url(${BACKGROUND})` }} aria-hidden="true" />

      <div className="asel__stage" style={stageStyle}>
        <img className="asel__background" src={BACKGROUND} alt="" draggable={false} width={MAP_WIDTH} height={MAP_HEIGHT} />

        {/* Ficha proyectada en la pantalla holográfica de la sala */}
        <section className="asel-holo" aria-live="polite" aria-atomic="true">
          <div className="asel-holo__content" key={selectedAvatar.id}>
            <p className="asel-holo__kicker">{t('avatars.title')}</p>
            <h2 className="asel-holo__name">{selectedAvatarName}</h2>
            <p className="asel-holo__role">{t(`avatars.profiles.${selectedAvatar.id}.role`)}</p>
            <p className="asel-holo__desc">{t(`avatars.profiles.${selectedAvatar.id}.desc`)}</p>
          </div>
        </section>

        {/* Elenco: cada astronauta es una opción del grupo */}
        <div className="asel-cast" role="radiogroup" aria-label={t('avatars.title')} onKeyDown={handleCastKeyDown}>
          {AVATAR_OPTIONS.map((avatar, index) => {
            const selected = avatar.id === selectedAvatarId;
            const name = t(`avatars.profiles.${avatar.id}.name`);
            return (
              <button
                key={avatar.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${name}. ${t(`avatars.profiles.${avatar.id}.role`)}`}
                tabIndex={selected ? 0 : -1}
                data-avatar-id={avatar.id}
                className={`asel-char${selected ? ' asel-char--selected' : ''}`}
                style={{ left: `${CAST_X[index] / 10}%`, ['--accent' as string]: AVATAR_ACCENTS[avatar.id] ?? '#f6c15b' }}
                onClick={() => { playSound('cardSelect'); setSelectedAvatarId(avatar.id); }}
              >
                <span className="asel-char__ring" aria-hidden="true" />
                <img className="asel-char__sprite" src={AVATAR_SPRITES[avatar.id]} alt="" draggable={false} />
                <span className="asel-char__tag">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <header className="emap-hud">
        <button type="button" className="emap-hud__back" onClick={onBack}>
          <ArrowLeft weight="bold" aria-hidden="true" />
          <span>{t('common.back')}</span>
        </button>
        <div className="emap-hud__status">
          <span className="emap-hud__route">{t('avatars.stepIndicator', { city: cityName, destination: destName })}</span>
        </div>
        <div className="emap-hud__tools">
          <span className="hud-audio-lang"><SoundToggle /><LanguageSelector variant="hud" plain /></span>
        </div>
      </header>

      <div className="asel-dock">
        <form className="asel-callsign" onSubmit={handleSubmit}>
          <label htmlFor="callsign-input-pixel" className="asel-callsign__label">{t('avatars.callsignLabel')}</label>
          <input
            id="callsign-input-pixel"
            type="text"
            className="asel-callsign__input"
            maxLength={26}
            value={callsign}
            onChange={(event) => setCallsign(event.target.value)}
            placeholder={t('avatars.callsignPlaceholder')}
            autoComplete="off"
          />
          <div className="asel-callsign__chips" role="group" aria-label={t('avatars.callsignSuggestions')}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={`asel-chip${callsign === suggestion ? ' asel-chip--active' : ''}`}
                aria-pressed={callsign === suggestion}
                onClick={() => { playSound('cardSelect'); setCallsign(suggestion); }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>

        <div className="asel-confirm">
          <button type="button" className="pixel-btn pixel-btn--primary" onClick={() => handleSubmit()}>
            <span>{t('avatars.confirmAvatar', { name: selectedAvatarName })}</span>
            <ArrowRight weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
