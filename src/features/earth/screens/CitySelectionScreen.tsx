import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sun, GlobeHemisphereWest, CheckCircle } from '@phosphor-icons/react';
import { SUPPORTED_CITIES, type CityData } from '../../../data/nasa/cities';
import './earth.css';

interface CitySelectionScreenProps {
  readonly initialCityId: string;
  readonly onSelectCity: (city: CityData) => void;
  readonly onBack: () => void;
}

export function CitySelectionScreen({ initialCityId, onSelectCity, onBack }: CitySelectionScreenProps) {
  const [selectedCityId, setSelectedCityId] = useState(initialCityId);
  const selectedCity = SUPPORTED_CITIES.find((c) => c.id === selectedCityId) ?? SUPPORTED_CITIES[0];

  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Volver a Inicio</span>
        </button>
        <div className="earth-screen__progress-pill">
          <span>Paso 1 de 5 · Tu lugar en la Tierra</span>
        </div>
      </header>

      <main className="earth-card">
        <h1 className="earth-card__title">
          <GlobeHemisphereWest color="#f6c15b" weight="fill" />
          <span>¿Desde dónde te preparas para el espacio?</span>
        </h1>
        <p className="earth-card__subtitle">
          Tu aventura comienza bajo el cielo terrestre. Conectamos con registros satelitales históricos de <strong>NASA POWER</strong> para analizar la radiación solar incidente en tu ciudad.
        </p>

        <div className="city-grid" role="radiogroup" aria-label="Selecciona tu ciudad de entrenamiento">
          {SUPPORTED_CITIES.map((city) => {
            const isSelected = city.id === selectedCityId;
            return (
              <div
                key={city.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`city-card ${isSelected ? 'city-card--selected' : ''}`}
                onClick={() => setSelectedCityId(city.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setSelectedCityId(city.id);
                  }
                }}
              >
                {city.id === 'LIMA' && <span className="city-card__badge">Demo Oficial</span>}
                <div>
                  <h2 className="city-card__name">{city.name}</h2>
                  <p className="city-card__country">{city.country}</p>
                  <p className="city-card__context">{city.description}</p>
                </div>
                {isSelected && (
                  <div style={{ marginTop: '0.8rem', color: '#f6c15b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <CheckCircle weight="fill" /> Seleccionada
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <section className="city-detail-panel" aria-label="Información científica de NASA POWER">
          <div className="city-detail-panel__header">
            <Sun weight="fill" size={20} />
            <span>Perfil Solar Científico · NASA POWER ({selectedCity.name})</span>
          </div>
          <p className="city-detail-panel__coords">
            Coordenadas: Latitud {selectedCity.latitude}°, Longitud {selectedCity.longitude}°
          </p>
          <p style={{ margin: 0, color: '#c5d8ea', fontSize: '0.92rem', lineHeight: '1.4' }}>
            {selectedCity.solarContext} En el observatorio solar utilizaremos estos datos históricos para poner a prueba la orientación de tus paneles fotovoltaicos.
          </p>
        </section>

        <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={() => onSelectCity(selectedCity)}
          >
            <span>Confirmar ciudad y crear comandante</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
