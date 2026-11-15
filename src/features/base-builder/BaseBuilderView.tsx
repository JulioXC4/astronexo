import { useState } from 'react';
import { MODULE_CATALOG } from '../../game';
import type { Destination, ModuleId } from '../../game';
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
        <span className="pixel-kicker">P10 · HANGAR DE CONSTRUCCIÓN</span>
        <h1>ARMA TU BASE EN {destName.toUpperCase()}</h1>
        <p>{t('baseBuilder.subtitle')}</p>
      </div>
      <div className="builder-counter" aria-live="polite"><strong>{selected.length}</strong><span>/3 MÓDULOS</span></div>
    </header>

    <section className="builder-layout">
      <div className="builder-workbench pixel-panel">
        <div className="section-heading">
          <div><span className="pixel-kicker">CUADRÍCULA 2D</span><h2>Plataforma de base</h2></div>
          <span className="status-light">SISTEMAS ESENCIALES LISTOS</span>
        </div>
        <div className="base-platform" aria-label="Tres espacios para módulos">
          <div className="base-platform__core">NÚCLEO<br /><small>VIDA · ENERGÍA · ENLACE</small></div>
          <div className="module-slot-grid">
            {slots.map((moduleId, index) => {
              const module = moduleId ? MODULE_CATALOG.find((item) => item.id === moduleId) : undefined;
              return <div
                className={`module-slot ${module ? 'module-slot--filled' : ''}`}
                key={index}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => place(index, event.dataTransfer.getData('text/module-id') as ModuleId)}
              >
                <button
                  type="button"
                  className="module-slot__target"
                  onClick={() => place(index)}
                  aria-label={module
                    ? `Espacio ${index + 1}: ${module.name}. ${armedModule ? 'Reemplazar con módulo elegido' : 'Seleccionado'}`
                    : `Espacio ${index + 1} vacío. Colocar módulo elegido`}
                >
                  <span>{module?.icon ?? '+'}</span>
                  <strong>{module?.name ?? `ESPACIO ${index + 1}`}</strong>
                  <small>{module ? module.costLabel : 'TOCA UNA TARJETA O ARRASTRA AQUÍ'}</small>
                </button>
                {module && <button
                  type="button"
                  className="module-slot__remove"
                  onClick={() => setSlots((current) => removeModuleFromSlot(current, index))}
                >RETIRAR</button>}
              </div>;
            })}
          </div>
        </div>
        {armedModule && <p className="builder-prompt" role="status">
          Módulo preparado. Toca el espacio que deseas reemplazar.
        </p>}
      </div>

      <aside className="builder-requirements pixel-panel">
        <span className="pixel-kicker">LISTA DE DESPEGUE</span>
        <h2>Requisitos</h2>
        <ul>
          <li className="requirement--done">✓ Sistemas esenciales disponibles</li>
          <li className={selected.length === 3 ? 'requirement--done' : ''}>{selected.length === 3 ? '✓' : '□'} Tres módulos colocados</li>
          <li className={new Set(selected).size === selected.length ? 'requirement--done' : ''}>✓ Sin módulos duplicados</li>
          <li className={complete ? 'requirement--done' : ''}>{complete ? '✓' : '□'} Configuración validada</li>
        </ul>
        <button
          className="pixel-button pixel-button--primary builder-start"
          disabled={!complete}
          onClick={() => onStart(selected)}
        >{t('baseBuilder.confirmBaseBtn')}</button>
      </aside>
    </section>

    <section className="module-catalog" aria-labelledby="catalog-title">
      <div className="module-catalog__heading"><span className="pixel-kicker">INVENTARIO 3 DE 5</span><h2 id="catalog-title">Módulos disponibles</h2></div>
      <div className="module-card-grid">
        {MODULE_CATALOG.map((module) => {
          const installed = selected.includes(module.id);
          const armed = armedModule === module.id;
          return <article
            className={`module-card pixel-panel ${installed ? 'module-card--installed' : ''} ${armed ? 'module-card--armed' : ''}`}
            key={module.id}
            draggable
            onDragStart={(event) => event.dataTransfer.setData('text/module-id', module.id)}
          >
            <div className="module-card__icon" aria-hidden="true">{module.icon}</div>
            <div><span>{installed ? 'INSTALADO' : armed ? 'LISTO PARA REEMPLAZAR' : 'DISPONIBLE'}</span><h3>{module.name}</h3></div>
            <p>{module.description}</p>
            <dl><div><dt>BENEFICIO</dt><dd>{module.benefit}</dd></div><div><dt>COSTO</dt><dd>{module.costLabel}</dd></div></dl>
            <button type="button" className="pixel-button" onClick={() => chooseModule(module.id)}>
              {installed ? 'MOVER / REEMPLAZAR' : selected.length < 3 ? 'COLOCAR' : 'ELEGIR PARA REEMPLAZAR'}
            </button>
          </article>;
        })}
      </div>
    </section>
  </main>;
}
