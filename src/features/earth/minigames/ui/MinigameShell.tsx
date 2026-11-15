import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { LanguageSelector } from '../../../../i18n';
import { computeSceneLayout, MAP_HEIGHT, MAP_WIDTH, type SafeZone } from '../../../../visual-kit/earthMapLayout';
import '../../screens/earth.css';
import '../../screens/earth-map.css';
import './minigame-ui.css';

export interface StageConfig {
  /** Fondo pixel art 16:9 del escenario (se encuadra con el mismo sistema que el mapa terrestre). */
  readonly background?: string;
  /** Zona del lienzo lógico 1000 × 563 que nunca debe recortarse. */
  readonly safe: SafeZone;
  /** Píxeles superiores que ocupa la interfaz flotante (HUD en varias filas); el escenario se encuadra por debajo. */
  readonly reserveTop?: number;
  /** Píxeles inferiores que ocupa la interfaz flotante; el escenario se encuadra por encima. */
  readonly reserveBottom?: number;
}

interface MinigameShellProps {
  readonly className?: string;
  readonly title: string;
  readonly subtitle?: ReactNode;
  readonly backLabel: string;
  readonly onBack: () => void;
  /** Contenido extra de la esquina superior derecha (ayuda, etc.), antes del selector de idioma. */
  readonly hudExtra?: ReactNode;
  /** Fondo a pantalla completa sin escenario escalable (juegos sin elementos que alinear). */
  readonly backdrop?: string;
  readonly stage?: StageConfig;
  /** Contenido dentro del escenario: sus coordenadas son porcentajes del lienzo; `--u` = px por unidad lógica. */
  readonly stageContent?: ReactNode;
  readonly stageClassName?: string;
  /** Interfaz flotante por encima del escenario (tarjetas, barra de acciones...). */
  readonly children?: ReactNode;
}

/** Estructura común de los minijuegos terrestres: escenario a pantalla completa, HUD y tarjetas flotantes. */
export function MinigameShell({
  className = '', title, subtitle, backLabel, onBack, hudExtra, backdrop, stage, stageContent, stageClassName = '', children,
}: MinigameShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element || !stage) return undefined;
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
  }, [stage]);

  const reserve = stage?.reserveBottom ?? 0;
  const reserveTop = stage?.reserveTop ?? 0;
  const safe = stage?.safe;
  const layout = useMemo(
    () => (safe ? computeSceneLayout(size.width, Math.max(1, size.height - reserve - reserveTop), safe) : null),
    [safe, size.width, size.height, reserve, reserveTop],
  );
  const measured = size.width > 0 && size.height > 0;

  const stageStyle: CSSProperties | undefined = layout
    ? measured
      ? { left: layout.x, top: layout.y + reserveTop, width: layout.width, height: layout.height, ['--u' as string]: `${layout.scale}px` }
      : { left: 0, top: 0, width: '100%', height: '100%', ['--u' as string]: '1px' }
    : undefined;
  const bottomGap = layout && measured ? size.height - (layout.y + reserveTop + layout.height) : 0;

  return (
    <div
      ref={rootRef}
      className={`emap mg ${className}`}
      data-letterbox-y={(layout && (bottomGap > 2 || layout.letterboxY)) || undefined}
      data-gap-top={(layout && measured && layout.y + reserveTop > 2) || undefined}
    >
      {backdrop && <div className="mg__backdrop" style={{ backgroundImage: `url(${backdrop})` }} aria-hidden="true" />}
      {stage?.background && <div className="mg__ambient" style={{ backgroundImage: `url(${stage.background})` }} aria-hidden="true" />}
      {stage && (
        <div className={`mg-stage ${stageClassName}`} style={stageStyle}>
          {stage.background && <img className="mg-stage__background" src={stage.background} alt="" draggable={false} width={MAP_WIDTH} height={MAP_HEIGHT} />}
          {stageContent}
        </div>
      )}

      <header className="emap-hud mg-hud">
        <button type="button" className="emap-hud__back" onClick={onBack}>
          <ArrowLeft weight="bold" aria-hidden="true" />
          <span>{backLabel}</span>
        </button>
        <div className="emap-hud__status mg-hud__title">
          <strong>{title}</strong>
          {subtitle && <span className="mg-hud__subtitle">{subtitle}</span>}
        </div>
        <div className="emap-hud__tools">
          {hudExtra}
          <LanguageSelector variant="hud" plain />
        </div>
      </header>

      {children}
    </div>
  );
}
