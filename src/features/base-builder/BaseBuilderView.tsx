import { useState } from 'react';
import { MODULE_CATALOG } from '../../game';
import type { Destination, ModuleId } from '../../game';
import { lunarModuleScenes } from '../../assets/moduleScenes';
import {
  EMPTY_MODULE_SLOTS,
  isCompleteBase,
  placeModuleInSlot,
  removeModuleFromSlot,
  selectedModulesFromSlots,
} from './selection';
import type { ModuleSlots } from './selection';
import { useI18n, LanguageSelector } from '../../i18n';
import './base-builder.css';

interface BaseBuilderViewProps {
  readonly destination: Destination;
  readonly onStart: (modules: readonly ModuleId[]) => void;
}

export function BaseBuilderView({ destination, onStart }: BaseBuilderViewProps) {
  const { t } = useI18n();
  const [slots, setSlots] = useState<ModuleSlots>(EMPTY_MODULE_SLOTS);
  const [armedModule, setArmedModule] = useState<ModuleId | null>(null);
  const selected = selectedModulesFromSlots(slots);
  const complete = isCompleteBase(slots);

  function chooseModule(moduleId: ModuleId) {
    const emptyIndex = slots.findIndex((slot) => slot === null);
    if (selected.includes(moduleId)) {
      setArmedModule(moduleId);
      return;
    }
    if (emptyIndex >= 0) {
      setSlots((current) => placeModuleInSlot(current, emptyIndex, moduleId));
      setArmedModule(null);
      return;
    }
    setArmedModule(moduleId);
  }

  function place(slotIndex: number, moduleId: ModuleId | null = armedModule) {
    if (!moduleId) return;
    setSlots((current) => placeModuleInSlot(current, slotIndex, moduleId));
    setArmedModule(null);
  }

  const destName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');

  return <main className={`builder-shell builder-shell--${destination.toLowerCase()}`}>
    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '0.6rem' }}>
      <LanguageSelector variant="hud" />
    </div>
    <header className="builder-header pixel-panel">
      <div>
        <span className="pixel-kicker">{t('baseBuilder.kicker')}</span>
        <h1>{t('baseBuilder.title', { destination: destName.toUpperCase() })}</h1>
        <p>{t('baseBuilder.subtitle')}</p>
      </div>
      <div className="builder-counter" aria-live="polite"><strong>{selected.length}</strong><span>{t('baseBuilder.counter', { selected: selected.length })}</span></div>
    </header>

    <section className="builder-layout">
      <div className="builder-workbench pixel-panel">
        <div className="section-heading">
          <div><span className="pixel-kicker">{t('baseBuilder.platformGrid')}</span><h2>{t('baseBuilder.platformTitle')}</h2></div>
          <span className="status-light">{t('baseBuilder.essentialReady')}</span>
        </div>
        <div className="base-platform" aria-label={t('baseBuilder.slotsAria')}>
          <div className="base-platform__core">{t('baseBuilder.coreTitle')}<br /><small>{t('baseBuilder.coreSub')}</small></div>
          <div className="module-slot-grid">
            {slots.map((moduleId, index) => {
              const module = moduleId ? MODULE_CATALOG.find((item) => item.id === moduleId) : undefined;
              const moduleCopy = module ? `baseBuilder.catalog.${module.id}` : '';
              return <div
                className={`module-slot ${module ? 'module-slot--filled' : ''}`}
                style={module && destination === 'MOON' ? { backgroundImage: `linear-gradient(#071426b8, #071426d9), url('${lunarModuleScenes[module.id]}')` } : undefined}
                key={index}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => place(index, event.dataTransfer.getData('text/module-id') as ModuleId)}
              >
                <button
                  type="button"
                  className="module-slot__target"
                  onClick={() => place(index)}
                  aria-label={module
                    ? t('baseBuilder.slotFilled', { slot: index + 1, name: t(`${moduleCopy}.name`), action: armedModule ? t('baseBuilder.replaceWithChosen') : t('common.selected') })
                    : t('baseBuilder.slotEmpty', { slot: index + 1 })}
                >
                  <span>{module?.icon ?? '+'}</span>
                  <strong>{module ? t(`${moduleCopy}.name`) : t('baseBuilder.emptySlot', { slot: index + 1 })}</strong>
                  <small>{module ? t(`${moduleCopy}.cost`) : t('baseBuilder.tapOrDrag')}</small>
                </button>
                {module && <button
                  type="button"
                  className="module-slot__remove"
                  onClick={() => setSlots((current) => removeModuleFromSlot(current, index))}
                aria-label={t('baseBuilder.removeModule', { name: t(`${moduleCopy}.name`) })}
                >{t('baseBuilder.remove')}</button>}
              </div>;
            })}
          </div>
        </div>
        {armedModule && <p className="builder-prompt" role="status">
          {t('baseBuilder.armedPrompt')}
        </p>}
      </div>

      <aside className="builder-requirements pixel-panel">
        <span className="pixel-kicker">{t('baseBuilder.checklist')}</span>
        <h2>{t('baseBuilder.reqTitle')}</h2>
        <ul>
          <li className="requirement--done">✓ {t('baseBuilder.reqEssentials')}</li>
          <li className={selected.length === 3 ? 'requirement--done' : ''}>{selected.length === 3 ? '✓' : '□'} {t('baseBuilder.reqThree')}</li>
          <li className={new Set(selected).size === selected.length ? 'requirement--done' : ''}>✓ {t('baseBuilder.reqUnique')}</li>
          <li className={complete ? 'requirement--done' : ''}>{complete ? '✓' : '□'} {t('baseBuilder.reqValidated')}</li>
        </ul>
        <button
          className="pixel-button pixel-button--primary builder-start"
          disabled={!complete}
          onClick={() => onStart(selected)}
        >{complete ? t('baseBuilder.startGuard') : t('baseBuilder.confirmBaseBtn')}</button>
      </aside>
    </section>

    <section className="module-catalog" aria-labelledby="catalog-title">
      <div className="module-catalog__heading"><span className="pixel-kicker">{t('baseBuilder.catalogKicker')}</span><h2 id="catalog-title">{t('baseBuilder.catalogTitle')}</h2></div>
      <div className="module-card-grid">
        {MODULE_CATALOG.map((module) => {
          const installed = selected.includes(module.id);
          const armed = armedModule === module.id;
          const moduleCopy = `baseBuilder.catalog.${module.id}`;
          return <article
            className={`module-card pixel-panel ${installed ? 'module-card--installed' : ''} ${armed ? 'module-card--armed' : ''}`}
            key={module.id}
            draggable
            onDragStart={(event) => event.dataTransfer.setData('text/module-id', module.id)}
          >
            <div className="module-card__icon" aria-hidden="true">{module.icon}</div>
            <div><span>{installed ? t('baseBuilder.installed') : armed ? t('baseBuilder.armed') : t('baseBuilder.available')}</span><h3>{t(`${moduleCopy}.name`)}</h3></div>
            {destination === 'MOON' && <img className="module-card__preview" src={lunarModuleScenes[module.id]} alt="" loading="lazy" />}
            <p>{t(`${moduleCopy}.description`)}</p>
            <dl><div><dt>{t('baseBuilder.benefitLabel')}</dt><dd>{t(`${moduleCopy}.benefit`)}</dd></div><div><dt>{t('baseBuilder.costLabel')}</dt><dd>{t(`${moduleCopy}.cost`)}</dd></div></dl>
            <button type="button" className="pixel-button" onClick={() => chooseModule(module.id)}>
              {installed ? t('baseBuilder.moveReplace') : selected.length < 3 ? t('baseBuilder.place') : t('baseBuilder.chooseReplace')}
            </button>
          </article>;
        })}
      </div>
    </section>
  </main>;
}
