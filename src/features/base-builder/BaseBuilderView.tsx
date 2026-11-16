import { useState } from 'react';
import { MODULE_CATALOG } from '../../game';
import type { Destination, ModuleId } from '../../game';
import { moduleScenes } from '../../assets/moduleScenes';
import { spaceBackgrounds } from '../../assets/manifest';
import {
  EMPTY_MODULE_SLOTS,
  isCompleteBase,
  placeModuleInSlot,
  removeModuleFromSlot,
  selectedModulesFromSlots,
} from './selection';
import type { ModuleSlots } from './selection';
import { useI18n, LanguageSelector } from '../../i18n';
import { useScreenRadio } from '../radio';
import './base-builder.css';

interface BaseBuilderViewProps {
  readonly destination: Destination;
  readonly onStart: (modules: readonly ModuleId[]) => void;
  /** Texto del botón de confirmación; por defecto «Iniciar guardia». */
  readonly confirmLabel?: string;
  /** Módulos ya elegidos (p. ej. al volver desde pantallas posteriores). */
  readonly initialModules?: readonly ModuleId[];
  /** Si se indica, muestra un botón para regresar a la pantalla anterior. */
  readonly onBack?: () => void;
}

export function BaseBuilderView({ destination, onStart, confirmLabel, initialModules, onBack }: BaseBuilderViewProps) {
  const { t } = useI18n();
  useScreenRadio([{ speaker: 'NICO', text: t('radio.builder') }]);
  const [slots, setSlots] = useState<ModuleSlots>(() => initialModules && initialModules.length === 3
    ? [initialModules[0], initialModules[1], initialModules[2]]
    : EMPTY_MODULE_SLOTS);
  const [armedModule, setArmedModule] = useState<ModuleId | null>(null);
  const [focusedModule, setFocusedModule] = useState<ModuleId>('SOLAR_STORAGE');
  const selected = selectedModulesFromSlots(slots);
  const complete = isCompleteBase(slots);

  function chooseModule(moduleId: ModuleId) {
    setFocusedModule(moduleId);
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
    setFocusedModule(moduleId);
    setArmedModule(null);
  }

  const destinationName = destination === 'MOON' ? t('destinations.moon.name') : t('destinations.mars.name');
  const focused = MODULE_CATALOG.find((module) => module.id === focusedModule)!;
  const builderBackground = spaceBackgrounds.builder[destination].path!;

  return <main className={`builder-shell builder-shell--${destination.toLowerCase()}`}>
    <header className="builder-header">
      <div>
        {onBack && <button type="button" className="pixel-button" onClick={onBack}>{t('common.back')}</button>}
        <span>{t('baseBuilder.kicker')}</span>
        <h1>{t('baseBuilder.title', { destination: destinationName.toUpperCase() })}</h1>
      </div>
      <div className="builder-progress" aria-live="polite">
        <strong>{selected.length}/3</strong>
        <span>{t('baseBuilder.counterLabel').replace('/3 ', '')}</span>
      </div>
      <LanguageSelector variant="hud" />
    </header>

    <section
      className="builder-scene"
      style={{ backgroundImage: `linear-gradient(rgb(2 8 19 / 5%), rgb(2 8 19 / 15%)), url('${builderBackground}')` }}
      aria-label={t('baseBuilder.platformAria')}
    >
      <p className="builder-scene__instruction">{armedModule ? t('baseBuilder.armedPrompt') : t('baseBuilder.subtitle')}</p>
      {slots.map((moduleId, index) => {
        const module = moduleId ? MODULE_CATALOG.find((item) => item.id === moduleId) : undefined;
        return <div
          className={`module-slot module-slot--${index + 1} ${module ? 'module-slot--filled' : ''} ${armedModule ? 'module-slot--ready' : ''}`}
          key={index}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => place(index, event.dataTransfer.getData('text/module-id') as ModuleId)}
        >
          <button
            type="button"
            className="module-slot__target"
            onClick={() => place(index)}
            aria-label={module
              ? t('baseBuilder.slotFilled', {
                  slot: index + 1,
                  name: t(`baseBuilder.modules.${module.id}.name`),
                  action: t(armedModule ? 'baseBuilder.slotReplace' : 'baseBuilder.slotSelected'),
                })
              : t('baseBuilder.slotEmpty', { slot: index + 1 })}
          >
            {module
              ? <img src={moduleScenes[destination][module.id]} alt="" />
              : <span>{index + 1}</span>}
            <strong>{module ? t(`baseBuilder.modules.${module.id}.name`) : t('baseBuilder.slotLabel', { slot: index + 1 })}</strong>
          </button>
          {module && <button
            type="button"
            className="module-slot__remove"
            onClick={() => setSlots((current) => removeModuleFromSlot(current, index))}
          >{t('baseBuilder.remove')}</button>}
        </div>;
      })}
    </section>

    <section className="builder-console" aria-labelledby="catalog-title">
      <div className="builder-console__detail">
        <img src={moduleScenes[destination][focused.id]} alt="" />
        <div>
          <h2 id="catalog-title">{t(`baseBuilder.modules.${focused.id}.name`)}</h2>
          <p>{t(`baseBuilder.modules.${focused.id}.benefit`)}</p>
          <small>{t('baseBuilder.costLabel')}: {t(`baseBuilder.modules.${focused.id}.cost`)}</small>
        </div>
      </div>
      <div className="module-picker" aria-label={t('baseBuilder.catalogTitle')}>
        {MODULE_CATALOG.map((module) => {
          const installed = selected.includes(module.id);
          const armed = armedModule === module.id;
          return <button
            type="button"
            className={`module-picker__button ${installed ? 'module-picker__button--installed' : ''} ${armed ? 'module-picker__button--armed' : ''}`}
            key={module.id}
            draggable
            aria-pressed={installed || armed}
            onFocus={() => setFocusedModule(module.id)}
            onMouseEnter={() => setFocusedModule(module.id)}
            onDragStart={(event) => event.dataTransfer.setData('text/module-id', module.id)}
            onClick={() => chooseModule(module.id)}
          >
            <img src={moduleScenes[destination][module.id]} alt="" />
            <span>{t(`baseBuilder.modules.${module.id}.name`)}</span>
            <small>{t(installed ? 'baseBuilder.installed' : armed ? 'baseBuilder.armed' : 'baseBuilder.place')}</small>
          </button>;
        })}
      </div>
      <button
        className="pixel-button pixel-button--primary builder-start"
        disabled={!complete}
        onClick={() => onStart(selected)}
      >{confirmLabel ?? t('baseBuilder.confirmBaseBtn')}</button>
    </section>
  </main>;
}
