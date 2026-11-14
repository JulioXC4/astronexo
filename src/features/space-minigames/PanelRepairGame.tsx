import { useState } from 'react';

interface PanelRepairGameProps {
  readonly onReadyChange: (ready: boolean) => void;
}

export function PanelRepairGame({ onReadyChange }: PanelRepairGameProps) {
  const [ready, setReady] = useState(false);

  function complete() {
    if (ready) return;
    setReady(true);
    onReadyChange(true);
  }

  return <div className="mini-game" aria-label="Minijuego de reparación de paneles">
    <div
      className={`panel-cell ${ready ? 'panel-cell--placed' : ''}`}
      draggable={!ready}
      onDragStart={(event) => event.dataTransfer.setData('text/plain', 'panel-cell')}
    >CELDA</div>
    <div
      className={`panel-slot ${ready ? 'panel-slot--ready' : ''}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (event.dataTransfer.getData('text/plain') === 'panel-cell') complete();
      }}
    >{ready ? 'CONECTADA' : 'ARRASTRA AQUÍ'}</div>
    <button type="button" className="text-button" disabled={ready} onClick={complete}>
      Alternativa accesible: conectar celda
    </button>
  </div>;
}
