import { ArrowLeft, ArrowRight, Backpack as BackpackIcon, CheckCircle, Warning, Sparkle } from '@phosphor-icons/react';
import { TOOL_CATALOG, isValidBackpack, type Backpack, type ToolId } from '../../../game/contracts';
import { ToolSprite } from '../../../visual-kit/ToolSprite';
import './earth.css';

interface BackpackScreenProps {
  readonly selectedTools: readonly ToolId[];
  readonly onUpdateTools: (tools: readonly ToolId[]) => void;
  readonly onConfirmBackpack: (backpack: Backpack) => void;
  readonly onBack: () => void;
}

const TOOL_ITEM_DATA: Record<Extract<ToolId, 'FOLDING_PANELS' | 'LIFE_SUPPORT' | 'SHELTER_KIT' | 'CROP_KIT'>, { color: string; badge: string; desc: string; risk: string }> = {
  FOLDING_PANELS: {
    color: '#ffb300',
    badge: 'ENERGÍA FOTOVOLTAICA',
    desc: 'Celdas solares ultraligeras para recargar baterías durante el día lunar.',
    risk: 'La base dependerá únicamente de la energía de reserva en turnos sin luz.',
  },
  LIFE_SUPPORT: {
    color: '#4cc3d9',
    badge: 'OXÍGENO & ECLSS',
    desc: 'Tanques presurizados y cartuchos regenerativos para sellar fugas de aire.',
    risk: 'Cualquier fuga de aire requerirá un sobreesfuerzo masivo del soporte vital.',
  },
  SHELTER_KIT: {
    color: '#81c784',
    badge: 'BLINDAJE DE REFUGIO',
    desc: 'Placas de polietileno denso para mitigar radiación de tormentas solares (CME).',
    risk: 'La tripulación absorberá mayor radiación en eventos de clima solar severo.',
  },
  CROP_KIT: {
    color: '#66bb6a',
    badge: 'BIO-CULTIVOS VEGGIE',
    desc: 'Almohadillas hidropónicas de crecimiento acelerado para alimento fresco.',
    risk: 'No habrá renovación de raciones frescas durante la permanencia en la base.',
  },
};

export function BackpackScreen({ selectedTools, onUpdateTools, onConfirmBackpack, onBack }: BackpackScreenProps) {
  function handleSelectTool(id: ToolId) {
    if (selectedTools.includes(id)) {
      // Si ya está, lo quitamos de la bodega
      onUpdateTools(selectedTools.filter((t) => t !== id));
    } else {
      // Si hay espacio (< 3), lo cargamos
      if (selectedTools.length < 3) {
        onUpdateTools([...selectedTools, id]);
      }
    }
  }

  const isFull = isValidBackpack(selectedTools);
  const leftOutTool = TOOL_CATALOG.find((tool) => !selectedTools.includes(tool.id));

  return (
    <div className="earth-screen" style={{ padding: '0.8rem 1rem' }}>
      <header className="earth-screen__header" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="earth-screen__back-btn" onClick={onBack}>
          <ArrowLeft weight="bold" />
          <span>Mapa del Centro Espacial</span>
        </button>
        <div className="earth-screen__progress-pill">
          <BackpackIcon weight="fill" color="#f6c15b" />
          <span>Hangar de Equipamiento · Capacidad: 3 Kits Máximo</span>
        </div>
      </header>

      <main className="earth-card" style={{ maxWidth: '64rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.8rem' }}>
          <div>
            <h1 className="earth-card__title" style={{ fontSize: '1.5rem', margin: 0 }}>
              <BackpackIcon color="#f6c15b" weight="fill" />
              <span>Bodega de Carga de la Nave (3 de 4)</span>
            </h1>
            <p style={{ margin: 0, color: '#9bc0e4', fontSize: '0.88rem' }}>
              Toca un contenedor para cargarlo en la nave o devolverlo a la mesa de preparación.
            </p>
          </div>

          <div style={{
            background: isFull ? '#1b5e20' : '#142539',
            border: `2px solid ${isFull ? '#69f0ae' : '#395c86'}`,
            borderRadius: '1rem',
            padding: '0.4rem 1rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: isFull ? '#69f0ae' : '#ffd54f',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {isFull ? <CheckCircle weight="fill" size={18} /> : null}
            <span>Bodega: {selectedTools.length} / 3 Ocupadas</span>
          </div>
        </div>

        {/* INVENTARIO DIVIDIDO: ESTANTES EN TIERRA (IZQ) VS BAHÍA DE CARGA DEL COHETE (DER) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.2rem', alignItems: 'stretch' }}>
          
          {/* LADO IZQUIERDO: KITS DISPONIBLES EN TIERRA */}
          <section style={{
            background: '#132338',
            border: '2px solid #2e527d',
            borderRadius: '1rem',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem'
          }}>
            <h2 style={{ fontSize: '1rem', color: '#f6c15b', margin: '0 0 0.3rem 0', fontFamily: 'Fredoka', letterSpacing: '0.04em' }}>
              📦 ESTANTERÍA DE EQUIPOS EN TIERRA (4 DISPONIBLES)
            </h2>

            {TOOL_CATALOG.map((tool) => {
              const isLoaded = selectedTools.includes(tool.id);
              const meta = TOOL_ITEM_DATA[tool.id];

              return (
                <div
                  key={tool.id}
                  style={{
                    background: isLoaded ? '#1e334d' : '#182e49',
                    border: `2px solid ${isLoaded ? '#f6c15b' : '#355982'}`,
                    borderRadius: '0.8rem',
                    padding: '0.8rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.8rem',
                    opacity: isLoaded ? 0.75 : 1,
                    transition: 'all 0.15s ease',
                    boxShadow: isLoaded ? 'none' : '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                  onClick={() => handleSelectTool(tool.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{
                      width: '2.8rem',
                      height: '2.8rem',
                      borderRadius: '0.6rem',
                      background: '#122336',
                      border: `1.5px solid ${meta.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      <ToolSprite id={tool.id} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: meta.color, fontWeight: 700, letterSpacing: '0.05em' }}>
                        {meta.badge}
                      </span>
                      <h3 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.05rem', color: '#ffffff' }}>
                        {tool.label}
                      </h3>
                      <p style={{ margin: '0.1rem 0 0 0', color: '#bed4ea', fontSize: '0.8rem' }}>
                        {meta.desc}
                      </p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.6rem',
                    borderRadius: '0.4rem',
                    background: isLoaded ? '#f6c15b' : '#23446b',
                    color: isLoaded ? '#101d2d' : '#c3dcfa',
                    flexShrink: 0
                  }}>
                    {isLoaded ? 'CARGADO ✓' : '+ CARGAR'}
                  </span>
                </div>
              );
            })}
          </section>

          {/* LADO DERECHO: BAHÍA DE CARGA DE LA NAVE CON 3 RANURAS */}
          <section style={{
            background: 'radial-gradient(circle at 50% 40%, #173356 0%, #0d1a29 100%)',
            border: '2px solid #3d6899',
            borderRadius: '1rem',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.8rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1rem', color: '#69f0ae', margin: '0 0 0.8rem 0', fontFamily: 'Fredoka', letterSpacing: '0.04em' }}>
                🚀 BAHÍA DE CARGA DEL COHETE (3 RANURAS)
              </h2>

              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {[0, 1, 2].map((slotIndex) => {
                  const toolId = selectedTools[slotIndex];
                  const toolDef = toolId ? TOOL_CATALOG.find((t) => t.id === toolId) : null;
                  const meta = toolDef ? TOOL_ITEM_DATA[toolDef.id] : null;

                  return (
                    <div
                      key={slotIndex}
                      style={{
                        background: toolDef ? '#193a52' : '#0d1825',
                        border: `2px ${toolDef ? 'solid #69f0ae' : 'dashed #34567c'}`,
                        borderRadius: '0.8rem',
                        padding: '0.8rem 1rem',
                        minHeight: '4.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.8rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      {toolDef && meta ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <ToolSprite id={toolId!} />
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#69f0ae', fontWeight: 700 }}>
                                RANURA {slotIndex + 1} ENSAMBLADA
                              </span>
                              <h4 style={{ margin: 0, fontFamily: 'Fredoka', fontSize: '1.1rem', color: '#ffffff' }}>
                                {toolDef.label}
                              </h4>
                            </div>
                          </div>
                          <button
                            type="button"
                            style={{
                              background: 'transparent',
                              border: '1px solid #e57373',
                              color: '#ff8a80',
                              borderRadius: '0.4rem',
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleSelectTool(toolDef.id)}
                          >
                            Expulsar
                          </button>
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#7cb5c8', fontSize: '0.9rem' }}>
                          <span style={{ width: '1.8rem', height: '1.8rem', borderRadius: '50%', border: '1px dashed #7cb5c8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                            {slotIndex + 1}
                          </span>
                          <span>Ranura de Bodega Vacía</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ADVERTENCIA DEL KIT EXCLUIDO EN TIERRA */}
            {isFull && leftOutTool && (
              <div style={{
                background: '#2d1d28',
                border: '1.5px solid #d32f2f',
                borderRadius: '0.8rem',
                padding: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <Warning color="#ff8a80" size={24} weight="fill" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: '#ffcdd2', lineHeight: '1.3' }}>
                  <strong>Se queda en la Tierra: {leftOutTool.label}.</strong>
                  <br />
                  <em>Consecuencia: {TOOL_ITEM_DATA[leftOutTool.id].risk}</em>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* BOTÓN DE CONFIRMACIÓN DE LA BODEGA */}
        <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="earth-action-btn"
            disabled={!isFull}
            style={{ padding: '0.9rem 2rem', fontSize: '1.15rem' }}
            onClick={() => {
              if (isValidBackpack(selectedTools)) {
                onConfirmBackpack(selectedTools);
              }
            }}
          >
            <Sparkle weight="fill" />
            <span>Sellar Bodega y Continuar a Destino</span>
            <ArrowRight weight="bold" />
          </button>
        </div>
      </main>
    </div>
  );
}
