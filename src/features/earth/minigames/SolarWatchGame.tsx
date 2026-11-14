import { useState } from 'react';
import { ArrowLeft, ShieldCheck, Warning, CheckCircle, Radio, Sparkle, Info } from '@phosphor-icons/react';
import { DONKI_HISTORICAL_EVENTS, type DonkiEventRecord } from '../../../data/nasa/donkiData';
import '../screens/earth.css';

interface SolarWatchGameProps {
  readonly onComplete: () => void;
  readonly onBack: () => void;
}

export function SolarWatchGame({ onComplete, onBack }: SolarWatchGameProps) {
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(0);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);

  const event: DonkiEventRecord = DONKI_HISTORICAL_EVENTS[selectedEventIndex] ?? DONKI_HISTORICAL_EVENTS[0];
  const allActions = [event.recommendedAction, ...event.alternativeActions];
  const currentAction = allActions.find((a) => a.id === selectedActionId);

  function handleExecuteProtocol() {
    if (!selectedActionId) return;
    setHasEvaluated(true);
  }

  const isSuccess = currentAction?.outcomeType === 'CORRECT';

  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Volver al Mapa</span>
        </button>
        <div className="earth-screen__progress-pill">
          <ShieldCheck weight="fill" color="#f6c15b" />
          <span>Entrenamiento T2 · Vigilante del Sol (NASA DONKI)</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '52rem' }}>
        <h1 className="earth-card__title">
          <ShieldCheck color="#f6c15b" weight="fill" />
          <span>Vigilante del Sol: Registro de Clima Espacial</span>
        </h1>
        <p className="earth-card__subtitle">
          Investiga observaciones de clima espacial de <strong>NASA DONKI</strong>. En el espacio, el viento solar y las eyecciones de masa coronal (CME) no encuentran atmósfera protectora: debes activar protocolos oportunos.
        </p>

        {/* 1. Selección de evento histórico */}
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#f6c15b', marginBottom: '0.6rem', fontFamily: 'Fredoka' }}>
            1. Registro histórico verificado de NASA DONKI:
          </h2>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {DONKI_HISTORICAL_EVENTS.map((ev, index) => (
              <button
                key={ev.eventId}
                type="button"
                className={`callsign-chip ${selectedEventIndex === index ? 'callsign-chip--active' : ''}`}
                style={{
                  background: selectedEventIndex === index ? '#f6c15b' : '#1e354e',
                  color: selectedEventIndex === index ? '#132235' : '#d0e3f5',
                  fontWeight: 700,
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem'
                }}
                onClick={() => {
                  setSelectedEventIndex(index);
                  setSelectedActionId(null);
                  setHasEvaluated(false);
                }}
              >
                {ev.typeLabel} ({ev.observedAt.slice(0, 10)})
              </button>
            ))}
          </div>

          <div style={{
            background: '#132336',
            border: '1px solid #33557e',
            borderRadius: '0.9rem',
            padding: '1.2rem',
            marginTop: '0.8rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'monospace', color: '#7cb5c8', fontSize: '0.85rem' }}>
                ID DONKI: {event.eventId}
              </span>
              <span style={{ fontSize: '0.8rem', background: '#3b2f15', color: '#fed976', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontWeight: 700 }}>
                Registro Histórico
              </span>
            </div>
            <p style={{ margin: '0.6rem 0 0.4rem 0', color: '#ffffff', fontWeight: 700, fontSize: '1.05rem' }}>
              {event.summary}
            </p>
            <p style={{ margin: 0, color: '#bed4ea', fontSize: '0.9rem', lineHeight: '1.4' }}>
              {event.scientificDetail}
            </p>
          </div>
        </section>

        {/* 2. Elección de protocolo */}
        <section>
          <h2 style={{ fontSize: '1.1rem', color: '#f6c15b', marginBottom: '0.6rem', fontFamily: 'Fredoka' }}>
            2. Elige el protocolo de preparación para la estación:
          </h2>
          <div style={{ display: 'grid', gap: '0.8rem' }} role="radiogroup">
            {allActions.map((action) => {
              const isSelected = selectedActionId === action.id;
              return (
                <div
                  key={action.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`city-card ${isSelected ? 'city-card--selected' : ''}`}
                  style={{ padding: '1rem' }}
                  onClick={() => {
                    setSelectedActionId(action.id);
                    setHasEvaluated(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setSelectedActionId(action.id);
                      setHasEvaluated(false);
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                    <div style={{ marginTop: '3px', color: isSelected ? '#f6c15b' : '#7cb5c8' }}>
                      <Radio weight={isSelected ? 'fill' : 'regular'} size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff', fontFamily: 'Fredoka' }}>
                        {action.label}
                      </h3>
                      <p style={{ margin: '0.3rem 0 0 0', color: '#bed5ea', fontSize: '0.88rem' }}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="facility-card__btn facility-card__btn--gold"
              disabled={!selectedActionId}
              onClick={handleExecuteProtocol}
            >
              <ShieldCheck weight="fill" />
              <span>Ejecutar Protocolo de Alerta</span>
            </button>
          </div>
        </section>

        {/* 3. Consecuencia y explicación */}
        {hasEvaluated && currentAction && (
          <section
            aria-live="polite"
            style={{
              background: isSuccess ? '#15322c' : '#331d20',
              border: `2px solid ${isSuccess ? '#5bbd78' : '#e57373'}`,
              borderRadius: '1rem',
              padding: '1.3rem',
              marginTop: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              {isSuccess ? (
                <>
                  <CheckCircle color="#66bb6a" weight="fill" size={24} />
                  <span style={{ fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#66bb6a' }}>
                    ¡Protocolo Ejecutado Exitosamente!
                  </span>
                </>
              ) : (
                <>
                  <Warning color="#ef5350" weight="fill" size={24} />
                  <span style={{ fontFamily: 'Fredoka', fontSize: '1.2rem', color: '#ef5350' }}>
                    Advertencia: Consecuencia Riesgosa
                  </span>
                </>
              )}
            </div>

            <p style={{ margin: '0 0 0.8rem 0', color: '#e8f3ee', fontSize: '0.95rem', lineHeight: '1.45' }}>
              {currentAction.explanation}
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '0.6rem' }}>
              <Info size={20} color="#f6c15b" weight="fill" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#c4d8ea', lineHeight: '1.4' }}>
                <strong>Diferencia científica clave:</strong> Una llamarada solar (FLR) emite fotones que llegan a la velocidad de la luz (8 minutos). Una eyección de masa coronal (CME) viaja como nube de partículas de plasma en horas o días. Identificar el tipo de evento en DONKI te permite saber cuánto tiempo tienes para proteger a la tripulación.
              </p>
            </div>
          </section>
        )}

        <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            className="earth-action-btn"
            disabled={!hasEvaluated || !isSuccess}
            onClick={onComplete}
          >
            <Sparkle weight="fill" />
            <span>Validar y Certificar Entrenamiento</span>
          </button>
        </div>
      </main>
    </div>
  );
}
