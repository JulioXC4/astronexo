import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, Sparkle } from '@phosphor-icons/react';
import type { QualityTier } from '../../../game';
import { LanguageSelector, useI18n } from '../../../i18n';
import { WorkQuality } from '../../../visual-kit/WorkQuality';
import { playSound } from '../../audio';
import { useRadio, useRadioLeave } from '../../radio';
import '../screens/earth.css';
import './training.css';
import './ui/guide.css';

export type TrainingResource = 'energy' | 'oxygen' | 'foodSupply';

const RESOURCE_LABEL: Readonly<Record<TrainingResource, string>> = {
  energy: 'missionControl.energy',
  oxygen: 'missionControl.oxygen',
  foodSupply: 'missionControl.food',
};

interface TrainingFrameProps {
  readonly title: string;
  readonly icon: ReactNode;
  readonly onBack: () => void;
  /** La tarea: la dicta Chispa por radio al entrar, en vez de una caja de texto. */
  readonly task: string;
  /** Un dato curioso que cuenta la Dra. Aurora justo después de la tarea. */
  readonly tip?: string;
  /** Lo que se ve y se toca: la escena del entrenamiento. */
  readonly scene: ReactNode;
  readonly controls: ReactNode;
  /** Una línea que reacciona en vivo a lo que haces. */
  readonly hint: string;
  /** null mientras no esté resuelto. */
  readonly result: { readonly tier: QualityTier; readonly cost: number; readonly resource: TrainingResource } | null;
  readonly onConfirm: () => void;
  readonly onReset: () => void;
}

/**
 * Marco común de los entrenamientos de la Tierra. Reemplaza al «formulario»:
 * no hay botón «Verificar». El mundo reacciona mientras juegas y, en cuanto
 * queda bien, aparece cómo quedó y el premio.
 */
export function TrainingFrame({
  title, icon, onBack, task, tip, scene, controls, hint, result, onConfirm, onReset,
}: TrainingFrameProps) {
  const { t } = useI18n();
  const radio = useRadio();
  useRadioLeave();
  const wasDone = useRef(false);

  useEffect(() => {
    // La tarea sale primero: se descarta cualquier mensaje viejo (p. ej. el del mapa).
    radio.clear();
    radio.say({ speaker: 'CHISPA', text: task });
    if (tip) radio.say({ speaker: 'AURORA', text: tip });
    // Solo al entrar: la tarea no cambia mientras juegas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El acierto suena una vez, en el momento en que se logra.
  useEffect(() => {
    if (result && !wasDone.current) playSound('success');
    wasDone.current = Boolean(result);
  }, [result]);

  return <div className="earth-screen training" style={{ ['--press-here' as string]: JSON.stringify(t('minigames.guide.pressHere')), ['--turn-here' as string]: JSON.stringify(t('minigames.guide.turnHere')) }}>
    <header className="earth-screen__header training__header">
      <button type="button" className="earth-screen__back-btn" onClick={onBack}>
        <ArrowLeft weight="bold" />
        <span>{t('common.back')}</span>
      </button>
      <div className="earth-screen__progress-pill">
        {icon}
        <span>{title}</span>
      </div>
      <LanguageSelector variant="hud" />
    </header>

    <main className="training__main">
      <section className="training__scene" aria-label={title}>{scene}</section>

      <section className="training__controls">
        <div className="training__panel">{controls}</div>
        {/* Aquí se ve si vas bien, sin tener que enviar nada. */}
        <p className={`training__hint ${result ? 'training__hint--done' : ''}`} aria-live="polite">{hint}</p>
        <button type="button" className="training__reset" onClick={onReset} title={t('training.reset')}>
          <ArrowCounterClockwise weight="bold" aria-hidden="true" />
          <span>{t('training.reset')}</span>
        </button>
      </section>

      {result && <section className="training__result" aria-live="polite">
        <div>
          <strong className="training__done">{t('training.done')}</strong>
          <WorkQuality tier={result.tier} />
          <small>{t('training.keepAdjusting')}</small>
        </div>
        <button type="button" className="training__kit" data-target data-guide-below onClick={() => { playSound('reward'); onConfirm(); }}>
          <Sparkle weight="fill" aria-hidden="true" />
          <span>{t('training.kitButton', { cost: result.cost, resource: t(RESOURCE_LABEL[result.resource]).toLowerCase() })}</span>
          <ArrowRight weight="bold" aria-hidden="true" />
        </button>
      </section>}
    </main>
  </div>;
}
