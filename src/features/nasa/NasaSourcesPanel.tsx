import { getSolarDatasetByCity } from '../../data/nasa/powerData';
import { DEFAULT_DONKI_EVENT, DONKI_SUPPORTING_EVENTS } from '../../data/nasa/donkiData';
import type { City, SpaceWeatherContext } from '../../game';
import { useI18n } from '../../i18n';

interface NasaSourcesPanelProps {
  /** Si se indica, solo se lista la ciudad jugada; si no, ambas. */
  readonly cityId?: City;
  /** Contexto DONKI usado en la partida; por defecto, el evento vigente del juego. */
  readonly spaceWeather?: SpaceWeatherContext;
}

const STATIC_SOURCES = [
  { key: 'eclss', url: 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/' },
  { key: 'veggie', url: 'https://www.nasa.gov/missions/station/iss-research/veggie-plant-growth-system-study/' },
  { key: 'osdr', url: 'https://osdr.nasa.gov/bio/' },
] as const;

/** Fuentes NASA con su estado real (histórico, actualizado o respaldo) y la regla simulada separada del dato. */
export function NasaSourcesPanel({ cityId, spaceWeather }: NasaSourcesPanelProps) {
  const { t } = useI18n();
  const cities: readonly City[] = cityId ? [cityId] : ['AREQUIPA', 'TROMSO'];
  const event = spaceWeather?.event;
  const difficulty = spaceWeather?.rule.difficulty;
  const speed = event?.value ?? Number(DEFAULT_DONKI_EVENT.observation.value);
  const supporting = DONKI_SUPPORTING_EVENTS.slice(0, 2);
  return (
    <section className="nasa-sources" aria-label={t('nasaSources.title')} style={{ background: 'rgba(2, 8, 19, .55)', border: '2px solid #315b73', borderRadius: 0, padding: '1rem 1.2rem', color: '#dcebf8', fontSize: '0.95rem' }}>
      <h2 style={{ margin: '0 0 0.5rem', fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#ffffff' }}>{t('nasaSources.title')}</h2>
      <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '0.35rem' }}>
        {cities.map((id) => {
          const dataset = getSolarDatasetByCity(id);
          const first = dataset.days[0].observation;
          return (
            <li key={id}>
              {t('nasaSources.power', {
                city: id === 'TROMSO' ? 'Tromsø' : 'Arequipa',
                parameter: first.parameter,
                status: t(`nasaStatus.${first.status ?? 'HISTORICAL'}`),
                date: first.fetchedAt ?? '',
              })}{' '}
              <a href={first.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#f6c15b' }}>URL</a>
            </li>
          );
        })}
        <li>
          {t('nasaSources.donki', {
            date: (event?.observedAt ?? DEFAULT_DONKI_EVENT.observedAt).slice(0, 10),
            speed,
            status: t(`nasaStatus.${event?.status ?? DEFAULT_DONKI_EVENT.observation.status ?? 'HISTORICAL'}`),
          })}{' '}
          <a href={event?.sourceUrl ?? DEFAULT_DONKI_EVENT.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#f6c15b' }}>DONKI</a>
        </li>
        {supporting.map((item) => (
          <li key={item.activityID}>{item.type} · {item.startTime.slice(0, 10)} · {item.value} {item.unit}</li>
        ))}
        {difficulty && <li>{t('nasaSources.rule', { difficulty: t(`monitor.difficulty.${difficulty}`) })}</li>}
        {STATIC_SOURCES.map((source) => (
          <li key={source.key}>
            {t(`nasaSources.${source.key}`)}{' '}
            <a href={source.url} target="_blank" rel="noreferrer" style={{ color: '#f6c15b' }}>NASA</a>
          </li>
        ))}
      </ul>
      <p style={{ margin: '0.6rem 0 0', color: '#9bc0e4' }}>{t('nasaSources.disclaimer')}</p>
    </section>
  );
}
