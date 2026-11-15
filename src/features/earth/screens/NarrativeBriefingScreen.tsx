import { ArrowLeft, ArrowRight, RocketLaunch } from '@phosphor-icons/react';
import { CharacterPortrait } from '../../../visual-kit/CharacterPortrait';
import './earth.css';

interface NarrativeBriefingScreenProps {
  readonly cityName: string;
  readonly destination: string;
  readonly astronautName: string;
  readonly onProceedToMap: () => void;
  readonly onBack: () => void;
}

export function NarrativeBriefingScreen({ cityName, destination, astronautName, onProceedToMap, onBack }: NarrativeBriefingScreenProps) {
  const destLabel = destination === 'MOON' ? 'la Luna' : 'Marte';

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Cambiar Avatar</span>
        </button>
        <div className="earth-screen__progress-pill">
          <RocketLaunch weight="fill" color="#f6c15b" />
          <span>Paso 4 de 6 · Enlace de Misión ({cityName} ➔ {destLabel})</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '48rem', textAlign: 'center', padding: '1.4rem' }}>
        <h1 className="earth-card__title" style={{ justifyContent: 'center', marginBottom: '1rem', fontSize: '1.6rem' }}>
          <span>Centro de Enlace: {cityName}</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', margin: '1rem 0' }}>
          {/* Bocadillo 1: Comandante Alba explica la regla 3 de 5 */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div className="briefing-portrait" aria-hidden="true"><CharacterPortrait identity="ALBA" label="Alba" /></div>
            <div style={{
              background: '#1c3452',
              border: '2px solid #3c6594',
              borderRadius: '0.4rem 1.2rem 1.2rem 1.2rem',
              padding: '1rem 1.2rem',
              position: 'relative',
              flex: 1
            }}>
              <strong style={{ color: '#f6c15b', fontFamily: 'Fredoka', fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>
                Comandante Alba:
              </strong>
              <p style={{ margin: 0, color: '#e3effb', fontSize: '1rem', lineHeight: '1.45' }}>
                «¡Atención, <strong>{astronautName}</strong>! Nuestro cohete despegará hacia <strong>{destLabel}</strong>. En el mapa encontrarás <strong>5 instalaciones de entrenamiento</strong>. Sin embargo, por capacidad de bodega y tiempo de ventana orbital, <strong>solo podrás elegir y completar exactamente 3 misiones</strong>. Cada misión completada te otorgará una herramienta específica para tu nave.»
              </p>
            </div>
          </div>

          {/* Bocadillo 2: Robot Chispa */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div className="briefing-portrait" aria-hidden="true"><CharacterPortrait identity="CHISPA" kind="robot" label="Chispa" /></div>
            <div style={{
              background: '#1e334a',
              border: '2px solid #5a4b2c',
              borderRadius: '0.4rem 1.2rem 1.2rem 1.2rem',
              padding: '1rem 1.2rem',
              position: 'relative',
              flex: 1
            }}>
              <strong style={{ color: '#ffd54f', fontFamily: 'Fredoka', fontSize: '1.1rem', display: 'block', marginBottom: '0.2rem' }}>
                Chispa (IA de Soporte):
              </strong>
              <p style={{ margin: 0, color: '#e3effb', fontSize: '1rem', lineHeight: '1.45' }}>
                «¡Elige con sabiduría, Comandante! Cada instalación tiene un costo de decisión y un efecto directo sobre nuestra supervivencia en el espacio. ¡Vamos al mapa!»
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="earth-action-btn"
            style={{ fontSize: '1.15rem', padding: '0.9rem 2.2rem' }}
            onClick={onProceedToMap}
          >
            <span>¡Entrar al Mapa y Elegir las 3 Misiones!</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
