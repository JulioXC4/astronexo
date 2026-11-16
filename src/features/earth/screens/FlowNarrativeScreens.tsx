import { useEffect, useState } from 'react';
import { ArrowRight, CaretLeft, CaretRight, Hammer, FastForward } from '@phosphor-icons/react';
import type { Destination, ModuleId } from '../../../game';
import { moduleScenes } from '../../../assets/moduleScenes';
import { LanguageSelector, useI18n } from '../../../i18n';
import { useRadio, useScreenRadio } from '../../radio';
import { playSound, SoundToggle } from '../../audio';
import { BuildFlowSteps, ModuleEffectChips, ModuleStatusBadge } from '../../base-builder/ModuleStatus';
import { MODULE_CATALOG } from '../../../game';
import { SceneScreen, SCENE_BACKGROUNDS } from './SceneScreen';
import './earth.css';
import './earth-map.css';
import './avatar-select.css';
import './briefing-scene.css';

const AUTO_ADVANCE_MS = 6000;

/** Avanza sola tras una pausa breve; el botón siempre permite saltar. */
function useAutoAdvance(onDone: () => void, ms: number = AUTO_ADVANCE_MS) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, ms);
    return () => window.clearTimeout(timer);
  }, [onDone]);
}

interface StationPrepScreenProps {
  readonly destination: Destination;
  /** Los tres módulos elegidos en el constructor: son los que entran en obra. */
  readonly selectedModules?: readonly ModuleId[];
  readonly onContinue: () => void;
}

const VN_SPRITES = {
  ALBA: '/assets/pixel-art/cadet-alba.webp',
  CHISPA: '/assets/characters/chispa.webp',
} as const;
const VN_ACCENT = { ALBA: '#4ec3d9', CHISPA: '#f6c15b' } as const;

/**
 * Paso 4 del flujo: la estación se prepara mientras el cadete entrena. Novela visual: la base en
 * obra ocupa toda la pantalla y Alba y Chispa hablan en el cuadro de texto de abajo, una frase
 * cada vez. Antes era una tarjeta pequeña que además avanzaba sola a los 6 s: un niño que lee
 * despacio no alcanzaba a terminarla.
 */
export function StationPrepScreen({ destination, selectedModules = [], onContinue }: StationPrepScreenProps) {
  const { t } = useI18n();
  // Esta pantalla ya narra con sus propios diálogos: solo se descarta el mensaje de radio anterior.
  useScreenRadio([]);
  const [step, setStep] = useState(0);
  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');
  const lines = [
    { speaker: 'ALBA' as const, name: t('avatars.alba.name'), role: t('stationPrep.kicker'), text: t('stationPrep.line1') },
    { speaker: 'CHISPA' as const, name: t('avatars.chispa.name'), role: t('briefing.dialogue.step4Role'), text: t('stationPrep.line2') },
  ];
  const current = lines[step];
  const last = step === lines.length - 1;
  const background = destination === 'MOON' ? SCENE_BACKGROUNDS.moonBuilder : SCENE_BACKGROUNDS.marsBuilder;

  function next() {
    playSound('dialogueNext');
    if (last) onContinue();
    else setStep((value) => value + 1);
  }

  return (
    <div
      className="emap asel brief vn station-vn"
      style={{ ['--accent' as string]: VN_ACCENT[current.speaker], ['--u' as string]: '1px' }}
      data-speaker={current.speaker}
    >
      <div className="station-vn__bg" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
      <div className="asel-cast station-vn__cast" aria-hidden="true">
        {(['ALBA', 'CHISPA'] as const).map((who) => (
          <div
            key={who}
            className={`asel-char brief-actor${who === 'CHISPA' ? ' brief-actor--chispa' : ''} ${current.speaker === who ? 'brief-actor--speaking' : 'brief-actor--listening'}`}
            style={{ left: who === 'ALBA' ? '24%' : '76%', ['--accent' as string]: VN_ACCENT[who] }}
          >
            <span className="asel-char__ring" />
            <img className="asel-char__sprite" src={VN_SPRITES[who]} alt="" draggable={false} />
          </div>
        ))}
      </div>

      <header className="emap-hud">
        <span />
        <div className="emap-hud__status">
          <span className="emap-hud__route"><Hammer weight="fill" color="#f6c15b" aria-hidden="true" /> {t('stationPrep.title', { destination: destName })}</span>
        </div>
        <div className="emap-hud__tools"><span className="hud-audio-lang"><SoundToggle /><LanguageSelector variant="hud" plain /></span></div>
      </header>

      <section className="brief-dialog" aria-live="polite" aria-label={current.name}>
        <div className="brief-dialog__speaker">
          <span className="brief-dialog__thumb"><img src={VN_SPRITES[current.speaker]} alt="" draggable={false} /></span>
          <div>
            <strong className="brief-dialog__name">{current.name}</strong>
            <span className="brief-dialog__role">{current.role}</span>
          </div>
        </div>
        <div className="brief-dialog__text" key={step}>
          <p>«{current.text}»</p>
          {last && selectedModules.length > 0 && <ul className="station-vn__modules" aria-label={t('buildFlow.construction.queueTitle')}>
            {selectedModules.map((id) => <li key={id}><Hammer weight="fill" aria-hidden="true" />{t(`baseBuilder.modules.${id}.name`)}</li>)}
          </ul>}
        </div>
        <div className="brief-dialog__controls">
          <div className="brief-dots" role="group" aria-label={t('briefing.dialogue.stepIndicator', { current: step + 1, total: lines.length })}>
            {lines.map((_, index) => (
              <button key={index} type="button" className={`brief-dot${index === step ? ' brief-dot--active' : ''}`}
                aria-label={t('briefing.dialogue.stepIndicator', { current: index + 1, total: lines.length })}
                aria-current={index === step ? 'step' : undefined} onClick={() => setStep(index)} />
            ))}
            <span className="brief-dots__label">{t('briefing.dialogue.stepIndicator', { current: step + 1, total: lines.length })}</span>
          </div>
          <div className="brief-dialog__buttons">
            {step > 0 && <button type="button" className="pixel-btn pixel-btn--secondary" onClick={() => { playSound('dialogueNext'); setStep(step - 1); }}>
              <CaretLeft weight="bold" aria-hidden="true" />
              <span>{t('briefing.dialogue.prevBtn')}</span>
            </button>}
            <button type="button" className="pixel-btn pixel-btn--primary" onClick={next} autoFocus>
              <span>{t(last ? 'stationPrep.continue' : 'briefing.dialogue.nextBtn')}</span>
              {last ? <ArrowRight weight="bold" aria-hidden="true" /> : <CaretRight weight="bold" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </section>
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

/** Lo que tarda la obra de un módulo antes de verlo terminado (ms). */
const BUILD_MS = 3400;
/** La pantalla da tiempo a ver la obra, el módulo terminado y los dos mensajes de radio. */
const CONSTRUCTION_ADVANCE_MS = 10500;

/**
 * Transición breve y saltable tras cada entrenamiento: avance de obra de la estación.
 * Muestra el módulo «en construcción» (obra animada) y luego «terminado», con lo que ayuda y gasta.
 */
export function ConstructionProgressScreen({ destination, selectedModules, done, onContinue }: ConstructionProgressScreenProps) {
  const { t } = useI18n();
  const radio = useRadio();
  const moduleId = selectedModules[Math.min(done, selectedModules.length) - 1];
  const finished = done >= 3;
  const [phase, setPhase] = useState<'building' | 'finished'>('building');
  useAutoAdvance(onContinue, CONSTRUCTION_ADVANCE_MS);
  const moduleName = moduleId ? t(`baseBuilder.modules.${moduleId}.name`) : '';
  const moduleDesc = moduleId ? t(`baseBuilder.modules.${moduleId}.desc`) : '';
  const known = moduleId ? MODULE_CATALOG.some((module) => module.id === moduleId) : false;

  // Nico presenta la obra al llegar; Alba celebra cuando el módulo queda terminado.
  // La tarjeta de obra ya cuenta qué se construye y para qué: sin globos de radio encima.
  useScreenRadio([]);
  // Al salir se descarta lo que quede por decir de esta obra.
  useEffect(() => () => radio.clear(), [radio]);
  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('finished'), BUILD_MS);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (phase !== 'finished' || !moduleId) return;
    playSound('reward'); // el módulo quedó terminado
    // Solo al terminar la obra de este módulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <SceneScreen background={destination === 'MOON' ? SCENE_BACKGROUNDS.moonBuilder : SCENE_BACKGROUNDS.marsBuilder}>
      <main className="earth-card build-card" style={{ maxWidth: '44rem', textAlign: 'center' }} aria-live="polite">
        <span className="pixel-kicker">{t('construction.kicker')}</span>
        <h1 className="earth-card__title" style={{ justifyContent: 'center', fontSize: '1.5rem' }}>
          <Hammer color="#f6c15b" weight="fill" />
          <span>{t('construction.title', { weeks: done * 3 })}</span>
        </h1>
        <BuildFlowSteps current={phase === 'building' ? 'build' : 'done'} />
        {moduleId && (
          <>
            <div className={`build-site build-site--${phase}`}>
              <img src={moduleScenes[destination][moduleId]} alt="" decoding="async" />
              {phase === 'building' && <>
                <span className="build-site__tape" aria-hidden="true" />
                <span className="build-site__progress" role="progressbar" aria-label={t('buildFlow.construction.building', { module: moduleName })} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ animationDuration: `${BUILD_MS}ms` }} />
                </span>
              </>}
              {phase === 'finished' && <span className="build-site__flash" aria-hidden="true" />}
              <span className="build-site__state">
                <ModuleStatusBadge state={phase === 'building' ? 'building' : 'finished'} />
              </span>
            </div>
            <p className="build-card__name">
              {phase === 'building'
                ? t('buildFlow.construction.building', { module: moduleName })
                : t('buildFlow.construction.finished', { module: moduleName })}
            </p>
            <p className="build-card__desc"><strong>{t('buildFlow.construction.whatFor')}:</strong> {moduleDesc}</p>
            {known && <ModuleEffectChips moduleId={moduleId} />}
          </>
        )}
        <ul className="build-queue" aria-label={t('buildFlow.construction.queueTitle')}>
          {selectedModules.map((id, index) => {
            const state = index < done - 1 ? 'finished' : index === done - 1 ? (phase === 'building' ? 'building' : 'finished') : 'pending';
            return <li key={id} className="build-queue__item">
              <strong>{t(`baseBuilder.modules.${id}.name`)}</strong>
              <ModuleStatusBadge state={state} />
            </li>;
          })}
        </ul>
        <p style={{ color: '#e3effb', margin: '0.4rem 0' }}>{t(finished ? 'construction.ready' : 'construction.line')}</p>
        <button type="button" className="earth-action-btn" onClick={onContinue}>
          <span>{t(finished ? 'construction.last' : 'construction.next')}</span>
          <FastForward weight="fill" />
        </button>
      </main>
    </SceneScreen>
  );
}
