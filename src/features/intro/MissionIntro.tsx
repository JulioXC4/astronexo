import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, FastForward, RocketLaunch } from '@phosphor-icons/react';
import { useI18n } from '../../i18n';
import { CharacterPortrait, type PortraitIdentity } from '../../visual-kit/CharacterPortrait';
import { SoundToggle, playSound } from '../audio';
import { useScreenRadio } from '../radio';
import './mission-intro.css';
import { CHARACTER_SPRITES } from '../../assets/characterSprites';

/**
 * Minicinemática ilustrada que cuenta, en cuatro escenas y en el orden real del juego,
 * qué hará el cadete: elegir destino → diseñar la base → entrenar en la Tierra → misión espacial.
 *
 * Es solo narrativa: no recibe ni modifica el estado de la misión. El niño avanza a su ritmo
 * («Siguiente»), puede saltarla en cualquier momento y al terminar se llama `onFinish` una sola vez.
 */

const INTRO = '/assets/intro';

type SceneId = 'destination' | 'base' | 'training' | 'space';

interface SceneDef {
  readonly id: SceneId;
  readonly speaker: PortraitIdentity;
  readonly name: string;
  /** Imágenes de la escena, para precargar la siguiente mientras se lee la actual. */
  readonly images: readonly string[];
}

const SCENES: readonly SceneDef[] = [
  {
    id: 'destination', speaker: 'CHISPA', name: 'Chispa',
    images: ['/assets/scenes/destinations/moon.webp', `${INTRO}/planet-moon.webp`, `${INTRO}/planet-mars.webp`, `${INTRO}/rocket.webp`, `${INTRO}/starry-route.webp`],
  },
  {
    id: 'base', speaker: 'NICO', name: 'Nico',
    images: ['/assets/space/backgrounds/moon-base-builder.webp', `${INTRO}/builder-hologram.webp`, `${INTRO}/base-preview-moon.webp`, `${INTRO}/base-preview-mars.webp`],
  },
  {
    id: 'training', speaker: 'AURORA', name: 'Aurora',
    images: [`${INTRO}/earth-training-split.webp`, `${INTRO}/badge-arequipa.webp`, `${INTRO}/radio-outpost-tromso.webp`, `${INTRO}/tool-scanner-pickaxe.webp`, `${INTRO}/tool-energy-cell.webp`],
  },
  {
    id: 'space', speaker: 'ALBA', name: 'Alba',
    images: ['/assets/space/backgrounds/moon-control.webp', '/assets/space/backgrounds/mars-control.webp', '/assets/space/ui/alert-frame.webp', `${INTRO}/mission-badge.webp`],
  },
];

/** Los mismos personajes de la selección de astronauta (antes usaba los diseños anteriores). */
const SPRITES: Record<PortraitIdentity, string> = CHARACTER_SPRITES;

const preloaded = new Set<string>();
/** Pide de fondo las imágenes de una escena; no bloquea nada y solo lo hace una vez. */
export function preloadIntroScene(index = 0) {
  if (typeof window === 'undefined') return;
  const scene = SCENES[index];
  if (!scene) return;
  for (const src of [...scene.images, SPRITES[scene.speaker]]) {
    if (preloaded.has(src)) continue;
    preloaded.add(src);
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  }
}

/**
 * Un doble clic de un niño en «¡Elige tu destino!» no debe pulsar también lo que aparece debajo
 * en la pantalla siguiente (p. ej. «Volver»). Se ignoran los clics durante un instante tras salir.
 */
const FOLLOW_UP_GUARD_MS = 450;
function swallowFollowUpClicks() {
  if (typeof window === 'undefined') return;
  const stop = (event: Event) => { event.stopPropagation(); event.preventDefault(); };
  const types = ['click', 'dblclick', 'pointerup'] as const;
  for (const type of types) window.addEventListener(type, stop, true);
  window.setTimeout(() => { for (const type of types) window.removeEventListener(type, stop, true); }, FOLLOW_UP_GUARD_MS);
}

interface MissionIntroProps {
  /** Se llama exactamente una vez: al pulsar «¡Elige tu destino!» o «Saltar introducción». */
  readonly onFinish: () => void;
}

export function MissionIntro({ onFinish }: MissionIntroProps) {
  const { t } = useI18n();
  // Vacía la radio: ningún aviso de otra pantalla se superpone a la introducción.
  useScreenRadio([]);
  const [index, setIndex] = useState(0);
  const finishedRef = useRef(false);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const scene = SCENES[index];
  const isLast = index === SCENES.length - 1;

  useEffect(() => {
    preloadIntroScene(index);
    preloadIntroScene(index + 1);
    playSound('dialogueBlip');
    primaryRef.current?.focus({ preventScroll: true });
  }, [index]);

  function finish(sound: 'dialogueNext' | 'panelClose') {
    if (finishedRef.current) return;
    finishedRef.current = true;
    playSound(sound);
    swallowFollowUpClicks();
    onFinish();
  }

  function next() {
    if (finishedRef.current) return;
    if (isLast) { finish('dialogueNext'); return; }
    playSound('dialogueNext');
    setIndex((value) => Math.min(value + 1, SCENES.length - 1));
  }

  const title = t(`intro.scenes.${scene.id}.title`);

  return <section
    className={`mission-intro mission-intro--${scene.id}`}
    role="dialog"
    aria-modal="true"
    aria-label={t('intro.label')}
  >
    {/* Fondo de la escena: una o dos mitades (Luna | Marte) con un velo para leer bien. */}
    <div className="mission-intro__backdrop" key={`bg-${scene.id}`} aria-hidden="true"><span /><span /></div>
    <header className="mission-intro__top">
      <SoundToggle className="mission-intro__sound" />
      <div className="mission-intro__progress" role="status" aria-label={t('intro.progress', { current: index + 1, total: SCENES.length })}>
        <ol aria-hidden="true">
          {SCENES.map((item, i) => <li key={item.id} className={i < index ? 'is-done' : i === index ? 'is-current' : undefined} />)}
        </ol>
        <span aria-hidden="true">{index + 1}/{SCENES.length}</span>
      </div>
      <button type="button" className="mission-intro__skip" data-silent onClick={() => finish('panelClose')}>
        <FastForward weight="fill" aria-hidden="true" />
        <span>{t('intro.skip')}</span>
      </button>
    </header>

    {/* `key` reinicia las animaciones de entrada en cada escena. */}
    <div className="mission-intro__stage" key={scene.id} aria-hidden="true">
      <SceneArt id={scene.id} />
    </div>

    <div className="mission-intro__dialog" key={`dialog-${scene.id}`}>
      <div className="mission-intro__speaker">
        <CharacterPortrait identity={scene.speaker} source={SPRITES[scene.speaker]} label={scene.name} kind={scene.speaker === 'CHISPA' ? 'robot' : 'cadet'} />
      </div>
      <div className="mission-intro__bubble">
        <p className="mission-intro__name">{scene.name}</p>
        <h2 className="mission-intro__title">{title}</h2>
        <p className="mission-intro__line">«{t(`intro.scenes.${scene.id}.line`)}»</p>
      </div>
      <button
        ref={primaryRef}
        type="button"
        data-silent
        className={`mission-intro__next${isLast ? ' mission-intro__next--start' : ''}`}
        onClick={next}
      >
        {isLast
          ? <><RocketLaunch weight="fill" aria-hidden="true" /><span>{t('intro.start')}</span></>
          : <><span>{t('intro.next')}</span><ArrowRight weight="bold" aria-hidden="true" /></>}
      </button>
    </div>
  </section>;
}

function SceneArt({ id }: { readonly id: SceneId }) {
  const { t } = useI18n();
  switch (id) {
    case 'destination':
      return <div className="mi-route">
        <img className="mi-route__path" src={`${INTRO}/starry-route.webp`} alt="" decoding="async" />
        <figure className="mi-planet mi-planet--moon">
          <img src={`${INTRO}/planet-moon.webp`} alt="" decoding="async" />
          <figcaption>{t('intro.labels.moon')}</figcaption>
        </figure>
        <figure className="mi-planet mi-planet--mars">
          <img src={`${INTRO}/planet-mars.webp`} alt="" decoding="async" />
          <figcaption>{t('intro.labels.mars')}</figcaption>
        </figure>
        <img className="mi-route__rocket" src={`${INTRO}/rocket.webp`} alt="" decoding="async" />
      </div>;

    case 'base':
      return <div className="mi-builder">
        <Preview src={`${INTRO}/base-preview-moon.webp`} label={t('intro.labels.moonBase')} tag={t('intro.example')} side="left" />
        <div className="mi-builder__console">
          <span className="mi-builder__glow" />
          <img src={`${INTRO}/builder-hologram.webp`} alt="" decoding="async" />
          <span className="mi-chip mi-builder__chip">{t('intro.labels.modules')}</span>
        </div>
        <Preview src={`${INTRO}/base-preview-mars.webp`} label={t('intro.labels.marsBase')} tag={t('intro.example')} side="right" />
      </div>;

    case 'training':
      return <div className="mi-training">
        <figure className="mi-city mi-city--arequipa">
          <img src={`${INTRO}/badge-arequipa.webp`} alt="" decoding="async" />
          <figcaption>Arequipa</figcaption>
        </figure>
        <figure className="mi-city mi-city--tromso">
          <img src={`${INTRO}/radio-outpost-tromso.webp`} alt="" decoding="async" />
          <figcaption>Tromsø</figcaption>
        </figure>
        <div className="mi-rewards">
          <span className="mi-rewards__label">{t('intro.toWin')}</span>
          <div className="mi-rewards__slots">
            <span className="mi-slot"><img src={`${INTRO}/tool-scanner-pickaxe.webp`} alt="" decoding="async" /></span>
            <span className="mi-slot"><img src={`${INTRO}/tool-energy-cell.webp`} alt="" decoding="async" /></span>
            <span className="mi-slot mi-slot--mystery">?</span>
          </div>
          <span className="mi-rewards__arrow" />
          <img className="mi-rewards__rocket" src={`${INTRO}/rocket.webp`} alt="" decoding="async" />
        </div>
      </div>;

    case 'space':
      return <div className="mi-space">
        <div className="mi-alert">
          <img className="mi-alert__frame" src="/assets/space/ui/alert-frame.webp" alt="" decoding="async" />
          <span className="mi-alert__text">{t('intro.labels.alert')}</span>
        </div>
        <ul className="mi-gauges">
          <Gauge icon="energy-icon" label={t('intro.labels.energy')} kind="energy" />
          <Gauge icon="oxygen-icon" label={t('intro.labels.oxygen')} kind="oxygen" />
          <Gauge icon="shield-icon" label={t('intro.labels.shield')} kind="shield" extra={<span className="mi-chip mi-chip--go">{t('intro.labels.protect')}</span>} />
          <Gauge icon="research-icon" label={t('intro.labels.science')} kind="science" />
        </ul>
        <img className="mi-space__badge" src={`${INTRO}/mission-badge.webp`} alt="" decoding="async" />
      </div>;
  }
}

function Preview({ src, label, tag, side }: { readonly src: string; readonly label: string; readonly tag: string; readonly side: 'left' | 'right' }) {
  return <figure className={`mi-preview mi-preview--${side}`}>
    <span className="mi-preview__tag">{tag}</span>
    <img src={src} alt="" decoding="async" />
    <figcaption>{label}</figcaption>
  </figure>;
}

function Gauge({ icon, label, kind, extra }: { readonly icon: string; readonly label: string; readonly kind: string; readonly extra?: ReactNode }) {
  return <li className={`mi-gauge mi-gauge--${kind}`}>
    <img src={`/assets/space/ui/${icon}.webp`} alt="" decoding="async" />
    <span className="mi-gauge__label">{label}</span>
    <span className="mi-gauge__bar"><span /></span>
    {extra}
  </li>;
}

/** Frase de Alba sobre el video de reclutamiento. Solo texto: no detiene ni alarga el video. */
export function RecruitCaption() {
  const { t } = useI18n();
  return <div className="mi-recruit" aria-live="polite">
    <span className="mi-recruit__portrait">
      <CharacterPortrait identity="ALBA" source={SPRITES.ALBA} label="Alba" />
    </span>
    <p><strong>Alba</strong>{t('intro.recruitLine')}</p>
  </div>;
}
