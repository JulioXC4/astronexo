import { ArrowRight, Planet, ShieldWarning, Sparkle } from '@phosphor-icons/react';
import { TOOL_CATALOG, type Backpack, type NasaDataset } from '../../../game/contracts';
import './earth.css';

interface ArrivalScreenProps {
  readonly astronautName: string;
  readonly cityName: string;
  readonly backpack: Backpack;
  readonly nasaData: NasaDataset;
  readonly onEnterBase: () => void;
}

export function ArrivalScreen({ astronautName, cityName, backpack, nasaData, onEnterBase }: ArrivalScreenProps) {
  const tools = backpack.map((id) => TOOL_CATALOG.find((t) => t.id === id)?.label ?? id);

  return (
    <div className="earth-screen">
      <main className="earth-card" style={{ maxWidth: '52rem' }}>
        <h1 className="earth-card__title">
          <Planet color="#f6c15b" weight="fill" />
          <span>¡Alunizaje Exitoso! Bienvenido a la Base Lunar</span>
        </h1>
        <p className="earth-card__subtitle">
          Cápsula <em>Astronexo I</em> posada en el sector del Polo Sur lunar (Cráter Shackleton).
        </p>

        <div style={{
          background: 'radial-gradient(circle at 50% 30%, #3a4759 0%, #17212e 100%)',
          border: '2px solid #4a6382',
          borderRadius: '1.2rem',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>🌕</div>
          <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
            Luna · Base Primera Luz
          </h2>
          <p style={{ color: '#bed4eb', fontSize: '0.95rem', margin: '0.4rem 0 1rem 0' }}>
            Comandante al frente: <strong>{astronautName}</strong> (Entrenado en {cityName})
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
            gap: '1rem',
            textAlign: 'left',
            marginTop: '1.2rem'
          }}>
            <div style={{ background: '#101a26', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: '1px solid #2d4562' }}>
              <span style={{ fontSize: '0.8rem', color: '#7cb5c8', fontWeight: 700 }}>Temperatura Exterior</span>
              <div style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#ffb74d' }}>-130°C a +120°C</div>
            </div>
            <div style={{ background: '#101a26', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: '1px solid #2d4562' }}>
              <span style={{ fontSize: '0.8rem', color: '#7cb5c8', fontWeight: 700 }}>Atmósfera</span>
              <div style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#64b5f6' }}>0% (Vacío total)</div>
            </div>
            <div style={{ background: '#101a26', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: '1px solid #2d4562' }}>
              <span style={{ fontSize: '0.8rem', color: '#7cb5c8', fontWeight: 700 }}>Gravedad</span>
              <div style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#81c784' }}>0.16 g (Baja)</div>
            </div>
          </div>
        </div>

        <section style={{
          background: '#142539',
          border: '1px solid #33557e',
          borderRadius: '0.9rem',
          padding: '1.2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldWarning color="#f6c15b" weight="fill" size={22} />
            <h3 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#ffffff' }}>
              Estado Inicial de Sistemas y Ciencia
            </h3>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', color: '#bed4ea', fontSize: '0.92rem' }}>
            <strong>Equipamiento disponible en la base:</strong> {tools.join(' · ')}
          </p>
          <p style={{ margin: 0, color: '#90caf9', fontSize: '0.88rem' }}>
            <strong>Integración científica NASA:</strong> {nasaData.observations.length} registros históricos transferidos ({nasaData.validation === 'VERIFIED' ? 'Verificados y Validados' : 'Pendientes'}).
          </p>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={onEnterBase}
          >
            <Sparkle weight="fill" />
            <span>Tomar el Mando de la Base Lunar (Software 1)</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
