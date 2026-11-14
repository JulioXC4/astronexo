import { ArrowLeft, CheckCircle, Lock, Play, Sparkle, Compass } from '@phosphor-icons/react';
import type { TrainingId } from '../../../game/contracts';
import './earth.css';

interface PreparationMapScreenProps {
  readonly cityName: string;
  readonly astronautName: string;
  readonly completedTrainings: readonly TrainingId[];
  readonly onOpenTraining: (trainingId: TrainingId) => void;
  readonly onOpenBackpack: () => void;
  readonly onBack: () => void;
}

export function PreparationMapScreen({
  cityName,
  astronautName,
  completedTrainings,
  onOpenTraining,
  onOpenBackpack,
  onBack,
}: PreparationMapScreenProps) {
  const hasSolar = completedTrainings.includes('SOLAR_DETECTIVE');
  const hasWatch = completedTrainings.includes('SOLAR_WATCH');
  const allCoreTrainingsDone = hasSolar && hasWatch;

  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Perfil</span>
        </button>
        <div className="earth-screen__progress-pill">
          <Compass weight="fill" />
          <span>Centro de Entrenamiento Espacial · {cityName}</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '58rem' }}>
        <div className="prep-map__overview">
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>
              Base de Preparación: {astronautName}
            </h1>
            <p style={{ margin: 0, color: '#a0c4e8', fontSize: '0.92rem' }}>
              Selecciona una instalación para entrenarte con ciencia real de la NASA antes de viajar a la Luna.
            </p>
          </div>
          <div className="prep-map__stats">
            <div className="prep-map__stat-item">
              <span className="prep-map__stat-label">Certificaciones</span>
              <span className="prep-map__stat-value">{completedTrainings.length} / 2</span>
            </div>
            <div className="prep-map__stat-item">
              <span className="prep-map__stat-label">Estado de Vuelo</span>
              <span className="prep-map__stat-value" style={{ color: allCoreTrainingsDone ? '#66bb6a' : '#f6c15b' }}>
                {allCoreTrainingsDone ? '¡Apto para Despegue!' : 'En Entrenamiento'}
              </span>
            </div>
          </div>
        </div>

        <div className="facility-grid" style={{ marginTop: '1.5rem' }}>
          {/* 1. Observatorio Solar */}
          <div className={`facility-card ${hasSolar ? 'facility-card--completed' : ''}`}>
            <div className={`facility-card__status-tag ${hasSolar ? 'facility-card__status-tag--completed' : 'facility-card__status-tag--available'}`}>
              {hasSolar ? <><CheckCircle weight="fill" /> Certificado</> : <><Sparkle weight="fill" /> Disponible</>}
            </div>
            <div className="facility-card__icon" aria-hidden="true">🔭</div>
            <h2 className="facility-card__title">Observatorio Solar</h2>
            <div className="facility-card__source">Fuente: NASA POWER</div>
            <p className="facility-card__desc">
              Compara 3 días históricos de radiación solar en {cityName}, orienta tu panel fotovoltaico y prueba la generación de energía.
            </p>
            <button
              type="button"
              className={`facility-card__btn ${hasSolar ? '' : 'facility-card__btn--gold'}`}
              onClick={() => onOpenTraining('SOLAR_DETECTIVE')}
            >
              <Play weight="fill" />
              <span>{hasSolar ? 'Repetir entrenamiento' : 'Iniciar Detective del Sol'}</span>
            </button>
          </div>

          {/* 2. Centro de Clima Espacial */}
          <div className={`facility-card ${hasWatch ? 'facility-card--completed' : ''}`}>
            <div className={`facility-card__status-tag ${hasWatch ? 'facility-card__status-tag--completed' : 'facility-card__status-tag--available'}`}>
              {hasWatch ? <><CheckCircle weight="fill" /> Certificado</> : <><Sparkle weight="fill" /> Disponible</>}
            </div>
            <div className="facility-card__icon" aria-hidden="true">🛰️</div>
            <h2 className="facility-card__title">Centro de Clima Espacial</h2>
            <div className="facility-card__source">Fuente: NASA DONKI</div>
            <p className="facility-card__desc">
              Investiga una gran eyección de masa coronal (CME) histórica y activa los protocolos preventivos para proteger a la tripulación.
            </p>
            <button
              type="button"
              className={`facility-card__btn ${hasWatch ? '' : 'facility-card__btn--gold'}`}
              onClick={() => onOpenTraining('SOLAR_WATCH')}
            >
              <Play weight="fill" />
              <span>{hasWatch ? 'Repetir entrenamiento' : 'Iniciar Vigilante del Sol'}</span>
            </button>
          </div>

          {/* 3. Hangar de Soporte Vital */}
          <div className="facility-card">
            <div className="facility-card__status-tag facility-card__status-tag--completed">
              <CheckCircle weight="fill" /> Acreditado
            </div>
            <div className="facility-card__icon" aria-hidden="true">💨</div>
            <h2 className="facility-card__title">Hangar de Soporte Vital</h2>
            <div className="facility-card__source">Principio: NASA ECLSS</div>
            <p className="facility-card__desc">
              Taller de filtrado y reciclaje de oxígeno (ECLSS). En el espacio, cada molécula de aire y gota de agua debe recuperarse continuamente.
            </p>
            <span style={{ fontSize: '0.85rem', color: '#90caf9', fontWeight: 700 }}>
              ✓ Protocolo básico integrado en tu kit de herramientas
            </span>
          </div>

          {/* 4. Bio-Laboratorio de Cultivos */}
          <div className="facility-card">
            <div className="facility-card__status-tag facility-card__status-tag--completed">
              <CheckCircle weight="fill" /> Acreditado
            </div>
            <div className="facility-card__icon" aria-hidden="true">🌱</div>
            <h2 className="facility-card__title">Bio-Módulo Hidropónico</h2>
            <div className="facility-card__source">Fundamento: CSA & NASA Veggie</div>
            <p className="facility-card__desc">
              Las plantas en la Luna necesitan iluminación LED controlada y sustratos hidropónicos. No crecen mágicamente: requieren balance de energía.
            </p>
            <span style={{ fontSize: '0.85rem', color: '#a5d6a7', fontWeight: 700 }}>
              ✓ Muestras listas para empacar en la bodega
            </span>
          </div>

          {/* 5. Plataforma de Carga y Despegue */}
          <div className={`facility-card ${allCoreTrainingsDone ? 'facility-card--completed' : 'facility-card--available'}`} style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className={`facility-card__status-tag ${allCoreTrainingsDone ? 'facility-card__status-tag--completed' : 'facility-card__status-tag--available'}`}>
                  {allCoreTrainingsDone ? <><CheckCircle weight="fill" /> Listo para Preparar Mochila</> : <>Paso Final</>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>🚀</span>
                  <div>
                    <h2 className="facility-card__title" style={{ fontSize: '1.4rem', margin: 0 }}>
                      Plataforma de Carga: Hangar de Herramientas
                    </h2>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#b9d5ee', fontSize: '0.92rem' }}>
                      Tienes 4 kits espaciales y la bodega de la nave admite <strong>exactamente 3</strong>. ¡Tus decisiones de carga definirán tu supervivencia lunar!
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="earth-action-btn"
                onClick={onOpenBackpack}
              >
                <span>{allCoreTrainingsDone ? 'Empacar Mochila (3 de 4)' : 'Ir al Hangar de Carga'}</span>
                {allCoreTrainingsDone ? <Sparkle weight="fill" /> : <Lock weight="bold" />}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
