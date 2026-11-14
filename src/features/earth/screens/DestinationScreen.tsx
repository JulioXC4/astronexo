import { useState } from 'react';
import { ArrowLeft, ArrowRight, Planet, RocketLaunch, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import type { Destination } from '../../../game/contracts';
import './earth.css';

interface DestinationScreenProps {
  readonly initialDestination: Destination;
  readonly onSelectDestination: (dest: Destination) => void;
  readonly onBack: () => void;
}

export function DestinationScreen({ initialDestination, onSelectDestination, onBack }: DestinationScreenProps) {
  const [selectedDest, setSelectedDest] = useState<Destination>(initialDestination || 'MOON');

  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Ajustar Bodega</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Planet weight="fill" color="#f6c15b" />
          <span>Paso 5 de 5 · Selecciona tu Destino Espacial</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '54rem' }}>
        <h1 className="earth-card__title">
          <RocketLaunch color="#f6c15b" weight="fill" />
          <span>Rumbo a otros mundos: ¿A dónde viajarás?</span>
        </h1>
        <p className="earth-card__subtitle">
          Cada destino espacial impone desafíos extremos de supervivencia y energía. La Luna es nuestro primer objetivo operativo.
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
                Objetivo principal de la misión
              </span>
              <ul style={{ margin: '1rem 0', paddingLeft: '1.2rem', color: '#c3d8ee', fontSize: '0.88rem', lineHeight: '1.5' }}>
                <li><strong>Gravedad:</strong> 0.16 g (1/6 de la Tierra).</li>
                <li><strong>Atmósfera:</strong> Sin atmósfera (vacío exterior).</li>
                <li><strong>Día / Noche:</strong> 14 días terrestres de luz continua seguidos de 14 días de oscuridad.</li>
                <li><strong>Tiempo de viaje:</strong> 3 días terrestres.</li>
              </ul>
            </div>
            {selectedDest === 'MOON' && (
              <div style={{ color: '#66bb6a', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle weight="fill" /> Seleccionado para despegue
              </div>
            )}
          </div>

          {/* Opción Marte: Horizonte Rojo */}
          <div
            role="radio"
            aria-checked={false}
            tabIndex={-1}
            className="destination-card destination-card--disabled"
            title="La campaña marciana está en fase de desarrollo"
          >
            <span className="destination-card__tag destination-card__tag--soon">Próximamente</span>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🪐</div>
              <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>
                Marte · Horizonte Rojo
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#e57373', fontWeight: 700 }}>
                Fase 2 del programa espacial
              </span>
              <ul style={{ margin: '1rem 0', paddingLeft: '1.2rem', color: '#c3d8ee', fontSize: '0.88rem', lineHeight: '1.5' }}>
                <li><strong>Gravedad:</strong> 0.38 g (más del doble que la Luna).</li>
                <li><strong>Atmósfera:</strong> Muy tenue, compuesta por 95% de CO₂.</li>
                <li><strong>Día / Noche:</strong> Sol marciano (24 horas y 39 minutos).</li>
                <li><strong>Tiempo de viaje:</strong> 7 a 9 meses terrestres.</li>
              </ul>
            </div>
            <div style={{ color: '#e57373', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <WarningCircle weight="fill" /> Bloqueado: Completa Luna primero
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={() => onSelectDestination('MOON')}
          >
            <span>Iniciar Secuencia de Despegue</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
