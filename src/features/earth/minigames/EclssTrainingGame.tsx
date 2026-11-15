import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { useState } from 'react';
import { ArrowLeft, Drop, CheckCircle, Sparkle, ArrowCounterClockwise, Info, Lightning, Warning } from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import '../screens/earth.css';

interface EclssTrainingGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

export function EclssTrainingGame({ onComplete, onBack }: EclssTrainingGameProps) {
  const { t } = useI18n();
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
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Drop weight="fill" color="#4cc3d9" />
          <span>{t('minigames.eclss.title')}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Drop color="#4cc3d9" weight="fill" />
              <span>{t('minigames.eclss.title')}</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              {t('minigames.eclss.subtitle')}
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
            aria-label={t('minigames.eclss.circuitAria')}
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
              <text x="0" y="-30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">{t('minigames.eclss.recycler')}</text>
              <text x="0" y="0" textAnchor="middle" fontSize="30">💧</text>
              <text x="0" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isWaterOptimal ? "#69f0ae" : "#ffb74d"}>
                {t('minigames.eclss.efficiency', { percent: waterRecycleRate })}
              </text>
              <text x="0" y="48" textAnchor="middle" fontSize="9" fill="#90caf9">{t('minigames.eclss.recovery')}</text>
            </g>

            {/* MÓDULO 2: Reactor de Electrólisis (Centro) */}
            <g transform="translate(390, 180)">
              <rect x="-70" y="-70" width="140" height="140" rx="14" fill="#1b395a" stroke={isOxygenOptimal ? "#69f0ae" : "#f6c15b"} strokeWidth={isOxygenOptimal ? 4 : 2.5} />
              <text x="0" y="-40" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">{t('minigames.eclss.electrolysis')}</text>
              <text x="0" y="-10" textAnchor="middle" fontSize="32">⚡</text>
              <text x="0" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill={isOxygenOptimal ? "#69f0ae" : "#ffb74d"}>
                {oxygenPercent}% O₂
              </text>
              <text x="0" y="40" textAnchor="middle" fontSize="10" fill="#b0bec5">
                {t('minigames.eclss.usage', { watts: electrolysisWatts })}
              </text>
            </g>

            {/* MÓDULO 3: Filtro Scrubber de CO2 (Derecha) */}
            <g transform="translate(650, 180)">
              <rect x="-65" y="-60" width="130" height="120" rx="12" fill={isCo2ScrubberOn ? "#1a4030" : "#372424"} stroke={isCo2ScrubberOn ? "#69f0ae" : "#ef5350"} strokeWidth={3} />
              <text x="0" y="-30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">{t('minigames.eclss.co2Filter')}</text>
              <text x="0" y="0" textAnchor="middle" fontSize="28">{isCo2ScrubberOn ? "🌬️" : "⛔"}</text>
              <text x="0" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill={isCo2Safe ? "#69f0ae" : "#ef5350"}>
                {co2Percent}% CO₂
              </text>
              <text x="0" y="46" textAnchor="middle" fontSize="9" fill={isCo2ScrubberOn ? "#69f0ae" : "#ef5350"}>
                {isCo2ScrubberOn ? t('minigames.eclss.scrubberActiveShort') : t('minigames.eclss.scrubberOff')}
              </text>
            </g>

            {/* MONITOR DE POTENCIA TOTAL INFERIOR */}
            <g transform="translate(450, 370)">
              <rect x="-200" y="-25" width="400" height="50" rx="10" fill="#0d1c2d" stroke="#375a82" strokeWidth="2" />
              <text x="-160" y="5" fontSize="12" fill="#b0bec5">{t('minigames.eclss.totalPowerLabel')}</text>
              <text x="-60" y="5" fontSize="14" fontWeight="bold" fill={isPowerSafe ? "#69f0ae" : "#ef5350"}>
                {t('minigames.eclss.totalPower', { watts: totalPowerConsumption })}
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
              <span>{t('minigames.eclss.wattsLabel')}</span>
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
              <span>{t('minigames.eclss.lowPower')}</span>
              <span style={{ color: '#ffd54f' }}>{t('minigames.eclss.optimalPower')}</span>
              <span>{t('minigames.eclss.highPower')}</span>
            </div>
          </div>

          {/* Filtro Scrubber CO2 y Reciclaje de Agua */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{t('minigames.eclss.scrubberLabel')}</span>
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
                {isCo2ScrubberOn ? t('minigames.eclss.scrubberActive') : t('minigames.eclss.scrubberOff')}
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#ffffff', marginBottom: '0.2rem' }}>
                <span>{t('minigames.eclss.recycleLabel')}</span>
                <span style={{ color: isWaterOptimal ? '#69f0ae' : '#ffb74d', fontWeight: 700 }}>{waterRecycleRate}%</span>
              </div>
              <input
                id="water-recycle-slider"
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
            <span>{t('minigames.eclss.totalLoad')}</span>
            <strong style={{ color: isPowerSafe ? '#69f0ae' : '#ef5350' }}>{totalPowerConsumption} W</strong>
            <span style={{ fontSize: '0.8rem', color: '#9fa8da', marginLeft: '0.4rem' }}>
              {t('minigames.eclss.balancedLoad')}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              className="facility-card__btn facility-card__btn--gold"
              onClick={() => setIsSimulated(true)}
            >
              <Lightning weight="fill" />
              <span>{t('minigames.eclss.verify')}</span>
            </button>
            <button
              type="button"
              className="earth-screen__back-btn"
              onClick={handleReset}
              aria-label={t('minigames.eclss.reset')}
              title={t('minigames.eclss.reset')}
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
              <strong>{t('minigames.eclss.failureTitle')}</strong>
              <div style={{ marginTop: '0.2rem' }}>
                {!isCo2ScrubberOn && ` ${t('minigames.eclss.scrubberOffWarning')}`}
                {!isOxygenOptimal && ` ${t('minigames.eclss.oxygenWarning', { percent: oxygenPercent })}`}
                {!isWaterOptimal && ` ${t('minigames.eclss.waterWarning')}`}
                {!isPowerSafe && ` ${t('minigames.eclss.powerWarning', { watts: totalPowerConsumption })}`}
                {` ${t('minigames.eclss.adjustAndRetry')}`}
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
                <CheckCircle weight="fill" size={22} /> {t('minigames.eclss.successTitle')}
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                {t('minigames.eclss.successDesc', { oxygen: oxygenPercent, co2: co2Percent, water: waterRecycleRate, watts: totalPowerConsumption })}
              </p>
            </div>
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.75rem 1.6rem' }}
              onClick={() => onComplete(createTrainingOutcome('ECLSS_TRAINING', `Electrólisis ${totalPowerConsumption} W`, 'energy', calculateTrainingCost('ECLSS_TRAINING', totalPowerConsumption), 'La prueba de electrólisis consume batería.'))}
            >
              <Sparkle weight="fill" />
              <span>{t('minigames.eclss.confirmCost', { cost: calculateTrainingCost('ECLSS_TRAINING', totalPowerConsumption) })}</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9bc0e4', fontSize: '0.82rem' }}>
          <Info size={16} color="#f6c15b" />
          <span>{t('minigames.eclss.scientificNote')}</span>
        </div>
      </main>
    </div>
  );
}
