import { useState } from 'react';
import { ArrowLeft, Sun, Lightning, CheckCircle, Info, Sparkle } from '@phosphor-icons/react';
import { LIMA_SOLAR_RECORDS, type SolarDayRecord } from '../../../data/nasa/powerData';
import '../screens/earth.css';

interface SolarDetectiveGameProps {
  readonly cityName: string;
  readonly onComplete: () => void;
  readonly onBack: () => void;
}

export function SolarDetectiveGame({ cityName, onComplete, onBack }: SolarDetectiveGameProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [tiltAngle, setTiltAngle] = useState<number>(12); // Ángulo de inclinación en grados (óptimo para latitud de Lima ~12°)
  const [isTested, setIsTested] = useState<boolean>(false);

  const currentDay: SolarDayRecord = LIMA_SOLAR_RECORDS.days[selectedDayIndex] ?? LIMA_SOLAR_RECORDS.days[0];

  // Cálculo físico-educativo:
  // La radiación incidente es ALLSKY_SFC_SW_DWN en kWh/m²/día
  // Factor de orientación: el óptimo para Lima (latitud 12°S) es orientar al norte con inclinación de 12° a 15°.
  // La desviación del ángulo reduce el factor de orientación cos(delta).
  const angleError = Math.abs(tiltAngle - 13);
  const orientationFactor = Math.max(0.65, Math.cos((angleError * Math.PI) / 180));
  // Eficiencia de celda solar de silicio espacial ~22%
  const panelEfficiency = 0.22;
  const areaM2 = 10; // 10 m² de paneles
  const energyGeneratedKwh = Number((currentDay.irradianceKwhPerM2 * orientationFactor * panelEfficiency * areaM2).toFixed(2));
  const maxPossibleKwh = Number((currentDay.irradianceKwhPerM2 * 1.0 * panelEfficiency * areaM2).toFixed(2));
  const efficiencyPercent = Math.round((energyGeneratedKwh / maxPossibleKwh) * 100);

  function handleTest() {
    setIsTested(true);
  }

  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Volver al Mapa</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Sun weight="fill" color="#f6c15b" />
          <span>Entrenamiento T1 · Detective del Sol (NASA POWER)</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '52rem' }}>
        <h1 className="earth-card__title">
          <Sun color="#f6c15b" weight="fill" />
          <span>Detective del Sol: Elige el día y orienta el panel</span>
        </h1>
        <p className="earth-card__subtitle">
          Utiliza observaciones satelitales históricas de <strong>NASA POWER</strong> para {cityName}. Descubre cómo la radiación que incide sobre la superficie se transforma en electricidad útil según la orientación de tus paneles.
        </p>

        <section aria-labelledby="solar-days-heading">
          <h2 id="solar-days-heading" style={{ fontSize: '1.1rem', color: '#f6c15b', marginBottom: '0.8rem', fontFamily: 'Fredoka' }}>
            1. Selecciona uno de los tres días históricos de {cityName}:
          </h2>
          <div className="solar-day-cards" role="radiogroup">
            {LIMA_SOLAR_RECORDS.days.map((day, index) => {
              const isSelected = selectedDayIndex === index;
              return (
                <div
                  key={day.date}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`solar-day-card ${isSelected ? 'solar-day-card--selected' : ''}`}
                  onClick={() => {
                    setSelectedDayIndex(index);
                    setIsTested(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setSelectedDayIndex(index);
                      setIsTested(false);
                    }
                  }}
                >
                  <span className="solar-day-card__date">{day.date}</span>
                  <h3 className="solar-day-card__season">{day.seasonLabel}</h3>
                  <div className="solar-day-card__value">
                    {day.irradianceKwhPerM2} <span style={{ fontSize: '0.9rem', color: '#a0c5e8' }}>kWh/m²</span>
                  </div>
                  <p className="solar-day-card__condition">{day.skyCondition}</p>
                  {isSelected && (
                    <div style={{ color: '#f6c15b', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle weight="fill" /> Día activo
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="solar-panel-simulator" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#f6c15b', margin: 0, fontFamily: 'Fredoka' }}>
            2. Ajusta la inclinación del panel fotovoltaico hacia el Sol:
          </h2>
          <p style={{ margin: 0, color: '#bed5ea', fontSize: '0.92rem' }}>
            Para captar la máxima radiación solar incidente en {cityName} (latitud 12.0° Sur), orientamos hacia el Norte con un ángulo cercano a su latitud.
          </p>

          <div className="solar-angle-controls">
            <label htmlFor="tilt-slider" style={{ fontWeight: 700, color: '#ffffff', minWidth: '9rem' }}>
              Inclinación: <span style={{ color: '#f6c15b', fontSize: '1.2rem', fontFamily: 'Fredoka' }}>{tiltAngle}°</span>
            </label>
            <input
              id="tilt-slider"
              type="range"
              min="0"
              max="60"
              value={tiltAngle}
              onChange={(e) => {
                setTiltAngle(Number(e.target.value));
                setIsTested(false);
              }}
              className="solar-angle-slider"
              aria-label="Ángulo de inclinación del panel en grados"
            />
            <button
              type="button"
              className="facility-card__btn facility-card__btn--gold"
              onClick={handleTest}
            >
              <Lightning weight="fill" />
              <span>Simular Generación</span>
            </button>
          </div>

          {isTested && (
            <div className="solar-output-box" aria-live="polite">
              <div className="solar-output-item">
                <div className="solar-output-item__val">{currentDay.irradianceKwhPerM2}</div>
                <div className="solar-output-item__lbl">Radiación Incidente (NASA POWER)</div>
              </div>
              <div className="solar-output-item">
                <div className="solar-output-item__val" style={{ color: '#69f0ae' }}>{energyGeneratedKwh} kWh</div>
                <div className="solar-output-item__lbl">Electricidad Generada (10 m² panel)</div>
              </div>
              <div className="solar-output-item">
                <div className="solar-output-item__val" style={{ color: efficiencyPercent >= 90 ? '#69f0ae' : '#ffb74d' }}>
                  {efficiencyPercent}%
                </div>
                <div className="solar-output-item__lbl">Rendimiento por Orientación</div>
              </div>
            </div>
          )}
        </section>

        {isTested && (
          <div style={{
            background: '#152b42',
            border: '1px solid #3c6594',
            borderRadius: '0.9rem',
            padding: '1.2rem',
            marginTop: '1.2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.8rem'
          }}>
            <Info size={24} color="#f6c15b" weight="fill" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#ffffff' }}>Lección Científica:</strong>
              <p style={{ margin: '0.3rem 0 0 0', color: '#cde0f2', fontSize: '0.92rem', lineHeight: '1.45' }}>
                La <strong>radiación solar incidente</strong> es la energía total de luz que llega del Sol. Los paneles solares fotovoltaicos no convierten toda esa energía: con células solares al 22% de eficiencia y buena orientación ({tiltAngle}°), generaste <strong>{energyGeneratedKwh} kWh</strong>. En la Luna no hay atmósfera ni nubes, pero la noche dura 14 días terrestres, por lo que almacenar energía en baterías será vital.
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            className="earth-action-btn"
            disabled={!isTested}
            onClick={onComplete}
          >
            <Sparkle weight="fill" />
            <span>Validar y Certificar Entrenamiento</span>
          </button>
        </div>
      </main>
    </div>
  );
}
