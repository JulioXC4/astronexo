import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Broadcast, Play, VideoCamera, X } from '@phosphor-icons/react';
import { welcomeLogos } from '../../../assets/welcomeArtwork';
import { useI18n, LanguageSelector, type SupportedLanguage } from '../../../i18n';
import { SoundToggle, playSound, usePauseBackgroundAudio } from '../../audio';
import { useScreenRadio } from '../../radio';
import { TutorialCoachMark, TutorialHelpButton } from '../../tutorial';
import { PixelSceneAnimator } from '../components/PixelSceneAnimator';
import { landingScene } from '../scenes/pixelScenes';
import './welcome.css';

type WelcomePanel = 'STATION' | 'SOURCES' | 'TRAILER' | null;

const TRAILER_ID = '9l9FvGKSMEo';

interface WelcomeScreenProps {
  readonly onPlay: () => void;
  readonly onOpenStation?: () => void;
  readonly onOpenLearn?: () => void;
}

export function WelcomeScreen({ onPlay, onOpenStation, onOpenLearn }: WelcomeScreenProps) {
  const { t, language } = useI18n();
  // Sin saludo por radio en la portada: la introducción ilustrada ya presenta el juego justo
  // después de «Jugar ahora» (el globo de Alba era redundante). Solo se vacía la radio anterior.
  useScreenRadio([]);
  const [panel, setPanel] = useState<WelcomePanel>(null);
  const trailerOpen = panel === 'TRAILER';
  usePauseBackgroundAudio(trailerOpen);
  const [logoFailedFor, setLogoFailedFor] = useState<SupportedLanguage | null>(null);
  const [welcomeTutorialOpen, setWelcomeTutorialOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const sources = [
    { name: 'NASA POWER', description: t('welcome.sources.power'), url: 'https://power.larc.nasa.gov/' },
    { name: 'NASA DONKI', description: t('welcome.sources.donki'), url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/' },
    { name: 'NASA ECLSS', description: t('welcome.sources.eclss'), url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/' },
  ] as const;

  useEffect(() => {
    if (!panel) return;
    closeButton.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closePanel();
      if (event.key === 'Tab') {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], iframe');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [panel]);

  // Las escenas de las ciudades ya no se precargan aquí: se piden al pulsar «Jugar ahora»
  // (ver `preloadCityScenes`), para que la portada cargue solo lo que muestra.

  function openPanel(value: Exclude<WelcomePanel, null>, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    if (value !== 'TRAILER') playSound('panelOpen');
    setPanel(value);
  }

  function closePanel() {
    if (!trailerOpen) playSound('panelClose');
    setPanel(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }

  const wordmark = welcomeLogos[language];
  const logoFailed = logoFailedFor === language;
  const welcomeSteps = useMemo(() => [{
    id: 'welcome.solo',
    character: 'ALBA' as const,
    text: t('tutorial.welcome'),
    placement: 'center' as const,
    actionLabel: t('tutorial.letsGo'),
  }], [t]);

  /**
   * Entra de inmediato. Antes se esperaba a que se descargaran las escenas de
   * las ciudades (~1,5 MB) y el juego se quedaba congelado unos 3 segundos tras
   * pulsar «Jugar ahora». La precarga sigue corriendo de fondo y la pantalla de
   * ciudad llega tres pantallas después, con las imágenes ya listas.
   */
  function showCitySelection() {
    onPlay();
  }

  // Alba da la bienvenida por radio. Antes, «Jugar ahora» abría un cartel que había que
  // cerrar; ahora se entra directo y el cartel queda solo en el botón «Ayuda».
  function beginSolo() {
    setPanel(null);
    playSound('playStart');
    void showCitySelection();
  }

  function finishWelcomeTutorial() {
    setWelcomeTutorialOpen(false);
    void showCitySelection();
  }

  return <main className="welcome">
    <PixelSceneAnimator
      className="welcome__scene"
      frames={landingScene.frames}
      poster={landingScene.poster}
      objectPosition={landingScene.objectPosition}
      priority
    />
    <div className="welcome__sky" aria-hidden="true">
      <span className="welcome__star welcome__star--one" />
      <span className="welcome__star welcome__star--two" />
      <span className="welcome__star welcome__star--three" />
      <span className="welcome__meteor" />
    </div>

    {/* Barra superior de idioma estilo HUD */}
    <div className="welcome__top-bar">
      <SoundToggle className="sound-toggle--welcome" />
      <LanguageSelector variant="welcome" />
    </div>

    <div className="welcome__content">
      <div className="welcome__identity">
        <h1 className={!logoFailed ? 'welcome__sr-only' : undefined}>{t('welcome.title')}</h1>
        {!logoFailed
          ? <img className="welcome__wordmark" src={wordmark} alt="" onError={() => setLogoFailedFor(language)} />
          : null}
        <p className={!logoFailed ? 'welcome__sr-only' : undefined}>{t('welcome.subtitle')}</p>
      </div>

      <div className="welcome__actions">
        <button className="welcome__play" type="button" onClick={beginSolo}>
          <span className="welcome__play-icon" aria-hidden="true"><Play weight="fill" /></span>
          <span>{t('welcome.playNow')}</span>
        </button>
        <div className="welcome__secondary">
          <button className="welcome__secondary-button" type="button" aria-haspopup="dialog" onClick={(event) => openPanel('STATION', event.currentTarget)}>
            <Broadcast aria-hidden="true" weight="duotone" />
            <span>{t('welcome.stationMode')}</span>
          </button>
          <button className="welcome__secondary-button" type="button" aria-haspopup="dialog" data-silent onClick={(event) => openPanel('TRAILER', event.currentTarget)}>
            <VideoCamera aria-hidden="true" weight="duotone" />
            <span>{t('welcome.trailer.watch')}</span>
          </button>
          <button className="welcome__secondary-button" type="button" aria-haspopup="dialog" onClick={(event) => openPanel('SOURCES', event.currentTarget)}>
            <BookOpen aria-hidden="true" weight="duotone" />
            <span>{t('welcome.scientificSources')}</span>
          </button>
        </div>
      </div>
    </div>

    <TutorialHelpButton className="tutorial-help-button--welcome" onClick={() => setWelcomeTutorialOpen(true)} />

    {panel && <div className="welcome__veil" data-silent={trailerOpen ? true : undefined} onMouseDown={(event) => { if (event.target === event.currentTarget) closePanel(); }}>
      <section className={`welcome__dialog${trailerOpen ? ' welcome__dialog--trailer' : ''}`} role="dialog" aria-modal="true" aria-labelledby="welcome-dialog-title" ref={dialogRef}>
        <button className="welcome__close" type="button" aria-label={t('common.close')} onClick={closePanel} ref={closeButton}><X aria-hidden="true" /></button>
        {trailerOpen ? <>
          <h2 id="welcome-dialog-title">{t('welcome.trailer.watch')}</h2>
          <iframe
            className="welcome__trailer-player"
            src={`https://www.youtube-nocookie.com/embed/${TRAILER_ID}?autoplay=0&playsinline=1`}
            title={t('welcome.trailer.watch')}
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <a className="welcome__trailer-link" href={`https://youtu.be/${TRAILER_ID}`} target="_blank" rel="noopener noreferrer">
            {t('welcome.trailer.openYouTube')}
          </a>
        </> : panel === 'STATION' ? <>
          <p className="welcome__dialog-kicker">{t('welcome.stationDialog.kicker')}</p>
          <h2 id="welcome-dialog-title">{t('welcome.stationDialog.title')}</h2>
          <p>{t('welcome.stationDialog.desc')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
            {onOpenStation && (
              <button
                className="welcome__dialog-action"
                type="button"
                style={{ background: '#f6c15b', color: '#132235' }}
                onClick={() => {
                  closePanel();
                  onOpenStation();
                }}
              >
                {t('welcome.stationDialog.classroomBtn')}
              </button>
            )}
            <button className="welcome__dialog-action" type="button" onClick={beginSolo}>{t('welcome.stationDialog.playSoloBtn')}</button>
          </div>
        </> : <>
          <p className="welcome__dialog-kicker">{t('welcome.sourcesDialog.kicker')}</p>
          <h2 id="welcome-dialog-title">{t('welcome.sourcesDialog.title')}</h2>
          <p>{t('welcome.sourcesDialog.desc')}</p>
          <ul className="welcome__sources">
            {sources.map((source) => <li key={source.name}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.name}</a>
              <span>{source.description}</span>
            </li>)}
          </ul>
          {onOpenLearn && (
            <button
              className="welcome__dialog-action"
              type="button"
              style={{ marginTop: '1rem', background: '#25446c', color: '#ffffff' }}
              onClick={() => {
                closePanel();
                onOpenLearn();
              }}
            >
              {t('welcome.sourcesDialog.learnBtn')}
            </button>
          )}
        </>}
      </section>
    </div>}
    <TutorialCoachMark
      open={welcomeTutorialOpen}
      steps={welcomeSteps}
      onComplete={finishWelcomeTutorial}
      // Cerrar la ayuda (X, «Saltar» o Escape) solo la cierra. Antes también empezaba la partida:
      // el niño cerraba el cartel y, sin pulsar «Jugar», arrancaba el video de reclutamiento.
      onSkip={() => setWelcomeTutorialOpen(false)}
    />
  </main>;
}
