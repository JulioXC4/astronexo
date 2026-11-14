import { ArrowLeft, BookOpen, Sun, ShieldWarning, Wind, Plant, Globe } from '@phosphor-icons/react';
import './earth.css';

interface LearnScreenProps {
  readonly onBack: () => void;
}

const LEARN_TOPICS = [
  {
    icon: <Sun size={28} color="#f6c15b" weight="fill" />,
    title: 'Energía Solar y Radiación Incidente',
    source: 'NASA POWER (Prediction of Worldwide Energy Resources)',
    url: 'https://power.larc.nasa.gov/',
    summary: 'La radiación incidente es la energía de la luz que llega del Sol. Los paneles fotovoltaicos convierten entre el 18% y el 24% de esa luz en electricidad. Para aprovecharla al máximo, los paneles deben orientarse e inclinarse según la latitud de tu ciudad o del lugar de alunizaje.',
  },
  {
    icon: <ShieldWarning size={28} color="#ba68c8" weight="fill" />,
    title: 'Clima Espacial y Tormentas Solares',
    source: 'NASA DONKI (Space Weather Database of Notifications)',
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
    summary: 'El Sol emite constantemente viento solar, pero a veces expulsa llamaradas (rayos X y UV que llegan en 8 minutos) o eyecciones de masa coronal (CME, nubes gigantes de plasma que tardan de 1 a 3 días). En la Luna no hay atmósfera ni campo magnético, por lo que el blindaje de refugio es vital.',
  },
  {
    icon: <Wind size={28} color="#64b5f6" weight="fill" />,
    title: 'Soporte Vital Regenerativo (ECLSS)',
    source: 'NASA ECLSS (Environmental Control and Life Support)',
    url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/',
    summary: 'En la Estación Espacial Internacional y en la Luna, el 98% del agua de la tripulación (incluyendo sudor y condensación) se filtra y recicla para beber. Mediante electrólisis, se separa el agua en oxígeno respirable e hidrógeno.',
  },
  {
    icon: <Plant size={28} color="#81c784" weight="fill" />,
    title: 'Cultivos y Botánica Espacial',
    source: 'NASA Veggie & Advanced Plant Habitat',
    url: 'https://www.nasa.gov/missions/station/iss-research/veggie-plant-growth-system-study/',
    summary: 'Las plantas en el espacio crecen en hidroponía o almohadillas especiales con nutrientes líquidos y luz LED roja, azul y verde. Además de proporcionar alimento fresco como lechugas o rábanos, ayudan a fijar CO₂ y aportan bienestar psicológico a los astronautas.',
  },
] as const;

export function LearnScreen({ onBack }: LearnScreenProps) {
  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Volver al Juego</span>
        </button>
        <div className="earth-screen__progress-pill">
          <BookOpen weight="fill" color="#f6c15b" />
          <span>Enciclopedia Científica · Aprende con la NASA</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '56rem' }}>
        <h1 className="earth-card__title">
          <BookOpen color="#f6c15b" weight="fill" />
          <span>La Ciencia Detrás de Astronauta Junior</span>
        </h1>
        <p className="earth-card__subtitle">
          Todo lo que viviste en el juego está respaldado por investigaciones científicas reales y misiones activas de la NASA.
        </p>

        <div style={{ display: 'grid', gap: '1.2rem', margin: '1.5rem 0' }}>
          {LEARN_TOPICS.map((topic, i) => (
            <article
              key={i}
              style={{
                background: '#15263a',
                border: '1px solid #33547d',
                borderRadius: '1rem',
                padding: '1.4rem',
                display: 'flex',
                gap: '1.2rem',
                alignItems: 'flex-start'
              }}
            >
              <div style={{
                background: '#1f3854',
                padding: '0.8rem',
                borderRadius: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {topic.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.25rem', color: '#ffffff' }}>
                    {topic.title}
                  </h2>
                  <a
                    href={topic.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.85rem',
                      color: '#f6c15b',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontWeight: 700
                    }}
                  >
                    <Globe size={16} /> Ver en NASA.gov
                  </a>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#7cb5c8', fontWeight: 700, display: 'block', margin: '0.2rem 0 0.6rem 0' }}>
                  Fuente Oficial: {topic.source}
                </span>
                <p style={{ margin: 0, color: '#c5d8ea', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  {topic.summary}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button type="button" className="earth-action-btn" onClick={onBack}>
            <span>Regresar a la Misión</span>
          </button>
        </div>
      </main>
    </div>
  );
}
