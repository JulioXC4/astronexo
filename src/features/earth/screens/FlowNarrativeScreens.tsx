import { useEffect, useState } from 'react';
import { ArrowRight, Hammer, FastForward } from '@phosphor-icons/react';
import type { Destination, ModuleId } from '../../../game';
import { moduleScenes } from '../../../assets/moduleScenes';
import { CharacterPortrait } from '../../../visual-kit/CharacterPortrait';
import { useI18n } from '../../../i18n';
import { useRadio, useScreenRadio } from '../../radio';
import { BuildFlowSteps, ModuleEffectChips, ModuleStatusBadge } from '../../base-builder/ModuleStatus';
import { MODULE_CATALOG } from '../../../game';
import { SceneScreen, SCENE_BACKGROUNDS } from './SceneScreen';
import './earth.css';

const AUTO_ADVANCE_MS = 6000;

/** Avanza sola tras una pausa breve; el botón siempre permite saltar. */
function useAutoAdvance(onDone: () => void, ms: number = AUTO_ADVANCE_MS) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, ms);
    return () => window.clearTimeout(timer);
  }, [onDone]);
}

interface BubbleProps {
  readonly identity: 'ALBA' | 'CHISPA';
  readonly name: string;
  readonly lines: readonly string[];
}

/** Una línea de diálogo de personaje: la misma pieza visual que el briefing y las consolas. */
function Bubble({ identity, name, lines }: BubbleProps) {
  return (
    <div className={`scene-dialog__line scene-dialog__line--${identity.toLowerCase()}`}>
      <span className="scene-dialog__thumb" aria-hidden="true">
        <CharacterPortrait identity={identity} kind={identity === 'CHISPA' ? 'robot' : 'cadet'} label={name} />
      </span>
      <div>
        <strong>{name}</strong>
        {lines.map((line) => <p key={line}>«{line}»</p>)}
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
    <SceneScreen background={destination === 'MOON' ? SCENE_BACKGROUNDS.moonBuilder : SCENE_BACKGROUNDS.marsBuilder}>
      <main className="earth-card" style={{ maxWidth: '48rem', textAlign: 'center' }} aria-live="polite">
        <span className="pixel-kicker">{t('stationPrep.kicker')}</span>
        <h1 className="earth-card__title" style={{ justifyContent: 'center' }}>
          <Hammer color="#f6c15b" weight="fill" />
          <span>{t('stationPrep.title', { destination: destName })}</span>
        </h1>
        <div className="scene-dialog">
          <Bubble identity="ALBA" name={t('avatars.alba.name')} lines={[t('stationPrep.line1')]} />
          <Bubble identity="CHISPA" name={t('avatars.chispa.name')} lines={[t('stationPrep.line2')]} />
        </div>
        <div className="scene-actions">
          <button type="button" className="earth-action-btn" onClick={onContinue}>
            <span>{t('stationPrep.continue')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </SceneScreen>
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
  const moduleBenefit = moduleId ? t(`baseBuilder.modules.${moduleId}.benefit`) : '';
  const known = moduleId ? MODULE_CATALOG.some((module) => module.id === moduleId) : false;

  // Nico presenta la obra al llegar; Alba celebra cuando el módulo queda terminado.
  useScreenRadio(moduleId ? [{ speaker: 'NICO', text: t('buildFlow.radio.building', { module: moduleName, desc: moduleDesc }) }] : []);
  // Al salir se descarta lo que quede por decir de esta obra.
  useEffect(() => () => radio.clear(), [radio]);
  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('finished'), BUILD_MS);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (phase !== 'finished' || !moduleId) return;
    radio.say({
      speaker: 'ALBA',
      tone: 'good',
      front: true,
      once: `build.done.${moduleId}`,
      text: t('buildFlow.radio.finished', { module: moduleName, benefit: moduleBenefit }),
    });
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
