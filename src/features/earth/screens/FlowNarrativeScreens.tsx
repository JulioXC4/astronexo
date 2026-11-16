import { useEffect } from 'react';
import { ArrowRight, Hammer, FastForward } from '@phosphor-icons/react';
import type { Destination, ModuleId } from '../../../game';
import { moduleScenes } from '../../../assets/moduleScenes';
import { CharacterPortrait } from '../../../visual-kit/CharacterPortrait';
import { useI18n, LanguageSelector } from '../../../i18n';
import { useScreenRadio } from '../../radio';
import './earth.css';

const AUTO_ADVANCE_MS = 6000;

/** Avanza sola tras una pausa breve; el botón siempre permite saltar. */
function useAutoAdvance(onDone: () => void) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [onDone]);
}

interface BubbleProps {
  readonly identity: 'ALBA' | 'CHISPA';
  readonly name: string;
  readonly lines: readonly string[];
}

function Bubble({ identity, name, lines }: BubbleProps) {
  return (
    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', textAlign: 'left' }}>
      <div className="briefing-portrait" aria-hidden="true">
        <CharacterPortrait identity={identity} kind={identity === 'CHISPA' ? 'robot' : 'cadet'} label={name} />
      </div>
      <div style={{ background: '#1c3452', border: '2px solid #3c6594', borderRadius: '0.4rem 1.2rem 1.2rem 1.2rem', padding: '0.8rem 1.1rem', flex: 1 }}>
        <strong style={{ color: '#f6c15b', fontFamily: 'Fredoka', display: 'block', marginBottom: '0.2rem' }}>{name}</strong>
        {lines.map((line) => (
          <p key={line} style={{ margin: '0.15rem 0', color: '#e3effb', fontSize: '1rem', lineHeight: 1.4 }}>«{line}»</p>
        ))}
      </div>
    </div>
  );
}

interface StationPrepScreenProps {
  readonly destination: Destination;
  readonly onContinue: () => void;
}

/** Paso 4 del flujo: la estación se prepara mientras el cadete entrena. */
export function StationPrepScreen({ destination, onContinue }: StationPrepScreenProps) {
  const { t } = useI18n();
  // Esta pantalla ya narra con sus propios diálogos: solo se descarta el mensaje de radio anterior.
  useScreenRadio([]);
  useAutoAdvance(onContinue);
  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');
  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '48rem' }}><LanguageSelector variant="hud" /></div>
      <main className="earth-card" style={{ maxWidth: '48rem', textAlign: 'center', padding: '1.4rem' }} aria-live="polite">
        <span className="pixel-kicker">{t('stationPrep.kicker')}</span>
        <h1 className="earth-card__title" style={{ justifyContent: 'center', fontSize: '1.6rem' }}>
          <Hammer color="#f6c15b" weight="fill" />
          <span>{t('stationPrep.title', { destination: destName })}</span>
        </h1>
        <Bubble identity="ALBA" name={t('avatars.alba.name')} lines={[t('stationPrep.line1')]} />
        <div style={{ height: '0.8rem' }} />
        <Bubble identity="CHISPA" name={t('avatars.chispa.name')} lines={[t('stationPrep.line2')]} />
        <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
          <button type="button" className="earth-action-btn" onClick={onContinue}>
            <span>{t('stationPrep.continue')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}

interface ConstructionProgressScreenProps {
  readonly destination: Destination;
  readonly selectedModules: readonly ModuleId[];
  /** Entrenamientos completados (1–3). */
  readonly done: number;
  readonly onContinue: () => void;
}

/** Transición breve y saltable tras cada entrenamiento: avance de obra de la estación. */
export function ConstructionProgressScreen({ destination, selectedModules, done, onContinue }: ConstructionProgressScreenProps) {
  const { t } = useI18n();
  useAutoAdvance(onContinue);
  const moduleId = selectedModules[Math.min(done, selectedModules.length) - 1];
  const finished = done >= 3;
  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '44rem' }}><LanguageSelector variant="hud" /></div>
      <main className="earth-card" style={{ maxWidth: '44rem', textAlign: 'center', padding: '1.4rem' }} aria-live="polite">
        <span className="pixel-kicker">{t('construction.kicker')}</span>
        <h1 className="earth-card__title" style={{ justifyContent: 'center', fontSize: '1.5rem' }}>
          <Hammer color="#f6c15b" weight="fill" />
          <span>{t('construction.title', { weeks: done * 3 })}</span>
        </h1>
        {moduleId && (
          <>
            <img src={moduleScenes[destination][moduleId]} alt="" style={{ width: '9rem', imageRendering: 'pixelated', margin: '0.4rem auto' }} />
            <p style={{ color: '#ffd54f', fontWeight: 700, margin: '0.2rem 0' }}>
              {t('construction.progress', { done, module: t(`baseBuilder.modules.${moduleId}.name`) })}
            </p>
          </>
        )}
        <p style={{ color: '#e3effb', margin: '0.4rem 0' }}>{t(finished ? 'construction.ready' : 'construction.line')}</p>
        <button type="button" className="earth-action-btn" onClick={onContinue}>
          <span>{t(finished ? 'construction.last' : 'construction.next')}</span>
          <FastForward weight="fill" />
        </button>
      </main>
    </div>
  );
}
