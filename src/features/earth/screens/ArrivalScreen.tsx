import { ArrowRight, Planet, ShieldWarning, Sparkle } from '@phosphor-icons/react';
import { type Backpack, type Destination, type NasaDataset } from '../../../game/contracts';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface ArrivalScreenProps {
  readonly destination: Destination;
  readonly astronautName: string;
  readonly cityName: string;
  readonly backpack: Backpack;
  readonly nasaData: NasaDataset;
  readonly onEnterBase: () => void;
}

export function ArrivalScreen({ destination, astronautName, cityName, backpack, nasaData, onEnterBase }: ArrivalScreenProps) {
  const { t } = useI18n();
  const tools = backpack.map((id) => t(`tools.catalog.${id}.label`));

  return (
    <div className="earth-screen">
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '52rem', marginBottom: '0.6rem' }}>
        <LanguageSelector variant="hud" />
      </div>
      <main className="earth-card" style={{ maxWidth: '52rem' }}>
        <h1 className="earth-card__title">
          <Planet color="#f6c15b" weight="fill" />
          <span>{t(destination === 'MOON' ? 'flight.arrivalMoonTitle' : 'flight.arrivalMarsTitle')}</span>
        </h1>
        <p className="earth-card__subtitle">
          {destination === 'MOON' ? t('flight.arrivalMoonSubtitle') : t('flight.arrivalMarsSubtitle')}
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
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>{destination === 'MOON' ? '🌕' : '🔴'}</div>
          <h2 style={{ fontFamily: 'Fredoka', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
            {destination === 'MOON' ? t('flight.baseMoonName') : t('flight.baseMarsName')}
          </h2>
          <p style={{ color: '#bed4eb', fontSize: '0.95rem', margin: '0.4rem 0 1rem 0' }}>
            {t('flight.commanderInCommand', { name: astronautName })} · {t('flight.trainedIn', { city: cityName })}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
            gap: '1rem',
            textAlign: 'left',
            marginTop: '1.2rem'
          }}>
            <div style={{ background: '#101a26', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: '1px solid #2d4562' }}>
              <span style={{ fontSize: '0.8rem', color: '#7cb5c8', fontWeight: 700 }}>{t('flight.externalTemp')}</span>
              <div style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#ffb74d' }}>{destination === 'MOON' ? t('flight.tempMoonVal') : t('flight.tempMarsVal')}</div>
            </div>
            <div style={{ background: '#101a26', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: '1px solid #2d4562' }}>
              <span style={{ fontSize: '0.8rem', color: '#7cb5c8', fontWeight: 700 }}>{t('flight.atmosphere')}</span>
              <div style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#64b5f6' }}>{destination === 'MOON' ? t('flight.atmoMoonVal') : t('flight.atmoMarsVal')}</div>
            </div>
            <div style={{ background: '#101a26', padding: '0.8rem 1rem', borderRadius: '0.8rem', border: '1px solid #2d4562' }}>
              <span style={{ fontSize: '0.8rem', color: '#7cb5c8', fontWeight: 700 }}>{t('flight.gravity')}</span>
              <div style={{ fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#81c784' }}>{destination === 'MOON' ? t('flight.gravityMoonVal') : t('flight.gravityMarsVal')}</div>
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
              {t('flight.initialStateTitle')}
            </h3>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', color: '#bed4ea', fontSize: '0.92rem' }}>
            {t('flight.availableTools', { tools: tools.join(' · ') })}
          </p>
          <p style={{ margin: 0, color: '#90caf9', fontSize: '0.88rem' }}>
            {t('flight.nasaRef', { count: nasaData.observations.length, status: nasaData.validation === 'VERIFIED' ? t('flight.verifiedStatus') : t('flight.pendingStatus') })}
          </p>
          <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', color: '#bed4ea', fontSize: '0.82rem' }}>
            {nasaData.observations.map((observation) => <li key={observation.recordId}>
              {observation.source} · {observation.observedAt} · {observation.parameter}: {observation.value} {observation.unit} ·{' '}
              <a href={observation.sourceUrl} target="_blank" rel="noreferrer">{t('flight.originalRecord')}</a>
            </li>)}
          </ul>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={onEnterBase}
          >
            <Sparkle weight="fill" />
            <span>{destination === 'MOON' ? t('flight.takeCommandMoon') : t('flight.takeCommandMars')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
