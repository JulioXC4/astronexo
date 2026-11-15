import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { useState } from 'react';
import { ArrowLeft, Wind, CheckCircle, Sparkle, ArrowCounterClockwise, Info, ShieldCheck, Warning } from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import '../screens/earth.css';

interface AltitudeAcclimatizationGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

export function AltitudeAcclimatizationGame({ onComplete, onBack }: AltitudeAcclimatizationGameProps) {
  const { t } = useI18n();
  // Parámetros de la cámara hipobárica
  const [pressureKpa, setPressureKpa] = useState<number>(62); // Rango seguro: 70 a 82 kPa (atmósfera de cabina espacial / ISS adaptada)
  const [sealMain, setSealMain] = useState<boolean>(false);
  const [sealHatch, setSealHatch] = useState<boolean>(false);
  const [sealNitrogen, setSealNitrogen] = useState<boolean>(false);
  const [isTested, setIsTested] = useState<boolean>(false);

  // Evaluación de sellos y presurización
  const sealsCount = (sealMain ? 1 : 0) + (sealHatch ? 1 : 0) + (sealNitrogen ? 1 : 0);
  const sealsIntegrityPercent = Math.round((sealsCount / 3) * 100);

  const isPressureOptimal = pressureKpa >= 70 && pressureKpa <= 82;
  const isHypoxiaRisk = pressureKpa < 70;
  const isOverpressureRisk = pressureKpa > 85;
  const allSealsSecured = sealsCount === 3;

  // Costo aplicado: gas de prueba consumido (30% base + sobrecosto por exceso o fuga)
  const gasCostPercent = 30 + Math.round((pressureKpa - 50) * 0.6) + (!allSealsSecured ? 20 : 0);
  const isGasSafe = gasCostPercent <= 65;

  const isMissionPassed = isTested && isPressureOptimal && allSealsSecured && isGasSafe;

  function handleReset() {
    setPressureKpa(62);
    setSealMain(false);
    setSealHatch(false);
    setSealNitrogen(false);
    setIsTested(false);
  }

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Wind weight="fill" color="#80d8ff" />
          <span>{t('minigames.altitudeAcclimatization.title')}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Wind color="#80d8ff" weight="fill" />
              <span>Aclimatación de Altura: Presurización y Sellos Herméticos</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              En Arequipa la atmósfera es delgada. Calibra la presión de cabina (70-82 kPa) y asegura los 3 sellos herméticos sin agotar los tanques de gas.
            </p>
          </div>
        </div>

        {/* ESCENARIO DE LA CÁMARA SVG INTERACTIVA */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 40%, #152d47 0%, #0b1724 100%)',
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
            aria-label="Cámara hipobárica de presurización y sellado hermético"
          >
            <defs>
              <linearGradient id="chamberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1f3b5c" />
                <stop offset="100%" stopColor="#122538" />
              </linearGradient>

              <radialGradient id="airGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#80d8ff" stopOpacity={isPressureOptimal ? 0.35 : 0.15} />
                <stop offset="100%" stopColor="#80d8ff" stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* Cápsula de prueba / Esclusa */}
            <rect x="220" y="40" width="460" height="340" rx="30" fill="url(#chamberGrad)" stroke="#3f6c9c" strokeWidth="4" />
            <ellipse cx="450" cy="210" rx="200" ry="140" fill="url(#airGlow)" />

            {/* Escotilla central circular */}
            <circle cx="450" cy="200" r="95" fill="#142639" stroke={allSealsSecured ? "#69f0ae" : "#f6c15b"} strokeWidth="5" />
            <circle cx="450" cy="200" r="75" fill="none" stroke="#2a4a6e" strokeWidth="2" strokeDasharray="6 4" />
            <text x="450" y="195" textAnchor="middle" fontSize="38">👨‍🚀</text>
            <text x="450" y="235" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isPressureOptimal ? "#69f0ae" : "#ffb74d"}>
              {pressureKpa} kPa
            </text>

            {/* SELLO 1: Válvula Principal (Izquierda) */}
            <g transform="translate(130, 140)">
              <rect x="-60" y="-35" width="120" height="70" rx="10" fill={sealMain ? "#183b2e" : "#243447"} stroke={sealMain ? "#69f0ae" : "#ffb74d"} strokeWidth="2" />
              <text x="0" y="-12" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">Sello Principal</text>
              <text x="0" y="8" textAnchor="middle" fontSize="18">{sealMain ? "🔒" : "🔓"}</text>
              <text x="0" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill={sealMain ? "#69f0ae" : "#ffa726"}>
                {sealMain ? "HERMÉTICO" : "ABIERTO"}
              </text>
            </g>

            {/* SELLO 2: Escotilla Exterior (Superior) */}
            <g transform="translate(450, 25)">
              <rect x="-65" y="-15" width="130" height="30" rx="6" fill={sealHatch ? "#183b2e" : "#243447"} stroke={sealHatch ? "#69f0ae" : "#ffb74d"} strokeWidth="2" />
              <text x="0" y="5" textAnchor="middle" fontSize="10" fontWeight="bold" fill={sealHatch ? "#69f0ae" : "#ffffff"}>
                {sealHatch ? "✓ ESCOTILLA SELLADA" : "⚠ ESCOTILLA EXPUESTA"}
              </text>
            </g>

            {/* SELLO 3: Retorno de Nitrógeno (Derecha) */}
            <g transform="translate(770, 140)">
              <rect x="-60" y="-35" width="120" height="70" rx="10" fill={sealNitrogen ? "#183b2e" : "#243447"} stroke={sealNitrogen ? "#69f0ae" : "#ffb74d"} strokeWidth="2" />
              <text x="0" y="-12" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">Retorno N₂</text>
              <text x="0" y="8" textAnchor="middle" fontSize="18">{sealNitrogen ? "🔒" : "🔓"}</text>
              <text x="0" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill={sealNitrogen ? "#69f0ae" : "#ffa726"}>
                {sealNitrogen ? "HERMÉTICO" : "ABIERTO"}
              </text>
            </g>

            {/* PANEL DE MONITOREO INFERIOR */}
            <g transform="translate(450, 340)">
              <rect x="-180" y="-25" width="360" height="50" rx="10" fill="#0d1b2a" stroke="#2f5580" strokeWidth="2" />
              <text x="-150" y="5" fontSize="11" fill="#b0bec5">Presión:</text>
              <text x="-95" y="5" fontSize="13" fontWeight="bold" fill={isPressureOptimal ? "#69f0ae" : (isHypoxiaRisk ? "#ffa726" : "#ef5350")}>
                {isPressureOptimal ? "Óptima (76 kPa)" : (isHypoxiaRisk ? "Baja (Hipoxia)" : "Sobrepresión")}
              </text>

              <text x="20" y="5" fontSize="11" fill="#b0bec5">Sellos:</text>
              <text x="70" y="5" fontSize="13" fontWeight="bold" fill={allSealsSecured ? "#69f0ae" : "#ffa726"}>
                {sealsIntegrityPercent}% ({sealsCount}/3)
              </text>
            </g>
          </svg>
        </div>

        {/* CONTROLES DE LA INTERACCIÓN */}
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
          {/* Slider de Presurización */}
          <div>
            <label htmlFor="pressure-slider" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
              <span>Presión de Cabina:</span>
              <span style={{ color: isPressureOptimal ? '#69f0ae' : '#ffb74d', fontFamily: 'Fredoka', fontSize: '1.2rem' }}>
                {pressureKpa} kPa {isPressureOptimal ? '(Rango Óptimo)' : ''}
              </span>
            </label>
            <input
              id="pressure-slider"
              type="range"
              min="50"
              max="100"
              value={pressureKpa}
              onChange={(e) => {
                setPressureKpa(Number(e.target.value));
                setIsTested(false);
              }}
              style={{ width: '100%', accentColor: isPressureOptimal ? '#69f0ae' : '#ffb74d', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#90caf9', marginTop: '0.2rem' }}>
              <span>50 kPa (Monte Everest)</span>
              <span style={{ color: '#ffd54f' }}>76 kPa (Cabina recomendada)</span>
              <span>101 kPa (Nivel del mar)</span>
            </div>
          </div>

          {/* Botones de sellado de las 3 válvulas */}
          <div>
            <span style={{ display: 'block', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
              Activar Sellos de Esclusa:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="callsign-chip"
                style={{
                  background: sealMain ? '#1b5e20' : '#263b50',
                  color: sealMain ? '#b9f6ca' : '#e0e0e0',
                  border: `1px solid ${sealMain ? '#69f0ae' : '#455a64'}`
                }}
                onClick={() => {
                  setSealMain(!sealMain);
                  setIsTested(false);
                }}
              >
                {sealMain ? '✓ Sello Principal' : '○ Sello Principal'}
              </button>

              <button
                type="button"
                className="callsign-chip"
                style={{
                  background: sealHatch ? '#1b5e20' : '#263b50',
                  color: sealHatch ? '#b9f6ca' : '#e0e0e0',
                  border: `1px solid ${sealHatch ? '#69f0ae' : '#455a64'}`
                }}
                onClick={() => {
                  setSealHatch(!sealHatch);
                  setIsTested(false);
                }}
              >
                {sealHatch ? '✓ Escotilla Exterior' : '○ Escotilla Exterior'}
              </button>

              <button
                type="button"
                className="callsign-chip"
                style={{
                  background: sealNitrogen ? '#1b5e20' : '#263b50',
                  color: sealNitrogen ? '#b9f6ca' : '#e0e0e0',
                  border: `1px solid ${sealNitrogen ? '#69f0ae' : '#455a64'}`
                }}
                onClick={() => {
                  setSealNitrogen(!sealNitrogen);
                  setIsTested(false);
                }}
              >
                {sealNitrogen ? '✓ Retorno N₂' : '○ Retorno N₂'}
              </button>
            </div>
          </div>
        </div>

        {/* DECISIÓN Y BOTONES DE PRUEBA */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ fontSize: '0.88rem', color: '#c5cae9' }}>
            <span>Consumo de gas de prueba: </span>
            <strong style={{ color: isGasSafe ? '#69f0ae' : '#ef5350' }}>{gasCostPercent}% de reserva</strong>
            <span style={{ fontSize: '0.8rem', color: '#9fa8da', marginLeft: '0.4rem' }}>
              (Límite de seguridad: ≤ 65%)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              className="facility-card__btn facility-card__btn--gold"
              onClick={() => setIsTested(true)}
            >
              <ShieldCheck weight="fill" />
              <span>Verificar Hermeticidad</span>
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

        {/* FEEDBACK Y RESULTADO DE LA MISIÓN */}
        {isTested && !isMissionPassed && (
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
              <strong>¡La verificación falló!</strong>
              <div style={{ marginTop: '0.2rem' }}>
                {!allSealsSecured && ' Faltan sellos herméticos por asegurar.'}
                {isHypoxiaRisk && ' La presión es demasiado baja (< 70 kPa): riesgo de hipoxia para la tripulación.'}
                {isOverpressureRisk && ' La presión es excesiva (> 85 kPa): riesgo de rotura de juntas mecánicas.'}
                {!isGasSafe && ' Se consumió demasiado gas de calibración.'}
                {' Ajusta los controles y vuelve a probar.'}
              </div>
            </div>
          </div>
        )}

        {isMissionPassed && (
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
                <CheckCircle weight="fill" size={22} /> ¡Sellado Hermético y Presurización Certificados!
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                Presurizaste la cámara a {pressureKpa} kPa con los 3 sellos herméticos activos y solo consumiste {gasCostPercent}% de gas. Has asegurado el <strong>Kit de soporte vital</strong> para la misión espacial.
              </p>
            </div>
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.75rem 1.6rem' }}
              onClick={() => onComplete(createTrainingOutcome('ALTITUDE_ACCLIMATIZATION', `Gas ${gasCostPercent}%`, 'oxygen', calculateTrainingCost('ALTITUDE_ACCLIMATIZATION', gasCostPercent), 'El gas de prueba reduce la reserva respirable.'))}
            >
              <Sparkle weight="fill" />
              <span>Confirmar costo de {(calculateTrainingCost('ALTITUDE_ACCLIMATIZATION', gasCostPercent))} punto(s) de Oxígeno y obtener el kit</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9bc0e4', fontSize: '0.82rem' }}>
          <Info size={16} color="#f6c15b" />
          <span>Medicina Aeroespacial de Altura: En la Luna la presión exterior es 0 kPa. Entrenar en Arequipa (~77 kPa) simula el gradiente barométrico y enseña a evitar fugas sin malgastar reservas de gas.</span>
        </div>
      </main>
    </div>
  );
}
