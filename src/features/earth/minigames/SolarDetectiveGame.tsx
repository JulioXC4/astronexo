import { createTrainingOutcome, calculateTrainingCost } from '../trainingOutcome';
import type { TrainingOutcome } from '../../../game';
import { useState, useEffect } from 'react';
import { ArrowLeft, Sun, Lightning, CheckCircle, Sparkle, ArrowCounterClockwise, Info, Warning } from '@phosphor-icons/react';
import { AREQUIPA_SOLAR_RECORDS, type SolarDayRecord } from '../../../data/nasa/powerData';
import { SolarCircuitVisual } from '../../../visual-kit/TrainingVisuals';
import { useI18n, LanguageSelector } from '../../../i18n';
import '../screens/earth.css';

interface SolarDetectiveGameProps {
  readonly onComplete: (outcome: TrainingOutcome) => void;
  readonly onBack: () => void;
}

export function SolarDetectiveGame({ onComplete, onBack }: SolarDetectiveGameProps) {
  const { t } = useI18n();
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
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Sun weight="fill" color="#f6c15b" />
          <span>{t('minigames.solarDetective.title')} · NASA POWER (Arequipa)</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        {/* Cabecera compacta con selector de días históricos reales de Arequipa */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Sun color="#f6c15b" weight="fill" />
              <span>{t('minigames.solarDetective.title')}</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              {t('minigames.solarDetective.subtitle')}
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
                {t('minigames.solarDetective.historicalDay', { date: day.date })} ({day.irradianceKwhPerM2} kWh/m²)
              </button>
            ))}
          </div>
        </div>

        <div className="training-scene">
          <SolarCircuitVisual
            panelActive={isOrientationGood}
            switchOn={isSwitchClosed}
            charge={batteryLevel}
            circuitComplete={isTestPassed}
            tiltAngle={tiltAngle}
          />
          <dl className="training-readouts">
            <div><dt>{t('minigames.solarDetective.dayChosen')}</dt><dd>{currentDay.irradianceKwhPerM2} kWh/m²/day</dd></div>
            <div><dt>{t('minigames.solarDetective.panelOrientation')}</dt><dd>{tiltAngle}° · {isOrientationGood ? t('minigames.solarDetective.captureOptimal') : t('minigames.solarDetective.adjustToTarget')}</dd></div>
            <div><dt>{t('minigames.solarDetective.reserveLabel')}</dt><dd>{reserveRatioPercent}% · {storedEnergyKwh} kWh</dd></div>
            <div><dt>{t('minigames.solarDetective.battery')}</dt><dd>{batteryLevel}% · {isSwitchClosed ? t('minigames.solarDetective.circuitClosed') : t('minigames.solarDetective.switchOpen')}</dd></div>
          </dl>
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
              <span>{t('minigames.solarDetective.tiltLabel')}</span>
              <span style={{ color: isOrientationGood ? '#69f0ae' : '#ffb74d', fontFamily: 'Fredoka', fontSize: '1.15rem' }}>
                {t('minigames.solarDetective.currentTilt', { angle: tiltAngle })}{isOrientationGood ? ` · ${t('minigames.solarDetective.optimal')}` : ''}
              </span>
            </div>
            <input
              id="tilt-angle-slider"
              type="range"
              min="0"
              max="50"
              value={tiltAngle}
              aria-label={t('minigames.solarDetective.tiltLabel')}
              onChange={(e) => {
                setTiltAngle(Number(e.target.value));
                if (isSwitchClosed) handleReset();
              }}
              style={{ width: '100%', accentColor: isOrientationGood ? '#69f0ae' : '#ffb74d', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#90caf9', marginTop: '0.2rem' }}>
              <span>{t('minigames.solarDetective.horizontal')}</span>
              <button
                type="button"
                className="callsign-chip"
                style={{ background: '#25446c', color: '#8ec5fc', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => {
                  setTiltAngle(16);
                  if (isSwitchClosed) handleReset();
                }}
              >
                {t('minigames.solarDetective.optimalTilt')}
              </button>
              <span>{t('minigames.solarDetective.steep')}</span>
            </div>
          </div>

          {/* Slider de Decisión de Reserva para Baterías */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
              <span>{t('minigames.solarDetective.reserveLabel')}</span>
              <span style={{ color: isReserveOptimal ? '#69f0ae' : '#ffb74d', fontFamily: 'Fredoka', fontSize: '1.15rem' }}>
                {t('minigames.solarDetective.reserveWithStorage', { reserve: reserveRatioPercent, kwh: storedEnergyKwh })}
              </span>
            </div>
            <input
              id="solar-reserve-slider"
              type="range"
              min="15"
              max="85"
              step="5"
              value={reserveRatioPercent}
              aria-label={t('minigames.solarDetective.reserveLabel')}
              onChange={(e) => {
                setReserveRatioPercent(Number(e.target.value));
                if (isSwitchClosed) handleReset();
              }}
              style={{ width: '100%', accentColor: isReserveOptimal ? '#69f0ae' : '#ffb74d', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#90caf9', marginTop: '0.2rem' }}>
              <span>{t('minigames.solarDetective.lowReserve')}</span>
              <span style={{ color: '#ffd54f' }}>{t('minigames.solarDetective.optimalReserve')}</span>
              <span>{t('minigames.solarDetective.highReserve')}</span>
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
            <span>☀ {t('minigames.solarDetective.daytimeAvailable', { kwh: daytimeAvailableKwh })}</span>
            <span>🔋 {t('minigames.solarDetective.nightReserve', { kwh: storedEnergyKwh })}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              type="button"
              className="facility-card__btn"
              style={{ background: isSwitchClosed ? '#37474f' : '#f6c15b', color: isSwitchClosed ? '#ffffff' : '#102033' }}
              onClick={() => setIsSwitchClosed(!isSwitchClosed)}
            >
              <Lightning weight="fill" />
              <span>{isSwitchClosed ? t('minigames.solarDetective.openCircuit') : t('minigames.solarDetective.closeCircuit')}</span>
            </button>
            <button
              type="button"
              className="earth-screen__back-btn"
              onClick={handleReset}
              aria-label={t('minigames.solarDetective.reset')}
              title={t('minigames.solarDetective.reset')}
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
              <strong>{t('minigames.solarDetective.suboptimalWarning')}</strong>
              <div style={{ marginTop: '0.2rem' }}>
                {!isOrientationGood && ` ${t('minigames.solarDetective.tiltWarning', { angle: tiltAngle })}`}
                {isReserveTooLow && ` ${t('minigames.solarDetective.lowReserveWarning')}`}
                {isReserveTooHigh && ` ${t('minigames.solarDetective.highReserveWarning')}`}
                {` ${t('minigames.solarDetective.adjustAndReconnect')}`}
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
                <CheckCircle weight="fill" size={22} /> {t('minigames.solarDetective.passedTitle')}
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', color: '#c8e6c9', fontSize: '0.88rem' }}>
                {t('minigames.solarDetective.passedDesc', { angle: tiltAngle, reserve: reserveRatioPercent, kwh: totalDailyEnergyKwh, efficiency: efficiencyPercent, stored: storedEnergyKwh })}
              </p>
            </div>
            <button
              type="button"
              className="earth-action-btn"
              style={{ padding: '0.75rem 1.6rem' }}
              onClick={() => onComplete(createTrainingOutcome('SOLAR_DETECTIVE', `Reserva ${reserveRatioPercent}%`, 'energy', calculateTrainingCost('SOLAR_DETECTIVE', reserveRatioPercent), 'La prueba solar consumió parte de la reserva.'))}
            >
              <Sparkle weight="fill" />
              <span>{t('minigames.solarDetective.confirmCost', { cost: calculateTrainingCost('SOLAR_DETECTIVE', reserveRatioPercent) })}</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#9bc0e4', fontSize: '0.80rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={16} color="#f6c15b" />
            <span>{t('minigames.solarDetective.scientificNote', { irradiance: currentDay.irradianceKwhPerM2, date: currentDay.date })}</span>
          </div>
          <div style={{ color: '#81d4fa', paddingLeft: '1.4rem' }}>
            <span>{t('minigames.solarDetective.educationalNote')}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
