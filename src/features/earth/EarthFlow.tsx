import { useState } from 'react';
import { pendingNasaDataset } from '../../data/nasa';
import { isValidBackpack, TOOL_CATALOG } from '../../game/contracts';
import type { EarthFlowProps, ToolId } from '../../game/contracts';

export function EarthFlow({ onReady }: EarthFlowProps) {
  const [selected, setSelected] = useState<ToolId[]>([
    'FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT',
  ]);

  function toggleTool(id: ToolId) {
    setSelected((current) => current.includes(id)
      ? current.filter((tool) => tool !== id)
      : current.length < 3 ? [...current, id] : current);
  }

  function beginIntegrationCheck() {
    if (!isValidBackpack(selected)) return;
    onReady({
      setup: {
        cityId: 'LIMA',
        avatarId: 'PLACEHOLDER',
        fictionalName: 'Explorador/a',
        destination: 'MOON',
        backpack: selected,
        completedTraining: [],
      },
      nasaData: pendingNasaDataset,
    });
  }

  return <main className="panel">
    <p className="eyebrow">Prueba de integración · Tierra</p>
    <h1>Astronauta Junior</h1>
    <p>Esta pantalla temporal comprueba el contrato entre módulos. Los entrenamientos y datos NASA están pendientes.</p>
    <p>Ciudad temporal: Lima · Destino disponible: Luna · Elige exactamente 3 herramientas.</p>
    <div className="tool-list">
      {TOOL_CATALOG.map((tool) => <label key={tool.id}>
        <input type="checkbox" checked={selected.includes(tool.id)} onChange={() => toggleTool(tool.id)} />
        {tool.label}
      </label>)}
    </div>
    <button disabled={!isValidBackpack(selected)} onClick={beginIntegrationCheck}>Enviar configuración a Espacio</button>
  </main>;
}
