import { ArrowLeft, ArrowRight, Backpack as BackpackIcon, CheckCircle, Warning, Sparkle } from '@phosphor-icons/react';
import { TOOL_CATALOG, isValidBackpack, type Backpack, type ToolId } from '../../../game/contracts';
import './earth.css';

interface BackpackScreenProps {
  readonly selectedTools: readonly ToolId[];
  readonly onUpdateTools: (tools: readonly ToolId[]) => void;
  readonly onConfirmBackpack: (backpack: Backpack) => void;
  readonly onBack: () => void;
}

const TOOL_METADATA: Record<ToolId, { icon: string; benefit: string; riskIfLeftOut: string }> = {
  FOLDING_PANELS: {
    icon: '☀️',
    benefit: 'Aumenta la generación de energía eléctrica solar en la base durante el día lunar.',
    riskIfLeftOut: 'Sin paneles extra, la base dependerá solo de baterías limitadas.',
  },
  LIFE_SUPPORT: {
    icon: '💨',
    benefit: 'Kits de sellado de aire y filtros ECLSS para emergencias y fugas de oxígeno.',
    riskIfLeftOut: 'Las fugas de aire consumirán mucha más energía para presurizar.',
  },
  SHELTER_KIT: {
    icon: '🛡️',
    benefit: 'Blindaje extra de polietileno/agua contra radiación de tormentas solares (CME).',
    riskIfLeftOut: 'La tripulación sufrirá mayor exposición ante eventos de clima espacial.',
  },
  CROP_KIT: {
    icon: '🌱',
    benefit: 'Módulo de bio-cultivo hidropónico para producir alimentos y soporte psicológico.',
    riskIfLeftOut: 'La reserva de raciones de emergencia no se renovará durante la misión.',
  },
};

export function BackpackScreen({ selectedTools, onUpdateTools, onConfirmBackpack, onBack }: BackpackScreenProps) {
  function handleToggle(id: ToolId) {
    if (selectedTools.includes(id)) {
      onUpdateTools(selectedTools.filter((t) => t !== id));
    } else {
      if (selectedTools.length < 3) {
        onUpdateTools([...selectedTools, id]);
      }
    }
  }

  const isComplete = isValidBackpack(selectedTools);
  const leftOutTool = TOOL_CATALOG.find((tool) => !selectedTools.includes(tool.id));

  return (
    <div className="earth-screen">
      <header className="earth-screen__header">
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Volver al Mapa</span>
        </button>
        <div className="earth-screen__progress-pill">
          <BackpackIcon weight="fill" color="#f6c15b" />
          <span>Paso 4 de 5 · Equipamiento de Carga</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '54rem' }}>
        <h1 className="earth-card__title">
          <BackpackIcon color="#f6c15b" weight="fill" />
          <span>Prepara tu bodega de herramientas (3 de 4)</span>
        </h1>
        <p className="earth-card__subtitle">
          El cohete tiene espacio y peso limitado para <strong>exactamente 3 kits</strong>. La herramienta que dejes en la Tierra condicionará las opciones de tu misión lunar.
        </p>

        {/* Ranuras de inventario */}
        <section aria-label="Ranuras de carga de la nave" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontFamily: 'Fredoka', color: '#f6c15b', fontSize: '1.1rem' }}>
              Bodega de Carga: {selectedTools.length} / 3 ranuras ocupadas
            </span>
            {isComplete ? (
              <span style={{ color: '#66bb6a', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle weight="fill" /> ¡Bodega lista para despegue!
              </span>
            ) : (
              <span style={{ color: '#ffb74d', fontWeight: 700, fontSize: '0.9rem' }}>
                Faltan {3 - selectedTools.length} kit(s) por elegir
              </span>
            )}
          </div>

          <div className="backpack-slots">
            {[0, 1, 2].map((slotIndex) => {
              const toolId = selectedTools[slotIndex];
              const toolDef = toolId ? TOOL_CATALOG.find((t) => t.id === toolId) : null;
              const meta = toolId ? TOOL_METADATA[toolId] : null;

              return (
                <div
                  key={slotIndex}
                  className={`backpack-slot ${toolDef ? 'backpack-slot--filled' : ''}`}
                >
                  {toolDef && meta ? (
                    <>
                      <span style={{ fontSize: '1.8rem' }}>{meta.icon}</span>
                      <strong className="backpack-slot__title">{toolDef.label}</strong>
                      <button
                        type="button"
                        onClick={() => handleToggle(toolDef.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#e57373',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          marginTop: '0.3rem',
                          textDecoration: 'underline'
                        }}
                      >
                        Quitar de bodega
                      </button>
                    </>
                  ) : (
                    <span style={{ color: '#7cb5c8', fontSize: '0.9rem' }}>
                      Ranura {slotIndex + 1} vacía
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Catálogo de 4 herramientas */}
        <section aria-label="Catálogo de herramientas disponibles">
          <h2 style={{ fontSize: '1.1rem', color: '#f6c15b', marginBottom: '0.8rem', fontFamily: 'Fredoka' }}>
            Kits disponibles para seleccionar:
          </h2>
          <div className="tool-catalog-grid">
            {TOOL_CATALOG.map((tool) => {
              const isSelected = selectedTools.includes(tool.id);
              const meta = TOOL_METADATA[tool.id];

              return (
                <div
                  key={tool.id}
                  className={`tool-item-card ${isSelected ? 'tool-item-card--selected' : ''}`}
                  onClick={() => handleToggle(tool.id)}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggle(tool.id);
                    }
                  }}
                >
                  <div>
                    <div className="tool-item-card__header">
                      <span className="tool-item-card__icon">{meta.icon}</span>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.4rem',
                        background: isSelected ? '#f6c15b' : '#29496e',
                        color: isSelected ? '#132235' : '#c3daf0'
                      }}>
                        {isSelected ? 'Cargado' : 'Disponible'}
                      </span>
                    </div>
                    <h3 className="tool-item-card__title">{tool.label}</h3>
                    <p className="tool-item-card__benefit">{meta.benefit}</p>
                  </div>
                  <div style={{
                    borderTop: '1px solid #2e4d70',
                    paddingTop: '0.5rem',
                    fontSize: '0.78rem',
                    color: '#93b5d8'
                  }}>
                    {isSelected ? '✓ Ocupa 1 espacio de bodega' : '+ Clic para cargar'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Consecuencia de la herramienta excluida */}
        {isComplete && leftOutTool && (
          <div style={{
            background: '#231e33',
            border: '1px solid #7e57c2',
            borderRadius: '0.9rem',
            padding: '1rem',
            marginTop: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            <Warning color="#ffb74d" size={26} weight="fill" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: '#e1d5f2', lineHeight: '1.4' }}>
              <strong>Estrategia de carga:</strong> Has dejado en la Tierra el <strong>{leftOutTool.label}</strong>.
              <br />
              <em>Consecuencia: {TOOL_METADATA[leftOutTool.id].riskIfLeftOut}</em>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.8rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
            disabled={!isComplete}
            onClick={() => {
              if (isValidBackpack(selectedTools)) {
                onConfirmBackpack(selectedTools);
              }
            }}
          >
            <Sparkle weight="fill" />
            <span>Confirmar Carga e Ir a Selección de Destino</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
