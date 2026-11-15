import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { useState } from 'react';
import { ArrowLeft, PottedPlant, CheckCircle, Sparkle, ArrowCounterClockwise, Info, Warning } from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import '../screens/earth.css';

interface VeggieLabGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

export function VeggieLabGame({ onComplete, onBack }: VeggieLabGameProps) {
  const { t } = useI18n();
  // Parámetros de cultivo espacial
  const [redSpectrum, setRedSpectrum] = useState<number>(50); // Óptimo: 65% a 75%
  const [blueSpectrum, setBlueSpectrum] = useState<number>(50); // Óptimo: 25% a 35%
  const [nutrientDose, setNutrientDose] = useState<'LOW' | 'OPTIMAL' | 'HIGH'>('LOW');
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Cálculos de salud botánica espacial
  const isRedOptimal = redSpectrum >= 65 && redSpectrum <= 75;
  const isBlueOptimal = blueSpectrum >= 25 && blueSpectrum <= 35;
  const isNutrientOptimal = nutrientDose === 'OPTIMAL';

  const photosynRate = Math.round(
    (isRedOptimal ? 50 : 25) +
    (isBlueOptimal ? 30 : 15) +
    (isNutrientOptimal ? 20 : (nutrientDose === 'HIGH' ? 10 : 5))
  );

  const waterCostLiters = nutrientDose === 'HIGH' ? 65 : (nutrientDose === 'OPTIMAL' ? 35 : 15);
  const isWaterSafe = waterCostLiters <= 40;

  const isSuccess = isSimulated && photosynRate >= 90 && isNutrientOptimal;

  function handleReset() {
    setRedSpectrum(50);
    setBlueSpectrum(50);
    setNutrientDose('LOW');
    setIsSimulated(false);
  }

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <PottedPlant weight="fill" color="#81c784" />
          <span>{t('minigames.veggieLab.title')}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <PottedPlant color="#81c784" weight="fill" />
              <span>Laboratorio Veggie: Espectro LED y Nutrientes Espaciales</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              En el espacio no hay luz solar directa para plantas. Calibra los LEDs Rojos (660 nm) y Azules (430 nm) y raciona la solución nutritiva.
            </p>
          </div>
        </div>

        {/* CÁMARA DE CULTIVO HIDROPÓNICO SVG */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 30%, #172c3d 0%, #091520 100%)',
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
            aria-label="Cámara hidropónica de cultivo Veggie de la NASA"
          >
            <defs>
              <linearGradient id="ledGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={`rgb(${Math.round(redSpectrum * 2.5)}, 20, ${Math.round(blueSpectrum * 4)})`} stopOpacity="0.8" />
                <stop offset="100%" stopColor="#172c3d" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Lámpara de LEDs en el techo */}
            <rect x="250" y="30" width="400" height="40" rx="8" fill="#263238" stroke="#455a64" strokeWidth="2" />
            {/* Diodos emisores */}
            {Array.from({ length: 12 }).map((_, i) => (
              <circle
                key={i}
                cx={280 + i * 31}
                cy={50}
                r={7}
                fill={i % 3 === 0 ? "#42a5f5" : "#ef5350"}
                opacity={0.9}
              />
            ))}

            {/* Haz de luz de espectro combinado sobre las plantas */}
            <polygon
              points="260,70 640,70 720,330 180,330"
              fill="url(#ledGlowGrad)"
            />

            {/* Bandeja hidropónica con raíces en solución */}
            <rect x="200" y="320" width="500" height="70" rx="10" fill="#1b2a3a" stroke="#375577" strokeWidth="3" />
            <rect x="220" y="350" width="460" height="25" rx="5" fill="#0288d1" opacity="0.6" />
            <text x="450" y="367" textAnchor="middle" fontSize="11" fill="#e1f5fe" fontWeight="bold">
              Solución Nutritiva Hidropónica (Sin Tierra)
            </text>

            {/* Plantas de lechuga espacial */}
            {[-140, -70, 0, 70, 140].map((offsetX, idx) => (
              <g key={idx} transform={`translate(${450 + offsetX}, 320)`}>
                {/* Tallo y hojas con tamaño según tasa fotosintética */}
                <ellipse cx="0" cy={-15 - (photosynRate * 0.15)} rx={14 + (photosynRate * 0.15)} ry={18 + (photosynRate * 0.2)} fill={photosynRate >= 80 ? "#4caf50" : (photosynRate >= 50 ? "#8bc34a" : "#cddc39")} />
                <ellipse cx="-12" cy={-10 - (photosynRate * 0.1)} rx={10 + (photosynRate * 0.1)} ry={14 + (photosynRate * 0.15)} fill={photosynRate >= 80 ? "#388e3c" : "#7cb342"} />
                <ellipse cx="12" cy={-10 - (photosynRate * 0.1)} rx={10 + (photosynRate * 0.1)} ry={14 + (photosynRate * 0.15)} fill={photosynRate >= 80 ? "#2e7d32" : "#689f38"} />
              </g>
            ))}

            {/* MONITOR DE FOTOSÍNTESIS DERECHA */}
            <g transform="translate(780, 180)">
              <rect x="-60" y="-70" width="120" height="140" rx="10" fill="#102030" stroke="#2e5077" strokeWidth="2" />
              <text x="0" y="-45" textAnchor="middle" fontSize="10" fill="#90caf9" fontWeight="bold">FOTOSÍNTESIS</text>
              <circle cx="0" cy="-5" r="32" fill="#172b40" stroke={photosynRate >= 90 ? "#69f0ae" : "#f6c15b"} strokeWidth="3" />
              <text x="0" y="2" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ffffff">{photosynRate}%</text>
              <text x="0" y="45" textAnchor="middle" fontSize="11" fontWeight="bold" fill={photosynRate >= 90 ? "#69f0ae" : "#ffb74d"}>
                {photosynRate >= 90 ? "ÓPTIMA" : "DEFICIENTE"}
              </text>
            </g>
          </svg>
        </div>

        {/* CONTROLES DE ESPECTRO Y NUTRIENTES */}
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
          {/* Espectro LED Rojo y Azul */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
              <span>Espectro Lumínico LED:</span>
              <span style={{ color: isRedOptimal && isBlueOptimal ? '#69f0ae' : '#ffb74d', fontFamily: 'Fredoka' }}>
                {redSpectrum}% Rojo · {blueSpectrum}% Azul
              </span>
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ff8a80' }}>
                <span>Luz Roja (660 nm - Biomasa):</span>
                <span>{redSpectrum}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={redSpectrum}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRedSpectrum(val);
                  setBlueSpectrum(100 - val);
                  setIsSimulated(false);
                }}
                style={{ width: '100%', accentColor: '#ef5350', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#90caf9' }}>
              <span>Busca el punto donde las plantas crecen mejor.</span>
            </div>
          </div>

          {/* Dosificación Nutritiva con Costo de Agua */}
          <div>
            <span style={{ display: 'block', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
              Ración de Agua y Sales Nutritivas:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="callsign-chip"
                style={{
                  background: nutrientDose === 'LOW' ? '#263b50' : '#142333',
                  color: nutrientDose === 'LOW' ? '#ffd54f' : '#b0bec5',
                  border: `1px solid ${nutrientDose === 'LOW' ? '#ffd54f' : '#37474f'}`
                }}
                onClick={() => {
                  setNutrientDose('LOW');
                  setIsSimulated(false);
                }}
              >
                Baja (15 L/sem · Hojas secas)
              </button>
              <button
                type="button"
                className="callsign-chip"
                style={{
                  background: nutrientDose === 'OPTIMAL' ? '#1b5e20' : '#142333',
                  color: nutrientDose === 'OPTIMAL' ? '#b9f6ca' : '#b0bec5',
                  border: `1px solid ${nutrientDose === 'OPTIMAL' ? '#69f0ae' : '#37474f'}`
                }}
                onClick={() => {
                  setNutrientDose('OPTIMAL');
                  setIsSimulated(false);
                }}
              >
                Media (35 L por semana)
              </button>
              <button
                type="button"
                className="callsign-chip"
                style={{
                  background: nutrientDose === 'HIGH' ? '#422424' : '#142333',
                  color: nutrientDose === 'HIGH' ? '#ef9a9a' : '#b0bec5',
                  border: `1px solid ${nutrientDose === 'HIGH' ? '#ef5350' : '#37474f'}`
                }}
                onClick={() => {
                  setNutrientDose('HIGH');
                  setIsSimulated(false);
                }}
              >
                Excesiva (65 L/sem · Agota reserva)
              </button>
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
            <span>Gasto Hídrico: </span>
            <strong style={{ color: isWaterSafe ? '#69f0ae' : '#ef5350' }}>{waterCostLiters} Litros/semana</strong>
            <span style={{ fontSize: '0.8rem', color: '#9fa8da', marginLeft: '0.4rem' }}>
              (Presupuesto límite de base: ≤ 40 L)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              className="facility-card__btn facility-card__btn--gold"
              onClick={() => setIsSimulated(true)}
            >
              <PottedPlant weight="fill" />
              <span>Verificar Crecimiento Veggie</span>
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
              <strong>¡Cultivo no equilibrado!</strong>
              <div style={{ marginTop: '0.2rem' }}>
                {!isRedOptimal && ' El espectro rojo debe estar cerca del 70% para maximizar la fotosíntesis.'}
                {!isBlueOptimal && ' El espectro azul debe estar cerca del 30% para la estructura de las hojas.'}
                {nutrientDose === 'LOW' && ' La ración nutritiva es insuficiente; las plantas no crecen.'}
                {nutrientDose === 'HIGH' && ' Ración excesiva de agua; sobrepasa el presupuesto de la base.'}
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
                <CheckCircle weight="fill" size={22} /> ¡Cultivos Veggie Certificados con Éxito!
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                Con 70% Rojo y 30% Azul lograste {photosynRate}% de tasa fotosintética y un gasto controlado de {waterCostLiters} L de agua. Has asegurado el <strong>Kit de cultivos</strong> para la misión espacial.
              </p>
            </div>
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.75rem 1.6rem' }}
              onClick={() => onComplete(createTrainingOutcome('VEGGIE_LAB', `Riego ${waterCostLiters} L, luz ${redSpectrum}% roja`, 'foodSupply', calculateTrainingCost('VEGGIE_LAB', redSpectrum), 'La prueba usa parte de las raciones de cultivo.'))}
            >
              <Sparkle weight="fill" />
              <span>Confirmar costo de {(calculateTrainingCost('VEGGIE_LAB', redSpectrum))} punto(s) de Alimentos y obtener el kit</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9bc0e4', fontSize: '0.82rem' }}>
          <Info size={16} color="#f6c15b" />
          <span>NASA Veggie & Advanced Plant Habitat: Los astronautas en la ISS cosechan lechugas rojas y flores zinnias utilizando luces LED ajustadas a las bandas de absorción fotosintética de las plantas.</span>
        </div>
      </main>
    </div>
  );
}
