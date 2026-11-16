import { House, Jeep, PersonSimpleWalk } from '@phosphor-icons/react';
import type { ExplorationResources } from '../../game';
import { useI18n } from '../../i18n';
import { playSound } from '../audio';
import { REQUIREMENTS } from './explorationData';
import { canRover, canWalk } from './explorationEngine';
import { UI } from './explorationAssets';
import { AssetImage } from './AssetImage';

export type ExplorationChoice =
  | { readonly kind: 'FOOT' }
  | { readonly kind: 'ROVER'; readonly battery: number }
  | { readonly kind: 'STAY' };

interface ExplorationStartProps {
  readonly clock: string;
  readonly resources: ExplorationResources;
  readonly onChoose: (choice: ExplorationChoice) => void;
}

/**
 * «Salida a explorar»: tres tarjetas con ventajas en verde y desventajas en rojo
 * (mismo patrón que las pantallas de elegir planeta y ciudad). Las opciones que
 * no se pueden pagar quedan desactivadas y dicen por qué.
 */
export function ExplorationStart({ clock, resources, onChoose }: ExplorationStartProps) {
  const { t } = useI18n();
  const footOk = canWalk(resources);
  const roverAny = REQUIREMENTS.batteryOptions.some((battery) => canRover(resources, battery));

  const pick = (choice: ExplorationChoice) => {
    playSound('click');
    onChoose(choice);
  };

  return <main className="explore-start">
    <header>
      <span className="pixel-kicker">{t('exploration.kicker')}</span>
      <h1>{t('exploration.startTitle', { clock })}</h1>
      <p>{t('exploration.startIntro')}</p>
    </header>

    <div className="explore-start__cards">
      <article className="explore-card">
        <AssetImage
          src={UI.cardFoot}
          className="explore-card__art"
          fallback={<PersonSimpleWalk weight="fill" className="explore-card__icon" aria-hidden="true" />}
        />
        <h2>{t('exploration.cards.foot.title')}</h2>
        <p className="explore-card__pros"><strong>{t('exploration.prosLabel')}</strong> {t('exploration.cards.foot.pros')}</p>
        <p className="explore-card__cons"><strong>{t('exploration.consLabel')}</strong> {t('exploration.cards.foot.cons')}</p>
        {!footOk && <small className="explore-card__needs">{t('exploration.cards.foot.needs')}</small>}
        <button type="button" className="pixel-button pixel-button--primary" disabled={!footOk} onClick={() => pick({ kind: 'FOOT' })}>
          {t('exploration.cards.foot.button')}
        </button>
      </article>

      <article className="explore-card">
        <AssetImage
          src={UI.cardRover}
          className="explore-card__art"
          fallback={<Jeep weight="fill" className="explore-card__icon" aria-hidden="true" />}
        />
        <h2>{t('exploration.cards.rover.title')}</h2>
        <p className="explore-card__pros"><strong>{t('exploration.prosLabel')}</strong> {t('exploration.cards.rover.pros')}</p>
        <p className="explore-card__cons"><strong>{t('exploration.consLabel')}</strong> {t('exploration.cards.rover.cons')}</p>
        {!roverAny && <small className="explore-card__needs">{t('exploration.cards.rover.needs')}</small>}
        <small>{t('exploration.cards.rover.pickBattery')}</small>
        <div className="explore-card__batteries">
          {REQUIREMENTS.batteryOptions.map((battery) => <button
            key={battery}
            type="button"
            className="pixel-button pixel-button--primary explore-card__battery"
            disabled={!canRover(resources, battery)}
            onClick={() => pick({ kind: 'ROVER', battery })}
          >
            <AssetImage src={UI.battery[battery]} className="explore-card__battery-art" />
            {t('exploration.cards.rover.battery', { amount: battery })}
          </button>)}
        </div>
      </article>

      <article className="explore-card">
        <AssetImage
          src={UI.cardStay}
          className="explore-card__art"
          fallback={<House weight="fill" className="explore-card__icon" aria-hidden="true" />}
        />
        <h2>{t('exploration.cards.stay.title')}</h2>
        <p className="explore-card__pros"><strong>{t('exploration.prosLabel')}</strong> {t('exploration.cards.stay.pros')}</p>
        <p className="explore-card__cons"><strong>{t('exploration.consLabel')}</strong> {t('exploration.cards.stay.cons')}</p>
        <button type="button" className="pixel-button" onClick={() => pick({ kind: 'STAY' })}>
          {t('exploration.cards.stay.button')}
        </button>
      </article>
    </div>
  </main>;
}
