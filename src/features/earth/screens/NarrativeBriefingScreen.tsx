import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, CaretLeft, CaretRight, FastForward } from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import { useScreenRadio } from '../../radio';
import { playSound, SoundToggle } from '../../audio';
import { computeSceneLayout, MAP_HEIGHT, MAP_WIDTH, type SafeZone } from '../../../visual-kit/earthMapLayout';
import './earth.css';
import './earth-map.css';
import './avatar-select.css';
import './briefing-scene.css';

interface NarrativeBriefingScreenProps {
  readonly cityName: string;
  readonly destination: string;
  readonly astronautName: string;
  readonly avatarId?: string;
  readonly onProceedToMap: () => void;
  readonly onBack: () => void;
}

/** Misma sala de la academia que la selección de astronauta: el cambio de pantalla no cambia de mundo. */
const BACKGROUND = '/assets/pixel-art/academy-briefing-room.webp';

const AVATAR_SPRITES: Record<string, string> = {
  ALBA: '/assets/pixel-art/cadet-alba.webp',
  LEO: '/assets/pixel-art/commander-leo.webp',
  AURORA: '/assets/pixel-art/officer-aurora.webp',
  NICO: '/assets/pixel-art/engineer-nico.webp',
};
const CHISPA_SPRITE = '/assets/characters/chispa.webp';

type SpeakerId = 'ALBA' | 'AURORA' | 'CHISPA';

/** Acento de cada voz: el mismo que usa la selección de astronauta para ese personaje. */
const SPEAKER_ACCENT: Record<SpeakerId, string> = { ALBA: '#4ec3d9', AURORA: '#bd92d0', CHISPA: '#f6c15b' };
const SPEAKER_THUMB: Record<SpeakerId, string> = {
  ALBA: AVATAR_SPRITES.ALBA,
  AURORA: AVATAR_SPRITES.AURORA,
  CHISPA: CHISPA_SPRITE,
};

const TOTAL_STEPS = 4;
/**
 * Novela visual: la sala ocupa TODA la pantalla y el cuadro de diálogo flota encima, abajo.
 * Solo se protege a lo ancho la zona de los dos personajes (30 % y 70 %); arriba y abajo el
 * escenario puede recortarse para llenar la pantalla sin franjas.
 */
const BRIEFING_SAFE_ZONE: SafeZone = { x0: 220, x1: 780, y0: 60, y1: 420 };

/** Paso 5: el centro de enlace presenta la misión con cuatro diálogos cortos sobre la sala de la academia. */
export function NarrativeBriefingScreen({
  cityName,
  destination,
  astronautName,
  avatarId = 'ALBA',
  onProceedToMap,
  onBack,
}: NarrativeBriefingScreenProps) {
  const { t } = useI18n();
  // Los diálogos de esta pantalla ya narran; solo se descarta el mensaje de radio de la pantalla anterior.
  useScreenRadio([]);
  const [step, setStep] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

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
    () => computeSceneLayout(size.width, Math.max(1, size.height), BRIEFING_SAFE_ZONE),
    [size.width, size.height],
  );
  const measured = size.width > 0 && size.height > 0;

  const destLabel = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');
  const playerSprite = AVATAR_SPRITES[avatarId] ?? AVATAR_SPRITES.ALBA;

  const dialogueSteps: ReadonlyArray<{ speaker: SpeakerId; name: string; role: string; text: string }> = [
    {
      speaker: 'ALBA',
      name: t('briefing.dialogue.step1Speaker'),
      role: t('briefing.title', { city: cityName }),
      text: t('briefing.dialogue.step1Text', { name: astronautName, city: cityName, destination: destLabel }),
    },
    {
      speaker: 'AURORA',
      name: t('briefing.dialogue.step2Speaker'),
      role: t('briefing.dialogue.step2Role'),
      text: t('briefing.dialogue.step2Text', { city: cityName }),
    },
    {
      speaker: 'ALBA',
      name: t('briefing.dialogue.step3Speaker'),
      role: t('briefing.dialogue.step3Role'),
      text: t('briefing.dialogue.step3Text'),
    },
    {
      speaker: 'CHISPA',
      name: t('briefing.dialogue.step4Speaker'),
      role: t('briefing.dialogue.step4Role'),
      text: t('briefing.dialogue.step4Text'),
    },
  ];
  const current = dialogueSteps[step - 1];
  const accent = SPEAKER_ACCENT[current.speaker];
  const last = step === TOTAL_STEPS;

  function next() {
    playSound('dialogueNext');
    if (last) onProceedToMap();
    else setStep((value) => value + 1);
  }
  function previous() {
    playSound('dialogueNext');
    setStep((value) => Math.max(1, value - 1));
  }

  // Flechas del teclado: mismo ritmo que los botones.
  const handlers = useRef({ next, previous });
  handlers.current = { next, previous };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowRight') handlers.current.next();
      else if (event.key === 'ArrowLeft') handlers.current.previous();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const stageStyle: CSSProperties = measured
    ? { left: layout.x, top: layout.y, width: layout.width, height: layout.height, ['--u' as string]: `${layout.scale}px`, ['--accent' as string]: accent }
    : { left: 0, top: 0, width: '100%', height: '100%', ['--u' as string]: '1px', ['--accent' as string]: accent };

  return (
    <div
      ref={containerRef}
      className="emap asel brief vn"
      style={{ ['--accent' as string]: accent }}
      data-speaker={current.speaker}
    >
      <div className="asel__ambient" style={{ backgroundImage: `url(${BACKGROUND})` }} aria-hidden="true" />

      <div className="asel__stage briefing-stage" style={stageStyle}>
        <img className="asel__background" src={BACKGROUND} alt="" draggable={false} width={MAP_WIDTH} height={MAP_HEIGHT} />
        <div className="asel-cast">
          {/* Quien habla se ilumina y da un paso al frente; el otro espera en penumbra. */}
          <div className={`asel-char brief-actor${current.speaker !== 'CHISPA' ? ' brief-actor--speaking' : ' brief-actor--listening'}`} style={{ left: '28%', ['--accent' as string]: SPEAKER_ACCENT.ALBA }}>
            <span className="asel-char__ring" aria-hidden="true" />
            <img className="asel-char__sprite" src={playerSprite} alt="" draggable={false} />
            <span className="asel-char__tag">{astronautName}</span>
          </div>
          <div className={`asel-char brief-actor brief-actor--chispa${current.speaker === 'CHISPA' ? ' brief-actor--speaking' : ' brief-actor--listening'}`} style={{ left: '72%', ['--accent' as string]: SPEAKER_ACCENT.CHISPA }}>
            <span className="asel-char__ring" aria-hidden="true" />
            <img className="asel-char__sprite" src={CHISPA_SPRITE} alt="" draggable={false} />
            <span className="asel-char__tag">{t('avatars.chispa.name')}</span>
          </div>
        </div>
      </div>

      <header className="emap-hud">
        <button type="button" className="emap-hud__back" onClick={onBack}>
          <ArrowLeft weight="bold" aria-hidden="true" />
          <span>{t('common.back')}</span>
        </button>
        <div className="emap-hud__status">
          <span className="emap-hud__route">{t('briefing.stepIndicator', { city: cityName, destination: destLabel })}</span>
        </div>
        <div className="emap-hud__tools">
          <span className="hud-audio-lang"><SoundToggle /><LanguageSelector variant="hud" plain /></span>
        </div>
      </header>

      <section className="brief-dialog" aria-live="polite" aria-label={current.name}>
        <div className="brief-dialog__speaker">
          <span className="brief-dialog__thumb"><img src={SPEAKER_THUMB[current.speaker]} alt="" draggable={false} /></span>
          <div>
            <strong className="brief-dialog__name">{current.name}</strong>
            <span className="brief-dialog__role">{current.role}</span>
          </div>
        </div>
        <p className="brief-dialog__text" key={step}>«{current.text}»</p>
        <div className="brief-dialog__controls">
          <div className="brief-dots" role="group" aria-label={t('briefing.dialogue.stepIndicator', { current: step, total: TOTAL_STEPS })}>
            {dialogueSteps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`brief-dot${index + 1 === step ? ' brief-dot--active' : ''}`}
                aria-label={t('briefing.dialogue.stepIndicator', { current: index + 1, total: TOTAL_STEPS })}
                aria-current={index + 1 === step ? 'step' : undefined}
                onClick={() => setStep(index + 1)}
              />
            ))}
            <span className="brief-dots__label">{t('briefing.dialogue.stepIndicator', { current: step, total: TOTAL_STEPS })}</span>
          </div>
          <div className="brief-dialog__buttons">
            {step > 1 && (
              <button type="button" className="pixel-btn pixel-btn--secondary" onClick={previous}>
                <CaretLeft weight="bold" aria-hidden="true" />
                <span>{t('briefing.dialogue.prevBtn')}</span>
              </button>
            )}
            {!last && (
              <button type="button" className="pixel-btn pixel-btn--secondary" onClick={() => setStep(TOTAL_STEPS)}>
                <FastForward weight="bold" aria-hidden="true" />
                <span>{t('briefing.dialogue.skipBtn')}</span>
              </button>
            )}
            <button type="button" className="pixel-btn pixel-btn--primary" onClick={next}>
              <span>{t(last ? 'briefing.dialogue.readyBtn' : 'briefing.dialogue.nextBtn')}</span>
              {last ? <ArrowRight weight="bold" aria-hidden="true" /> : <CaretRight weight="bold" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
