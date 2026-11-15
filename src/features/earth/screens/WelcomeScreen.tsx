import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Broadcast, Play, X } from '@phosphor-icons/react';
import { assetManifest } from '../../../assets/manifest';
import { useI18n, LanguageSelector } from '../../../i18n';
import { isTutorialComplete, TutorialCoachMark, TutorialHelpButton } from '../../tutorial';
import './welcome.css';

type WelcomePanel = 'STATION' | 'SOURCES' | null;

interface WelcomeScreenProps {
  readonly onPlay: () => void;
  readonly onOpenStation?: () => void;
  readonly onOpenLearn?: () => void;
}

export function WelcomeScreen({ onPlay, onOpenStation, onOpenLearn }: WelcomeScreenProps) {
  const { t } = useI18n();
  const [panel, setPanel] = useState<WelcomePanel>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
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
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href]');
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

  function openPanel(value: Exclude<WelcomePanel, null>, trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setPanel(value);
  }

  function closePanel() {
    setPanel(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }

  const scene = assetManifest['background.earthWelcome'];
  const wordmark = assetManifest['ui.welcomeWordmark'];
  const welcomeSteps = useMemo(() => [{
    id: 'welcome.solo',
    character: 'ALBA' as const,
    text: t('tutorial.welcome'),
    placement: 'center' as const,
    actionLabel: t('tutorial.letsGo'),
  }], [t]);

  function beginSolo() {
    setPanel(null);
    if (isTutorialComplete(welcomeSteps.map(({ id }) => id))) {
      onPlay();
      return;
    }
    setWelcomeTutorialOpen(true);
  }

  function finishWelcomeTutorial() {
    setWelcomeTutorialOpen(false);
    onPlay();
  }

  return <main className="welcome" style={{ backgroundColor: scene.fallbackColor }}>
    {!sceneFailed && scene.path && <img className="welcome__scene" src={scene.path} alt="" onError={() => setSceneFailed(true)} />}
    <div className="welcome__content">
      <div className="welcome__identity">
        <h1 className={!logoFailed && wordmark.path ? 'welcome__sr-only' : undefined}>{t('welcome.title')}</h1>
        {!logoFailed && wordmark.path
          ? <img className="welcome__wordmark" src={wordmark.path} alt={t('welcome.title')} onError={() => setLogoFailed(true)} />
          : <p>{t('welcome.subtitle')}</p>}
      </div>

      <LanguageSelector variant="welcome" />

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
          <button className="welcome__secondary-button" type="button" aria-haspopup="dialog" onClick={(event) => openPanel('SOURCES', event.currentTarget)}>
            <BookOpen aria-hidden="true" weight="duotone" />
            <span>{t('welcome.scientificSources')}</span>
          </button>
        </div>
      </div>
    </div>

    <TutorialHelpButton className="tutorial-help-button--welcome" onClick={() => setWelcomeTutorialOpen(true)} />

    {panel && <div className="welcome__veil" onMouseDown={(event) => { if (event.target === event.currentTarget) closePanel(); }}>
      <section className="welcome__dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-dialog-title" ref={dialogRef}>
        <button className="welcome__close" type="button" aria-label={t('common.close')} onClick={closePanel} ref={closeButton}><X aria-hidden="true" /></button>
        {panel === 'STATION' ? <>
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
      onSkip={finishWelcomeTutorial}
    />
  </main>;
}
