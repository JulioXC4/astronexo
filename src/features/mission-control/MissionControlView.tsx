import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle } from '@phosphor-icons/react';
import type { GameAction, MissionState, ResourceDelta } from '../../game';
import { projectAlertConsequence, resourceLevel, SCIENCE_TARGET } from '../../game';
import { spaceBackgrounds } from '../../assets/manifest';
import { InterventionDock } from '../space-minigames';
import { AlertCard } from './AlertCard';
import { ResourceBar } from './ResourceBar';
import { ModuleCameras } from './ModuleCameras';
import { formatChange, readableChanges } from './resourceLabels';
import { useRadio, useRadioLeave, useRadioAnchor } from '../radio';
import { SoundToggle } from '../audio';
import { useI18n, LanguageSelector, resolveMessage, msg } from '../../i18n';
import { isTutorialComplete, TutorialCoachMark, TutorialHelpButton } from '../tutorial';

const GUARD_TUTORIAL_STEPS = ['guard.resources', 'guard.alerts', 'guard.actions'] as const;

/** Las cuatro barras que el niño vigila, en el orden en que se muestran. */
const TRACKED_RESOURCES = [
  { key: 'energy', tone: 'energy', labelKey: 'missionControl.energy' },
  { key: 'oxygen', tone: 'oxygen', labelKey: 'missionControl.oxygen' },
  { key: 'shield', tone: 'shield', labelKey: 'missionControl.shield' },
  { key: 'foodSupply', tone: 'food', labelKey: 'missionControl.food' },
] as const;

function sumDelta(deltas: readonly ResourceDelta[]): ResourceDelta {
  const total: Record<string, number> = {};
  for (const delta of deltas) {
    for (const [key, value] of Object.entries(delta)) {
      total[key] = (total[key] ?? 0) + (value ?? 0);
    }
  }
  return total as ResourceDelta;
}

interface MissionControlViewProps {
  readonly state: MissionState;
  readonly onAction: (action: GameAction) => void;
  readonly onAdvance: () => void;
  readonly onRequestConfirmation?: (action: GameAction) => void;
  /** El niño encontró la estrella dorada escondida de un minijuego. */
  readonly onFindStar?: (interventionId: string) => void;
  readonly groupDecisionPending?: boolean;
  /** @deprecated Comida es ahora siempre una de las cuatro barras principales. */
  readonly showFoodAsPrimary?: boolean;
}

export function MissionControlView({
  state,
  onAction,
  onAdvance,
  onRequestConfirmation,
  onFindStar,
  groupDecisionPending = false,
}: MissionControlViewProps) {
  const { t } = useI18n();
  const radio = useRadio();
  useRadioLeave();
  useRadioAnchor('guard');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(state.activeAlerts[0]?.id ?? null);
  const [tutorialOpen, setTutorialOpen] = useState(() => !isTutorialComplete(GUARD_TUTORIAL_STEPS));
  useEffect(() => {
    if (selectedAlertId && state.activeAlerts.some((alert) => alert.id === selectedAlertId)) return;
    setSelectedAlertId(state.activeAlerts[0]?.id ?? null);
  }, [selectedAlertId, state.activeAlerts]);

  const destinationLabel = state.destination === 'MOON'
    ? t('destinations.moon.name').toUpperCase()
    : t('destinations.mars.name').toUpperCase();
  const clockLabel = state.destination === 'MOON'
    ? t('missionControl.lunarDay', { day: state.clockLabel.match(/\d+/)?.[0] ?? state.turn })
    : state.clockLabel;
  const background = spaceBackgrounds.control[state.destination].path;
  const hasEarlyWarning = Boolean(
    state.earlyWarningForecast && state.turn < state.earlyWarningForecast.turn,
  );

  /**
   * Riesgo que se ve venir (maqueta JD v11.0): cómo quedarían las barras si el
   * turno se cierra sin atender las alertas activas. Sin esto, el niño solo ve
   * el costo de actuar y nunca el de no actuar.
   */
  const risk = useMemo(() => {
    const projected = sumDelta(state.activeAlerts.map(projectAlertConsequence));
    return TRACKED_RESOURCES
      .map(({ key, labelKey }) => {
        const change = projected[key as keyof ResourceDelta] ?? 0;
        const after = Math.max(0, Math.min(100, state[key] + change));
        return { key, labelKey, change, after, level: resourceLevel(after) };
      })
      .filter((item) => item.change < 0)
      .sort((a, b) => a.after - b.after);
  }, [state]);
  const worstRisk = risk[0];

  const lastChange = useMemo(() => readableChanges(state.lastTurnDelta), [state.lastTurnDelta]);

  /** Ya usó su única acción del turno: lo único que queda es terminarlo. */
  const turnDone = state.actionTakenThisTurn && !groupDecisionPending;
  /** Al empezar el turno, `lastFeedback` solo puede ser la respuesta de la Tierra. */
  const earthMessage = !state.actionTakenThisTurn && state.lastFeedback?.ok ? state.lastFeedback.message : undefined;
  /** Cada clic en «Atender» de una alerta abre el menú de acciones (contador = petición nueva). */
  const [menuRequest, setMenuRequest] = useState(0);

  // En cuanto hace su acción, Alba le dice que el turno terminó para él: no puede hacer más,
  // tiene que pasar al siguiente. Antes solo cambiaba una frase pequeña en la barra de abajo.
  useEffect(() => {
    if (!turnDone) return;
    radio.say({
      speaker: 'ALBA',
      tone: 'good',
      front: true,
      text: msg(state.turn === state.maxTurns ? 'radio.turnDoneLast' : 'radio.turnDone'),
      once: `turn.done.${state.turn}`,
    });
  }, [turnDone, radio, state.turn, state.maxTurns]);

  // Alba abre la guardia diciendo cuál es la meta, y avisa por radio en cuanto
  // una barra entra en rojo. El peligro deja de ser invisible.
  useEffect(() => {
    // Se descarta lo que viniera de la Tierra antes de abrir la guardia.
    radio.clear();
    radio.say({
      speaker: 'ALBA',
      text: msg('radio.guardGoal', { target: SCIENCE_TARGET }),
      once: 'guard.goal',
    });
    // Solo al tomar el mando: la meta no cambia durante la guardia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const { key, labelKey } of TRACKED_RESOURCES) {
      if (resourceLevel(state[key]) === 'ok') continue;
      radio.say({
        speaker: 'NICO',
        tone: 'danger',
        text: msg('radio.resourceLow', { resource: msg(labelKey), value: state[key] }),
        once: `low.${key}.${state.turn}`,
      });
    }
  }, [radio, state]);
  const tutorialSteps = useMemo(() => [
    {
      id: GUARD_TUTORIAL_STEPS[0],
      character: 'ALBA' as const,
      text: t('tutorial.guard.resources'),
      targetSelector: '[data-tutorial="space-resources"]',
      placement: 'bottom' as const,
    },
    {
      id: GUARD_TUTORIAL_STEPS[1],
      character: 'CHISPA' as const,
      text: t('tutorial.guard.alerts'),
      targetSelector: '[data-tutorial="space-alerts"]',
      placement: 'left' as const,
      frame: 'alert' as const,
    },
    {
      id: GUARD_TUTORIAL_STEPS[2],
      character: 'ALBA' as const,
      text: t('tutorial.guard.actions'),
      targetSelector: '[data-tutorial="space-actions"]',
      placement: 'top' as const,
    },
  ], [t]);

  return <main
    className={`mission-shell mission-shell--${state.destination.toLowerCase()} ${hasEarlyWarning ? 'mission-shell--with-warning' : ''}`}
    style={background ? { backgroundImage: `linear-gradient(rgb(2 8 19 / 20%), rgb(2 8 19 / 46%)), url('${background}')` } : undefined}
  >
    <header className="mission-hud">
      <div className="mission-hud__identity">
        <span>{destinationLabel}</span>
        <h1>{t('missionControl.guardTitle', { destination: destinationLabel })}</h1>
      </div>
      {/* Las cuatro barras van siempre al mismo rango (dotación base JD: 64/78/60/72)
          y, junto a ellas, el objetivo que decide si la misión se gana. */}
      <section data-tutorial="space-resources" className="resource-rack resource-rack--five" aria-label={t('missionControl.resourceRackAria')}>
        {TRACKED_RESOURCES.map(({ key, tone, labelKey }) => (
          <ResourceBar key={key} label={t(labelKey)} value={state[key]} tone={tone} />
        ))}
        <ResourceBar
          label={t('missionControl.scienceGoal')}
          value={state.scienceProgress}
          tone="science"
          target={SCIENCE_TARGET}
        />
      </section>
      <div className="mission-clock" aria-label={t('missionControl.turnIndicator', { current: state.turn, total: state.maxTurns })}>
        <span>{t('missionControl.turnIndicator', { current: state.turn, total: state.maxTurns })}</span>
        <strong>{clockLabel}</strong>
      </div>
      {/* «Ayuda» vive en la barra de arriba: flotando abajo tapaba las alertas y el resultado. */}
      <span className="mission-hud__tools">
        <TutorialHelpButton onClick={() => setTutorialOpen(true)} />
        <SoundToggle />
      </span>
      <LanguageSelector variant="hud" />
    </header>

    {hasEarlyWarning && state.earlyWarningForecast && <aside className="early-warning" role="status">
      <strong>{t('missionControl.earlyWarningTitle')}</strong>
      <span>{t(`alerts.${state.earlyWarningForecast.kind}.title`)}</span>
      <small>{t('missionControl.earlyWarningSub')}</small>
    </aside>}

    <section className="mission-stage">
      <ModuleCameras state={state} />
      <aside data-tutorial="space-alerts" className="alerts-monitor" aria-labelledby="alerts-title">
        <div className="alerts-monitor__heading">
          <h2 id="alerts-title">{t('missionControl.alertsTitle')}</h2>
          <strong>{state.activeAlerts.length}/2</strong>
        </div>
        <div className="alert-stack">
          {state.activeAlerts.length > 0
            ? state.activeAlerts.map((alert) => <AlertCard
                key={alert.id}
                alert={alert}
                selected={alert.id === selectedAlertId}
                onSelect={setSelectedAlertId}
                // Desde la alerta se llega directo a las acciones que la resuelven.
                onAttend={state.actionTakenThisTurn || groupDecisionPending ? undefined : (alertId) => {
                  setSelectedAlertId(alertId);
                  setMenuRequest((count) => count + 1);
                }}
              />)
            : <p className="empty-signal">{t('missionControl.noAlerts')}</p>}
        </div>
        {/* Mensaje de la Tierra que llegó al empezar el turno (antes salía como aviso flotante). */}
        {earthMessage && <p className="earth-message" role="status">
          <strong>{t('missionControl.earthMessageTitle')}</strong>
          <span>{resolveMessage(earthMessage, t)}</span>
        </p>}
        {/* Último cambio: qué subió y qué bajó en el turno que acaba de pasar (dentro de la columna, sin tapar nada). */}
        {lastChange.length > 0 && <div className="last-change" role="status">
          <strong>{t('missionControl.lastChangeTitle')}</strong>
          <ul>{lastChange.map(({ key, labelKey, value }) => <li
            key={key}
            className={value > 0 ? 'last-change__up' : 'last-change__down'}
          >
            <span>{t(labelKey)}</span>
            <strong>{formatChange(value)}</strong>
          </li>)}</ul>
        </div>}
        <details className="tool-status">
          <summary>{t('missionControl.toolDrawerSummary')}</summary>
          <ul>{state.selectedTools.map((toolId, index) => <li key={`${toolId}-${index}`}>
            <strong>{t(`tools.${toolId}.label`)}</strong>
            <span>{t(`tools.${toolId}.benefit`)}</span>
          </li>)}</ul>
        </details>
      </aside>
    </section>

    {/* La barra de turno: dos pasos que se leen de izquierda a derecha.
        ① Elige UNA acción  →  ② Termina el turno. */}
    <section className={`mission-bottom-bar${turnDone ? ' mission-bottom-bar--done' : ''}`}>
      <InterventionDock
        key={state.turn}
        state={state}
        onAction={onAction}
        onRequestConfirmation={onRequestConfirmation}
        onFindStar={onFindStar}
        groupDecisionPending={groupDecisionPending}
        focusedAlertId={selectedAlertId}
        menuRequest={menuRequest}
        doneSummary={turnDone && state.lastFeedback ? resolveMessage(state.lastFeedback.message, t) : undefined}
      />
      <footer className="turn-controls">
        {turnDone
          ? <p className="turn-done" role="status">
            <CheckCircle weight="fill" aria-hidden="true" />
            <span>
              <strong>{t('missionControl.turnDoneTitle')}</strong>
              <span>{t(state.turn === state.maxTurns ? 'missionControl.turnDoneLast' : 'missionControl.turnDoneBody')}</span>
            </span>
            <ArrowRight className="turn-done__arrow" weight="bold" aria-hidden="true" />
          </p>
          : <div className="turn-controls__info">
            <p>{t('missionControl.turnControlsPrompt')}</p>
            {/* El costo de NO actuar, con número, antes de cerrar el turno. */}
            {worstRisk && <p className={`turn-risk turn-risk--${worstRisk.level}`} role="status">
              {worstRisk.after <= 0
                ? t('missionControl.riskRunsOut', { resource: t(worstRisk.labelKey) })
                : t('missionControl.riskLow', { resource: t(worstRisk.labelKey), value: worstRisk.after })}
            </p>}
          </div>}
        <button
          className={`pixel-button pixel-button--primary turn-controls__end${turnDone ? ' turn-controls__end--ready' : ''}`}
          disabled={!state.actionTakenThisTurn}
          onClick={onAdvance}
        >
          <span className="turn-step__num" aria-hidden="true">2</span>
          <span>{t(state.turn === state.maxTurns ? 'missionControl.closeGuard' : 'missionControl.endTurn')}</span>
        </button>
      </footer>
    </section>
    <TutorialCoachMark
      open={tutorialOpen}
      steps={tutorialSteps}
      onComplete={() => setTutorialOpen(false)}
      onSkip={() => setTutorialOpen(false)}
    />
  </main>;
}
