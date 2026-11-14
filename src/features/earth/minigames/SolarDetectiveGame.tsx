import { useState, useEffect } from 'react';
import { ArrowLeft, Sun, Lightning, CheckCircle, Sparkle, ArrowCounterClockwise, Info } from '@phosphor-icons/react';
import { AREQUIPA_SOLAR_RECORDS, type SolarDayRecord } from '../../../data/nasa/powerData';
import '../screens/earth.css';

interface SolarDetectiveGameProps {
  readonly onComplete: () => void;
  readonly onBack: () => void;
}

export function SolarDetectiveGame({ onComplete, onBack }: SolarDetectiveGameProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [tiltAngle, setTiltAngle] = useState<number>(16); // Inclinación en grados (óptimo Arequipa ~16° hacia el norte)
  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(0);

  const currentDay: SolarDayRecord = AREQUIPA_SOLAR_RECORDS.days[selectedDayIndex] ?? AREQUIPA_SOLAR_RECORDS.days[0];

  // Cálculo físico-educativo para Arequipa (Latitud -16.4° Sur):
  // Ángulo óptimo: 16° hacia el norte
  // Eficiencia de panel fotovoltaico espacial: ~22%
  // Superficie: 10 m²
  const angleError = Math.abs(tiltAngle - 16);
  const orientationFactor = Math.max(0.60, Math.cos((angleError * Math.PI) / 180));
  const panelEfficiency = 0.22;
  const areaM2 = 10;
  const targetEnergyKwh = Number((currentDay.irradianceKwhPerM2 * orientationFactor * panelEfficiency * areaM2).toFixed(2));
  const maxPossibleKwh = Number((currentDay.irradianceKwhPerM2 * 1.0 * panelEfficiency * areaM2).toFixed(2));
  const efficiencyPercent = Math.round((targetEnergyKwh / maxPossibleKwh) * 100);

  // Animación de carga al cerrar el interruptor
  useEffect(() => {
    if (isSwitchClosed) {
      setBatteryLevel(0);
      const interval = setInterval(() => {
        setBatteryLevel((prev) => {
          if (prev >= efficiencyPercent) {
            clearInterval(interval);
            return efficiencyPercent;
          }
          return Math.min(prev + 10, efficiencyPercent);
        });
      }, 70);
      return () => clearInterval(interval);
    } else {
      setBatteryLevel(0);
    }
  }, [isSwitchClosed, efficiencyPercent]);

  function handleReset() {
    setIsSwitchClosed(false);
    setBatteryLevel(0);
  }

  const isTestPassed = isSwitchClosed && batteryLevel >= 75;

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Mapa de Arequipa</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Sun weight="fill" color="#f6c15b" />
          <span>Laboratorio Fotovoltaico · NASA POWER (Arequipa, -16.4° S, 2,325 m s. n. m.)</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        {/* Cabecera compacta con selector de días históricos reales de Arequipa */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Sun color="#f6c15b" weight="fill" />
              <span>Detective del Sol: Circuito Fotovoltaico en Arequipa</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              Aprovecha la radiación solar de gran altitud de Arequipa. Orienta el panel al Norte a 16° y cierra el circuito.
            </p>
          </div>

          {/* Diales de los 3 días históricos de Arequipa */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {AREQUIPA_SOLAR_RECORDS.days.map((day, idx) => (
              <button
                key={day.date}
                type="button"
                className={`callsign-chip ${selectedDayIndex === idx ? 'callsign-chip--active' : ''}`}
                style={{
                  background: selectedDayIndex === idx ? '#f6c15b' : '#1c334d',
                  color: selectedDayIndex === idx ? '#101d2d' : '#d1e4f6',
                  fontWeight: 700,
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem'
                }}
                onClick={() => {
                  setSelectedDayIndex(idx);
                  handleReset();
                }}
              >
                {day.seasonLabel.split(' ')[0]} ({day.irradianceKwhPerM2} kWh/m²)
              </button>
            ))}
          </div>
        </div>

        {/* ESCENARIO DEL LABORATORIO SVG INTERACTIVO */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 30%, #173252 0%, #0c1827 100%)',
          border: '2px solid #365e8c',
          borderRadius: '1rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
          minHeight: '22rem'
        }}>
          <svg
            viewBox="0 0 900 480"
            style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
            role="img"
            aria-label="Circuito interactivo de energía solar en Arequipa"
          >
            <defs>
              <linearGradient id="skySunArequipa" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffb300" />
                <stop offset="100%" stopColor="#ff6f00" />
              </linearGradient>

              <linearGradient id="batteryGradArequipa" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#43a047" />
                <stop offset="100%" stopColor="#76ff03" />
              </linearGradient>

              <style>{`
                .current-flow-arequipa {
                  stroke-dasharray: 8 6;
                  animation: dashArequipa 1s linear infinite;
                }
                @keyframes dashArequipa {
                  to { stroke-dashoffset: -28; }
                }
              `}</style>
            </defs>

            {/* Cielo andino y Sol brillante */}
            <g transform="translate(140, 90)">
              <circle r="44" fill="url(#skySunArequipa)">
                <animate attributeName="r" values="42;46;42" dur="2.5s" repeatCount="indefinite" />
              </circle>
              {/* Rayos solares intensos */}
              <g stroke="#ffca28" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.85">
                <line x1="0" y1="-55" x2="0" y2="-70" />
                <line x1="42" y1="-42" x2="54" y2="-54" />
                <line x1="58" y1="0" x2="72" y2="0" />
                <line x1="42" y1="42" x2="54" y2="54" />
                <line x1="0" y1="58" x2="0" y2="72" />
                <line x1="-42" y1="42" x2="-54" y2="54" />
                <line x1="-58" y1="0" x2="-72" y2="0" />
                <line x1="-42" y1="-42" x2="-54" y2="-54" />
              </g>
              <text x="0" y="5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
                {currentDay.irradianceKwhPerM2} kWh/m²
              </text>
              <text x="0" y="20" textAnchor="middle" fontSize="9" fill="#fff9c4">
                NASA POWER
              </text>
            </g>

            {/* Haz de luz */}
            <path
              d="M 175 110 L 270 200 L 250 250 L 150 140 Z"
              fill="rgba(255, 213, 79, 0.15)"
              stroke="none"
            />

            {/* PANEL SOLAR CON ROTACIÓN VISUAL */}
            <g transform="translate(260, 270)">
              <polygon points="-12,50 12,50 6,0 -6,0" fill="#37474f" stroke="#263238" strokeWidth="2" />
              <rect x="-35" y="48" width="70" height="12" rx="4" fill="#263238" />

              {/* Panel giratorio que rota según tiltAngle */}
              <g transform={`rotate(${-tiltAngle})`}>
                <rect x="-70" y="-12" width="140" height="24" rx="4" fill="#0d47a1" stroke="#42a5f5" strokeWidth="2.5" />
                <line x1="-35" y1="-12" x2="-35" y2="12" stroke="#64b5f6" strokeWidth="1.5" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#64b5f6" strokeWidth="1.5" />
                <line x1="35" y1="-12" x2="35" y2="12" stroke="#64b5f6" strokeWidth="1.5" />
                <line x1="-70" y1="0" x2="70" y2="0" stroke="#64b5f6" strokeWidth="1.5" />

                {angleError <= 3 && (
                  <circle cx="0" cy="0" r="18" fill="rgba(255,255,255,0.45)">
                    <animate attributeName="opacity" values="0.2;0.9;0.2" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>

              <text x="0" y="80" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#f6c15b">
                Inclinación: {tiltAngle}° {angleError <= 3 ? '★ ÓPTIMO AREQUIPA' : ''}
              </text>
            </g>

            {/* CABLEADO: Del panel al interruptor */}
            <path
              d="M 260 320 L 260 380 L 440 380"
              fill="none"
              stroke={isSwitchClosed ? "#69f0ae" : "#37474f"}
              strokeWidth="5"
              className={isSwitchClosed ? "current-flow-arequipa" : undefined}
            />

            {/* INTERRUPTOR CUCHILLA CLICABLE */}
            <g
              transform="translate(480, 380)"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsSwitchClosed(!isSwitchClosed)}
            >
              <rect x="-40" y="-20" width="80" height="40" rx="6" fill="#1b2a3d" stroke="#f6c15b" strokeWidth="1.5" />
              <circle cx="-25" cy="0" r="6" fill="#ffb74d" />
              <circle cx="25" cy="0" r="6" fill="#ffb74d" />

              {isSwitchClosed ? (
                <g>
                  <line x1="-25" y1="0" x2="25" y2="0" stroke="#76ff03" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="25" cy="0" r="9" fill="rgba(118, 255, 3, 0.4)">
                    <animate attributeName="r" values="6;12;6" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </g>
              ) : (
                <g>
                  <line x1="-25" y1="0" x2="10" y2="-28" stroke="#e53935" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="10" cy="-28" r="5" fill="#d32f2f" />
                </g>
              )}

              <text x="0" y="32" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isSwitchClosed ? "#69f0ae" : "#ffb74d"}>
                {isSwitchClosed ? "CIRCUITO CERRADO" : "TOCA PARA CONECTAR"}
              </text>
            </g>

            {/* CABLEADO: A la batería */}
            <path
              d="M 520 380 L 660 380 L 660 320"
              fill="none"
              stroke={isSwitchClosed ? "#69f0ae" : "#37474f"}
              strokeWidth="5"
              className={isSwitchClosed ? "current-flow-arequipa" : undefined}
            />

            {/* BATERÍA ESPACIAL */}
            <g transform="translate(660, 220)">
              <rect x="-45" y="-75" width="90" height="150" rx="10" fill="#142333" stroke="#4a73a3" strokeWidth="3" />
              <rect x="-18" y="-87" width="36" height="12" rx="3" fill="#cfd8dc" />

              <rect
                x="-37"
                y={65 - (1.3 * batteryLevel)}
                width="74"
                height={1.3 * batteryLevel}
                rx="4"
                fill="url(#batteryGradArequipa)"
              />

              <line x1="-37" y1="-30" x2="37" y2="-30" stroke="#263b52" strokeWidth="1.5" />
              <line x1="-37" y1="5" x2="37" y2="5" stroke="#263b52" strokeWidth="1.5" />
              <line x1="-37" y1="40" x2="37" y2="40" stroke="#263b52" strokeWidth="1.5" />

              <text x="0" y="-9" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#ffffff">
                {batteryLevel}%
              </text>
              <text x="0" y="100" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">
                Batería Andina
              </text>
            </g>

            {/* INDICADOR DE TELEMETRÍA */}
            <g transform="translate(800, 220)">
              <rect x="-35" y="-50" width="70" height="100" rx="8" fill="#1b2a3d" stroke="#395c86" strokeWidth="2" />
              <circle cx="0" cy="-15" r="18" fill={isTestPassed ? "#69f0ae" : "#37474f"} stroke="#ffffff" strokeWidth="2">
                {isTestPassed && (
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="0.6s" repeatCount="indefinite" />
                )}
              </circle>
              <text x="0" y="-10" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#102033">
                {isTestPassed ? "ON" : "OFF"}
              </text>
              <text x="0" y="25" textAnchor="middle" fontSize="10" fill="#a4c9ef" fontWeight="bold">
                TELEMETRÍA
              </text>
              <text x="0" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isTestPassed ? "#69f0ae" : "#b0bec5"}>
                {isTestPassed ? "✓ ACTIVA" : "SIN ENERGÍA"}
              </text>
            </g>

          </svg>
        </div>

        {/* CONTROLES DEL JUGADOR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1rem',
          background: '#132338',
          border: '1px solid #325884',
          borderRadius: '0.8rem',
          padding: '0.9rem 1.2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 20rem' }}>
            <label htmlFor="tilt-slider-arequipa" style={{ fontWeight: 700, color: '#ffffff', minWidth: '9rem' }}>
              Orientar Panel: <span style={{ color: '#f6c15b', fontSize: '1.2rem', fontFamily: 'Fredoka' }}>{tiltAngle}°</span>
            </label>
            <input
              id="tilt-slider-arequipa"
              type="range"
              min="0"
              max="50"
              value={tiltAngle}
              onChange={(e) => {
                setTiltAngle(Number(e.target.value));
                if (isSwitchClosed) handleReset();
              }}
              style={{ flex: 1, accentColor: '#f6c15b', cursor: 'pointer' }}
            />
            <button
              type="button"
              className="callsign-chip"
              style={{ background: '#25446c', color: '#8ec5fc' }}
              onClick={() => {
                setTiltAngle(16);
                if (isSwitchClosed) handleReset();
              }}
            >
              16° (Óptimo Arequipa)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              className="facility-card__btn"
              style={{ background: isSwitchClosed ? '#37474f' : '#f6c15b', color: isSwitchClosed ? '#ffffff' : '#102033' }}
              onClick={() => setIsSwitchClosed(!isSwitchClosed)}
            >
              <Lightning weight="fill" />
              <span>{isSwitchClosed ? 'Abrir Circuito' : 'Cerrar Interruptor'}</span>
            </button>
            <button
              type="button"
              className="earth-screen__back-btn"
              onClick={handleReset}
              title="Reiniciar prueba"
            >
              <ArrowCounterClockwise weight="bold" />
            </button>
          </div>
        </div>

        {/* FEEDBACK CIENTÍFICO */}
        {isTestPassed && (
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
                <CheckCircle weight="fill" size={22} /> ¡Calibración Fotovoltaica en Arequipa Superada!
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                Con el panel orientado a {tiltAngle}° y la radiación de montaña de {currentDay.irradianceKwhPerM2} kWh/m², generaste <strong>{targetEnergyKwh} kWh</strong> ({efficiencyPercent}% de rendimiento). La telemetría está energizada y obtienes los <strong>Paneles plegables</strong> para la nave.
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

        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9bc0e4', fontSize: '0.82rem' }}>
          <Info size={16} color="#f6c15b" />
          <span>Datos NASA POWER para Arequipa (Latitud: -16.4° S, Longitud: -71.5° O, Altitud: 2,325 m). La radiación solar incidente se convierte a electricidad con celdas de silicio al 22% de eficiencia.</span>
        </div>
      </main>
    </div>
  );
}
