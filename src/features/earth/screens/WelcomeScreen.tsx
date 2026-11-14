import { useEffect, useRef, useState } from 'react';
import { BookOpen, Broadcast, Play, X } from '@phosphor-icons/react';
import { assetManifest } from '../../../assets/manifest';
import './welcome.css';

type WelcomePanel = 'STATION' | 'SOURCES' | null;

interface WelcomeScreenProps {
  readonly onPlay: () => void;
}

const sources = [
  { name: 'NASA POWER', description: 'Datos históricos del Sol en la Tierra.', url: 'https://power.larc.nasa.gov/' },
  { name: 'NASA DONKI', description: 'Registro histórico de eventos solares.', url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/' },
  { name: 'NASA ECLSS', description: 'Cómo funciona el soporte vital espacial.', url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/' },
] as const;

export function WelcomeScreen({ onPlay }: WelcomeScreenProps) {
  const [panel, setPanel] = useState<WelcomePanel>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

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

  return <main className="welcome" style={{ backgroundColor: scene.fallbackColor }}>
    {!sceneFailed && scene.path && <img className="welcome__scene" src={scene.path} alt="" onError={() => setSceneFailed(true)} />}
    <div className="welcome__content">
      <div className="welcome__identity">
        <h1 className={!logoFailed && wordmark.path ? 'welcome__sr-only' : undefined}>Astronauta Junior</h1>
        {!logoFailed && wordmark.path
          ? <img className="welcome__wordmark" src={wordmark.path} alt="" onError={() => setLogoFailed(true)} />
          : <p>De tu cielo a otros mundos</p>}
      </div>
      <div className="welcome__actions">
        <button className="welcome__play" type="button" onClick={onPlay}>
          <span className="welcome__play-icon" aria-hidden="true"><Play weight="fill" /></span>
          <span>Jugar ahora</span>
        </button>
        <div className="welcome__secondary">
          <button className="welcome__secondary-button" type="button" aria-haspopup="dialog" onClick={(event) => openPanel('STATION', event.currentTarget)}>
            <Broadcast aria-hidden="true" weight="duotone" />
            <span>Modo Estación</span>
          </button>
          <button className="welcome__secondary-button" type="button" aria-haspopup="dialog" onClick={(event) => openPanel('SOURCES', event.currentTarget)}>
            <BookOpen aria-hidden="true" weight="duotone" />
            <span>Fuentes científicas</span>
          </button>
        </div>
      </div>
    </div>

    {panel && <div className="welcome__veil" onMouseDown={(event) => { if (event.target === event.currentTarget) closePanel(); }}>
      <section className="welcome__dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-dialog-title" ref={dialogRef}>
        <button className="welcome__close" type="button" aria-label="Cerrar" onClick={closePanel} ref={closeButton}><X aria-hidden="true" /></button>
        {panel === 'STATION' ? <>
          <p className="welcome__dialog-kicker">Próximamente</p>
          <h2 id="welcome-dialog-title">Modo Estación</h2>
          <p>Una maqueta para jugar en equipo desde la misma pantalla. Todavía no hay salas ni multijugador.</p>
          <button className="welcome__dialog-action" type="button" onClick={onPlay}>Empezar en modo Despegue</button>
        </> : <>
          <p className="welcome__dialog-kicker">Nuestra base científica</p>
          <h2 id="welcome-dialog-title">Fuentes científicas</h2>
          <p>Usaremos registros históricos verificables. La prueba actual aún no incluye observaciones NASA validadas.</p>
          <ul className="welcome__sources">
            {sources.map((source) => <li key={source.name}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.name}</a>
              <span>{source.description}</span>
            </li>)}
          </ul>
        </>}
      </section>
    </div>}
  </main>;
}
