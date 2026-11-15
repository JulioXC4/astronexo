import { useEffect, useMemo, useState } from 'react';
import type { GameAction, MissionState } from '../../game';
import { spaceBackgrounds } from '../../assets/manifest';
import { InterventionDock } from '../space-minigames';
import { AlertCard } from './AlertCard';
import { ResourceBar } from './ResourceBar';
import { ModuleCameras } from './ModuleCameras';
import { useI18n, LanguageSelector } from '../../i18n';
import { isTutorialComplete, TutorialCoachMark, TutorialHelpButton } from '../tutorial';

const GUARD_TUTORIAL_STEPS = ['guard.resources', 'guard.alerts', 'guard.actions'] as const;

interface MissionControlViewProps {
  readonly state: MissionState;
  readonly onAction: (action: GameAction) => void;
  readonly onAdvance: () => void;
  readonly onRequestConfirmation?: (action: GameAction) => void;
  readonly groupDecisionPending?: boolean;
  readonly showFoodAsPrimary?: boolean;
}

export function MissionControlView({
  state,
  onAction,
  onAdvance,
  onRequestConfirmation,
  groupDecisionPending = false,
  showFoodAsPrimary = false,
}: MissionControlViewProps) {
  const { t } = useI18n();
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
      <section data-tutorial="space-resources" className={`resource-rack ${showFoodAsPrimary ? 'resource-rack--four' : ''}`} aria-label={t('missionControl.resourceRackAria')}>
        <ResourceBar label={t('missionControl.energy')} value={state.energy} tone="energy" />
        <ResourceBar label={t('missionControl.oxygen')} value={state.oxygen} tone="oxygen" />
        <ResourceBar label={t('missionControl.shield')} value={state.shield} tone="shield" />
        {showFoodAsPrimary && <ResourceBar label={t('missionControl.food')} value={state.foodSupply} tone="food" />}
      </section>
      <div className="mission-clock" aria-label={t('missionControl.turnIndicator', { current: state.turn, total: state.maxTurns })}>
        <span>{t('missionControl.turnIndicator', { current: state.turn, total: state.maxTurns })}</span>
        <strong>{clockLabel}</strong>
      </div>
      <LanguageSelector variant="hud" />
    </header>
    <TutorialHelpButton className="tutorial-help-button--floating" onClick={() => setTutorialOpen(true)} />

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
              />)
            : <p className="empty-signal">{t('missionControl.noAlerts')}</p>}
        </div>
        <details className="tool-status">
          <summary>{t('missionControl.toolDrawerSummary')}</summary>
          <ul>{state.selectedTools.map((toolId, index) => <li key={`${toolId}-${index}`}>
            <strong>{t(`tools.${toolId}.label`)}</strong>
            <span>{t(`tools.${toolId}.benefit`)}</span>
          </li>)}</ul>
        </details>
      </aside>
    </section>

    {state.lastFeedback && <aside className={`mission-feedback ${state.lastFeedback.ok ? 'mission-feedback--success' : 'mission-feedback--error'}`} role="status">
      <strong>{t('missionControl.feedbackTitle')}</strong>
      <span>{state.lastFeedback.message}</span>
    </aside>}

    <section className="mission-bottom-bar">
      <InterventionDock
        key={state.turn}
        state={state}
        onAction={onAction}
        onRequestConfirmation={onRequestConfirmation}
        groupDecisionPending={groupDecisionPending}
        focusedAlertId={selectedAlertId}
      />
      <footer className="turn-controls">
        <p>{state.actionTakenThisTurn
          ? t('missionControl.turnControlsReady')
          : t('missionControl.turnControlsPrompt')}</p>
        <button
          className="pixel-button pixel-button--primary"
          disabled={!state.actionTakenThisTurn}
          onClick={onAdvance}
        >
          {t(state.turn === state.maxTurns ? 'missionControl.closeGuard' : 'missionControl.endTurn')}
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
