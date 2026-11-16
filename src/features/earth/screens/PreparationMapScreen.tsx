import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, RocketLaunch } from '@phosphor-icons/react';
import { getMissionsForCity, type EarthMissionDefinition, type MissionType } from '../../../data/missions';
import type { ToolId } from '../../../game/contracts';
import type { TrainingOutcome } from '../../../game';
import { EarthBaseScene } from '../../../visual-kit/EarthBaseScene';
import { useRadio } from '../../radio';
import { useI18n, LanguageSelector } from '../../../i18n';
import { isTutorialComplete, TutorialCoachMark, TutorialHelpButton } from '../../tutorial';
import { EarthMissionPanel, type MissionPanelState } from './EarthMissionPanel';
import './earth.css';
import './earth-map.css';

const MAP_TUTORIAL_STEPS = ['map.pin', 'map.tool', 'map.counter'] as const;
const TOAST_MS = 5200;

interface PreparationMapScreenProps {
  readonly cityId: string;
  readonly cityName: string;
  readonly destination: string;
  readonly astronautName: string;
  readonly completedMissions: readonly MissionType[];
  readonly trainingOutcomes: readonly TrainingOutcome[];
  /** Entrenamiento que se acaba de completar al volver de un minijuego (confirmación visual breve). */
  readonly justCompletedId?: MissionType | null;
  readonly onOpenMission: (mission: EarthMissionDefinition) => void;
  readonly onProceedToLaunch: (derivedTools: readonly ToolId[]) => void;
  readonly onBack: () => void;
}

/** Mapa terrestre a pantalla completa: el escenario es el menú y la interfaz flota encima. */
export function PreparationMapScreen({
  cityId,
  cityName,
  destination,
  astronautName,
  completedMissions,
  trainingOutcomes,
  justCompletedId = null,
  onOpenMission,
  onProceedToLaunch,
  onBack,
}: PreparationMapScreenProps) {
  const { t } = useI18n();
  const radio = useRadio();
  const missions = getMissionsForCity(cityId);

  // Chispa explica el mapa por radio, sin detener el juego ni tapar el escenario.
  useEffect(() => {
    radio.say({ speaker: 'CHISPA', text: t('radio.mapWelcome'), once: 'map.welcome' });
  }, [radio, t]);
  const [selectedId, setSelectedId] = useState<MissionType | null>(null);
  const [celebratingId, setCelebratingId] = useState<MissionType | null>(justCompletedId);
  const [tutorialOpen, setTutorialOpen] = useState(() => !isTutorialComplete(MAP_TUTORIAL_STEPS));

  const countCompleted = completedMissions.length;
  const isThreeDone = countCompleted >= 3;
  const activeMission = missions.find((mission) => mission.id === selectedId) ?? null;

  // Al abrir una instalación, Chispa dice de qué va en una frase, como en los
  // minijuegos de la guardia. Antes solo había una ficha de texto que leer.
  useEffect(() => {
    if (!activeMission) return;
    radio.say({
      speaker: 'CHISPA',
      front: true,
      text: t(`map.facilities.${activeMission.id}.objective`),
    });
  }, [activeMission, radio, t]);
  const arctic = cityId === 'TROMSO';

  // Herramientas ganadas: exactamente las de las misiones completadas.
  const derivedTools: ToolId[] = completedMissions.flatMap((id) => {
    const found = missions.find((mission) => mission.id === id);
    return found ? [found.targetTool] : [];
  });
  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');

  /** Cierra la ficha y deja el mapa despejado. Con teclado, devuelve el foco a la instalación. */
  const closePanel = (restoreFocus = false) => {
    if (restoreFocus && selectedId) {
      const id = selectedId;
      requestAnimationFrame(() => document.querySelector<SVGElement>(`[data-facility-id="${id}"]`)?.focus({ preventScroll: true }));
    }
    setSelectedId(null);
  };

  useEffect(() => {
    if (!selectedId || tutorialOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const id = selectedId;
      setSelectedId(null);
      requestAnimationFrame(() => document.querySelector<SVGElement>(`[data-facility-id="${id}"]`)?.focus({ preventScroll: true }));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, tutorialOpen]);

  // La confirmación del entrenamiento recién completado es breve y se retira sola.
  useEffect(() => {
    if (!celebratingId) return undefined;
    const timer = window.setTimeout(() => setCelebratingId(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [celebratingId]);

  const celebratedMission = celebratingId ? missions.find((mission) => mission.id === celebratingId) ?? null : null;

  const tutorialSteps = useMemo(() => [
    {
      id: MAP_TUTORIAL_STEPS[0],
      character: 'CHISPA' as const,
      text: t('tutorial.map.pin'),
      targetSelector: '.earth-base-facility',
      placement: 'right' as const,
    },
    {
      id: MAP_TUTORIAL_STEPS[1],
      character: 'CHISPA' as const,
      text: t('tutorial.map.tool'),
      targetSelector: '[data-tutorial="mission-tool"]',
      placement: 'left' as const,
    },
    {
      id: MAP_TUTORIAL_STEPS[2],
      character: 'CHISPA' as const,
      text: t('tutorial.map.counter'),
      targetSelector: '[data-tutorial="mission-counter"]',
      placement: 'bottom' as const,
    },
  ], [t]);

  const panelState: MissionPanelState = activeMission
    ? completedMissions.includes(activeMission.id) ? 'completed' : isThreeDone ? 'locked' : 'available'
    : 'available';
  const activeOutcome = activeMission ? trainingOutcomes.find((outcome) => outcome.missionId === activeMission.id) : undefined;

  return (
    <div className={`emap ${arctic ? 'emap--arctic' : 'emap--andes'}`} data-panel-open={activeMission ? 'true' : undefined}>
      <EarthBaseScene
        cityId={cityId}
        missions={missions}
        selectedMissionId={selectedId}
        completedMissions={completedMissions}
        missionLimitReached={isThreeDone}
        justCompletedId={celebratingId}
        launchReady={isThreeDone}
        onSelectMission={setSelectedId}
        onClearSelection={() => closePanel()}
        onOpenMission={onOpenMission}
      />

      <header className="emap-hud">
        <button type="button" className="emap-hud__back" onClick={onBack}>
          <ArrowLeft weight="bold" aria-hidden="true" />
          <span>{t('common.back')}</span>
        </button>

        <div className="emap-hud__status" role="status" aria-live="polite">
          <span className="emap-hud__route">
            <strong>{cityName}</strong>
            <ArrowRight weight="bold" aria-hidden="true" />
            <strong>{destName}</strong>
          </span>
          <span className="emap-hud__callsign">{astronautName}</span>
          <span className={`emap-hud__counter${isThreeDone ? ' emap-hud__counter--done' : ''}`} data-tutorial="mission-counter">
            {isThreeDone && <CheckCircle weight="fill" aria-hidden="true" />}
            {t('map.trainingProgress', { completed: countCompleted, total: 3 })}
          </span>
        </div>

        <div className="emap-hud__tools">
          <TutorialHelpButton className="emap-hud__help" onClick={() => setTutorialOpen(true)} />
          <LanguageSelector variant="hud" plain />
        </div>
      </header>

      {celebratedMission && (
        <div className="emap-toast" role="status" aria-live="polite">
          <CheckCircle weight="fill" aria-hidden="true" />
          <span>{t('map.trainingCompletedToast', {
            facility: t(`map.facilities.${celebratedMission.id}.facilityName`),
            tool: t(`tools.${celebratedMission.targetTool}.label`),
          })}</span>
        </div>
      )}

      {activeMission && (
        <EarthMissionPanel
          mission={activeMission}
          state={panelState}
          outcome={activeOutcome}
          onStart={() => onOpenMission(activeMission)}
          onClose={() => closePanel(true)}
        />
      )}

      {isThreeDone && (
        <button type="button" className="pixel-btn pixel-btn--primary emap-launch" onClick={() => onProceedToLaunch(derivedTools)}>
          <RocketLaunch weight="fill" aria-hidden="true" />
          <span>{t('map.proceedToLaunch', { count: countCompleted })}</span>
        </button>
      )}

      <TutorialCoachMark
        open={tutorialOpen}
        steps={tutorialSteps}
        onComplete={() => setTutorialOpen(false)}
        onSkip={() => setTutorialOpen(false)}
      />
    </div>
  );
}
