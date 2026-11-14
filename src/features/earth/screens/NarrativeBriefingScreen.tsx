import { ArrowLeft, ArrowRight, RocketLaunch, ChatTeardropText } from '@phosphor-icons/react';
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
          <span>Briefing de Misión Terrestre</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '46rem' }}>
        <h1 className="earth-card__title">
          <RocketLaunch color="#f6c15b" weight="fill" />
          <span>¡Bienvenido al Centro Espacial, {astronautName}!</span>
        </h1>
        <p className="earth-card__subtitle">
          Base de entrenamiento enlazada con las coordenadas de <strong>{cityName}</strong>.
        </p>

        <div style={{
          background: '#132338',
          border: '2px solid #2e4f78',
          borderRadius: '1rem',
          padding: '1.4rem',
          margin: '1.2rem 0',
          display: 'flex',
          gap: '1.2rem',
          alignItems: 'flex-start'
        }}>
          <div style={{
            fontSize: '3rem',
            background: '#4d72b0',
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            👩‍🚀
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontFamily: 'Fredoka', fontSize: '1.15rem', color: '#f6c15b' }}>Comandante Alba</span>
              <span style={{ fontSize: '0.8rem', background: '#25446c', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', color: '#8ec5fc' }}>Jefa de Instrucción</span>
            </div>
            <p style={{ margin: 0, color: '#dbe7f5', fontSize: '1rem', lineHeight: '1.5' }}>
              «¡Cadete, el espacio no perdona la improvisación! Nuestra regla de oro es: <em>La Tierra te prepara. La Luna y Marte ponen a prueba tus decisiones. Cada elección tiene consecuencias.</em>
              <br /><br />
              Antes de abordar el cohete hacia la Luna, debes completar dos certificaciones científicas obligatorias con datos reales de la NASA: aprender a orientar paneles según el Sol de tu ciudad (NASA POWER) y activar protocolos de protección ante tormentas solares (NASA DONKI).»
            </p>
          </div>
        </div>

        <div style={{
          background: '#152538',
          border: '1px dashed #3a5f8a',
          borderRadius: '0.8rem',
          padding: '1rem',
          color: '#b6cee5',
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <ChatTeardropText size={28} color="#f6c15b" weight="duotone" />
          <span>
            <strong>Tu objetivo en la Tierra:</strong> Supera las pruebas del Observatorio y del Centro de Clima Espacial para desbloquear el hangar de equipamiento y la plataforma de despegue.
          </span>
        </div>

        <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={onProceedToMap}
          >
            <span>Ir al Mapa de Preparación Terrestre</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
