import { ArrowLeft, ArrowRight, RocketLaunch } from '@phosphor-icons/react';
import './earth.css';

interface NarrativeBriefingScreenProps {
  readonly cityName: string;
  readonly astronautName: string;
  readonly onProceedToMap: () => void;
  readonly onBack: () => void;
}

export function NarrativeBriefingScreen({ cityName, astronautName, onProceedToMap, onBack }: NarrativeBriefingScreenProps) {
  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Cambiar Avatar</span>
        </button>
        <div className="earth-screen__progress-pill">
          <RocketLaunch weight="fill" color="#f6c15b" />
          <span>Comunicaciones de Misión</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '44rem', textAlign: 'center' }}>
        <h1 className="earth-card__title" style={{ justifyContent: 'center', marginBottom: '1.2rem' }}>
          <span>Centro de Enlace: {cityName}</span>
        </h1>

        {/* Diálogos estilo bocadillo de videojuego / cómic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', margin: '1rem 0' }}>
          
          {/* Bocadillo 1: Comandante Alba */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '3.8rem',
              height: '3.8rem',
              borderRadius: '50%',
              background: '#4d72b0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              border: '2px solid #8ab4f8',
              flexShrink: 0
            }}>
              👩‍🚀
            </div>
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
              <p style={{ margin: 0, color: '#e3effb', fontSize: '1rem', lineHeight: '1.4' }}>
                «¡Bienvenido al Centro Espacial, <strong>{astronautName}</strong>! La Tierra te prepara para el cosmos: debes certificar tu base en <strong>Energía Solar</strong> y <strong>Clima Espacial</strong> antes del despegue.»
              </p>
            </div>
          </div>

          {/* Bocadillo 2: Robot Chispa */}
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '3.8rem',
              height: '3.8rem',
              borderRadius: '50%',
              background: '#e0a548',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              border: '2px solid #ffd54f',
              flexShrink: 0
            }}>
              🤖
            </div>
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
              <p style={{ margin: 0, color: '#e3effb', fontSize: '1rem', lineHeight: '1.4' }}>
                «¡Sistemas listos! Toca las instalaciones del mapa para calibrar los paneles y blindar el refugio. ¡A trabajar!»
              </p>
            </div>
          </div>

        </div>

        <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="earth-action-btn"
            style={{ fontSize: '1.2rem', padding: '1rem 2.2rem' }}
            onClick={onProceedToMap}
          >
            <span>¡Entrar al Mapa del Centro Espacial!</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
