import { useState } from 'react';
import { ArrowLeft, ArrowRight, RocketLaunch, FastForward, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface NarrativeBriefingScreenProps {
  readonly cityName: string;
  readonly destination: string;
  readonly astronautName: string;
  readonly avatarId?: string;
  readonly onProceedToMap: () => void;
  readonly onBack: () => void;
}

const AVATAR_SPRITES: Record<string, string> = {
  ALBA: '/assets/pixel-art/cadet-alba.png',
  LEO: '/assets/pixel-art/commander-leo.png',
  AURORA: '/assets/pixel-art/officer-aurora.png',
  NICO: '/assets/pixel-art/engineer-nico.png',
};

export function NarrativeBriefingScreen({
  cityName,
  destination,
  astronautName,
  avatarId = 'ALBA',
  onProceedToMap,
  onBack,
}: NarrativeBriefingScreenProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  const destLabel = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');
  const playerSprite = AVATAR_SPRITES[avatarId] || AVATAR_SPRITES.ALBA;

  // Diálogos educativos interactivos
  const dialogueSteps = [
    {
      step: 1,
      speaker: t('briefing.dialogue.step1Speaker'),
      role: t('briefing.title', { city: cityName }),
      thumb: playerSprite,
      text: t('briefing.dialogue.step1Text', { name: astronautName, city: cityName, destination: destLabel }),
      accentColor: '#f6c15b',
    },
    {
      step: 2,
      speaker: t('briefing.dialogue.step2Speaker'),
      role: 'Estación de Telemetría',
      thumb: '/assets/pixel-art/officer-aurora.png',
      text: t('briefing.dialogue.step2Text', { city: cityName }),
      accentColor: '#4ec3d9',
    },
    {
      step: 3,
      speaker: t('briefing.dialogue.step3Speaker'),
      role: 'Planificación de Misión',
      thumb: '/assets/pixel-art/cadet-alba.png',
      text: t('briefing.dialogue.step3Text'),
      accentColor: '#f6c15b',
    },
    {
      step: 4,
      speaker: t('briefing.dialogue.step4Speaker'),
      role: 'Asistente Táctico',
      thumb: '/assets/characters/chispa.png',
      text: t('briefing.dialogue.step4Text'),
      accentColor: '#ffd54f',
    },
  ];

  const currentDialogue = dialogueSteps[step - 1];

  function handleNext() {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      onProceedToMap();
    }
  }

  function handlePrev() {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  }

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1.2rem' }}>
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <RocketLaunch weight="fill" color="#f6c15b" />
          <span>{t('briefing.stepIndicator', { city: cityName, destination: destLabel })}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '68rem', padding: 0, overflow: 'hidden' }}>
        {/* ESCENARIO DEL CENTRO DE COMUNICACIONES PIXEL ART */}
        <div className="briefing-stage">

          {/* ACTORES EN EL ESCENARIO (ASTRONAUTA A LA IZQUIERDA, CHISPA A LA DERECHA) */}
          <div className="briefing-actors-stage">
            {/* Personaje del jugador a la izquierda */}
            <div className="briefing-actor briefing-actor--player">
              <img
                src={playerSprite}
                alt={astronautName}
                className="briefing-actor__sprite"
              />
              <span className="briefing-actor__name-tag">
                👨‍🚀 {astronautName}
              </span>
            </div>

            {/* Asistente Chispa a la derecha */}
            <div className="briefing-actor briefing-actor--chispa">
              <img
                src="/assets/characters/chispa.png"
                alt="Chispa robot asistente"
                className="briefing-actor__sprite"
                style={{ maxHeight: '11rem' }}
              />
              <span className="briefing-actor__name-tag" style={{ borderColor: '#e5a93b' }}>
                🤖 Chispa (IA)
              </span>
            </div>
          </div>

          {/* CAJA DE DIÁLOGO RPG INFERIOR */}
          <div className="briefing-dialog-box">
            <div className="briefing-dialog-box__speaker">
              <div className="briefing-dialog-box__speaker-thumb" style={{ borderColor: currentDialogue.accentColor }}>
                <img src={currentDialogue.thumb} alt={currentDialogue.speaker} />
              </div>
              <div>
                <span className="briefing-dialog-box__speaker-name" style={{ color: currentDialogue.accentColor }}>
                  {currentDialogue.speaker}
                </span>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#90b4d6' }}>
                  {currentDialogue.role}
                </span>
              </div>
            </div>

            <p className="briefing-dialog-box__text">
              «{currentDialogue.text}»
            </p>

            <div className="briefing-dialog-box__controls">
              {/* Indicador de pasos con puntitos */}
              <div className="briefing-step-dots" aria-label={`Paso ${step} de ${totalSteps}`}>
                {dialogueSteps.map((d) => (
                  <span
                    key={d.step}
                    className={`briefing-step-dot ${d.step === step ? 'briefing-step-dot--active' : ''}`}
                    onClick={() => setStep(d.step)}
                    style={{ cursor: 'pointer' }}
                    title={`Paso ${d.step}`}
                  />
                ))}
                <span style={{ fontSize: '0.85rem', color: '#8daecf', marginLeft: '0.4rem', fontFamily: 'Fredoka' }}>
                  {t('briefing.dialogue.stepIndicator', { current: step, total: totalSteps })}
                </span>
              </div>

              {/* Controles de avance */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {step > 1 && (
                  <button
                    type="button"
                    className="pixel-btn pixel-btn--secondary"
                    style={{ padding: '0.6rem 1rem', fontSize: '0.95rem' }}
                    onClick={handlePrev}
                  >
                    <CaretLeft weight="bold" />
                    <span>{t('briefing.dialogue.prevBtn')}</span>
                  </button>
                )}

                {step < totalSteps && (
                  <button
                    type="button"
                    className="pixel-btn pixel-btn--secondary"
                    style={{ padding: '0.6rem 1.1rem', fontSize: '0.95rem', color: '#f6c15b' }}
                    onClick={() => setStep(totalSteps)}
                  >
                    <FastForward weight="bold" />
                    <span>{t('briefing.dialogue.skipBtn')}</span>
                  </button>
                )}

                {step < totalSteps ? (
                  <button
                    type="button"
                    className="pixel-btn pixel-btn--primary"
                    style={{ padding: '0.65rem 1.4rem', fontSize: '1rem' }}
                    onClick={handleNext}
                  >
                    <span>{t('briefing.dialogue.nextBtn')}</span>
                    <CaretRight weight="bold" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pixel-btn pixel-btn--primary"
                    style={{ padding: '0.8rem 1.8rem', fontSize: '1.15rem' }}
                    onClick={onProceedToMap}
                  >
                    <span>{t('briefing.dialogue.readyBtn')}</span>
                    <ArrowRight weight="bold" />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
