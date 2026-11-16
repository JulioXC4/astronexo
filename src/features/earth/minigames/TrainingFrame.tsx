import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, CheckCircle, Circle, Sparkle, Trophy } from '@phosphor-icons/react';
import type { QualityTier } from '../../../game';
import { LanguageSelector, msg, useI18n } from '../../../i18n';
import { WorkQuality } from '../../../visual-kit/WorkQuality';
import { playSound, SoundToggle } from '../../audio';
import { RADIO_PORTRAITS, useRadio, useRadioLeave } from '../../radio';
import '../screens/earth.css';
import './training.css';
import './ui/guide.css';

export type TrainingResource = 'energy' | 'oxygen' | 'foodSupply';

const RESOURCE_LABEL: Readonly<Record<TrainingResource, string>> = {
  energy: 'missionControl.energy',
  oxygen: 'missionControl.oxygen',
  foodSupply: 'missionControl.food',
};

/**
 * Cuánto tiene que quedarse bien el juego antes de contar como logrado. Al girar una perilla
 * se cruza la zona verde muchas veces en un segundo: antes cada cruce disparaba el sonido de
 * victoria y abría/cerraba el aviso (hasta 40 veces). Ahora solo cuenta cuando el niño se detiene.
 */
export const TRAINING_SETTLE_MS = 450;

/** Una condición para ganar, a la vista: el niño sabe qué falta sin adivinar. */
export interface TrainingGoal {
  readonly label: string;
  readonly ok: boolean;
}

interface TrainingFrameProps {
  /** Id del entrenamiento: agrupa sus ayudas de radio (si el niño las cierra, no vuelven). */
  readonly scope: string;
  readonly title: string;
  readonly icon: ReactNode;
  readonly onBack: () => void;
  /** Clave de la tarea: la dicta Chispa por radio al entrar y se queda escrita arriba. */
  readonly taskKey: string;
  /** Clave de un dato curioso que cuenta la Dra. Aurora justo después de la tarea. */
  readonly tipKey?: string;
  /** Lo que hay que dejar en verde para ganar. */
  readonly goals: readonly TrainingGoal[];
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
 * Marco común de los entrenamientos de la Tierra. No hay botón «Verificar»: el mundo reacciona
 * mientras juegas, la lista «Para ganar» se va marcando y, cuando todo queda en verde (y te
 * detienes), sale una sola vez la tarjeta de «¡Entrenamiento superado!» con el premio.
 */
export function TrainingFrame({
  scope, title, icon, onBack, taskKey, tipKey, goals, scene, controls, hint, result, onConfirm, onReset,
}: TrainingFrameProps) {
  const { t } = useI18n();
  const radio = useRadio();
  useRadioLeave();
  const solved = Boolean(result);
  /** Ya lo logró una vez: el sonido y la tarjeta no se repiten aunque siga moviendo controles. */
  const [won, setWon] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const claimed = useRef(false);

  useEffect(() => {
    // La tarea sale primero: se descarta cualquier mensaje viejo (p. ej. el del mapa).
    radio.clear();
    radio.say({ speaker: 'CHISPA', text: msg(taskKey), scope });
    if (tipKey) radio.say({ speaker: 'AURORA', text: msg(tipKey), scope });
    // Solo al entrar: la tarea no cambia mientras juegas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuenta como logrado cuando la solución se queda quieta un momento (ver TRAINING_SETTLE_MS).
  useEffect(() => {
    if (!solved || won) return undefined;
    const timer = window.setTimeout(() => {
      setWon(true);
      setCardOpen(true);
      playSound('trainingComplete');
    }, TRAINING_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [solved, won]);

  function claim() {
    if (!result || claimed.current) return;
    claimed.current = true;
    playSound('toolEarned');
    onConfirm();
  }

  const doneGoals = goals.filter((goal) => goal.ok).length;
  const kitLabel = result
    ? t('training.kitButton', { cost: result.cost, resource: t(RESOURCE_LABEL[result.resource]).toLowerCase() })
    : '';

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
      <span className="hud-audio-lang"><SoundToggle /><LanguageSelector variant="hud" /></span>
    </header>

    <main className="training__main">
      {/* La tarea se queda escrita (el globo de radio se va a los pocos segundos y un niño de
          7 años lee despacio) y, debajo, la lista de lo que hay que dejar en verde para ganar. */}
      <p className="training__task">
        <img src={RADIO_PORTRAITS.CHISPA} alt="" aria-hidden="true" />
        <span><b>{t('training.yourMission')}</b> {t(taskKey)}</span>
      </p>

      <section className="training__scene" aria-label={title}>{scene}</section>

      <section className="training__controls">
        <div className="training__panel">{controls}</div>
        {/* Para ganar: justo debajo de los controles que se tocan (arriba chocaba con los rótulos
            «Pulsa aquí»). Cuando ya lo logró y cerró la tarjeta para seguir mejorando, el premio
            queda en esta misma fila (sin quitarle sitio a la escena). */}
        <div className={`training__goals${won && solved && !cardOpen ? ' is-won' : ''}`} role="list" aria-label={t('training.goalsTitle')}>
          <strong className="training__goals-title">{t('training.goalsTitle')} <small>{doneGoals}/{goals.length}</small></strong>
          {goals.map((goal) => <span key={goal.label} role="listitem" className={`training__goal${goal.ok ? ' is-ok' : ''}`}>
            {goal.ok ? <CheckCircle weight="fill" aria-hidden="true" /> : <Circle weight="bold" aria-hidden="true" />}
            <span>{goal.label}</span>
            <span className="training__sr">{t(goal.ok ? 'training.goalDone' : 'training.goalPending')}</span>
          </span>)}
          {won && solved && !cardOpen && result && <button type="button" className="training__kit training__kit--inline" onClick={claim} title={kitLabel}>
            <Sparkle weight="fill" aria-hidden="true" />
            <span>{t('training.kitShort')}</span>
            <ArrowRight weight="bold" aria-hidden="true" />
          </button>}
        </div>
        {/* Aquí se ve si vas bien, sin tener que enviar nada. */}
        <p className={`training__hint ${solved ? 'training__hint--done' : ''}`} aria-live="polite">
          {won && !solved ? t('training.backToGreen') : hint}
        </p>
        <button type="button" className="training__reset" onClick={onReset} title={t('training.reset')}>
          <ArrowCounterClockwise weight="bold" aria-hidden="true" />
          <span>{t('training.reset')}</span>
        </button>
      </section>
    </main>

    {/* ¡Lo lograste! Sale una sola vez, en el centro, con lo que ganó y cuánto le costó. */}
    {cardOpen && solved && result && <div className="training-win" role="dialog" aria-modal="true" aria-labelledby="training-win-title">
      <section className="training-win__card">
        <span className="training-win__sparks" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} />)}</span>
        <Trophy className="training-win__trophy" weight="fill" aria-hidden="true" />
        <h2 id="training-win-title">{t('training.winTitle')}</h2>
        <p>{t('training.winBody', { title })}</p>
        <WorkQuality tier={result.tier} />
        <div className="training-win__actions">
          <button type="button" className="training__kit" onClick={claim} autoFocus>
            <Sparkle weight="fill" aria-hidden="true" />
            <span>{kitLabel}</span>
            <ArrowRight weight="bold" aria-hidden="true" />
          </button>
          {/* Opcional: cerrar para dejarlo aún mejor (gasta menos). El premio queda abajo. */}
          <button type="button" className="training-win__improve" onClick={() => setCardOpen(false)}>
            {t('training.keepImproving')}
          </button>
        </div>
      </section>
    </div>}
  </div>;
}
