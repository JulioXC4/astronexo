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
import './systems-monitor.css';

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
      {/* Todo en una pantalla, sin scroll: a la izquierda los módulos; a la derecha herramientas,
          recursos y clima espacial; abajo el botón. Antes era una sola columna larga. */}
      <main className="earth-card monitor-card">
        <header className="monitor-card__head">
          <div>
            <span className="pixel-kicker">{t('monitor.kicker')}</span>
            <h1 className="earth-card__title">
              <Gauge color="#f6c15b" weight="fill" />
              <span>{t('monitor.title')}</span>
            </h1>
          </div>
          <BuildFlowSteps current="working" />
        </header>

        <div className="monitor-card__body">
          <section className="monitor-card__modules" aria-labelledby="monitor-modules-title">
            <h2 id="monitor-modules-title" className="scene-kicker">{t('monitor.modules')}</h2>
            <p className="monitor-card__note">{t('buildFlow.monitor.headline')}</p>
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
          </section>

          <aside className="monitor-card__side">
            <section>
              <h2 className="scene-kicker">{t('monitor.resources')}</h2>
              <div className="monitor-resources">
                {resources.map(([label, value]) => (
                  <div key={label} className="scene-stat monitor-resource">
                    <span>{label}</span>
                    <div className="monitor-resource__bar"><div style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
                    <strong>{Math.round(value)}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="scene-kicker">{t('monitor.tools')}</h2>
              <p className="monitor-card__tools">{setup.selectedTools.map((tool) => t(`tools.${tool}.label`)).join(' · ')}</p>
            </section>

            {weather && (
              <section aria-label={t('monitor.weatherTitle')} className="scene-box monitor-card__weather">
                <span className="scene-kicker">{t('monitor.weatherTitle')}</span>
                <p>
                  {t('monitor.weatherEvent', {
                    date: weather.event.observedAt.slice(0, 10),
                    speed: weather.event.value,
                    status: t(`nasaStatus.${weather.event.status}`),
                  })}
                </p>
                <p>{t('monitor.weatherRule', { difficulty: t(`monitor.difficulty.${weather.rule.difficulty}`) })}</p>
              </section>
            )}
          </aside>
        </div>

        <div className="scene-actions monitor-card__actions">
          <button type="button" className="earth-action-btn" onClick={onStart} autoFocus>
            <span>{t('monitor.start')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </SceneScreen>
  );
}
