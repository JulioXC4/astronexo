import { useEffect, useState } from 'react';
import { ArrowRight, RocketLaunch, Sparkle } from '@phosphor-icons/react';
import type { Backpack, Destination } from '../../../game/contracts';
import { useI18n } from '../../../i18n';
import {
  CinematicTransition, departureVideoFor, playSound, stopSound, travelVideoFor, warmVideo,
  arrivalVideoFor,
} from '../../audio';
import { SceneScreen, SCENE_BACKGROUNDS } from './SceneScreen';
import './earth.css';

interface DepartureScreenProps {
  readonly destination: Destination;
  readonly astronautName: string;
  readonly cityName: string;
  /** Ciudad de salida: decide qué video de despegue se ve. */
  readonly cityId: 'AREQUIPA' | 'TROMSO';
  readonly backpack: Backpack;
  readonly onProceedToArrival: () => void;
}

export function DepartureScreen({ destination, astronautName, cityName, cityId, backpack, onProceedToArrival }: DepartureScreenProps) {
  const { t } = useI18n();
  const [countdown, setCountdown] = useState<number>(3);
  const [hasLaunched, setHasLaunched] = useState<boolean>(false);
  // Cinemáticas: tras la cuenta atrás (que no cambia) se ve el despegue y luego el viaje.
  const [cinematic, setCinematic] = useState<'departure' | 'travel' | null>(null);
  /**
   * El viaje terminó (cuenta atrás + despegue + viaje). Solo entonces aparece «Aproximarse a…».
   * Antes el botón estaba desde el primer segundo y, si el niño lo tocaba, cortaba la cuenta
   * atrás y los videos del despegue.
   */
  const [journeyDone, setJourneyDone] = useState<boolean>(false);

  useEffect(() => {
    warmVideo(departureVideoFor(cityId));
    return () => stopSound('liftoffEngine');
  }, [cityId]);

  // La ignición dispara el video de despegue y el rugido del motor, una sola vez.
  useEffect(() => {
    if (!hasLaunched) return;
    setCinematic('departure');
    // Con movimiento reducido no hay video: tampoco rugido que se corte a medias.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) playSound('liftoffEngine');
  }, [hasLaunched]);

  useEffect(() => {
    if (cinematic === 'departure') warmVideo(travelVideoFor(destination));
    if (cinematic === 'travel') warmVideo(arrivalVideoFor(destination));
  }, [cinematic, destination]);

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
    <SceneScreen background={SCENE_BACKGROUNDS.academy}>
      {cinematic === 'departure' && <CinematicTransition
        key="departure"
        video={departureVideoFor(cityId)}
        onDone={() => { stopSound('liftoffEngine', 700); setCinematic('travel'); }}
      />}
      {cinematic === 'travel' && <CinematicTransition
        key="travel"
        video={travelVideoFor(destination)}
        onDone={() => { setCinematic(null); setJourneyDone(true); }}
      />}
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
          <div className="flight-rocket" aria-hidden="true" />
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
            <p style={{ margin: '0.5rem 0 0 0', color: '#cfe6f7', fontSize: '1.1rem' }}>
              {t('flight.commanderInCommand', { name: astronautName })}
            </p>
          </div>
        </div>

        <div className="scene-box">
          <span className="scene-kicker">{t('flight.cargoManifestTitle')}</span>
          <p>{t('flight.cargoKitsVerified', { tools: packedTools.join(' · ') })}</p>
          <p className="scene-note">{t(destination === 'MOON' ? 'flight.trajectoryNoteMoon' : 'flight.trajectoryNoteMars')}</p>
        </div>

        {journeyDone && <div className="scene-actions">
          <button type="button" className="earth-action-btn" onClick={onProceedToArrival} autoFocus>
            <Sparkle weight="fill" />
            <span>{t(destination === 'MOON' ? 'flight.approachMoon' : 'flight.approachMars')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>}
      </main>
    </SceneScreen>
  );
}
