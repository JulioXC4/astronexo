import { useState } from 'react';
import { ArrowLeft, ArrowRight, Crosshair, Sun, Snowflake, GlobeHemisphereWest } from '@phosphor-icons/react';
import { SUPPORTED_CITIES, type CityData } from '../../../data/nasa/cities';
import { CityLandscape } from '../../../visual-kit/CityLandscape';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface CitySelectionScreenProps {
  readonly initialCityId: string;
  readonly onSelectCity: (city: CityData) => void;
  readonly onBack: () => void;
}

// Coordenadas relativas en el canvas SVG del mapamundi (600 x 360)
// Arequipa: Sudamérica pacífico (-16° S, -71° O) -> x: 195, y: 245
// Tromsø: Norte de Escandinavia / Ártico (69° N, 19° E) -> x: 345, y: 55
const CITY_MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  AREQUIPA: { x: 195, y: 245 },
  TROMSO: { x: 345, y: 55 },
};

export function CitySelectionScreen({ initialCityId, onSelectCity, onBack }: CitySelectionScreenProps) {
  const { t } = useI18n();
  const [selectedCityId, setSelectedCityId] = useState<'AREQUIPA' | 'TROMSO'>(
    initialCityId === 'TROMSO' ? 'TROMSO' : 'AREQUIPA'
  );

  const selectedCity = SUPPORTED_CITIES.find((c) => c.id === selectedCityId) ?? SUPPORTED_CITIES[0];
  const activePos = CITY_MAP_POSITIONS[selectedCity.id] ?? { x: 195, y: 245 };
  const cityKey = selectedCity.id === 'AREQUIPA' ? 'arequipa' : 'tromso';

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <Crosshair color="#f6c15b" weight="bold" />
              <span>{t('cities.title')}</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              {t('cities.subtitle')}
            </p>
          </div>

          {/* Selector de las dos ciudades oficiales V3.0 */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {SUPPORTED_CITIES.map((city) => {
              const isSelected = city.id === selectedCityId;
              const isArequipa = city.id === 'AREQUIPA';
              const localizedName = isArequipa ? t('cities.arequipa.name') : t('cities.tromso.name');
              const localizedCountry = isArequipa ? t('cities.arequipa.country') : t('cities.tromso.country');
              return (
                <button
                  key={city.id}
                  type="button"
                  className="callsign-chip"
                  style={{
                    background: isSelected ? (city.id === 'AREQUIPA' ? '#f6c15b' : '#80d8ff') : '#1e3857',
                    color: isSelected ? '#101d2d' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    padding: '0.45rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: isSelected ? '2px solid #ffffff' : '1px solid #3d6899'
                  }}
                  onClick={() => setSelectedCityId(city.id)}
                >
                  {city.id === 'AREQUIPA' ? <Sun weight="fill" size={16} /> : <Snowflake weight="fill" size={16} />}
                  <span>{localizedName} ({localizedCountry})</span>
                </button>
              );
            })}
          </div>
        </div>

        <CityLandscape cityId={selectedCityId} />

        {/* CONTENEDOR DIVIDIDO: MAPA GLOBAL SVG (IZQ) Y HUD CIENTÍFICO (DER) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.2rem', alignItems: 'center' }}>
          
          {/* MAPAMUNDI INTERACTIVO SVG */}
          <div style={{
            background: 'radial-gradient(ellipse at 50% 50%, #173356 0%, #0a1726 100%)',
            border: '2px solid #335d8b',
            borderRadius: '1rem',
            overflow: 'hidden',
            position: 'relative',
            height: '22rem',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)',
          }}>
            <svg
              viewBox="0 0 600 360"
              style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
              role="img"
              aria-label="Mapamundi que ubica Arequipa y Tromsø"
            >
              <defs>
                {/* Cuadrícula de latitudes y meridianos */}
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

              {/* Ecuador y Círculo Polar Ártico */}
              <line x1="0" y1="180" x2="600" y2="180" stroke="rgba(246, 193, 91, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="10" y="175" fontSize="8" fill="#f6c15b" opacity="0.6">ECUADOR (0°)</text>

              <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(128, 216, 255, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="10" y="55" fontSize="8" fill="#80d8ff" opacity="0.6">CÍRCULO POLAR ÁRTICO (66.5° N)</text>

              {/* Siluetas de continentes */}
              {/* América del Norte */}
              <path
                d="M 100 50 Q 150 40 210 60 Q 230 110 170 140 Q 150 160 190 180 Q 140 180 110 130 Z"
                fill="#1b3654"
                stroke="#355e8a"
                strokeWidth="1.5"
              />
              {/* América del Sur (donde está Arequipa en la costa del Pacífico) */}
              <path
                d="M 180 180 Q 240 190 250 240 Q 240 310 200 340 Q 180 320 175 260 Q 170 210 180 180 Z"
                fill="#204268"
                stroke="#4377ae"
                strokeWidth="2"
              />
              {/* Europa y Escandinavia (donde está Tromsø arriba al norte) */}
              <path
                d="M 310 90 Q 340 30 360 40 Q 370 70 340 95 Q 360 130 320 150 Q 290 140 300 110 Z"
                fill="#204268"
                stroke="#4377ae"
                strokeWidth="2"
              />
              {/* África y Asia esquemáticas */}
              <path
                d="M 310 155 Q 360 160 380 220 Q 360 290 320 270 Q 300 210 310 155 Z"
                fill="#1b3654"
                stroke="#355e8a"
                strokeWidth="1.5"
              />
              <path
                d="M 370 70 Q 480 50 530 100 Q 510 170 430 160 Q 380 120 370 70 Z"
                fill="#1b3654"
                stroke="#355e8a"
                strokeWidth="1.5"
              />

              {/* Enlace de telemetría entre satélite y la ciudad activa */}
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

              {/* ============================================================== */}
              {/* PIN 1: AREQUIPA, PERÚ                                          */}
              {/* ============================================================== */}
              <g
                transform="translate(195, 245)"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedCityId('AREQUIPA')}
              >
                {selectedCityId === 'AREQUIPA' && (
                  <circle r="22" fill="url(#pulseArequipa)">
                  </circle>
                )}
                <circle r={selectedCityId === 'AREQUIPA' ? 10 : 7} fill="#f6c15b" stroke="#ffffff" strokeWidth="2" />
                <text x="14" y="4" fontSize="12" fontWeight="bold" fill="#f6c15b">
                  Arequipa (-16.4°)
                </text>
              </g>

              {/* ============================================================== */}
              {/* PIN 2: TROMSØ, NORUEGA                                         */}
              {/* ============================================================== */}
              <g
                transform="translate(345, 55)"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedCityId('TROMSO')}
              >
                {selectedCityId === 'TROMSO' && (
                  <circle r="22" fill="url(#pulseTromso)">
                  </circle>
                )}
                <circle r={selectedCityId === 'TROMSO' ? 10 : 7} fill="#80d8ff" stroke="#ffffff" strokeWidth="2" />
                <text x="14" y="4" fontSize="12" fontWeight="bold" fill="#80d8ff">
                  Tromsø (69.6° N)
                </text>
              </g>

              {/* Retícula / Mira sobre la base activa */}
              <g transform={`translate(${activePos.x}, ${activePos.y})`}>
                <circle r="18" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="-24" y1="0" x2="-14" y2="0" stroke="#ffffff" strokeWidth="2" />
                <line x1="14" y1="0" x2="24" y2="0" stroke="#ffffff" strokeWidth="2" />
                <line x1="0" y1="-24" x2="0" y2="-14" stroke="#ffffff" strokeWidth="2" />
                <line x1="0" y1="14" x2="0" y2="24" stroke="#ffffff" strokeWidth="2" />
              </g>
            </svg>
          </div>

          {/* HUD CIENTÍFICO DE LA BASE SELECCIONADA */}
          <div style={{
            background: '#132438',
            border: `2px solid ${selectedCity.id === 'AREQUIPA' ? '#f6c15b' : '#80d8ff'}`,
            borderRadius: '1rem',
            padding: '1.4rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '22rem',
            boxSizing: 'border-box'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: selectedCity.id === 'AREQUIPA' ? '#f6c15b' : '#80d8ff', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {t('cities.' + cityKey + '.badge')}
                </span>
                <span style={{
                  background: selectedCity.id === 'AREQUIPA' ? '#f6c15b' : '#80d8ff',
                  color: '#101d2d',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.4rem'
                }}>
                  {t('cities.' + cityKey + '.specialty')}
                </span>
              </div>

              <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.8rem', color: '#ffffff', margin: '0.3rem 0 0.1rem 0' }}>
                {t('cities.' + cityKey + '.name')}, {t('cities.' + cityKey + '.country')}
              </h2>
              <div style={{ fontFamily: 'monospace', color: '#7cb5c8', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                LAT: {selectedCity.latitude}° | LON: {selectedCity.longitude}° | ALTITUD: {selectedCity.altitudeMeters} m
              </div>

              {/* Medidor de radiación solar de NASA POWER */}
              <div style={{
                background: '#0d1926',
                border: '1px solid #264366',
                borderRadius: '0.8rem',
                padding: '0.8rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                margin: '0.6rem 0'
              }}>
                <div style={{
                  width: '3.2rem',
                  height: '3.2rem',
                  borderRadius: '50%',
                  background: selectedCity.id === 'AREQUIPA'
                    ? 'conic-gradient(#f6c15b 0% 85%, #1e354f 85% 100%)'
                    : 'conic-gradient(#80d8ff 0% 45%, #1e354f 45% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', background: '#0d1926', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedCity.id === 'AREQUIPA'
                      ? <Sun weight="fill" color="#f6c15b" size={18} />
                      : <Snowflake weight="fill" color="#80d8ff" size={18} />}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#8fb1d4', textTransform: 'uppercase', fontWeight: 700 }}>
                    {t('cities.historicalDates')}
                  </span>
                  <div style={{ fontFamily: 'Fredoka', fontSize: '1.25rem', color: '#ffffff' }}>
                    {t('cities.' + cityKey + '.irradianceRange')}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#5ec284' }}>
                    {t('cities.threeDaysNote')}
                  </span>
                </div>
              </div>

              <p style={{ margin: '0.4rem 0 0 0', color: '#b2cce6', fontSize: '0.88rem', lineHeight: '1.35' }}>
                {t('cities.' + cityKey + '.description')}
              </p>
            </div>

            <button
              type="button"
              className="earth-action-btn"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => onSelectCity(selectedCity)}
            >
              <span>{t('cities.confirmBase', { city: t('cities.' + cityKey + '.name') })}</span>
              <ArrowRight weight="bold" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
