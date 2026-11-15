import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sun, Snowflake, GlobeHemisphereWest, CheckCircle, ChartLineUp } from '@phosphor-icons/react';
import { SUPPORTED_CITIES, type CityData } from '../../../data/nasa/cities';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface CitySelectionScreenProps {
  readonly initialCityId: string;
  readonly onSelectCity: (city: CityData) => void;
  readonly onBack: () => void;
}

// Coordenadas en el mapa SVG interactivo de telemetría (600 x 360)
const CITY_MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  AREQUIPA: { x: 195, y: 245 },
  TROMSO: { x: 345, y: 55 },
};

export function CitySelectionScreen({ initialCityId, onSelectCity, onBack }: CitySelectionScreenProps) {
  const { t } = useI18n();
  const [selectedCityId, setSelectedCityId] = useState<'AREQUIPA' | 'TROMSO'>(
    initialCityId === 'TROMSO' ? 'TROMSO' : 'AREQUIPA'
  );
  const [showTelemetry, setShowTelemetry] = useState(false);

  const selectedCity = SUPPORTED_CITIES.find((c) => c.id === selectedCityId) ?? SUPPORTED_CITIES[0];
  const activePos = CITY_MAP_POSITIONS[selectedCity.id] ?? { x: 195, y: 245 };
  const cityKey = selectedCity.id === 'AREQUIPA' ? 'arequipa' : 'tromso';

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1.2rem' }}>
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>{t('common.back')}</span>
        </button>
        <div className="earth-screen__progress-pill">
          <GlobeHemisphereWest weight="fill" color="#f6c15b" />
          <span>{t('cities.stepIndicator')}</span>
        </div>
        <LanguageSelector variant="hud" />
      </header>

      <main className="earth-card" style={{ maxWidth: '68rem', padding: '1.4rem' }}>
        <div style={{ marginBottom: '1.2rem' }}>
          <h1 className="earth-card__title" style={{ fontSize: '1.75rem', margin: 0 }}>
            <span>{t('cities.title')}</span>
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#9bc0e4', fontSize: '0.95rem' }}>
            {t('cities.subtitle')}
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TARJETAS DE SELECCIÓN PIXEL ART: AREQUIPA & TROMSØ            */}
        {/* ------------------------------------------------------------- */}
        <div className="academy-cards-grid" role="radiogroup" aria-label={t('cities.title')}>
          
          {/* TARJETA 1: AREQUIPA, PERÚ */}
          <div
            role="radio"
            aria-checked={selectedCityId === 'AREQUIPA'}
            tabIndex={0}
            className={`academy-card academy-card--arequipa ${selectedCityId === 'AREQUIPA' ? 'academy-card--selected' : ''}`}
            onClick={() => setSelectedCityId('AREQUIPA')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedCityId('AREQUIPA');
              }
            }}
          >
            <div className="academy-card__image-wrap">
              <img
                src="/assets/pixel-art/andean-training-complex.png"
                alt="Complejo de entrenamiento andino en Arequipa al pie del volcán Misti"
                className="academy-card__image"
              />
              <div className="academy-card__vignette" />
              <div className="academy-card__badge-tag" style={{ background: '#f6c15b', color: '#101d2d' }}>
                <Sun weight="fill" size={16} />
                <span>{t('cities.arequipa.badge')}</span>
              </div>
              {selectedCityId === 'AREQUIPA' && (
                <div className="academy-card__selected-pill">
                  <CheckCircle weight="fill" size={16} />
                  <span>{t('common.selected')}</span>
                </div>
              )}
            </div>

            <div className="academy-card__body">
              <div className="academy-card__title-row">
                <h2 className="academy-card__title">
                  {t('cities.arequipa.name')}, {t('cities.arequipa.country')}
                </h2>
                <span className="academy-card__coords">2,325 m s. n. m. · -16.4° S</span>
              </div>

              <div className="academy-card__chips">
                <span className="academy-chip">☀️ {t('cities.arequipa.specialty')}</span>
                <span className="academy-chip">🌋 Volcán Misti</span>
                <span className="academy-chip">⚡ 5.60 a 6.17 kWh/m²</span>
              </div>

              <div className="academy-card__challenge">
                <strong style={{ color: '#f6c15b', display: 'block', marginBottom: '0.2rem' }}>
                  {t('cities.environmentalChallenge')}
                </strong>
                <span>{t('cities.arequipa.scientificChallenge')}</span>
              </div>

              <p style={{ margin: 0, color: '#adc8e2', fontSize: '0.85rem', lineHeight: '1.4' }}>
                {t('cities.arequipa.description')}
              </p>
            </div>
          </div>

          {/* TARJETA 2: TROMSØ, NORUEGA */}
          <div
            role="radio"
            aria-checked={selectedCityId === 'TROMSO'}
            tabIndex={0}
            className={`academy-card academy-card--tromso ${selectedCityId === 'TROMSO' ? 'academy-card--selected' : ''}`}
            onClick={() => setSelectedCityId('TROMSO')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedCityId('TROMSO');
              }
            }}
          >
            <div className="academy-card__image-wrap">
              <img
                src="/assets/pixel-art/arctic-research-base.png"
                alt="Base de investigación ártica en Tromsø entre fiordos y montañas nevadas"
                className="academy-card__image"
              />
              <div className="academy-card__vignette" />
              <div className="academy-card__badge-tag" style={{ background: '#62c1cc', color: '#0b2331' }}>
                <Snowflake weight="fill" size={16} />
                <span>{t('cities.tromso.badge')}</span>
              </div>
              {selectedCityId === 'TROMSO' && (
                <div className="academy-card__selected-pill">
                  <CheckCircle weight="fill" size={16} />
                  <span>{t('common.selected')}</span>
                </div>
              )}
            </div>

            <div className="academy-card__body">
              <div className="academy-card__title-row">
                <h2 className="academy-card__title">
                  {t('cities.tromso.name')}, {t('cities.tromso.country')}
                </h2>
                <span className="academy-card__coords">Ártico 69.6° N · 20 m</span>
              </div>

              <div className="academy-card__chips">
                <span className="academy-chip">❄️ {t('cities.tromso.specialty')}</span>
                <span className="academy-chip">🌌 Noche Polar & Auroras</span>
                <span className="academy-chip">🔋 Ciclo Criogénico</span>
              </div>

              <div className="academy-card__challenge">
                <strong style={{ color: '#62c1cc', display: 'block', marginBottom: '0.2rem' }}>
                  {t('cities.environmentalChallenge')}
                </strong>
                <span>{t('cities.tromso.scientificChallenge')}</span>
              </div>

              <p style={{ margin: 0, color: '#adc8e2', fontSize: '0.85rem', lineHeight: '1.4' }}>
                {t('cities.tromso.description')}
              </p>
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* PANEL SECUNDARIO DESPLEGABLE: TELEMETRÍA GLOBAL NASA POWER     */}
        {/* ------------------------------------------------------------- */}
        <button
          type="button"
          className="academy-telemetry-toggle"
          onClick={() => setShowTelemetry((prev) => !prev)}
          aria-expanded={showTelemetry}
        >
          <ChartLineUp size={20} weight="bold" />
          <span>{showTelemetry ? t('cities.hideTelemetryBtn') : t('cities.viewTelemetryBtn')}</span>
        </button>

        {showTelemetry && (
          <div style={{
            background: 'radial-gradient(ellipse at 50% 50%, #173356 0%, #0a1726 100%)',
            border: '2px solid #335d8b',
            borderRadius: '1rem',
            overflow: 'hidden',
            margin: '1rem 0',
            padding: '0.5rem',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)',
          }}>
            <svg
              viewBox="0 0 600 360"
              style={{ width: '100%', height: '18rem', display: 'block', userSelect: 'none' }}
              role="img"
              aria-label="Mapamundi de telemetría NASA POWER para Arequipa y Tromsø"
            >
              <defs>
                <pattern id="globeGrid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(76, 195, 217, 0.1)" strokeWidth="1" />
                </pattern>
                <radialGradient id="pulseArequipa" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f6c15b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#f6c15b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="pulseTromso" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#80d8ff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#80d8ff" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#globeGrid)" />

              {/* Ecuador y Círculo Polar */}
              <line x1="0" y1="180" x2="600" y2="180" stroke="rgba(246, 193, 91, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="10" y="175" fontSize="8" fill="#f6c15b" opacity="0.6">ECUADOR (0°)</text>

              <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(128, 216, 255, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="10" y="55" fontSize="8" fill="#80d8ff" opacity="0.6">CÍRCULO POLAR ÁRTICO (66.5° N)</text>

              {/* Siluetas de continentes */}
              <path d="M 100 50 Q 150 40 210 60 Q 230 110 170 140 Q 150 160 190 180 Q 140 180 110 130 Z" fill="#1b3654" stroke="#355e8a" strokeWidth="1.5" />
              <path d="M 180 180 Q 240 190 250 240 Q 240 310 200 340 Q 180 320 175 260 Q 170 210 180 180 Z" fill="#204268" stroke="#4377ae" strokeWidth="2" />
              <path d="M 310 90 Q 340 30 360 40 Q 370 70 340 95 Q 360 130 320 150 Q 290 140 300 110 Z" fill="#204268" stroke="#4377ae" strokeWidth="2" />
              <path d="M 310 155 Q 360 160 380 220 Q 360 290 320 270 Q 300 210 310 155 Z" fill="#1b3654" stroke="#355e8a" strokeWidth="1.5" />
              <path d="M 370 70 Q 480 50 530 100 Q 510 170 430 160 Q 380 120 370 70 Z" fill="#1b3654" stroke="#355e8a" strokeWidth="1.5" />

              {/* Telemetría hacia la base seleccionada */}
              <line
                x1="480"
                y1="40"
                x2={activePos.x}
                y2={activePos.y}
                stroke={selectedCity.id === 'AREQUIPA' ? "#f6c15b" : "#80d8ff"}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />

              {/* Satélite NASA POWER */}
              <g transform="translate(480, 40)">
                <circle r="14" fill="#14263b" stroke="#f6c15b" strokeWidth="2" />
                <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#d5e5dc" />
                <path d="M-7-5-17-8v16L-7 5M7-5l10-3V8L7 5" fill="#6eb5c2" stroke="#d5e5dc" strokeWidth="1" />
                <text x="0" y="24" textAnchor="middle" fontSize="9" fill="#a4c9ef" fontWeight="bold">NASA POWER</text>
              </g>

              {/* Pin Arequipa */}
              <g transform="translate(195, 245)" style={{ cursor: 'pointer' }} onClick={() => setSelectedCityId('AREQUIPA')}>
                {selectedCityId === 'AREQUIPA' && <circle r="22" fill="url(#pulseArequipa)" />}
                <circle r={selectedCityId === 'AREQUIPA' ? 10 : 7} fill="#f6c15b" stroke="#ffffff" strokeWidth="2" />
                <text x="14" y="4" fontSize="12" fontWeight="bold" fill="#f6c15b">Arequipa (-16.4° S)</text>
              </g>

              {/* Pin Tromsø */}
              <g transform="translate(345, 55)" style={{ cursor: 'pointer' }} onClick={() => setSelectedCityId('TROMSO')}>
                {selectedCityId === 'TROMSO' && <circle r="22" fill="url(#pulseTromso)" />}
                <circle r={selectedCityId === 'TROMSO' ? 10 : 7} fill="#80d8ff" stroke="#ffffff" strokeWidth="2" />
                <text x="14" y="4" fontSize="12" fontWeight="bold" fill="#80d8ff">Tromsø (69.6° N)</text>
              </g>
            </svg>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#90b4d6', padding: '0.4rem' }}>
              Latitud: {selectedCity.latitude}° · Longitud: {selectedCity.longitude}° · {t('cities.threeDaysNote')}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BARRA DE ACCIÓN INFERIOR                                      */}
        {/* ------------------------------------------------------------- */}
        <div style={{ marginTop: '1.4rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="pixel-btn pixel-btn--primary"
            style={{ fontSize: '1.2rem', padding: '0.9rem 2.2rem' }}
            onClick={() => onSelectCity(selectedCity)}
          >
            <span>{t('cities.confirmBase', { city: t('cities.' + cityKey + '.name') })}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
