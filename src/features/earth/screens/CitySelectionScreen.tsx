import { useState, type KeyboardEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  GlobeHemisphereWest,
  Snowflake,
  Sun,
} from '@phosphor-icons/react';
import { playSound, SoundToggle } from '../../audio';
import { SUPPORTED_CITIES, type CityData } from '../../../data/nasa/cities';
import { useI18n, LanguageSelector, msg } from '../../../i18n';
import { useScreenRadio } from '../../radio';
import { PixelSceneAnimator } from '../components/PixelSceneAnimator';
import { arequipaScene, tromsoScene } from '../scenes/pixelScenes';
import './earth.css';
import './city-selection.css';

interface CitySelectionScreenProps {
  readonly initialCityId: string;
  readonly onSelectCity: (city: CityData) => void;
  readonly onBack: () => void;
}

type SupportedCityId = 'AREQUIPA' | 'TROMSO';

export function CitySelectionScreen({ initialCityId, onSelectCity, onBack }: CitySelectionScreenProps) {
  const { t } = useI18n();
  useScreenRadio([{ speaker: 'AURORA', text: msg('radio.city') }]);
  const [selectedCityId, setSelectedCityId] = useState<SupportedCityId>(
    initialCityId === 'TROMSO' ? 'TROMSO' : 'AREQUIPA',
  );

  const selectedCity = SUPPORTED_CITIES.find((city) => city.id === selectedCityId) ?? SUPPORTED_CITIES[0];
  const cityKey = selectedCity.id === 'AREQUIPA' ? 'arequipa' : 'tromso';

  function moveSelection(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const nextCity: SupportedCityId = selectedCityId === 'AREQUIPA' ? 'TROMSO' : 'AREQUIPA';
    setSelectedCityId(nextCity);
    const group = event.currentTarget;
    requestAnimationFrame(() => group.querySelector<HTMLButtonElement>(`[data-city="${nextCity}"]`)?.focus());
  }

  return (
    <main className={`city-selection city-selection--${selectedCityId.toLowerCase()}`}>
      <div className="city-selection__scenes" aria-hidden="true">
        <PixelSceneAnimator
          className={`city-selection__scene city-selection__scene--arequipa ${selectedCityId === 'AREQUIPA' ? 'is-active' : ''}`}
          frames={arequipaScene.frames}
          poster={arequipaScene.poster}
          objectPosition={arequipaScene.objectPosition}
          paused={selectedCityId !== 'AREQUIPA'}
          priority
          transitionMs={140}
        />
        <PixelSceneAnimator
          className={`city-selection__scene city-selection__scene--tromso ${selectedCityId === 'TROMSO' ? 'is-active' : ''}`}
          frames={tromsoScene.frames}
          poster={tromsoScene.poster}
          objectPosition={tromsoScene.objectPosition}
          paused={selectedCityId !== 'TROMSO'}
          transitionMs={160}
        />
      </div>

      <div className="city-selection__scrim" aria-hidden="true" />

      <header className="city-selection__header">
        <button type="button" className="city-selection__back" onClick={onBack}>
          <ArrowLeft weight="bold" aria-hidden="true" />
          <span>{t('common.back')}</span>
        </button>
        <div className="city-selection__progress">
          <GlobeHemisphereWest weight="fill" aria-hidden="true" />
          <span>{t('cities.stepIndicator')}</span>
        </div>
        <span className="hud-audio-lang"><SoundToggle /><LanguageSelector variant="hud" /></span>
      </header>

      <section className="city-selection__intro" aria-labelledby="city-selection-title">
        <p className="city-selection__eyebrow">ASTRONEXO · NASA POWER</p>
        <h1 id="city-selection-title">{t('cities.title')}</h1>
        <p>{t('cities.subtitle')}</p>
      </section>

      <div className="city-selection__dock">
        <section className="city-selection__info" aria-live="polite" aria-atomic="true">
          <div className="city-selection__info-heading">
            <div>
              <p className="city-selection__badge">{t(`cities.${cityKey}.badge`)}</p>
              <h2>{t(`cities.${cityKey}.name`)}</h2>
              <p className="city-selection__country">{t(`cities.${cityKey}.country`)}</p>
            </div>
            <span className="city-selection__selected-mark" aria-label={t('common.selected')}>
              <CheckCircle weight="fill" aria-hidden="true" />
            </span>
          </div>

          <p className="city-selection__specialty">{t(`cities.${cityKey}.specialty`)}</p>
          <p className="city-selection__description">{t(`cities.${cityKey}.description`)}</p>

          <details className="city-selection__science">
            <summary>
              <ChartLineUp weight="bold" aria-hidden="true" />
              <span>{t('cities.viewTelemetryBtn')}</span>
            </summary>
            <dl>
              <div>
                <dt>{t('cities.coordinatesLabel')}</dt>
                <dd>{selectedCity.latitude.toFixed(4)}°, {selectedCity.longitude.toFixed(4)}° · {selectedCity.altitudeMeters.toLocaleString()} m</dd>
              </div>
              <div>
                <dt>{t('cities.historicalDates')}</dt>
                <dd>{t(`cities.${cityKey}.irradianceRange`)}</dd>
              </div>
            </dl>
            <p>{t('cities.threeDaysNote')}</p>
          </details>
        </section>

        <div
          className="city-selection__switcher"
          role="radiogroup"
          aria-label={t('cities.title')}
          onKeyDown={moveSelection}
        >
          <button
            type="button"
            role="radio"
            aria-checked={selectedCityId === 'AREQUIPA'}
            tabIndex={selectedCityId === 'AREQUIPA' ? 0 : -1}
            data-city="AREQUIPA"
            className={selectedCityId === 'AREQUIPA' ? 'is-active' : ''}
            onClick={() => { playSound('cardSelect'); setSelectedCityId('AREQUIPA'); }}
          >
            <Sun weight="fill" aria-hidden="true" />
            <span>{t('cities.arequipa.name')}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selectedCityId === 'TROMSO'}
            tabIndex={selectedCityId === 'TROMSO' ? 0 : -1}
            data-city="TROMSO"
            className={selectedCityId === 'TROMSO' ? 'is-active' : ''}
            onClick={() => { playSound('cardSelect'); setSelectedCityId('TROMSO'); }}
          >
            <Snowflake weight="fill" aria-hidden="true" />
            <span>{t('cities.tromso.name')}</span>
          </button>
        </div>

        <button
          type="button"
          className="city-selection__confirm"
          onClick={() => { playSound('cityConfirm'); onSelectCity(selectedCity); }}
        >
          <span>{t('cities.confirmBase', { city: t(`cities.${cityKey}.name`) })}</span>
          <ArrowRight weight="bold" aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
