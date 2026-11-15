import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { useState } from 'react';
import { ArrowLeft, Plant, CheckCircle, Sparkle, ArrowCounterClockwise, Info, Warning, Thermometer } from '@phosphor-icons/react';
import { useI18n, LanguageSelector } from '../../../i18n';
import '../screens/earth.css';

interface ArcticGreenhouseGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

export function ArcticGreenhouseGame({ onComplete, onBack }: ArcticGreenhouseGameProps) {
  const { t } = useI18n();
  // Parámetros del bio-refugio ártico
  const [geothermalFlow, setGeothermalFlow] = useState<number>(30); // Óptimo: 45% a 60%
  const [isDomeInsulated, setIsDomeInsulated] = useState<boolean>(false);
  const [ledLightingMode, setLedLightingMode] = useState<'LOW' | 'NORMAL' | 'BOOST'>('NORMAL');
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Cálculos térmicos y biológicos
  // Exterior ártico: -15°C
  const ambientGain = isDomeInsulated ? 22 : 8;
  const flowHeatGain = Math.round(geothermalFlow * 0.28);
  const internalTempC = -15 + ambientGain + flowHeatGain + (ledLightingMode === 'BOOST' ? 4 : (ledLightingMode === 'NORMAL' ? 2 : 0));

  const isTempOptimal = internalTempC >= 18 && internalTempC <= 24;
  const isFreezingRisk = internalTempC < 14;
  const isOverheatingRisk = internalTempC > 26;
  const isGeothermalSafe = geothermalFlow <= 65;

  const isSuccess = isSimulated && isTempOptimal && isDomeInsulated && isGeothermalSafe;

  function handleAutoTune() {
    setGeothermalFlow(52);
    setIsDomeInsulated(true);
    setLedLightingMode('NORMAL');
    setIsSimulated(false);
  }

  function handleReset() {
    setGeothermalFlow(30);
    setIsDomeInsulated(false);
    setLedLightingMode('NORMAL');
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
          <Plant weight="fill" color="#a5d6a7" />
          <span>{t('minigames.arctic.title')} · Tromsø</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Plant color="#a5d6a7" weight="fill" />
              <span>{t('minigames.arctic.title')}</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              {t('minigames.arctic.subtitle')}
            </p>
          </div>
        </div>

        {/* ESCENARIO SVG DEL BIO-REFUGIO */}
        <div style={{
          background: 'radial-gradient(ellipse at 50% 20%, #102d44 0%, #061521 100%)',
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
            aria-label={t('minigames.arctic.shelterAria')}
          >
            <defs>
              <linearGradient id="auroraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00e676" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#29b6f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ab47bc" stopOpacity="0.2" />
              </linearGradient>

              <radialGradient id="greenhouseWarmth" cx="50%" cy="60%" r="50%">
                <stop offset="0%" stopColor={isTempOptimal ? "#ffb74d" : (isFreezingRisk ? "#80d8ff" : "#ff5252")} stopOpacity={isDomeInsulated ? 0.35 : 0.15} />
                <stop offset="100%" stopColor="#102d44" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Cielo ártico con auroras boreales */}
            <path d="M 0 60 Q 250 20, 500 70 T 900 40 L 900 120 L 0 120 Z" fill="url(#auroraGrad)" />

            {/* Suelo nevado exterior */}
            <path d="M 0 320 Q 450 310, 900 320 L 900 440 L 0 440 Z" fill="#cfd8dc" opacity="0.25" />
            <text x="120" y="360" fontSize="13" fill="#b0bec5" fontWeight="bold">{t('minigames.arctic.outsideSnow')}</text>

            {/* CÚPULA DEL BIO-REFUGIO */}
            <path
              d="M 260 320 A 190 190 0 0 1 640 320 Z"
              fill={isDomeInsulated ? "#1b3752" : "#12202e"}
              stroke={isDomeInsulated ? "#69f0ae" : "#4fc3f7"}
              strokeWidth={isDomeInsulated ? 4 : 2}
            />
            <path d="M 260 320 A 190 190 0 0 1 640 320 Z" fill="url(#greenhouseWarmth)" />

            {/* Estructura geodésica de la cúpula */}
            <line x1="450" y1="130" x2="350" y2="320" stroke="#375577" strokeWidth="1.5" />
            <line x1="450" y1="130" x2="450" y2="320" stroke="#375577" strokeWidth="1.5" />
            <line x1="450" y1="130" x2="550" y2="320" stroke="#375577" strokeWidth="1.5" />
            <line x1="310" y1="230" x2="590" y2="230" stroke="#375577" strokeWidth="1.5" />

            {/* Plantas interiores protegidas */}
            <g transform="translate(450, 315)">
              <ellipse cx="0" cy="0" rx="140" ry="8" fill="#2e7d32" opacity="0.3" />
              {[-80, -40, 0, 40, 80].map((posX, i) => (
                <g key={i} transform={`translate(${posX} -8)`}>
                  <path d={isFreezingRisk ? 'M0 0v-14l-9-8m9 8 9-8' : isOverheatingRisk ? 'M0 0v-20l-12-8m12 8 12-8' : 'M0 0v-26l-12-10m12 10 12-10'} fill="none" stroke="#609b65" strokeWidth="3" strokeLinecap="round" />
                  <path d="M-12-36q-11 1-10 11 9 4 16-2m18-9q11 1 10 11-9 4-16-2" fill={isFreezingRisk ? '#8caeaf' : isOverheatingRisk ? '#c5a36a' : '#76c887'} />
                </g>
              ))}
            </g>

            {/* TUBERÍAS GEOTÉRMICAS SUBTERRÁNEAS */}
            <path d="M 330 360 L 570 360" stroke="#ff7043" strokeWidth="6" strokeDasharray="8 4" />
            <text x="450" y="390" textAnchor="middle" fontSize="11" fill="#ffab91" fontWeight="bold">
              ♨ {t('minigames.arctic.geothermalPipe', { flow: geothermalFlow })}
            </text>

            {/* TERMÓMETRO DIGITAL DERECHA */}
            <g transform="translate(780, 200)">
              <rect x="-55" y="-70" width="110" height="140" rx="10" fill="#0d1b29" stroke="#2e4d70" strokeWidth="2" />
              <text x="0" y="-45" textAnchor="middle" fontSize="10" fill="#90caf9" fontWeight="bold">{t('minigames.arctic.temperature')}</text>
              <circle cx="0" cy="-5" r="30" fill="#13263b" stroke={isTempOptimal ? "#69f0ae" : "#ffb74d"} strokeWidth={3} />
              <text x="0" y="2" textAnchor="middle" fontSize="16" fontWeight="bold" fill={isTempOptimal ? "#69f0ae" : "#ffd54f"}>
                {internalTempC}°C
              </text>
              <text x="0" y="45" textAnchor="middle" fontSize="11" fontWeight="bold" fill={isTempOptimal ? "#69f0ae" : (isFreezingRisk ? "#80d8ff" : "#ef5350")}>
                {isTempOptimal ? t('minigames.arctic.tempOptimalShort') : (isFreezingRisk ? t('minigames.arctic.freezingShort') : t('minigames.arctic.overheatingShort'))}
              </text>
            </g>
          </svg>
        </div>

        {/* CONTROLES DE FLUJO Y CÚPULA */}
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
          {/* Slider de Caudal Geotérmico */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
              <span>{t('minigames.arctic.geothermalFlow')}</span>
              <span style={{ color: isGeothermalSafe ? '#69f0ae' : '#ffb74d', fontFamily: 'Fredoka' }}>
                {geothermalFlow}% (Consumo sustentable)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={geothermalFlow}
              onChange={(e) => {
                setGeothermalFlow(Number(e.target.value));
                setIsSimulated(false);
              }}
              style={{ width: '100%', accentColor: isGeothermalSafe ? '#ff7043' : '#ef5350', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#90caf9', marginTop: '0.2rem' }}>
              <span>{t('minigames.arctic.flowLow')}</span>
              <button
                type="button"
                className="callsign-chip"
                style={{ background: '#25446c', color: '#8ec5fc', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
                onClick={handleAutoTune}
              >
                {t('minigames.arctic.autoTune')}
              </button>
              <span>{t('minigames.arctic.flowHigh')}</span>
            </div>
          </div>

          {/* Cúpula Aislante e Iluminación */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>{t('minigames.arctic.insulationLabel')}</span>
              <button
                type="button"
                className="callsign-chip"
                style={{
                  background: isDomeInsulated ? '#1b5e20' : '#37474f',
                  color: isDomeInsulated ? '#b9f6ca' : '#cfd8dc',
                  border: `1px solid ${isDomeInsulated ? '#69f0ae' : '#607d8b'}`
                }}
                onClick={() => {
                  setIsDomeInsulated(!isDomeInsulated);
                  setIsSimulated(false);
                }}
              >
                {isDomeInsulated ? t('minigames.arctic.domeClosed') : t('minigames.arctic.domeExposed')}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', color: '#ffffff' }}>{t('minigames.arctic.ledLabel')}</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {(['LOW', 'NORMAL', 'BOOST'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className="callsign-chip"
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.78rem',
                      background: ledLightingMode === mode ? '#1976d2' : '#142333',
                      color: ledLightingMode === mode ? '#ffffff' : '#90caf9',
                      border: `1px solid ${ledLightingMode === mode ? '#42a5f5' : '#263b50'}`
                    }}
                    onClick={() => {
                      setLedLightingMode(mode);
                      setIsSimulated(false);
                    }}
                  >
                    {mode === 'LOW' ? t('minigames.arctic.ledLow') : (mode === 'NORMAL' ? t('minigames.arctic.ledNormal') : t('minigames.arctic.ledBoost'))}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES Y RECURSOS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ fontSize: '0.88rem', color: '#c5cae9', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Thermometer size={18} color="#f6c15b" />
            <strong style={{ color: isTempOptimal ? '#69f0ae' : '#ef5350' }}>{t('minigames.arctic.tempLabel', { temp: internalTempC })}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              className="facility-card__btn facility-card__btn--gold"
              onClick={() => setIsSimulated(true)}
            >
              <Plant weight="fill" />
              <span>{t('minigames.arctic.verify')}</span>
            </button>
            <button
              type="button"
              className="earth-screen__back-btn"
              onClick={handleReset}
              aria-label={t('minigames.arctic.reset')}
              title={t('minigames.arctic.reset')}
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
              <strong>{t('minigames.arctic.failureTitle')}</strong>
              <div style={{ marginTop: '0.2rem' }}>
                {!isDomeInsulated && ` ${t('minigames.arctic.domeOpenWarning')}`}
                {isFreezingRisk && ` ${t('minigames.arctic.freezingWarning', { temp: internalTempC })}`}
                {isOverheatingRisk && ` ${t('minigames.arctic.overheatingWarning', { temp: internalTempC })}`}
                {!isGeothermalSafe && ` ${t('minigames.arctic.flowWarning')}`}
                {` ${t('minigames.arctic.adjustAndRetry')}`}
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
                <CheckCircle weight="fill" size={22} /> {t('minigames.arctic.successTitle')}
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                {t('minigames.arctic.successDesc', { temp: internalTempC })}
              </p>
            </div>
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.75rem 1.6rem' }}
              onClick={() => onComplete(createTrainingOutcome('ARCTIC_GREENHOUSE', `Flujo geotérmico ${geothermalFlow}%`, 'energy', calculateTrainingCost('ARCTIC_GREENHOUSE', geothermalFlow), 'Calefacción e iluminación consumen reserva.'))}
            >
              <Sparkle weight="fill" />
              <span>{t('minigames.arctic.confirmCost', { cost: calculateTrainingCost('ARCTIC_GREENHOUSE', geothermalFlow) })}</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9bc0e4', fontSize: '0.82rem' }}>
          <Info size={16} color="#f6c15b" />
          <span>{t('minigames.arctic.scientificNote')}</span>
        </div>
      </main>
    </div>
  );
}
