import { useState } from 'react';
import { ArrowLeft, ArrowRight, Planet, RocketLaunch, CheckCircle } from '@phosphor-icons/react';
import type { Destination } from '../../../game/contracts';
import './earth.css';

interface DestinationScreenProps {
  readonly cityName: string;
  readonly initialDestination: Destination;
  readonly onSelectDestination: (dest: Destination) => void;
  readonly onBack: () => void;
}

export function DestinationScreen({ cityName, initialDestination, onSelectDestination, onBack }: DestinationScreenProps) {
  const [selectedDest, setSelectedDest] = useState<Destination>(initialDestination || 'MOON');

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Cambiar Base ({cityName})</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Planet weight="fill" color="#f6c15b" />
          <span>Paso 2 de 6 · Destino Espacial (Requisitos V3.0)</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '58rem', padding: '1.2rem' }}>
        <h1 className="earth-card__title" style={{ fontSize: '1.6rem' }}>
          <RocketLaunch color="#f6c15b" weight="fill" />
          <span>Elige tu Destino Espacial antes de Entrenar</span>
        </h1>
        <p className="earth-card__subtitle">
          Tu preparación en la base de <strong>{cityName}</strong> se calibrará según los desafíos ambientales de tu destino.
        </p>

        <div className="destination-grid" role="radiogroup">
          {/* Opción Luna: Primera Luz */}
          <div
            role="radio"
            aria-checked={selectedDest === 'MOON'}
            tabIndex={0}
            className={`destination-card ${selectedDest === 'MOON' ? 'destination-card--selected' : ''}`}
            onClick={() => setSelectedDest('MOON')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedDest('MOON');
              }
            }}
          >
            <span className="destination-card__tag">Campaña Activa</span>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌕</div>
              <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
                Luna · Primera Luz
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#7cb5c8', fontWeight: 700 }}>
                Objetivo principal de la expedición
              </span>
              <ul style={{ margin: '0.8rem 0', paddingLeft: '1.2rem', color: '#c3d8ee', fontSize: '0.85rem', lineHeight: '1.5' }}>
                <li><strong>Gravedad:</strong> 0.16 g (1/6 de la Tierra).</li>
                <li><strong>Atmósfera:</strong> Vacío total exterior (0 atm).</li>
                <li><strong>Ciclo Día/Noche:</strong> 14 días de luz seguidos de 14 días de oscuridad continua.</li>
                <li><strong>Viaje:</strong> 3 días terrestres.</li>
              </ul>
            </div>
            {selectedDest === 'MOON' && (
              <div style={{ color: '#66bb6a', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" /> Seleccionado para la misión
              </div>
            )}
          </div>

          {/* Opción Marte: Horizonte Rojo */}
          <div
            role="radio"
            aria-checked={selectedDest === 'MARS'}
            tabIndex={0}
            className={`destination-card ${selectedDest === 'MARS' ? 'destination-card--selected' : ''}`}
            onClick={() => setSelectedDest('MARS')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedDest('MARS');
              }
            }}
          >
            <span className="destination-card__tag destination-card__tag--soon">Campaña Marte</span>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🪐</div>
              <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
                Marte · Horizonte Rojo
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#ffb74d', fontWeight: 700 }}>
                Desafío interplanetario de largo alcance
              </span>
              <ul style={{ margin: '0.8rem 0', paddingLeft: '1.2rem', color: '#c3d8ee', fontSize: '0.85rem', lineHeight: '1.5' }}>
                <li><strong>Gravedad:</strong> 0.38 g (más del doble que la Luna).</li>
                <li><strong>Atmósfera:</strong> Muy tenue, 95% CO₂.</li>
                <li><strong>Día / Noche:</strong> Sol marciano (24 horas 39 minutos).</li>
                <li><strong>Viaje:</strong> 7 a 9 meses interplanetarios.</li>
              </ul>
            </div>
            {selectedDest === 'MARS' && (
              <div style={{ color: '#ffb74d', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" /> Seleccionado para la misión
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={() => onSelectDestination(selectedDest)}
          >
            <span>Confirmar Destino y Crear Comandante</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
