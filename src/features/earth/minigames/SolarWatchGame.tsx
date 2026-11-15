import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Siren, LockKey, Broadcast, Sparkle, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { DONKI_HISTORICAL_EVENTS, type DonkiEventRecord } from '../../../data/nasa/donkiData';
import { StormShelterVisual } from '../../../visual-kit/TrainingVisuals';
import { MissionPulse } from './MissionPulse';
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
  const [protocolMessage, setProtocolMessage] = useState<string>('');

  const event: DonkiEventRecord = DONKI_HISTORICAL_EVENTS[eventIndex] ?? DONKI_HISTORICAL_EVENTS[0];

  // Secuencia de evacuación cuando suena la alarma
  useEffect(() => {
    if (isAlarmActive && !isCrewEvacuated) {
      const timer = setTimeout(() => { setIsCrewEvacuated(true); setProtocolMessage(''); }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAlarmActive, isCrewEvacuated]);

  function handleReset() {
    setIsAlarmActive(false);
    setIsCrewEvacuated(false);
    setIsHatchSealed(false);
    setIsSensorsProtected(false);
    setIsStormImpacted(false);
    setProtocolMessage('');
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
        <MissionPulse objective={t('gameplayV2.watch.objective')} signals={[
          { label: t('gameplayV2.watch.crew'), good: isCrewEvacuated },
          { label: t('gameplayV2.watch.hatch'), good: isHatchSealed },
          { label: t('gameplayV2.watch.sensors'), good: isSensorsProtected },
        ]} hint={t('gameplayV2.watch.hint')} attempted={isAlarmActive} solved={isMissionSuccess} fact={t('gameplayFacts.watch', { date: event.observedAt.slice(0, 10) })} />
        {/* Cabecera con selector de evento histórico verificado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Siren color="#ef5350" weight="fill" />
              <span>Vigilante del Sol: Protocolo de Tormenta CME</span>
            </h1>
            <details className="training-context"><summary>{t('gameplayV2.moreContext')}</summary><p>{t('minigames.solarWatch.subtitle')}</p></details>
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
            <div><dt>Alarma</dt><dd>{isAlarmActive ? 'Activada' : 'En espera'}</dd></div>
            <div><dt>Tripulación</dt><dd>{isCrewEvacuated ? 'En refugio' : 'Preparando evacuación'}</dd></div>
            <div><dt>Compuerta y sensores</dt><dd>{isHatchSealed ? 'Sellada' : 'Abierta'} · {isSensorsProtected ? 'Protegidos' : 'Expuestos'}</dd></div>
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
            <span>{isCrewEvacuated ? '✓ Tripulación Evacuada' : '1. Sonar Alarma de Evacuación'}</span>
          </button>

          {/* Acción 2: Sellar escotilla */}
          <button
            type="button"
            className="facility-card__btn"
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
            onClick={() => {
              if (isCrewEvacuated) { setIsHatchSealed(true); setProtocolMessage(''); }
              else setProtocolMessage(t('gameplayV2.watch.hatchTooEarly'));
            }}
          >
            <LockKey weight="fill" size={20} />
            <span>{isHatchSealed ? '✓ Compuerta Sellada' : '2. Cerrar Compuerta Blindada'}</span>
          </button>

          {/* Acción 3: Proteger sensores y telemetría */}
          <button
            type="button"
            className="facility-card__btn"
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
            onClick={() => {
              setIsSensorsProtected(true);
              setProtocolMessage(!isCrewEvacuated ? t('gameplayV2.watch.sensorsFirst') : '');
            }}
          >
            <Broadcast weight="fill" size={20} />
            <span>{isSensorsProtected ? '✓ Sensores en Modo Seguro' : '3. Blindar Telemetría'}</span>
          </button>
        </div>

        <div className="storm-approach" aria-label={t('gameplayV2.watch.stage', { count: Number(isCrewEvacuated) + Number(isHatchSealed) + Number(isSensorsProtected) })}>
          <span style={{ width: `${(Number(isCrewEvacuated) + Number(isHatchSealed) + Number(isSensorsProtected)) / 3 * 100}%` }} />
        </div>
        <p role="status" className="training-inline-hint">{protocolMessage || t('gameplayV2.watch.stage', { count: Number(isCrewEvacuated) + Number(isHatchSealed) + Number(isSensorsProtected) })}</p>

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
            <span>{isStormImpacted ? 'Impacto de la Tormenta Comprobado' : 'Simular Llegada de la Tormenta Solar (CME)'}</span>
          </button>

          <button
            type="button"
            className="earth-screen__back-btn"
            onClick={handleReset}
          >
            <ArrowCounterClockwise weight="bold" />
            <span>Reiniciar Protocolo</span>
          </button>
        </div>

        {!isProtocolReady && (
          <p role="status" style={{ color: '#ffd78a', margin: '0.5rem 0 0', fontSize: '0.88rem' }}>
            Antes de simular la llegada: {!isCrewEvacuated ? 'activa la alarma y espera a que la tripulación entre al refugio.' : !isHatchSealed ? 'cierra la compuerta blindada.' : 'protege los sensores y la telemetría.'}
          </p>
        )}

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
                <CheckCircle weight="fill" size={22} /> ¡Tripulación a Salvo bajo el Escudo!
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                {event.summary} En esta simulación completaste el protocolo de refugio y protección de sensores. El registro NASA no proporciona una dosis recibida por la tripulación.
              </p>
            </div>
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.75rem 1.6rem' }}
              onClick={() => onComplete(createTrainingOutcome('SOLAR_WATCH', `Protocolo CME ${eventIndex + 1}`, 'energy', calculateTrainingCost('SOLAR_WATCH', eventIndex), 'El refugio suspende operaciones durante la prueba.'))}
            >
              <Sparkle weight="fill" />
              <span>Confirmar costo de {(calculateTrainingCost('SOLAR_WATCH', eventIndex))} punto(s) de Energía y obtener el kit</span>
            </button>
          </div>
        )}

        <details className="training-science"><summary>{t('gameplayV2.scienceMore')}</summary><p>{t('gameplayScience.watch')} {event.eventId}</p></details>
      </main>
    </div>
  );
}
