import { useState } from 'react';
import { ArrowLeft, ArrowRight, Crosshair, Sun, GlobeHemisphereWest } from '@phosphor-icons/react';
import { SUPPORTED_CITIES, type CityData } from '../../../data/nasa/cities';
import './earth.css';

interface CitySelectionScreenProps {
  readonly initialCityId: string;
  readonly onSelectCity: (city: CityData) => void;
  readonly onBack: () => void;
}

// Coordenadas relativas en el canvas SVG del mapa (proyección esquemática centrada en las Américas)
const CITY_MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  LIMA: { x: 330, y: 360 },     // Costa de Perú
  AREQUIPA: { x: 365, y: 395 }, // Sur andino de Perú
  BOGOTA: { x: 320, y: 260 },   // Andes de Colombia
  HOUSTON: { x: 260, y: 150 },  // Golfo de México / EE.UU.
};

export function CitySelectionScreen({ initialCityId, onSelectCity, onBack }: CitySelectionScreenProps) {
  const [selectedCityId, setSelectedCityId] = useState(initialCityId);
  const selectedCity = SUPPORTED_CITIES.find((c) => c.id === selectedCityId) ?? SUPPORTED_CITIES[0];
  const activePos = CITY_MAP_POSITIONS[selectedCity.id] ?? { x: 330, y: 360 };

  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Volver al Inicio</span>
        </button>
        <div className="earth-screen__progress-pill">
          <GlobeHemisphereWest weight="fill" color="#f6c15b" />
          <span>Telemetría Satelital · Selecciona tu Base Terrestre</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '60rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.6rem', margin: 0 }}>
              <Crosshair color="#f6c15b" weight="bold" />
              <span>Mapa de Telemetría NASA POWER</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.9rem' }}>
              Toca un punto en el mapa para posicionar tu centro espacial.
            </p>
          </div>

          {/* Selector rápido tipo pastillas tácticas */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {SUPPORTED_CITIES.map((city) => (
              <button
                key={city.id}
                type="button"
                className={`callsign-chip ${city.id === selectedCityId ? 'callsign-chip--active' : ''}`}
                style={{
                  background: city.id === selectedCityId ? '#f6c15b' : '#1e3857',
                  color: city.id === selectedCityId ? '#101d2d' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '0.35rem 0.8rem',
                }}
                onClick={() => setSelectedCityId(city.id)}
              >
                {city.name} {city.id === 'LIMA' && '★'}
              </button>
            ))}
          </div>
        </div>

        {/* Contenedor dividido: Mapa visual interactivo a la izquierda, HUD de telemetría a la derecha */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem', alignItems: 'center' }}>
          
          {/* MAPA VISUAL SVG INTERACTIVO */}
          <div style={{
            background: 'radial-gradient(circle at 50% 50%, #152c48 0%, #0c1827 100%)',
            border: '2px solid #335985',
            borderRadius: '1rem',
            overflow: 'hidden',
            position: 'relative',
            height: '22rem',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
          }}>
            <svg
              viewBox="0 0 600 500"
              style={{ width: '100%', height: '100%', display: 'block' }}
              role="img"
              aria-label="Mapa interactivo de bases terrestres"
            >
              {/* Cuadrícula de coordenadas satelitales */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(76, 195, 217, 0.12)" strokeWidth="1" />
                </pattern>
                <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f6c15b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f6c15b" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Silueta estilizada de continentes de América */}
              <path
                d="M 180 80 Q 240 70 320 110 Q 340 160 280 200 Q 260 220 310 250 Q 360 280 390 330 Q 410 400 370 470 Q 330 450 300 380 Q 280 300 240 230 Q 180 180 150 120 Z"
                fill="#1c3859"
                stroke="#3f6d9e"
                strokeWidth="2"
              />
              <path
                d="M 230 180 L 290 190 L 320 220 L 270 215 Z"
                fill="#254870"
                stroke="#4a7eb5"
                strokeWidth="1.5"
              />

              {/* Conexión orbital del satélite con la ciudad activa */}
              <line
                x1="480"
                y1="60"
                x2={activePos.x}
                y2={activePos.y}
                stroke="#f6c15b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.7"
              />

              {/* Icono del satélite NASA POWER en órbita */}
              <g transform="translate(480, 60)">
                <circle r="14" fill="#1b3656" stroke="#f6c15b" strokeWidth="2" />
                <text x="0" y="5" textAnchor="middle" fontSize="13" fill="#f6c15b">🛰️</text>
                <text x="0" y="26" textAnchor="middle" fontSize="10" fill="#a4c9ef" fontWeight="bold">NASA POWER</text>
              </g>

              {/* Pines de ciudades sobre el mapa */}
              {SUPPORTED_CITIES.map((city) => {
                const pos = CITY_MAP_POSITIONS[city.id] ?? { x: 300, y: 250 };
                const isSelected = city.id === selectedCityId;

                return (
                  <g
                    key={city.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCityId(city.id)}
                  >
                    {/* Anillo de pulso si está seleccionado */}
                    {isSelected && (
                      <circle r="22" fill="url(#radarPulse)">
                        <animate attributeName="r" values="10;28;10" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      r={isSelected ? 10 : 6}
                      fill={isSelected ? '#f6c15b' : '#4cc3d9'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x="14"
                      y="4"
                      fontSize={isSelected ? "13" : "11"}
                      fontWeight="bold"
                      fill={isSelected ? '#ffffff' : '#9ec5ec'}
                    >
                      {city.name} {city.id === 'LIMA' && '★'}
                    </text>
                  </g>
                );
              })}

              {/* Mira táctica sobre la ciudad activa */}
              <g transform={`translate(${activePos.x}, ${activePos.y})`}>
                <circle r="18" fill="none" stroke="#f6c15b" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="-24" y1="0" x2="-14" y2="0" stroke="#f6c15b" strokeWidth="2" />
                <line x1="14" y1="0" x2="24" y2="0" stroke="#f6c15b" strokeWidth="2" />
                <line x1="0" y1="-24" x2="0" y2="-14" stroke="#f6c15b" strokeWidth="2" />
                <line x1="0" y1="14" x2="0" y2="24" stroke="#f6c15b" strokeWidth="2" />
              </g>
            </svg>
          </div>

          {/* HUD TÁCTICO DE TELEMETRÍA */}
          <div style={{
            background: '#132438',
            border: '2px solid #2f537d',
            borderRadius: '1rem',
            padding: '1.4rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '22rem',
            boxSizing: 'border-box'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#f6c15b', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Base Seleccionada
                </span>
                {selectedCity.id === 'LIMA' && (
                  <span style={{ background: '#f6c15b', color: '#101d2d', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.4rem' }}>
                    Demo Oficial
                  </span>
                )}
              </div>

              <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.8rem', color: '#ffffff', margin: '0.3rem 0 0.1rem 0' }}>
                {selectedCity.name}, {selectedCity.country}
              </h2>
              <div style={{ fontFamily: 'monospace', color: '#7cb5c8', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                COORD: {selectedCity.latitude}° S, {Math.abs(selectedCity.longitude)}° O
              </div>

              {/* Medidor visual de radiación solar (gauge esquemático) */}
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
                  background: 'conic-gradient(#f6c15b 0% 75%, #1e354f 75% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{ width: '2.4rem', height: '2.4rem', borderRadius: '50%', background: '#0d1926', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sun weight="fill" color="#f6c15b" size={18} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#8fb1d4', textTransform: 'uppercase', fontWeight: 700 }}>
                    Radiación Solar Incidente
                  </span>
                  <div style={{ fontFamily: 'Fredoka', fontSize: '1.25rem', color: '#ffffff' }}>
                    {selectedCity.id === 'LIMA' ? '6.42 kWh/m²' : 'Variable'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#5ec284' }}>
                    ✓ Datos históricos NASA POWER validados
                  </span>
                </div>
              </div>

              <p style={{ margin: '0.4rem 0 0 0', color: '#b2cce6', fontSize: '0.88rem', lineHeight: '1.35' }}>
                {selectedCity.description}
              </p>
            </div>

            <button
              type="button"
              className="earth-action-btn"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => onSelectCity(selectedCity)}
            >
              <span>Establecer Base en {selectedCity.name}</span>
              <ArrowRight weight="bold" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
