import { useEffect, useRef, useState } from 'react';
import type { ActionChoice, InterventionAction } from '../../game';

interface InterventionGestureProps {
  readonly action: Exclude<InterventionAction, 'REPAIR_PANELS' | 'PATCH_OXYGEN_LEAK'>;
  readonly onReadyChange: (ready: boolean) => void;
  readonly onChoiceChange: (choice: ActionChoice | undefined) => void;
}

export function InterventionGesture({ action, onReadyChange, onChoiceChange }: InterventionGestureProps) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }, []);

  function complete() {
    if (ready) return;
    setReady(true);
    setProgress(100);
    onReadyChange(true);
  }

  function beginHold() {
    if (ready || holdTimer.current) return;
    setProgress(45);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      complete();
    }, 650);
  }

  function cancelHold() {
    if (!holdTimer.current) return;
    clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setProgress(0);
  }

  function choose(choice: ActionChoice) {
    onChoiceChange(choice);
    setReady(true);
    onReadyChange(true);
  }

  if (action === 'CLEAN_PANELS') {
    return <div className="mini-game mini-game--stacked">
      <label htmlFor="clean-panels">DESLIZA PARA LIMPIAR · {progress}%</label>
      <input
        id="clean-panels"
        className="swipe-control"
        type="range"
        min={0}
        max={100}
        value={progress}
        onChange={(event) => {
          const next = Number(event.target.value);
          setProgress(next);
          if (next >= 95) complete();
        }}
      />
      <button type="button" className="text-button" disabled={ready} onClick={complete}>
        Alternativa accesible: completar limpieza
      </button>
    </div>;
  }

  if (action === 'RECYCLE_OXYGEN' || action === 'RUN_RESEARCH') {
    return <div className="mini-game mini-game--stacked">
      <button
        type="button"
        className={`hold-control ${ready ? 'hold-control--ready' : ''}`}
        onPointerDown={beginHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
      >{ready ? 'CICLO COMPLETO' : `MANTÉN PRESIONADO · ${progress}%`}</button>
      <button type="button" className="text-button" disabled={ready} onClick={complete}>
        Alternativa accesible: completar ciclo
      </button>
    </div>;
  }

  if (action === 'REINFORCE_SHELTER') {
    return <div className="mini-game">
      <div
        className={`regolith-block ${ready ? 'regolith-block--placed' : ''}`}
        draggable={!ready}
        onDragStart={(event) => event.dataTransfer.setData('text/plain', 'regolith')}
      >REGOLITO</div>
      <div
        className={`shelter-slot ${ready ? 'shelter-slot--ready' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.getData('text/plain') === 'regolith') complete();
        }}
      >{ready ? 'REFUERZO LISTO' : 'ARRASTRA AL REFUGIO'}</div>
      <button type="button" className="text-button" disabled={ready} onClick={complete}>
        Alternativa accesible: colocar regolito
      </button>
    </div>;
  }

  if (action === 'MANAGE_GREENHOUSE') {
    return <div className="mini-game mini-game--stacked">
      <span>ELIGE EL ESTADO DE LOS CULTIVOS</span>
      <div className="choice-grid">
        <button type="button" className="choice-control" onClick={() => choose('MAINTAIN_CROPS')}>
          MANTENER · −3 Energía / +Alimento
        </button>
        <button type="button" className="choice-control" onClick={() => choose('SUSPEND_CROPS')}>
          SUSPENDER · +Energía / −Alimento
        </button>
      </div>
    </div>;
  }

  return <div className="mini-game mini-game--stacked">
    <span>SELECCIONA UNA CONSULTA SIMULADA</span>
    <div className="choice-grid">
      <button type="button" className="choice-control" onClick={() => choose('ENERGY_GUIDANCE')}>ENERGÍA</button>
      <button type="button" className="choice-control" onClick={() => choose('RADIATION_GUIDANCE')}>RADIACIÓN</button>
      <button type="button" className="choice-control" onClick={() => choose('LIFE_SUPPORT_GUIDANCE')}>SOPORTE VITAL</button>
    </div>
  </div>;
}
