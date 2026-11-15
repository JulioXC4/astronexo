import { ArrowRight, Gauge } from '@phosphor-icons/react';
import { createMission } from '../../../game';
import type { GameSetup } from '../../../game';
import { moduleScenes } from '../../../assets/moduleScenes';
import { useI18n, LanguageSelector } from '../../../i18n';
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
  const initial = createMission(setup);
  const weather = setup.spaceWeather;
  const resources: readonly (readonly [string, number])[] = [
    [t('monitor.energy'), initial.energy],
    [t('monitor.oxygen'), initial.oxygen],
    [t('monitor.food'), initial.foodSupply],
    [t('monitor.shield'), initial.shield],
  ];
  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', maxWidth: '52rem' }}><LanguageSelector variant="hud" /></div>
      <main className="earth-card" style={{ maxWidth: '52rem', padding: '1.3rem' }}>
        <span className="pixel-kicker">{t('monitor.kicker')}</span>
        <h1 className="earth-card__title" style={{ fontSize: '1.5rem' }}>
          <Gauge color="#f6c15b" weight="fill" />
          <span>{t('monitor.title')}</span>
        </h1>
        <p style={{ color: '#9bc0e4', margin: '0 0 0.8rem' }}>{t('monitor.line')}</p>

        <h2 style={{ color: '#ffd54f', fontSize: '1rem', margin: '0.4rem 0' }}>{t('monitor.modules')}</h2>
        <ul style={{ display: 'flex', gap: '0.8rem', listStyle: 'none', padding: 0, margin: 0, flexWrap: 'wrap' }}>
          {setup.selectedModules.map((moduleId) => (
            <li key={moduleId} style={{ textAlign: 'center', color: '#e3effb', width: '9rem', fontSize: '0.85rem' }}>
              <img src={moduleScenes[setup.destination][moduleId]} alt="" style={{ width: '100%', imageRendering: 'pixelated' }} />
              <strong>{t(`baseBuilder.modules.${moduleId}.name`)}</strong>
            </li>
          ))}
        </ul>

        <h2 style={{ color: '#ffd54f', fontSize: '1rem', margin: '0.8rem 0 0.4rem' }}>{t('monitor.tools')}</h2>
        <p style={{ color: '#e3effb', margin: 0 }}>{setup.selectedTools.map((tool) => t(`tools.${tool}.label`)).join(' · ')}</p>

        <h2 style={{ color: '#ffd54f', fontSize: '1rem', margin: '0.8rem 0 0.4rem' }}>{t('monitor.resources')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '0.5rem' }}>
          {resources.map(([label, value]) => (
            <div key={label} style={{ background: '#142539', borderRadius: '0.5rem', padding: '0.5rem 0.7rem', color: '#e3effb' }}>
              <div style={{ fontSize: '0.8rem' }}>{label}</div>
              <div style={{ background: '#0c1826', borderRadius: '0.3rem', height: '0.7rem', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: '#69f0ae' }} />
              </div>
              <strong>{Math.round(value)}</strong>
            </div>
          ))}
        </div>

        {weather && (
          <section aria-label={t('monitor.weatherTitle')} style={{ marginTop: '0.9rem', background: '#16263a', border: '1px solid #3c6594', borderRadius: '0.6rem', padding: '0.7rem 0.9rem', color: '#d1e4f6', fontSize: '0.88rem' }}>
            <strong style={{ color: '#f6c15b' }}>{t('monitor.weatherTitle')}</strong>
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

        <div style={{ marginTop: '1.1rem', display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="earth-action-btn" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }} onClick={onStart}>
            <span>{t('monitor.start')}</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
