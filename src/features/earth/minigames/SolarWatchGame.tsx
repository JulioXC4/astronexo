import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Siren, LockKey, Broadcast, Sparkle, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { DONKI_HISTORICAL_EVENTS, type DonkiEventRecord } from '../../../data/nasa/donkiData';
import { StormShelterVisual } from '../../../visual-kit/TrainingVisuals';
import { useI18n, LanguageSelector } from '../../../i18n';
import '../screens/earth.css';

interface SolarWatchGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

export function SolarWatchGame({ onComplete, onBack }: SolarWatchGameProps) {
  const { t } = useI18n();
  const [eventIndex, setEventIndex] = useState<number>(0);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [isCrewEvacuated, setIsCrewEvacuated] = useState<boolean>(false);
  const [isHatchSealed, setIsHatchSealed] = useState<boolean>(false);
  const [isSensorsProtected, setIsSensorsProtected] = useState<boolean>(false);
  const [isStormImpacted, setIsStormImpacted] = useState<boolean>(false);

  const event: DonkiEventRecord = DONKI_HISTORICAL_EVENTS[eventIndex] ?? DONKI_HISTORICAL_EVENTS[0];
  const eventSummary = eventIndex === 0
    ? t('minigames.solarWatch.primaryEventSummary', { speed: event.observation.value })
    : t('minigames.solarWatch.secondaryEventSummary', { speed: event.observation.value });

  // Secuencia de evacuación cuando suena la alarma
  useEffect(() => {
    if (isAlarmActive && !isCrewEvacuated) {
      const timer = setTimeout(() => setIsCrewEvacuated(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isAlarmActive, isCrewEvacuated]);

  function handleReset() {
    setIsAlarmActive(false);
    setIsCrewEvacuated(false);
    setIsHatchSealed(false);
    setIsSensorsProtected(false);
    setIsStormImpacted(false);
  }

  function handleTestStorm() {
    setIsStormImpacted(true);
  }

  const isProtocolReady = isCrewEvacuated && isHatchSealed && isSensorsProtected;
  const isMissionSuccess = isStormImpacted && isProtocolReady;

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <ShieldCheck weight="fill" color="#ba68c8" />
          <span>{t('minigames.solarWatch.title')} · NASA DONKI</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        {/* Cabecera con selector de evento histórico verificado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Siren color="#ef5350" weight="fill" />
              <span>{t('minigames.solarWatch.title')}</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              {t('minigames.solarWatch.subtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {DONKI_HISTORICAL_EVENTS.map((ev, idx) => (
              <button
                key={ev.eventId}
                type="button"
                className={`callsign-chip ${eventIndex === idx ? 'callsign-chip--active' : ''}`}
                style={{
                  background: eventIndex === idx ? '#ba68c8' : '#1c334d',
                  color: eventIndex === idx ? '#ffffff' : '#d1e4f6',
                  fontWeight: 700,
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem'
                }}
                onClick={() => {
                  setEventIndex(idx);
                  handleReset();
                }}
              >
                {ev.eventType} · {ev.observedAt.slice(11, 16)} UTC
              </button>
            ))}
          </div>
        </div>

        <div className="training-scene">
          <StormShelterVisual alert={isAlarmActive || isStormImpacted} doorClosed={isHatchSealed} crewEvacuated={isCrewEvacuated} crewSafe={isCrewEvacuated && isHatchSealed} />
          <dl className="training-readouts">
            <div><dt>NASA DONKI</dt><dd>{event.eventType} · {event.observedAt.slice(0, 10)}</dd></div>
            <div><dt>{t('minigames.solarWatch.readouts.alarm')}</dt><dd>{isAlarmActive ? t('minigames.solarWatch.readouts.active') : t('minigames.solarWatch.readouts.waiting')}</dd></div>
            <div><dt>{t('minigames.solarWatch.readouts.crew')}</dt><dd>{isCrewEvacuated ? t('minigames.solarWatch.readouts.inShelter') : t('minigames.solarWatch.readouts.preparing')}</dd></div>
            <div><dt>{t('minigames.solarWatch.readouts.doorAndSensors')}</dt><dd>{isHatchSealed ? t('minigames.solarWatch.readouts.sealed') : t('minigames.solarWatch.readouts.open')} · {isSensorsProtected ? t('minigames.solarWatch.readouts.protected') : t('minigames.solarWatch.readouts.exposed')}</dd></div>
          </dl>
        </div>

        {/* CONSOLA DE ACCIONES INTERACTIVAS DEL JUGADOR (PASOS 1, 2, 3) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
          gap: '0.8rem',
          marginTop: '0.8rem'
        }}>
          {/* Acción 1: Sirena y evacuar */}
          <button
            type="button"
            className="facility-card__btn"
            style={{
              background: isCrewEvacuated ? '#1b5e20' : '#d32f2f',
              color: '#ffffff',
              padding: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem'
            }}
            onClick={() => setIsAlarmActive(true)}
          >
            <Siren weight="fill" size={20} />
            <span>{isCrewEvacuated ? t('minigames.solarWatch.step1Done') : t('minigames.solarWatch.step1')}</span>
          </button>

          {/* Acción 2: Sellar escotilla */}
          <button
            type="button"
            className="facility-card__btn"
            disabled={!isCrewEvacuated}
            style={{
              background: isHatchSealed ? '#1b5e20' : '#f57c00',
              color: '#ffffff',
              padding: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem'
            }}
            onClick={() => setIsHatchSealed(true)}
          >
            <LockKey weight="fill" size={20} />
            <span>{isHatchSealed ? t('minigames.solarWatch.step2Done') : t('minigames.solarWatch.step2')}</span>
          </button>

          {/* Acción 3: Proteger sensores y telemetría */}
          <button
            type="button"
            className="facility-card__btn"
            disabled={!isHatchSealed}
            style={{
              background: isSensorsProtected ? '#1b5e20' : '#1976d2',
              color: '#ffffff',
              padding: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem'
            }}
            onClick={() => setIsSensorsProtected(true)}
          >
            <Broadcast weight="fill" size={20} />
            <span>{isSensorsProtected ? t('minigames.solarWatch.step3Done') : t('minigames.solarWatch.step3')}</span>
          </button>
        </div>

        {/* BOTÓN DE DISPARO DEL EVENTO DE LA TORMENTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.8rem' }}>
          <button
            type="button"
            className="earth-action-btn"
            disabled={!isProtocolReady || isStormImpacted}
            style={{ padding: '0.75rem 1.6rem', fontSize: '1.05rem' }}
            onClick={handleTestStorm}
          >
            <Siren weight="fill" />
            <span>{isStormImpacted ? t('minigames.solarWatch.impactChecked') : t('minigames.solarWatch.simulateStorm')}</span>
          </button>

          <button
            type="button"
            className="earth-screen__back-btn"
            onClick={handleReset}
          >
            <ArrowCounterClockwise weight="bold" />
            <span>{t('minigames.solarWatch.reset')}</span>
          </button>
        </div>

        {/* FEEDBACK CIENTÍFICO TRAS EL IMPACTO */}
        {isMissionSuccess && (
          <div style={{
            background: '#122e23',
            border: '2px solid #5bbd78',
            borderRadius: '0.8rem',
            padding: '1rem',
            marginTop: '0.8rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <strong style={{ color: '#69f0ae', fontFamily: 'Fredoka', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" size={22} /> {t('minigames.solarWatch.successTitle')}
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                {t('minigames.solarWatch.successDesc', { summary: eventSummary })}
              </p>
            </div>
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.75rem 1.6rem' }}
              onClick={() => onComplete(createTrainingOutcome('SOLAR_WATCH', `Protocolo CME ${eventIndex + 1}`, 'energy', calculateTrainingCost('SOLAR_WATCH', eventIndex), 'El refugio suspende operaciones durante la prueba.'))}
            >
              <Sparkle weight="fill" />
              <span>{t('minigames.solarWatch.confirmCost', { cost: calculateTrainingCost('SOLAR_WATCH', eventIndex) })}</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#9bc0e4', fontSize: '0.80rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#f6c15b" />
            <span>{t('minigames.solarWatch.scientificNote', { summary: eventSummary, id: event.eventId })}</span>
          </div>
          <div style={{ color: '#ce93d8', paddingLeft: '1.4rem' }}>
            <span>{t('minigames.solarWatch.educationalNote')}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
