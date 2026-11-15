import { useEffect, useState } from 'react';
import { ArrowRight, RocketLaunch, Sparkle } from '@phosphor-icons/react';
import type { Backpack, Destination } from '../../../game/contracts';
import { useI18n, LanguageSelector } from '../../../i18n';
import './earth.css';

interface DepartureScreenProps {
  readonly destination: Destination;
  readonly astronautName: string;
  readonly cityName: string;
  readonly backpack: Backpack;
  readonly onProceedToArrival: () => void;
}

export function DepartureScreen({ destination, astronautName, cityName, backpack, onProceedToArrival }: DepartureScreenProps) {
  const { t } = useI18n();
  const [countdown, setCountdown] = useState<number>(3);
  const [hasLaunched, setHasLaunched] = useState<boolean>(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setHasLaunched(true);
    }
  }, [countdown]);

  const packedTools = backpack.map((id) => t(`tools.${id}.label`));
  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');

  return (
    <div className="earth-screen">
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '48rem', marginBottom: '0.6rem' }}>
        <LanguageSelector variant="hud" />
      </div>
      <main className="earth-card" style={{ maxWidth: '48rem', textAlign: 'center' }}>
        <h1 className="earth-card__title" style={{ justifyContent: 'center' }}>
          <RocketLaunch color="#f6c15b" weight="fill" />
          <span>{t('flight.departureTitle', { destination: destName })}</span>
        </h1>
        <p className="earth-card__subtitle">
          {t('flight.departureSubtitle', { city: cityName, destination: destName })}
        </p>

        <div className="flight-scene">
          <div className="flight-scene__stars" aria-hidden="true" />
          <div className="flight-rocket" aria-hidden="true">
            🚀
          </div>
          <div style={{ zIndex: 2 }}>
            {!hasLaunched ? (
              <div style={{ fontFamily: 'Fredoka', fontSize: '3.5rem', color: '#f6c15b' }}>
                T - {countdown}
              </div>
            ) : (
              <div style={{ fontFamily: 'Fredoka', fontSize: '2rem', color: '#69f0ae' }}>
                {t('flight.ignition')}
              </div>
            )}
            <p style={{ margin: '0.5rem 0 0 0', color: '#b2cce6', fontSize: '1rem' }}>
              {t('flight.commanderInCommand', { name: astronautName })}
            </p>
          </div>
        </div>

        <div style={{
          background: '#132338',
          border: '1px solid #33557d',
          borderRadius: '0.9rem',
          padding: '1.2rem',
          margin: '1.5rem 0',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#f6c15b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('flight.cargoManifestTitle')}
          </span>
          <p style={{ margin: '0.4rem 0 0 0', color: '#d9e7f5', fontSize: '0.95rem' }}>
            {t('flight.cargoKitsVerified', { tools: packedTools.join(' · ') })}
          </p>
          <p style={{ margin: '0.4rem 0 0 0', color: '#97b8d8', fontSize: '0.85rem' }}>
            {t(destination === 'MOON' ? 'flight.trajectoryNoteMoon' : 'flight.trajectoryNoteMars')}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="earth-action-btn"
            onClick={onProceedToArrival}
          >
            <Sparkle weight="fill" />
            <span>{t(destination === 'MOON' ? 'flight.approachMoon' : 'flight.approachMars')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
