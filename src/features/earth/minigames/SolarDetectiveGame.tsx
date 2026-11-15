import { useState, useEffect } from 'react';
import { ArrowLeft, Sun, Lightning, CheckCircle, Sparkle, ArrowCounterClockwise, Info, Warning } from '@phosphor-icons/react';
import { AREQUIPA_SOLAR_RECORDS, type SolarDayRecord } from '../../../data/nasa/powerData';
import '../screens/earth.css';

interface SolarDetectiveGameProps {
  readonly onComplete: () => void;
  readonly onBack: () => void;
}

export function SolarDetectiveGame({ onComplete, onBack }: SolarDetectiveGameProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [tiltAngle, setTiltAngle] = useState<number>(16); // Inclinación en grados (supuesto simulación: óptimo Arequipa ~16° hacia el norte por latitud)
  const [reserveRatioPercent, setReserveRatioPercent] = useState<number>(45); // Decisión de reserva energética nocturna: 30% a 60%
  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(0);

  const currentDay: SolarDayRecord = AREQUIPA_SOLAR_RECORDS.days[selectedDayIndex] ?? AREQUIPA_SOLAR_RECORDS.days[0];

  // Cálculo físico-educativo para Arequipa (Latitud -16.4° Sur):
  // Radiación histórica NASA POWER ALLSKY_SFC_SW_DWN en kW-hr/m²/día
  // Supuestos del modelo de ingeniería:
  // - Ángulo óptimo: 16° hacia el norte (basado en latitud)
  // - Eficiencia del panel fotovoltaico espacial: 22% (modelo de silicio monocristalino)
  // - Superficie: 10 m²
  const angleError = Math.abs(tiltAngle - 16);
  const orientationFactor = Math.max(0.60, Math.cos((angleError * Math.PI) / 180));
  const panelEfficiency = 0.22;
  const areaM2 = 10;
  const totalDailyEnergyKwh = Number((currentDay.irradianceKwhPerM2 * orientationFactor * panelEfficiency * areaM2).toFixed(2));
  const maxPossibleKwh = Number((currentDay.irradianceKwhPerM2 * 1.0 * panelEfficiency * areaM2).toFixed(2));
  const efficiencyPercent = Math.round((totalDailyEnergyKwh / maxPossibleKwh) * 100);

  // Decisión de balance: Cuánta energía va a consumo diurno y cuánta a reserva de baterías para la noche
  const isReserveOptimal = reserveRatioPercent >= 30 && reserveRatioPercent <= 60;
  const isReserveTooLow = reserveRatioPercent < 30;
  const isReserveTooHigh = reserveRatioPercent > 60;
  const storedEnergyKwh = Number((totalDailyEnergyKwh * (reserveRatioPercent / 100)).toFixed(2));
  const daytimeAvailableKwh = Number((totalDailyEnergyKwh - storedEnergyKwh).toFixed(2));

  // Animación de carga al cerrar el interruptor
  useEffect(() => {
    if (isSwitchClosed) {
      setBatteryLevel(0);
      const targetPercent = Math.min(100, Math.round((efficiencyPercent * (reserveRatioPercent / 50))));
      const interval = setInterval(() => {
        setBatteryLevel((prev) => {
          if (prev >= targetPercent) {
            clearInterval(interval);
            return targetPercent;
          }
          return Math.min(prev + 10, targetPercent);
        });
      }, 70);
      return () => clearInterval(interval);
    } else {
      setBatteryLevel(0);
    }
  }, [isSwitchClosed, efficiencyPercent, reserveRatioPercent]);

  function handleReset() {
    setIsSwitchClosed(false);
    setBatteryLevel(0);
  }

  const isOrientationGood = angleError <= 5;
  const isTestPassed = isSwitchClosed && isOrientationGood && isReserveOptimal && batteryLevel >= 60;

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Volver al Mapa de Arequipa</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Sun weight="fill" color="#f6c15b" />
          <span>Observatorio Solar Andino · NASA POWER (Arequipa, -16.4° S, 2,325 m s. n. m.)</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        {/* Cabecera compacta con selector de días históricos reales de Arequipa */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Sun color="#f6c15b" weight="fill" />
              <span>Detective del Sol: Orientación y Reserva de Baterías</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              Elige un día histórico, orienta los paneles hacia el Norte (óptimo 16°) y decide cuánta energía almacenar para la noche andina.
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
          minHeight: '21rem'
        }}>
          <svg
            viewBox="0 0 900 440"
            style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
            role="img"
            aria-label="Circuito interactivo de energía solar y almacenamiento en Arequipa"
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
            <g transform="translate(130, 80)">
              <circle r="40" fill="url(#skySunArequipa)">
                <animate attributeName="r" values="38;42;38" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <g stroke="#ffca28" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.85">
                <line x1="0" y1="-50" x2="0" y2="-65" />
                <line x1="38" y1="-38" x2="50" y2="-50" />
                <line x1="52" y1="0" x2="65" y2="0" />
                <line x1="38" y1="38" x2="50" y2="50" />
                <line x1="0" y1="52" x2="0" y2="65" />
                <line x1="-38" y1="38" x2="-50" y2="50" />
                <line x1="-52" y1="0" x2="-65" y2="0" />
                <line x1="-38" y1="-38" x2="-50" y2="-50" />
              </g>
              <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
                {currentDay.irradianceKwhPerM2}
              </text>
              <text x="0" y="70" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffca28">
                NASA POWER
              </text>
            </g>

            {/* PANEL SOLAR FOTOVOLTAICO CON ROTACIÓN TÁCTIL */}
            <g transform="translate(300, 240)">
              {/* Soporte mecánico */}
              <polygon points="-8,70 8,70 4,20 -4,20" fill="#37474f" stroke="#263238" strokeWidth="2" />
              <circle cx="0" cy="20" r="10" fill="#78909c" />

              {/* Placa de celda solar pivotante */}
              <g transform={`rotate(${-tiltAngle}, 0, 20)`}>
                <rect x="-80" y="-15" width="160" height="30" rx="4" fill="#0d233a" stroke="#4fc3f7" strokeWidth="2.5" />
                {/* Cuadrícula de celdas */}
                <line x1="-40" y1="-15" x2="-40" y2="15" stroke="#4fc3f7" strokeWidth="1" />
                <line x1="0" y1="-15" x2="0" y2="15" stroke="#4fc3f7" strokeWidth="1" />
                <line x1="40" y1="-15" x2="40" y2="15" stroke="#4fc3f7" strokeWidth="1" />
                <line x1="-80" y1="0" x2="80" y2="0" stroke="#4fc3f7" strokeWidth="1" />
              </g>

              <text x="0" y="105" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
                Inclinación: {tiltAngle}°
              </text>
              <text x="0" y="122" textAnchor="middle" fontSize="10" fill="#90caf9">
                {isOrientationGood ? "✓ Hacia el Norte Óptimo" : "Ajusta hacia 16°"}
              </text>
            </g>

            {/* CABLEADO: Del Panel al Interruptor */}
            <path
              d="M 300 260 L 300 360 L 440 360"
              fill="none"
              stroke={isSwitchClosed ? "#69f0ae" : "#37474f"}
              strokeWidth="5"
              className={isSwitchClosed ? "current-flow-arequipa" : undefined}
            />

            {/* INTERRUPTOR CENTRAL INTERACTIVO */}
            <g transform="translate(470, 360)">
              <rect x="-30" y="-20" width="60" height="40" rx="8" fill="#1e2c3a" stroke="#455a64" strokeWidth="2" />
              <circle cx="-15" cy="0" r="4" fill="#cfd8dc" />
              <circle cx="15" cy="0" r="4" fill="#cfd8dc" />

              {isSwitchClosed ? (
                <line x1="-15" y1="0" x2="15" y2="0" stroke="#00e676" strokeWidth="6" strokeLinecap="round" />
              ) : (
                <g>
                  <line x1="-15" y1="0" x2="10" y2="-22" stroke="#e53935" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="10" cy="-22" r="4" fill="#d32f2f" />
                </g>
              )}

              <text x="0" y="32" textAnchor="middle" fontSize="10" fontWeight="bold" fill={isSwitchClosed ? "#69f0ae" : "#ffb74d"}>
                {isSwitchClosed ? "CIRCUITO CERRADO" : "INTERRUPTOR ABIERTO"}
              </text>
            </g>

            {/* CABLEADO: A la batería */}
            <path
              d="M 500 360 L 640 360 L 640 300"
              fill="none"
              stroke={isSwitchClosed ? "#69f0ae" : "#37474f"}
              strokeWidth="5"
              className={isSwitchClosed ? "current-flow-arequipa" : undefined}
            />

            {/* BATERÍA Y ALMACENAMIENTO */}
            <g transform="translate(640, 200)">
              <rect x="-45" y="-70" width="90" height="140" rx="10" fill="#142333" stroke="#4a73a3" strokeWidth="3" />
              <rect x="-18" y="-80" width="36" height="10" rx="3" fill="#cfd8dc" />

              <rect
                x="-37"
                y={60 - (1.2 * batteryLevel)}
                width="74"
                height={1.2 * batteryLevel}
                rx="4"
                fill="url(#batteryGradArequipa)"
              />

              <text x="0" y="-10" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#ffffff">
                {batteryLevel}%
              </text>
              <text x="0" y="90" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
                Batería ({storedEnergyKwh} kWh)
              </text>
              <text x="0" y="106" textAnchor="middle" fontSize="10" fill="#80d8ff">
                Reserva: {reserveRatioPercent}%
              </text>
            </g>

            {/* MONITOR DE TELEMETRÍA Y POTENCIA */}
            <g transform="translate(790, 200)">
              <rect x="-40" y="-55" width="80" height="110" rx="8" fill="#1b2a3d" stroke="#395c86" strokeWidth="2" />
              <circle cx="0" cy="-20" r="16" fill={isTestPassed ? "#69f0ae" : "#37474f"} stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="-15" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#102033">
                {isTestPassed ? "ON" : "OFF"}
              </text>
              <text x="0" y="15" textAnchor="middle" fontSize="10" fill="#a4c9ef" fontWeight="bold">
                GENERACIÓN
              </text>
              <text x="0" y="32" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
                {totalDailyEnergyKwh} kWh
              </text>
              <text x="0" y="75" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isTestPassed ? "#69f0ae" : "#b0bec5"}>
                {isTestPassed ? "✓ CERTIFICADA" : "EN ESPERA"}
              </text>
            </g>
          </svg>
        </div>

        {/* CONTROLES DEL JUGADOR: ORIENTACIÓN Y RESERVA */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
          gap: '1rem',
          marginTop: '1rem',
          background: '#132338',
          border: '1px solid #325884',
          borderRadius: '0.8rem',
          padding: '1rem'
        }}>
          {/* Slider de Orientación */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
              <span>Orientación Panel:</span>
              <span style={{ color: isOrientationGood ? '#69f0ae' : '#ffb74d', fontFamily: 'Fredoka', fontSize: '1.15rem' }}>
                {tiltAngle}° hacia el Norte {isOrientationGood ? '(Óptimo)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={tiltAngle}
              onChange={(e) => {
                setTiltAngle(Number(e.target.value));
                if (isSwitchClosed) handleReset();
              }}
              style={{ width: '100%', accentColor: isOrientationGood ? '#69f0ae' : '#ffb74d', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#90caf9', marginTop: '0.2rem' }}>
              <span>0° (Horizontal)</span>
              <button
                type="button"
                className="callsign-chip"
                style={{ background: '#25446c', color: '#8ec5fc', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => {
                  setTiltAngle(16);
                  if (isSwitchClosed) handleReset();
                }}
              >
                16° (Óptimo Arequipa)
              </button>
              <span>50° (Inclinado)</span>
            </div>
          </div>

          {/* Slider de Decisión de Reserva para Baterías */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
              <span>Reserva Baterías Nocturnas:</span>
              <span style={{ color: isReserveOptimal ? '#69f0ae' : '#ffb74d', fontFamily: 'Fredoka', fontSize: '1.15rem' }}>
                {reserveRatioPercent}% ({storedEnergyKwh} kWh)
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="85"
              step="5"
              value={reserveRatioPercent}
              onChange={(e) => {
                setReserveRatioPercent(Number(e.target.value));
                if (isSwitchClosed) handleReset();
              }}
              style={{ width: '100%', accentColor: isReserveOptimal ? '#69f0ae' : '#ffb74d', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#90caf9', marginTop: '0.2rem' }}>
              <span>15% (Poco guardado)</span>
              <span style={{ color: '#ffd54f' }}>30% a 60% (Recomendado)</span>
              <span>85% (Exceso reserva)</span>
            </div>
          </div>
        </div>

        {/* DECISIÓN Y ACCIONES */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ fontSize: '0.88rem', color: '#c5cae9', display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <span>☀️ Diurno disponible: <strong>{daytimeAvailableKwh} kWh</strong></span>
            <span>🔋 Reserva nocturna: <strong style={{ color: isReserveOptimal ? '#69f0ae' : '#ffb74d' }}>{storedEnergyKwh} kWh</strong></span>
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

        {/* FEEDBACK Y ADVERTENCIAS */}
        {isSwitchClosed && !isTestPassed && (
          <div style={{
            background: '#331c1c',
            border: '2px solid #ef5350',
            borderRadius: '0.8rem',
            padding: '1rem',
            marginTop: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            color: '#ffcdd2',
            fontSize: '0.88rem'
          }}>
            <Warning size={28} color="#ef5350" weight="fill" />
            <div>
              <strong>¡Circuito subóptimo!</strong>
              <div style={{ marginTop: '0.2rem' }}>
                {!isOrientationGood && ` El panel está a ${tiltAngle}°; oriéntalo a 16° al Norte para captar la radiación de Arequipa.`}
                {isReserveTooLow && ' Reserva nocturna insuficiente (< 30%). La base se quedaría sin energía durante la noche andina.'}
                {isReserveTooHigh && ' Exceso de reserva (> 60%). La base diurna no tiene suficiente energía operativa.'}
                {' Ajusta los controles y reconecta el circuito.'}
              </div>
            </div>
          </div>
        )}

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
                Con el panel a {tiltAngle}° y una reserva equilibrada del {reserveRatioPercent}%, generaste <strong>{totalDailyEnergyKwh} kWh</strong> ({efficiencyPercent}% de rendimiento) con <strong>{storedEnergyKwh} kWh</strong> almacenados para la noche. Has asegurado los <strong>Paneles plegables</strong>.
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

        <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#9bc0e4', fontSize: '0.80rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={16} color="#f6c15b" />
            <span><strong>Dato NASA POWER verificado:</strong> Radiación global incidente (ALLSKY_SFC_SW_DWN) en Arequipa (-16.4090° S, -71.5375° O): {currentDay.irradianceKwhPerM2} kW-hr/m²/día en {currentDay.seasonLabel}.</span>
          </div>
          <div style={{ color: '#81d4fa', paddingLeft: '1.4rem' }}>
            <span><strong>Supuestos de la simulación educativa:</strong> La inclinación óptima de 16° (derivada de la latitud geográfica) y la eficiencia del panel al 22% son supuestos de ingeniería para calcular la conversión eléctrica en la base.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
