import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Siren, LockKey, Broadcast, Sparkle, CheckCircle, ArrowCounterClockwise } from '@phosphor-icons/react';
import { DONKI_HISTORICAL_EVENTS, type DonkiEventRecord } from '../../../data/nasa/donkiData';
import '../screens/earth.css';

interface SolarWatchGameProps {
  readonly onComplete: () => void;
  readonly onBack: () => void;
}

export function SolarWatchGame({ onComplete, onBack }: SolarWatchGameProps) {
  const [eventIndex, setEventIndex] = useState<number>(0);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [isCrewEvacuated, setIsCrewEvacuated] = useState<boolean>(false);
  const [isHatchSealed, setIsHatchSealed] = useState<boolean>(false);
  const [isSensorsProtected, setIsSensorsProtected] = useState<boolean>(false);
  const [isStormImpacted, setIsStormImpacted] = useState<boolean>(false);

  const event: DonkiEventRecord = DONKI_HISTORICAL_EVENTS[eventIndex] ?? DONKI_HISTORICAL_EVENTS[0];

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
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Mapa de la Base</span>
        </button>
        <div className="earth-screen__progress-pill">
          <ShieldCheck weight="fill" color="#ba68c8" />
          <span>Defensa de Clima Espacial · NASA DONKI</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        {/* Cabecera con selector de evento histórico verificado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Siren color="#ef5350" weight="fill" />
              <span>Vigilante del Sol: Protocolo de Tormenta CME</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              El satélite detectó una eyección de masa coronal. ¡Protege a la tripulación en el refugio blindado!
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
                {ev.typeLabel.split(' ')[0]} ({ev.observedAt.slice(0, 10)})
              </button>
            ))}
          </div>
        </div>

        {/* ESCENARIO ESQUEMÁTICO 2D EN SVG DE LA ESTACIÓN Y EL REFUGIO */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1c2b42 0%, #0a1420 100%)',
          border: '2px solid #3d5a80',
          borderRadius: '1rem',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '22rem',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)'
        }}>
          <svg
            viewBox="0 0 900 480"
            style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
            role="img"
            aria-label="Corte esquemático de la estación espacial y el refugio"
          >
            <defs>
              {/* Ráfaga de radiación de la tormenta CME */}
              <linearGradient id="cmeBlast" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 87, 34, 0.85)" />
                <stop offset="50%" stopColor="rgba(255, 193, 7, 0.6)" />
                <stop offset="100%" stopColor="rgba(255, 87, 34, 0)" />
              </linearGradient>

              {/* Capa de blindaje de polietileno/agua */}
              <linearGradient id="shieldWall" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2e7d32" />
                <stop offset="100%" stopColor="#1b5e20" />
              </linearGradient>
            </defs>

            {/* Suelo lunar/terrestre (línea divisoria entre superficie y búnker subterráneo) */}
            <rect x="0" y="190" width="900" height="290" fill="#142131" stroke="#253b54" strokeWidth="2" />
            <line x1="0" y1="190" x2="900" y2="190" stroke="#375577" strokeWidth="4" />
            <text x="30" y="215" fontSize="11" fontWeight="bold" fill="#7194ba" letterSpacing="0.08em">
              ▼ SUBSUELO PROTEGIDO (CAPAS DE REGOLITO Y BLINDAJE)
            </text>

            {/* RÁFAGA DE RADIACIÓN SOLAR CME (animada si la tormenta impacta) */}
            {isStormImpacted && (
              <g>
                <rect x="0" y="0" width="900" height="190" fill="url(#cmeBlast)">
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
                </rect>
                <text x="450" y="45" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ffffff" letterSpacing="0.1em">
                  ⚡ FRENTE DE ONDA CME (VELOCIDAD &gt; 1200 KM/S) EN SUPERFICIE ⚡
                </text>
              </g>
            )}

            {/* ============================================================== */}
            {/* SUPERFICIE: CÚPULA EXTERIOR Y SENSOR RADIOLÓGICO               */}
            {/* ============================================================== */}
            <g transform="translate(450, 190)">
              {/* Cúpula transparente superior */}
              <ellipse cx="0" cy="0" rx="90" ry="70" fill="rgba(76, 195, 217, 0.15)" stroke="#4cc3d9" strokeWidth="2.5" />
              {/* Esclusa de paso vertical hacia el búnker */}
              <rect x="-24" y="0" width="48" height="60" fill="#203348" stroke="#3f668f" strokeWidth="2" />

              {/* SIRENA DE ALARMA EN LA CÚPULA */}
              <g transform="translate(0, -78)">
                <circle cx="0" cy="0" r="12" fill={isAlarmActive ? "#d32f2f" : "#455a64"} stroke="#ffffff" strokeWidth="2">
                  {isAlarmActive && (
                    <animate attributeName="fill" values="#d32f2f;#ffeb3b;#d32f2f" dur="0.5s" repeatCount="indefinite" />
                  )}
                </circle>
                <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                  {isAlarmActive ? "!" : ""}
                </text>
              </g>

              {/* COMPUERTA BLINDADA MECÁNICA */}
              <g transform="translate(0, 45)">
                {isHatchSealed ? (
                  // Compuerta cerrada hermética
                  <g>
                    <rect x="-26" y="-6" width="52" height="12" rx="3" fill="#ffb300" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#102033">SELLADA</text>
                  </g>
                ) : (
                  // Compuerta abierta retráctil
                  <g>
                    <rect x="-26" y="-18" width="10" height="24" fill="#78909c" />
                    <rect x="16" y="-18" width="10" height="24" fill="#78909c" />
                    <text x="0" y="-2" textAnchor="middle" fontSize="8" fill="#e53935" fontWeight="bold">ABIERTA</text>
                  </g>
                )}
              </g>

              {/* POSICIÓN DE LOS ASTRONAUTAS: Fuera o dentro del búnker */}
              {!isCrewEvacuated ? (
                // En la cúpula exterior (vulnerables)
                <g transform="translate(-15, -15)">
                  <circle cx="0" cy="-12" r="10" fill="#ffffff" stroke="#102033" strokeWidth="1.5" />
                  <rect x="-8" y="-2" width="16" height="20" rx="3" fill="#ffffff" />
                  <circle cx="30" cy="-12" r="10" fill="#ffffff" stroke="#102033" strokeWidth="1.5" />
                  <rect x="22" y="-2" width="16" height="20" rx="3" fill="#ffffff" />
                  <text x="15" y="-30" textAnchor="middle" fontSize="11" fill="#ffca28" fontWeight="bold">
                    👨‍🚀 Tripulación en Cúpula
                  </text>
                </g>
              ) : (
                // Ya evacuados al búnker subterráneo
                <g transform="translate(0, 150)">
                  <circle cx="-20" cy="-12" r="10" fill="#69f0ae" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x="-28" y="-2" width="16" height="20" rx="3" fill="#69f0ae" />
                  <circle cx="20" cy="-12" r="10" fill="#69f0ae" stroke="#ffffff" strokeWidth="1.5" />
                  <rect x="12" y="-2" width="16" height="20" rx="3" fill="#69f0ae" />
                  <text x="0" y="-28" textAnchor="middle" fontSize="12" fill="#69f0ae" fontWeight="bold">
                    🛡️ Tripulación Protegida en Búnker
                  </text>
                </g>
              )}
            </g>

            {/* ============================================================== */}
            {/* SUBSUELO: REFUGIO SUBTERRÁNEO BLINDADO                         */}
            {/* ============================================================== */}
            <g transform="translate(450, 350)">
              {/* Capa de blindaje de polietileno y agua */}
              <rect x="-160" y="-50" width="320" height="110" rx="14" fill="url(#shieldWall)" stroke="#81c784" strokeWidth="3" />
              {/* Interior habitable del refugio */}
              <rect x="-140" y="-35" width="280" height="80" rx="8" fill="#0d1b2a" stroke="#4cc3d9" strokeWidth="1.5" />

              <text x="0" y="35" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#a4c9ef">
                REFUGIO BLINDADO (POLIETILENO + AGUA ECLSS)
              </text>
            </g>

            {/* ============================================================== */}
            {/* SENSORES DE RADIACIÓN: EXTERIOR VS INTERIOR                    */}
            {/* ============================================================== */}
            {/* Sensor exterior */}
            <g transform="translate(180, 110)">
              <rect x="-65" y="-35" width="130" height="70" rx="8" fill="#1b2a3d" stroke="#f6c15b" strokeWidth="2" />
              <text x="0" y="-15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#9bc0e4">
                SENSOR EXTERIOR
              </text>
              <text x="0" y="15" textAnchor="middle" fontSize="18" fontWeight="bold" fill={isStormImpacted ? "#ff5252" : "#69f0ae"}>
                {isStormImpacted ? "EXTREMO (G5)" : "0.12 mSv/h"}
              </text>
            </g>

            {/* Sensor del refugio subterráneo */}
            <g transform="translate(180, 350)">
              <rect x="-65" y="-35" width="130" height="70" rx="8" fill="#1b2a3d" stroke="#69f0ae" strokeWidth="2" />
              <text x="0" y="-15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#9bc0e4">
                DOSIS EN REFUGIO
              </text>
              <text x="0" y="15" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#69f0ae">
                {isHatchSealed ? "0.02 mSv/h (SEGURO)" : (isStormImpacted ? "RIESGO ALTO" : "0.05 mSv/h")}
              </text>
            </g>

            {/* Radar DONKI de alerta */}
            <g transform="translate(740, 110)">
              <rect x="-70" y="-35" width="140" height="70" rx="8" fill="#1b2a3d" stroke="#ba68c8" strokeWidth="2" />
              <text x="0" y="-15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e1bee7">
                RADAR NASA DONKI
              </text>
              <text x="0" y="10" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffd54f">
                {event.eventType}: {event.observedAt.slice(0, 10)}
              </text>
            </g>

          </svg>
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
            <span>{isHatchSealed ? '✓ Compuerta Sellada' : '2. Cerrar Compuerta Blindada'}</span>
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
            <span>{isSensorsProtected ? '✓ Sensores en Modo Seguro' : '3. Blindar Telemetría'}</span>
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
                El frente de onda de la tormenta de mayo de 2024 ({event.summary}) cruzó la superficie a &gt;1200 km/s. Al evacuar a tiempo y sellar la compuerta de polietileno, la radiación en el búnker se mantuvo en niveles seguros.
              </p>
            </div>
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.75rem 1.6rem' }}
              onClick={onComplete}
            >
              <Sparkle weight="fill" />
              <span>Validar Certificación en el Mapa</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
