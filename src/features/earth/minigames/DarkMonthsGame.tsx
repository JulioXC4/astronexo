import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { useState } from 'react';
import { ArrowLeft, Snowflake, BatteryCharging, CheckCircle, Sparkle, ArrowCounterClockwise, Info } from '@phosphor-icons/react';
import { TROMSO_SOLAR_RECORDS } from '../../../data/nasa/powerData';
import { useI18n, LanguageSelector } from '../../../i18n';
import '../screens/earth.css';

interface DarkMonthsGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

export function DarkMonthsGame({ onComplete, onBack }: DarkMonthsGameProps) {
  const { t } = useI18n();
  // Distribución de energía en porcentaje (total debe ser 100%)
  const [thermalHeat, setThermalHeat] = useState<number>(55);
  const [bioLighting, setBioLighting] = useState<number>(30);
  const [telemetry, setTelemetry] = useState<number>(15);
  const [isTested, setIsTested] = useState<boolean>(false);

  // Datos reales de Tromsø en diciembre (Noche polar)
  const polarNightRecord = TROMSO_SOLAR_RECORDS.days[2];

  function handleAutoBalance() {
    setThermalHeat(55);
    setBioLighting(30);
    setTelemetry(15);
    setIsTested(false);
  }

  function handleSimulatePolarNight() {
    setIsTested(true);
  }

  // Criterios de éxito:
  // Calefacción mínima requerida: >= 50% (evita congelamiento del hábitat)
  // Iluminación biológica mínima: >= 20% (evita muerte de plantas)
  // Telemetría mínima: >= 10% (mantiene comunicaciones con la Tierra)
  const isHeatingSafe = thermalHeat >= 50;
  const isBioSafe = bioLighting >= 20;
  const isTelemetrySafe = telemetry >= 10;
  const isSuccess = isHeatingSafe && isBioSafe && isTelemetrySafe;

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Snowflake weight="fill" color="#80d8ff" />
          <span>{t('minigames.darkMonths.title')} · NASA POWER (Tromsø)</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Snowflake color="#80d8ff" weight="fill" />
            <span>{t('minigames.darkMonths.title')}</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              {t('minigames.darkMonths.subtitle')}
            </p>
          </div>

          <div style={{
            background: '#0d1b2a',
            border: '1px solid #4fc3f7',
            borderRadius: '0.8rem',
            padding: '0.4rem 0.8rem',
            textAlign: 'right'
          }}>
              <span style={{ fontSize: '0.75rem', color: '#80d8ff', fontWeight: 700 }}>{t('minigames.darkMonths.solstice')}</span>
            <div style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#ffffff' }}>
              {polarNightRecord.irradianceKwhPerM2} kWh/m² · 0h Sol
            </div>
          </div>
        </div>

        {/* ESCENARIO SVG DEL BANCO CRIOGÉNICO Y HÁBITAT POLAR */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 30%, #10263f 0%, #050d18 100%)',
          border: '2px solid #33618d',
          borderRadius: '1rem',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '22rem',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)'
        }}>
          <svg
            viewBox="0 0 900 460"
            style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
            role="img"
            aria-label={t('minigames.darkMonths.scenarioAria')}
          >
            {/* Cielo nocturno polar con aurora boreal estilizada */}
            <path
              d="M 50 80 Q 250 30 500 70 T 850 40"
              fill="none"
              stroke="rgba(105, 240, 174, 0.45)"
              strokeWidth="28"
              filter="blur(10px)"
            />
            <path
              d="M 80 100 Q 350 40 600 90 T 900 60"
              fill="none"
              stroke="rgba(128, 216, 255, 0.35)"
              strokeWidth="20"
              filter="blur(8px)"
            />
            <text x="450" y="35" textAnchor="middle" fontSize="12" fill="#b9f6ca" fontWeight="bold" letterSpacing="0.1em">
              {t('minigames.darkMonths.svgPolarNight')}
            </text>

            {/* Suelo cubierto de nieve/regolito frío */}
            <rect x="0" y="240" width="900" height="220" fill="#0d1e31" stroke="#224263" strokeWidth="2" />

            {/* BANCO CENTRAL DE BATERÍAS */}
            <g transform="translate(180, 260)">
              <rect x="-65" y="-80" width="130" height="150" rx="10" fill="#14263b" stroke="#80d8ff" strokeWidth="3" />
              <rect x="-24" y="-92" width="48" height="12" rx="3" fill="#cfd8dc" />
              <rect x="-24" y="-62" width="48" height="37" rx="5" fill="#83cbd3" stroke="#e4f1e9" strokeWidth="3" />
              <path d="m4-56-14 16h11l-5 11 15-17H0Z" fill="#f6c15b" />
              <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">
                {t('minigames.darkMonths.batteryBank')}
              </text>
              <text x="0" y="25" textAnchor="middle" fontSize="10" fill="#80d8ff" fontWeight="bold">
                {t('minigames.darkMonths.batteryFull')}
              </text>
            </g>

            {/* LÍNEAS DE FLUJO DE ENERGÍA */}
            {/* Hacia Calefacción */}
            <path
              d="M 245 230 L 400 180"
              fill="none"
              stroke={isHeatingSafe ? "#ff7043" : "#d32f2f"}
              strokeWidth="5"
              strokeDasharray="6 4"
            />
            {/* Hacia Bio-Iluminación */}
            <path
              d="M 245 260 L 580 260"
              fill="none"
              stroke={isBioSafe ? "#69f0ae" : "#d32f2f"}
              strokeWidth="5"
              strokeDasharray="6 4"
            />
            {/* Hacia Telemetría */}
            <path
              d="M 245 290 L 750 340"
              fill="none"
              stroke={isTelemetrySafe ? "#4fc3f7" : "#d32f2f"}
              strokeWidth="5"
              strokeDasharray="6 4"
            />

            {/* 1. MÓDULO DE CALEFACCIÓN TÉRMICA */}
            <g transform="translate(460, 180)">
              <rect x="-65" y="-45" width="130" height="90" rx="8" fill="#1e2c3d" stroke="#ff7043" strokeWidth="2" />
              <text x="0" y="-18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffab91">
                {t('minigames.darkMonths.heating')}
              </text>
              <text x="0" y="10" textAnchor="middle" fontSize="18" fontWeight="bold" fill={isHeatingSafe ? "#ff7043" : "#ef5350"}>
                {thermalHeat}%
              </text>
              <text x="0" y="30" textAnchor="middle" fontSize="10" fill={isHeatingSafe ? "#81c784" : "#e57373"} fontWeight="bold">
                {isHeatingSafe ? `✓ ${t('minigames.darkMonths.heatingSafe')}` : `⚠ ${t('minigames.darkMonths.freezing')}`}
              </text>
            </g>

            {/* 2. MÓDULO DE CULTIVOS LED */}
            <g transform="translate(630, 260)">
              <rect x="-65" y="-45" width="130" height="90" rx="8" fill="#1e2c3d" stroke="#69f0ae" strokeWidth="2" />
              <text x="0" y="-18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#b9f6ca">
                {t('minigames.darkMonths.bioLighting')}
              </text>
              <text x="0" y="10" textAnchor="middle" fontSize="18" fontWeight="bold" fill={isBioSafe ? "#69f0ae" : "#ef5350"}>
                {bioLighting}%
              </text>
              <text x="0" y="30" textAnchor="middle" fontSize="10" fill={isBioSafe ? "#81c784" : "#e57373"} fontWeight="bold">
                {isBioSafe ? `✓ ${t('minigames.darkMonths.photosynthesisActive')}` : `⚠ ${t('minigames.darkMonths.plantsAtRisk')}`}
              </text>
            </g>

            {/* 3. MÓDULO DE TELEMETRÍA Y SENSORES */}
            <g transform="translate(800, 340)">
              <rect x="-65" y="-45" width="130" height="90" rx="8" fill="#1e2c3d" stroke="#4fc3f7" strokeWidth="2" />
              <text x="0" y="-18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#b3e5fc">
                {t('minigames.darkMonths.radioSensors')}
              </text>
              <text x="0" y="10" textAnchor="middle" fontSize="18" fontWeight="bold" fill={isTelemetrySafe ? "#4fc3f7" : "#ef5350"}>
                {telemetry}%
              </text>
              <text x="0" y="30" textAnchor="middle" fontSize="10" fill={isTelemetrySafe ? "#81c784" : "#e57373"} fontWeight="bold">
                {isTelemetrySafe ? `✓ ${t('minigames.darkMonths.linkActive')}` : `⚠ ${t('minigames.darkMonths.signalLost')}`}
              </text>
            </g>

          </svg>
        </div>

        {/* CONTROLES DE ASIGNACIÓN DE ENERGÍA */}
        <div style={{
          background: '#132338',
          border: '1px solid #33557e',
          borderRadius: '0.8rem',
          padding: '1rem',
          marginTop: '0.8rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', color: '#ffab91', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
              {t('minigames.darkMonths.heatingControl', { value: thermalHeat, minimum: 50 })}
            </label>
            <input
              type="range"
              min="30"
              max="70"
              value={thermalHeat}
              onChange={(e) => {
                const val = Number(e.target.value);
                setThermalHeat(val);
                setIsTested(false);
              }}
              style={{ width: '100%', accentColor: '#ff7043' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#b9f6ca', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
              {t('minigames.darkMonths.cropLightControl', { value: bioLighting, minimum: 20 })}
            </label>
            <input
              type="range"
              min="10"
              max="40"
              value={bioLighting}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBioLighting(val);
                setIsTested(false);
              }}
              style={{ width: '100%', accentColor: '#69f0ae' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#b3e5fc', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
              {t('minigames.darkMonths.telemetryControl', { value: telemetry, minimum: 10 })}
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={telemetry}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTelemetry(val);
                setIsTested(false);
              }}
              style={{ width: '100%', accentColor: '#4fc3f7' }}
            />
          </div>
        </div>

        {/* ACCIONES Y SIMULACIÓN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginTop: '0.8rem' }}>
          <button
            type="button"
            className="facility-card__btn facility-card__btn--gold"
            onClick={handleSimulatePolarNight}
          >
            <BatteryCharging weight="fill" size={20} />
            <span>{t('minigames.darkMonths.simulateNight')}</span>
          </button>

          <button
            type="button"
            className="earth-screen__back-btn"
            onClick={handleAutoBalance}
          >
            <ArrowCounterClockwise weight="bold" />
            <span>{t('minigames.darkMonths.autoBalance')}</span>
          </button>
        </div>

        {/* FEEDBACK TRAS LA SIMULACIÓN */}
        {isTested && (
          <div style={{
            background: isSuccess ? '#122e23' : '#331a1a',
            border: `2px solid ${isSuccess ? '#5bbd78' : '#e57373'}`,
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
              <strong style={{ color: isSuccess ? '#69f0ae' : '#ef5350', fontFamily: 'Fredoka', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" size={22} />
                {isSuccess ? t('minigames.darkMonths.successTitle') : t('minigames.darkMonths.failureTitle')}
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: isSuccess ? '#c8e6c9' : '#ffcdd2', fontSize: '0.88rem' }}>
                {isSuccess
                  ? t('minigames.darkMonths.successDesc')
                  : t('minigames.darkMonths.failureDesc')}
              </p>
            </div>

            {isSuccess && (
              <button
                type="button"
                className="earth-action-btn"
                style={{ padding: '0.75rem 1.6rem' }}
                onClick={() => onComplete(createTrainingOutcome('DARK_MONTHS_RESERVE', `Calefacción ${thermalHeat}%`, 'energy', calculateTrainingCost('DARK_MONTHS_RESERVE', thermalHeat), 'La calefacción consume parte de la reserva.'))}
              >
                <Sparkle weight="fill" />
                <span>{t('minigames.darkMonths.confirmCost', { cost: calculateTrainingCost('DARK_MONTHS_RESERVE', thermalHeat) })}</span>
              </button>
            )}
          </div>
        )}

        {/* NOTA CIENTÍFICA AL PIE */}
        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9bc0e4', fontSize: '0.82rem' }}>
          <Info size={16} color="#80d8ff" />
          <span>{t('minigames.darkMonths.scientificNote')}</span>
        </div>
      </main>
    </div>
  );
}
