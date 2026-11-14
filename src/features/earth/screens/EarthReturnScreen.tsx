import { ArrowRight, GlobeHemisphereWest, Sparkle } from '@phosphor-icons/react';
import type { MissionResult } from '../../../game/contracts';
import './earth.css';

interface EarthReturnScreenProps {
  readonly result: MissionResult;
  readonly astronautName: string;
  readonly onProceedToNextAdventure: () => void;
}

export function EarthReturnScreen({ result, astronautName, onProceedToNextAdventure }: EarthReturnScreenProps) {
  const isSuccess = result.outcome === 'SUCCESS';

  return (
    <div className="earth-screen">
      <main className="earth-card" style={{ maxWidth: '48rem', textAlign: 'center' }}>
        <h1 className="earth-card__title" style={{ justifyContent: 'center' }}>
          <GlobeHemisphereWest color="#f6c15b" weight="fill" />
          <span>¡Regreso a la Tierra: Misión Cumplida!</span>
        </h1>
        <p className="earth-card__subtitle">
          La cápsula espacial reingresa con éxito en la atmósfera terrestre y despliega sus paracaídas sobre el océano Pacífico.
        </p>

        <div style={{
          background: 'radial-gradient(circle at 50% 40%, #1e4570 0%, #0d1e33 100%)',
          border: '2px solid #366091',
          borderRadius: '1.2rem',
          padding: '2.5rem 1.5rem',
          margin: '1.5rem 0',
          position: 'relative'
        }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>🪂 🌊</div>
          <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
            {isSuccess ? '¡Bienvenido a Casa, Comandante!' : 'Retorno Seguro de Emergencia'}
          </h2>
          <p style={{ color: '#bed5ed', fontSize: '1rem', marginTop: '0.4rem' }}>
            Tripulante: <strong>{astronautName}</strong>
          </p>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid #3a5c86',
            borderRadius: '0.8rem',
            padding: '1rem',
            maxWidth: '32rem',
            margin: '1.2rem auto 0 auto',
            textAlign: 'left'
          }}>
            <p style={{ margin: 0, color: '#f6c15b', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Bitácora de Vuelo Final
            </p>
            <p style={{ margin: '0.3rem 0 0 0', color: '#e6f0fa', fontSize: '0.92rem', lineHeight: '1.4' }}>
              {result.explanation}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={onProceedToNextAdventure}
          >
            <Sparkle weight="fill" />
            <span>Ver Análisis y Próxima Aventura</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
