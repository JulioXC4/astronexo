import { useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Planet, RocketLaunch } from '@phosphor-icons/react';
import type { Destination } from '../../../game/contracts';
import { useI18n, LanguageSelector } from '../../../i18n';
import { useScreenRadio } from '../../radio';
import { playSound, SoundToggle } from '../../audio';
import './earth.css';
import './destination-selection.css';

interface DestinationScreenProps {
  readonly initialDestination: Destination;
  readonly onSelectDestination: (dest: Destination) => void;
  readonly onBack: () => void;
}

const destinationImages = {
  MOON: '/assets/scenes/destinations/moon.webp',
  MARS: '/assets/scenes/destinations/mars.webp',
} as const;

export function DestinationScreen({ initialDestination, onSelectDestination, onBack }: DestinationScreenProps) {
  const { t } = useI18n();
  // Sin globo de radio: el título de la pantalla ya dice qué hacer (antes el globo lo repetía).
  useScreenRadio([]);
  const [selectedDest, setSelectedDest] = useState<Destination>(initialDestination === 'MARS' ? 'MARS' : 'MOON');
  const destinationKey = selectedDest === 'MARS' ? 'mars' : 'moon';

  function moveSelection(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const nextDestination: Destination = selectedDest === 'MOON' ? 'MARS' : 'MOON';
    setSelectedDest(nextDestination);
    const group = event.currentTarget;
    requestAnimationFrame(() => group.querySelector<HTMLButtonElement>(`[data-destination="${nextDestination}"]`)?.focus());
  }

  return (
    <main className={`destination-selection destination-selection--${destinationKey}`}>
      <div className="destination-selection__scenes" aria-hidden="true">
        <img
          className={`destination-selection__scene destination-selection__scene--moon ${selectedDest === 'MOON' ? 'is-active' : ''}`}
          src={destinationImages.MOON}
          alt=""
          fetchPriority="high"
        />
        <img
          className={`destination-selection__scene destination-selection__scene--mars ${selectedDest === 'MARS' ? 'is-active' : ''}`}
          src={destinationImages.MARS}
          alt=""
        />
      </div>
      <div className="destination-selection__scrim" aria-hidden="true" />

      <header className="destination-selection__header">
        <button type="button" className="destination-selection__back" onClick={onBack}>
          <ArrowLeft weight="bold" aria-hidden="true" />
          <span>{t('common.back')}</span>
        </button>
        <div className="destination-selection__progress">
          <Planet weight="fill" aria-hidden="true" />
          <span>{t('destinations.stepIndicator')}</span>
        </div>
        <span className="hud-audio-lang"><SoundToggle /><LanguageSelector variant="hud" /></span>
      </header>

      <section className="destination-selection__intro" aria-labelledby="destination-selection-title">
        <p className="destination-selection__eyebrow">ASTRONEXO · NASA POWER</p>
        <h1 id="destination-selection-title">{t('destinations.title')}</h1>
        <p>{t('destinations.subtitle')}</p>
      </section>

      <div className="destination-selection__dock">
        <section className="destination-selection__info" aria-live="polite" aria-atomic="true">
          <div className="destination-selection__info-heading">
            <div>
              <p className="destination-selection__badge">{t(`destinations.${destinationKey}.tag`)}</p>
              <h2>{t(`destinations.${destinationKey}.name`)}</h2>
            </div>
            <CheckCircle className="destination-selection__selected-mark" weight="fill" aria-label={t('common.selected')} />
          </div>
          <p className="destination-selection__objective">{t(`destinations.${destinationKey}.missionObjective`)}</p>
          <p className="destination-selection__challenge">
            <strong>{t('destinations.challengeLabel')}:</strong> {t(`destinations.${destinationKey}.challenge`)}
          </p>
          <details className="destination-selection__science">
            <summary>{t('destinations.viewDetails')}</summary>
            <dl>
              <div><dt>{t('destinations.gravityLabel')}</dt><dd>{t(`destinations.${destinationKey}.gravity`)}</dd></div>
              <div><dt>{t('destinations.atmosphereLabel')}</dt><dd>{t(`destinations.${destinationKey}.atmosphere`)}</dd></div>
              <div><dt>{t('destinations.travelTime')}</dt><dd>{t(`destinations.${destinationKey}.travelDuration`)}</dd></div>
              <div><dt>{t('destinations.distanceLabel')}</dt><dd>{t(`destinations.${destinationKey}.distance`)}</dd></div>
            </dl>
            <p>{t(`destinations.${destinationKey}.cycle`)}</p>
          </details>
        </section>

        <div
          className="destination-selection__switcher"
          role="radiogroup"
          aria-label={t('destinations.title')}
          onKeyDown={moveSelection}
        >
          <button
            type="button"
            role="radio"
            aria-checked={selectedDest === 'MOON'}
            tabIndex={selectedDest === 'MOON' ? 0 : -1}
            data-destination="MOON"
            className={selectedDest === 'MOON' ? 'is-active' : ''}
            onClick={() => { playSound('cardSelect'); setSelectedDest('MOON'); }}
          >
            <span className="destination-selection__orb destination-selection__orb--moon" aria-hidden="true" />
            <span>{t('destinations.moon.name')}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selectedDest === 'MARS'}
            tabIndex={selectedDest === 'MARS' ? 0 : -1}
            data-destination="MARS"
            className={selectedDest === 'MARS' ? 'is-active' : ''}
            onClick={() => { playSound('cardSelect'); setSelectedDest('MARS'); }}
          >
            <span className="destination-selection__orb destination-selection__orb--mars" aria-hidden="true" />
            <span>{t('destinations.mars.name')}</span>
          </button>
        </div>

        <button type="button" className="destination-selection__confirm" onClick={() => { playSound('destinationConfirm'); onSelectDestination(selectedDest); }}>
          <RocketLaunch weight="fill" aria-hidden="true" />
          <span>{t('destinations.confirmDestination', { dest: t(`destinations.${destinationKey}.name`) })}</span>
          <ArrowRight weight="bold" aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
