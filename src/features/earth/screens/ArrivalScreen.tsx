import { ArrowRight, Planet, ShieldWarning, Sparkle } from '@phosphor-icons/react';
import type { Backpack, Destination, NasaDataset } from '../../../game/contracts';
import { useI18n } from '../../../i18n';
import { SceneScreen, SCENE_BACKGROUNDS } from './SceneScreen';
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
  const tools = backpack.map((id) => t(`tools.${id}.label`));
  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');

  return (
    <SceneScreen background={destination === 'MOON' ? SCENE_BACKGROUNDS.moon : SCENE_BACKGROUNDS.mars}>
      <main className="earth-card" style={{ maxWidth: '52rem' }}>
        <h1 className="earth-card__title">
          <Planet color="#f6c15b" weight="fill" />
          <span>{t('flight.arrivalTitle', { destination: destName })}</span>
        </h1>
        <p className="earth-card__subtitle">
          {t('flight.arrivalSubtitle', { destination: destName })}
        </p>

        <div className="scene-box scene-box--hero">
          <h2 style={{ fontSize: '1.9rem' }}>
            {t(destination === 'MOON' ? 'flight.baseMoonName' : 'flight.baseMarsName')}
          </h2>
          <p>{t('flight.commanderTrained', { name: astronautName, city: cityName })}</p>
          <div className="scene-stats">
            <div className="scene-stat scene-stat--warm">
              <span>{t('flight.externalTemp')}</span>
              <strong>{t(destination === 'MOON' ? 'flight.tempMoonVal' : 'flight.tempMarsVal')}</strong>
            </div>
            <div className="scene-stat scene-stat--cool">
              <span>{t('flight.atmosphere')}</span>
              <strong>{t(destination === 'MOON' ? 'flight.atmoMoonVal' : 'flight.atmoMarsVal')}</strong>
            </div>
            <div className="scene-stat scene-stat--good">
              <span>{t('flight.gravity')}</span>
              <strong>{t(destination === 'MOON' ? 'flight.gravityMoonVal' : 'flight.gravityMarsVal')}</strong>
            </div>
          </div>
        </div>

        <section className="scene-box">
          <span className="scene-kicker"><ShieldWarning color="#f6c15b" weight="fill" size={20} style={{ verticalAlign: '-0.2em', marginRight: '.35rem' }} />{t('flight.initialStateTitle')}</span>
          <p>{t('flight.availableTools', { tools: tools.join(' · ') })}</p>
          <details className="scene-note" style={{ marginTop: '.5rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 800, color: '#8fd8ff' }}>
              {t('flight.nasaRef', {
                count: nasaData.observations.length,
                status: t(nasaData.validation === 'VERIFIED' ? 'flight.verifiedStatus' : 'flight.pendingStatus'),
              })}
            </summary>
            <ul className="scene-list">
              {nasaData.observations.map((observation) => <li key={observation.recordId}>
                {observation.source} · {observation.observedAt} · {observation.parameter}: {observation.value} {observation.unit} ·{' '}
                <a href={observation.sourceUrl} target="_blank" rel="noreferrer">{t('flight.originalRecord')}</a>
              </li>)}
            </ul>
          </details>
        </section>

        <div className="scene-actions scene-actions--end">
          <button type="button" className="earth-action-btn" onClick={onEnterBase}>
            <Sparkle weight="fill" />
            <span>{t(destination === 'MOON' ? 'flight.takeCommandMoon' : 'flight.takeCommandMars')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </SceneScreen>
  );
}
