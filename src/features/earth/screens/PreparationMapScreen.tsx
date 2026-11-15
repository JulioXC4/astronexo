import { useState } from 'react';
import { ArrowLeft, CheckCircle, Compass, Crosshair, Play, RocketLaunch, Sparkle, LockKey } from '@phosphor-icons/react';
import { getMissionsForCity, type EarthMissionDefinition, type MissionType } from '../../../data/missions';
import type { ToolId } from '../../../game/contracts';
import type { TrainingOutcome } from '../../../game';
import { trainingResourceLabel } from '../trainingOutcome';
import { EarthBaseScene } from '../../../visual-kit/EarthBaseScene';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface PreparationMapScreenProps {
  readonly cityId: string;
  readonly cityName: string;
  readonly destination: string;
  readonly astronautName: string;
  readonly completedMissions: readonly MissionType[];
  readonly trainingOutcomes: readonly TrainingOutcome[];
  readonly onOpenMission: (mission: EarthMissionDefinition) => void;
  readonly onProceedToLaunch: (derivedTools: readonly ToolId[]) => void;
  readonly onBack: () => void;
}

export function PreparationMapScreen({
  cityId,
  cityName,
  destination,
  astronautName,
  completedMissions,
  trainingOutcomes,
  onOpenMission,
  onProceedToLaunch,
  onBack,
}: PreparationMapScreenProps) {
  const { t } = useI18n();
  const missions = getMissionsForCity(cityId);
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<number>(0);

  const activeMission = missions[selectedMissionIndex] ?? missions[0];
  const isCompleted = completedMissions.includes(activeMission.id);
  const countCompleted = completedMissions.length;
  const isThreeDone = countCompleted >= 3;

  // Derivar las herramientas correspondientes a las misiones completadas (exactamente las ganadas)
  const derivedTools: ToolId[] = completedMissions.flatMap((id) => {
    const found = missions.find((m) => m.id === id);
    return found ? [found.targetTool] : [];
  });
  const activeOutcome = trainingOutcomes.find((outcome) => outcome.missionId === activeMission.id);
  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="earth-screen__progress-pill">
            <Compass weight="fill" color="#f6c15b" />
            <span>Base: {cityName} ➔ {destName} ({astronautName})</span>
          </div>

          <div style={{
            background: isThreeDone ? '#1b5e20' : '#142539',
            border: `2px solid ${isThreeDone ? '#69f0ae' : '#f6c15b'}`,
            borderRadius: '2rem',
            padding: '0.35rem 1rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: isThreeDone ? '#69f0ae' : '#ffd54f',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            {isThreeDone ? <CheckCircle weight="fill" /> : <Sparkle weight="fill" />}
            <span>{t('map.facilitiesCompleted', { completed: countCompleted, total: 3 })}</span>
          </div>
        </div>

        <LanguageSelector variant="hud" />
      </header>

      <div className="prep-map-layout">
        <EarthBaseScene
          cityId={cityId}
          missions={missions}
          selectedMissionId={activeMission.id}
          completedMissions={completedMissions}
          missionLimitReached={isThreeDone}
          onSelectMission={(missionId) => {
            const index = missions.findIndex((mission) => mission.id === missionId);
            if (index >= 0) setSelectedMissionIndex(index);
          }}
          onOpenMission={onOpenMission}
        />

        {/* HUD TÁCTICO DE LA MISIÓN SELECCIONADA CON TODOS LOS REQUISITOS V3.0 */}
        <section className="prep-map-mission-panel" style={{
          width: '100%',
          boxSizing: 'border-box',
          background: '#132438',
          border: '2px solid #325884',
          borderRadius: '1rem',
          padding: '0.9rem 1.2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.9rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          <div style={{ flex: '1 1 24rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
              <Crosshair weight="bold" color="#f6c15b" size={20} />
              <h2 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.25rem', color: '#ffffff' }}>
                {activeMission.name}
              </h2>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.4rem',
                background: isCompleted ? '#2e7d32' : (isThreeDone ? '#455a64' : '#f6c15b'),
                color: isCompleted || isThreeDone ? '#ffffff' : '#102033'
              }}>
                {isCompleted ? `✓ ${t('common.completed')}` : (isThreeDone ? `🔒 ${t('common.locked')}` : t('common.available'))}
              </span>

              <span style={{ fontSize: '0.8rem', color: '#4cc3d9', fontWeight: 700 }}>
                [{activeMission.scienceSource}]
              </span>
            </div>

            <p style={{ margin: '0.2rem 0', color: '#e0effe', fontSize: '0.88rem', lineHeight: '1.35' }}>
              <strong>Objetivo:</strong> {activeMission.objective}
            </p>
            {activeOutcome && <p style={{ margin: '0.3rem 0', color: '#ffcf91', fontSize: '0.82rem' }}>
              <strong>Tu preparación:</strong> {activeOutcome.decision} · costo de {activeOutcome.cost} punto(s) de {trainingResourceLabel(activeOutcome.resource)} al iniciar la guardia.
            </p>}

            <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.4rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
              <span style={{ color: '#69f0ae' }}>
                🎁 <strong>Herramienta:</strong> {activeMission.toolLabel}
              </span>
              <span style={{ color: '#ffb74d' }}>
                ⚖️ <strong>Costo:</strong> {activeMission.costDescription}
              </span>
              <span style={{ color: '#b3e5fc' }}>
                🚀 <strong>Efecto espacial:</strong> {activeMission.effectOnSpaceMission}
              </span>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {!isCompleted && !isThreeDone && (
              <button
                type="button"
                className="facility-card__btn facility-card__btn--gold"
                style={{ padding: '0.8rem 1.6rem', fontSize: '1.05rem' }}
                onClick={() => onOpenMission(activeMission)}
              >
                <Play weight="fill" />
                <span>{t('map.executeMission')}</span>
              </button>
            )}

            {isCompleted && (
              <span style={{ color: '#69f0ae', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" size={20} /> Kit Asegurado
              </span>
            )}

            {isThreeDone && !isCompleted && (
              <span style={{ color: '#b0bec5', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LockKey weight="bold" size={18} /> Bodega Completa (3/3)
              </span>
            )}

            {isThreeDone && (
              <button
                type="button"
                className="earth-action-btn"
                style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem' }}
                onClick={() => onProceedToLaunch(derivedTools)}
              >
                <RocketLaunch weight="fill" />
                <span>{t('map.proceedToLaunch', { count: countCompleted })}</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
