import { useState } from 'react';
import { ArrowLeft, Drop, CheckCircle, Sparkle, ArrowCounterClockwise, Info, Lightning, Warning } from '@phosphor-icons/react';
import '../screens/earth.css';

interface EclssTrainingGameProps {
  readonly onComplete: () => void;
  readonly onBack: () => void;
}

export function EclssTrainingGame({ onComplete, onBack }: EclssTrainingGameProps) {
  // Parámetros del circuito regenerativo ECLSS
  const [electrolysisWatts, setElectrolysisWatts] = useState<number>(200); // Rango óptimo: 300W a 420W
  const [isCo2ScrubberOn, setIsCo2ScrubberOn] = useState<boolean>(false);
  const [waterRecycleRate, setWaterRecycleRate] = useState<number>(70); // Rango óptimo: >= 85%
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Cálculos de telemetría ambiental
  const oxygenPercent = Number((18.0 + (electrolysisWatts / 100) * 0.9).toFixed(1));
  const co2Percent = isCo2ScrubberOn ? 0.04 : 1.85;
  const totalPowerConsumption = electrolysisWatts + (isCo2ScrubberOn ? 45 : 0) + Math.round(waterRecycleRate * 0.5);

  const isOxygenOptimal = oxygenPercent >= 20.4 && oxygenPercent <= 21.8;
  const isCo2Safe = co2Percent <= 0.10;
  const isPowerSafe = totalPowerConsumption <= 450;
  const isWaterOptimal = waterRecycleRate >= 80;

  const isSuccess = isSimulated && isOxygenOptimal && isCo2Safe && isPowerSafe && isWaterOptimal;

  function handleReset() {
    setElectrolysisWatts(200);
    setIsCo2ScrubberOn(false);
    setWaterRecycleRate(70);
    setIsSimulated(false);
  }

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Volver al Mapa</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Drop weight="fill" color="#4cc3d9" />
          <span>Hangar ECLSS · Soporte Vital Regenerativo en Circuito Cerrado</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Drop color="#4cc3d9" weight="fill" />
              <span>Soporte Vital Regenerativo (NASA ECLSS)</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              En una base espacial nada se desperdicia. Equilibra la electrólisis de agua (O₂) y el filtrado de CO₂ sin fundir la red eléctrica (máx 450 W).
            </p>
          </div>
        </div>

        {/* DIAGRAMA SVG DE CIRCUITO ECLSS */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 30%, #10263f 0%, #081422 100%)',
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
            aria-label="Circuito cerrado de reciclaje de agua y generación de oxígeno ECLSS"
          >
            <defs>
              <linearGradient id="pipeWater" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#29b6f6" />
                <stop offset="100%" stopColor="#0288d1" />
              </linearGradient>

              <linearGradient id="pipeOxygen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#81c784" />
                <stop offset="100%" stopColor="#388e3c" />
              </linearGradient>
            </defs>

            {/* TUBERÍAS DE CONEXIÓN */}
            <path d="M 180 180 L 330 180" stroke="#0288d1" strokeWidth="8" fill="none" strokeDasharray="6 4" />
            <path d="M 450 180 L 600 180" stroke="#388e3c" strokeWidth="8" fill="none" strokeDasharray="6 4" />
            <path d="M 600 240 L 450 330" stroke="#fbc02d" strokeWidth="6" fill="none" strokeDasharray="6 4" />

            {/* MÓDULO 1: Recuperador de Agua (Izquierda) */}
            <g transform="translate(130, 180)">
              <rect x="-65" y="-60" width="130" height="120" rx="12" fill="#162e4a" stroke="#29b6f6" strokeWidth="3" />
              <text x="0" y="-30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">Reciclador H₂O</text>
              <text x="0" y="0" textAnchor="middle" fontSize="30">💧</text>
              <text x="0" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isWaterOptimal ? "#69f0ae" : "#ffb74d"}>
                {waterRecycleRate}% Efic.
              </text>
              <text x="0" y="48" textAnchor="middle" fontSize="9" fill="#90caf9">Recuperación</text>
            </g>

            {/* MÓDULO 2: Reactor de Electrólisis (Centro) */}
            <g transform="translate(390, 180)">
              <rect x="-70" y="-70" width="140" height="140" rx="14" fill="#1b395a" stroke={isOxygenOptimal ? "#69f0ae" : "#f6c15b"} strokeWidth={isOxygenOptimal ? 4 : 2.5} />
              <text x="0" y="-40" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">Electrólisis OGA</text>
              <text x="0" y="-10" textAnchor="middle" fontSize="32">⚡</text>
              <text x="0" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill={isOxygenOptimal ? "#69f0ae" : "#ffb74d"}>
                {oxygenPercent}% O₂
              </text>
              <text x="0" y="40" textAnchor="middle" fontSize="10" fill="#b0bec5">
                Consumo: {electrolysisWatts} W
              </text>
            </g>

            {/* MÓDULO 3: Filtro Scrubber de CO2 (Derecha) */}
            <g transform="translate(650, 180)">
              <rect x="-65" y="-60" width="130" height="120" rx="12" fill={isCo2ScrubberOn ? "#1a4030" : "#372424"} stroke={isCo2ScrubberOn ? "#69f0ae" : "#ef5350"} strokeWidth={3} />
              <text x="0" y="-30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">Filtro CO₂ CDRA</text>
              <text x="0" y="0" textAnchor="middle" fontSize="28">{isCo2ScrubberOn ? "🌬️" : "⛔"}</text>
              <text x="0" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isCo2Safe ? "#69f0ae" : "#ef5350"}>
                {co2Percent}% CO₂
              </text>
              <text x="0" y="46" textAnchor="middle" fontSize="9" fill={isCo2ScrubberOn ? "#69f0ae" : "#ef5350"}>
                {isCo2ScrubberOn ? "ACTIVO (45W)" : "APAGADO"}
              </text>
            </g>

            {/* MONITOR DE POTENCIA TOTAL INFERIOR */}
            <g transform="translate(450, 370)">
              <rect x="-200" y="-25" width="400" height="50" rx="10" fill="#0d1c2d" stroke="#375a82" strokeWidth="2" />
              <text x="-160" y="5" fontSize="12" fill="#b0bec5">Carga Eléctrica:</text>
              <text x="-60" y="5" fontSize="14" fontWeight="bold" fill={isPowerSafe ? "#69f0ae" : "#ef5350"}>
                {totalPowerConsumption} W / 450 W máx
              </text>
              <circle cx="140" cy="0" r="10" fill={isPowerSafe ? "#2e7d32" : "#c62828"} />
              <text x="140" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">
                {isPowerSafe ? "OK" : "!"}
              </text>
            </g>
          </svg>
        </div>

        {/* CONTROLES INTERACTIVOS */}
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
          {/* Potencia Electrólisis */}
          <div>
            <label htmlFor="watts-slider" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
              <span>Potencia Electrólisis (O₂):</span>
              <span style={{ color: isOxygenOptimal ? '#69f0ae' : '#ffb74d', fontFamily: 'Fredoka', fontSize: '1.2rem' }}>
                {electrolysisWatts} W ({oxygenPercent}% O₂)
              </span>
            </label>
            <input
              id="watts-slider"
              type="range"
              min="150"
              max="550"
              step="10"
              value={electrolysisWatts}
              onChange={(e) => {
                setElectrolysisWatts(Number(e.target.value));
                setIsSimulated(false);
              }}
              style={{ width: '100%', accentColor: isOxygenOptimal ? '#69f0ae' : '#ffb74d', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#90caf9', marginTop: '0.2rem' }}>
              <span>150 W (Bajo O₂)</span>
              <span style={{ color: '#ffd54f' }}>340 W (21.0% O₂ óptimo)</span>
              <span>550 W (Sobrecarga)</span>
            </div>
          </div>

          {/* Filtro Scrubber CO2 y Reciclaje de Agua */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>Filtro Scrubber de CO₂:</span>
              <button
                type="button"
                className="callsign-chip"
                style={{
                  background: isCo2ScrubberOn ? '#1b5e20' : '#422424',
                  color: isCo2ScrubberOn ? '#b9f6ca' : '#ffcdd2',
                  border: `1px solid ${isCo2ScrubberOn ? '#69f0ae' : '#ef5350'}`
                }}
                onClick={() => {
                  setIsCo2ScrubberOn(!isCo2ScrubberOn);
                  setIsSimulated(false);
                }}
              >
                {isCo2ScrubberOn ? '✓ Scrubber ACTIVO (+45 W)' : '⛔ Scrubber APAGADO'}
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#ffffff', marginBottom: '0.2rem' }}>
                <span>Tasa Reciclaje de Agua:</span>
                <span style={{ color: isWaterOptimal ? '#69f0ae' : '#ffb74d', fontWeight: 700 }}>{waterRecycleRate}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="98"
                value={waterRecycleRate}
                onChange={(e) => {
                  setWaterRecycleRate(Number(e.target.value));
                  setIsSimulated(false);
                }}
                style={{ width: '100%', accentColor: '#4cc3d9', cursor: 'pointer' }}
              />
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
          <div style={{ fontSize: '0.88rem', color: '#c5cae9' }}>
            <span>Carga Total: </span>
            <strong style={{ color: isPowerSafe ? '#69f0ae' : '#ef5350' }}>{totalPowerConsumption} W</strong>
            <span style={{ fontSize: '0.8rem', color: '#9fa8da', marginLeft: '0.4rem' }}>
              (Consumo equilibrado de soporte vital)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              className="facility-card__btn facility-card__btn--gold"
              onClick={() => setIsSimulated(true)}
            >
              <Lightning weight="fill" />
              <span>Verificar Circuito ECLSS</span>
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

        {/* FEEDBACK */}
        {isSimulated && !isSuccess && (
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
              <strong>¡Parámetros fuera de balance!</strong>
              <div style={{ marginTop: '0.2rem' }}>
                {!isCo2ScrubberOn && ' El filtro de CO₂ está apagado; el aire se volvería tóxico rápidamente.'}
                {!isOxygenOptimal && ` El O₂ (${oxygenPercent}%) no está en el rango óptimo (20.5% - 21.5%).`}
                {!isWaterOptimal && ' La recuperación de agua es muy baja (< 80%); se agotarían las reservas.'}
                {!isPowerSafe && ` Consumo excesivo (${totalPowerConsumption} W > 450 W); riesgo de corte eléctrico.`}
                {' Ajusta los controles y vuelve a probar.'}
              </div>
            </div>
          </div>
        )}

        {isSuccess && (
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
                <CheckCircle weight="fill" size={22} /> ¡Circuito ECLSS Calibrado con Éxito!
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                Alcanzaste {oxygenPercent}% de O₂, eliminaste el CO₂ a {co2Percent}% y reciclaste el {waterRecycleRate}% del agua con un consumo seguro de {totalPowerConsumption} W. Has asegurado el <strong>Kit de soporte vital</strong>.
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
          <span>NASA ECLSS (Environmental Control and Life Support System): En la ISS se recicla más del 98% de la orina y la condensación del aire en agua potable, y el generador OGA produce el oxígeno que respira la tripulación.</span>
        </div>
      </main>
    </div>
  );
}
