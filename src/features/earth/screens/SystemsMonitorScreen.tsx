import { ArrowRight, Gauge } from '@phosphor-icons/react';
import { createMission } from '../../../game';
import type { GameSetup } from '../../../game';
import { moduleScenes } from '../../../assets/moduleScenes';
import { useI18n } from '../../../i18n';
import { useEffect } from 'react';
import { useRadio, useScreenRadio } from '../../radio';
import { playSound } from '../../audio';
import { BuildFlowSteps, ModuleEffectChips, ModuleStatusBadge } from '../../base-builder/ModuleStatus';
import { SceneScreen, SCENE_BACKGROUNDS } from './SceneScreen';
import './earth.css';

interface SystemsMonitorScreenProps {
  readonly setup: GameSetup;
  readonly onStart: () => void;
}

/**
 * Paso 9: monitoreo inicial antes de la guardia. Muestra los 3 módulos ya construidos,
 * las herramientas y los recursos reales con los que empezará el motor (sin reconstruir la base).
 */
export function SystemsMonitorScreen({ setup, onStart }: SystemsMonitorScreenProps) {
  const { t } = useI18n();
  // Nico confirma que todo ya funciona; sustituye cualquier mensaje de la pantalla anterior.
  // Sin globo de radio: el título de la pantalla ya dice qué hacer (antes el globo lo repetía).
  useScreenRadio([]);
  const radio = useRadio();
  // Al salir se descarta lo que quede por decir: no debe hablar de módulos en la guardia.
  useEffect(() => () => radio.clear(), [radio]);
  // La pantalla de datos se enciende al entrar al monitoreo.
  useEffect(() => { playSound('monitorOn'); }, []);
  const initial = createMission(setup);
  const weather = setup.spaceWeather;
  const resources: readonly (readonly [string, number])[] = [
    [t('monitor.energy'), initial.energy],
    [t('monitor.oxygen'), initial.oxygen],
    [t('monitor.food'), initial.foodSupply],
    [t('monitor.shield'), initial.shield],
  ];
  return (
    <SceneScreen background={setup.destination === 'MOON' ? SCENE_BACKGROUNDS.moonControl : SCENE_BACKGROUNDS.marsControl}>
      <main className="earth-card" style={{ maxWidth: '52rem' }}>
        <span className="pixel-kicker">{t('monitor.kicker')}</span>
        <h1 className="earth-card__title">
          <Gauge color="#f6c15b" weight="fill" />
          <span>{t('monitor.title')}</span>
        </h1>
        <p style={{ color: '#9bc0e4', margin: '0 0 0.8rem' }}>{t('monitor.line')}</p>

        <BuildFlowSteps current="working" />
        <h2 className="scene-kicker" style={{ margin: '.6rem 0 .3rem' }}>{t('monitor.modules')}</h2>
        <p style={{ color: '#e3effb', margin: '0 0 0.5rem', fontSize: '1.05rem' }}>{t('buildFlow.monitor.headline')}</p>
        <ul className="monitor-modules">
          {setup.selectedModules.map((moduleId) => (
            <li key={moduleId} className="monitor-module">
              <div className="monitor-module__pic">
                <img src={moduleScenes[setup.destination][moduleId]} alt="" decoding="async" loading="lazy" />
                <span className="monitor-module__state"><ModuleStatusBadge state="working" /></span>
              </div>
              <strong>{t(`baseBuilder.modules.${moduleId}.name`)}</strong>
              <ModuleEffectChips moduleId={moduleId} compact />
            </li>
          ))}
        </ul>

        <h2 className="scene-kicker" style={{ margin: '1rem 0 .3rem' }}>{t('monitor.tools')}</h2>
        <p style={{ color: '#e3effb', margin: 0, fontSize: '1.05rem' }}>{setup.selectedTools.map((tool) => t(`tools.${tool}.label`)).join(' · ')}</p>

        <h2 className="scene-kicker" style={{ margin: '1rem 0 .4rem' }}>{t('monitor.resources')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '0.5rem' }}>
          {resources.map(([label, value]) => (
            <div key={label} className="scene-stat">
              <span>{label}</span>
              <div style={{ background: '#0c1826', border: '2px solid #315b73', height: '0.8rem', overflow: 'hidden', margin: '.3rem 0' }}>
                <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: '#69f0ae' }} />
              </div>
              <strong>{Math.round(value)}</strong>
            </div>
          ))}
        </div>

        {weather && (
          <section aria-label={t('monitor.weatherTitle')} className="scene-box">
            <span className="scene-kicker">{t('monitor.weatherTitle')}</span>
            <p style={{ margin: '0.25rem 0' }}>
              {t('monitor.weatherEvent', {
                date: weather.event.observedAt.slice(0, 10),
                speed: weather.event.value,
                status: t(`nasaStatus.${weather.event.status}`),
              })}
            </p>
            <p style={{ margin: 0 }}>
              {t('monitor.weatherRule', { difficulty: t(`monitor.difficulty.${weather.rule.difficulty}`) })}
            </p>
          </section>
        )}

        <div className="scene-actions">
          <button type="button" className="earth-action-btn" onClick={onStart}>
            <span>{t('monitor.start')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </SceneScreen>
  );
}
