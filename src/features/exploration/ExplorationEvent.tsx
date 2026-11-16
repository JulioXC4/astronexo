import { useEffect, useState } from 'react';
import type { ExplorationMode, ExplorationResult, MissionState } from '../../game';
import { useI18n } from '../../i18n';
import { useRadio } from '../radio';
import { ExplorationCanvas } from './ExplorationCanvas';
import { ExplorationReport } from './ExplorationReport';
import { ExplorationStart, type ExplorationChoice } from './ExplorationStart';
import './exploration.css';

interface ExplorationEventProps {
  /** Estado de la guardia ya avanzado al siguiente turno. */
  readonly state: MissionState;
  /** Turno recién terminado (2 o 4). */
  readonly completedTurn: number;
  /** Etiqueta del reloj del turno, ya traducida («Día lunar 6»). */
  readonly clock: string;
  /** null = decidió quedarse en la base. */
  readonly onDone: (result: ExplorationResult | null) => void;
}

type Stage =
  | { readonly kind: 'START' }
  | { readonly kind: 'WALK'; readonly mode: ExplorationMode; readonly battery: number }
  | { readonly kind: 'REPORT'; readonly result: ExplorationResult };

/**
 * La ventana opcional entre turnos: elegir cómo salir, explorar y ver el
 * informe. Al terminar solo devuelve el resultado; quien la llamó lo escribe en
 * la guardia (`applyExploration`).
 */
export function ExplorationEvent({ state, completedTurn, clock, onDone }: ExplorationEventProps) {
  const { t } = useI18n();
  const radio = useRadio();
  const [stage, setStage] = useState<Stage>({ kind: 'START' });
  const resources = { energy: state.energy, oxygen: state.oxygen, shield: state.shield };

  // Alba y Nico presentan la salida por radio, sin tapar las tarjetas.
  useEffect(() => {
    radio.clear();
    radio.say({ speaker: 'ALBA', text: t('exploration.introAlba') });
    radio.say({ speaker: 'NICO', text: t('exploration.introNico') });
    // Solo al abrir: los textos no cambian mientras dura la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(choice: ExplorationChoice) {
    if (choice.kind === 'STAY') {
      radio.clear();
      radio.say({ speaker: 'NICO', text: t('exploration.stayRadio') });
      onDone(null);
      return;
    }
    radio.clear();
    setStage(choice.kind === 'ROVER'
      ? { kind: 'WALK', mode: 'ROVER', battery: choice.battery }
      : { kind: 'WALK', mode: 'FOOT', battery: 0 });
  }

  if (stage.kind === 'START') {
    return <ExplorationStart clock={clock} resources={resources} onChoose={choose} />;
  }
  if (stage.kind === 'WALK') {
    return <ExplorationCanvas
      destination={state.destination}
      afterTurn={completedTurn}
      mode={stage.mode}
      battery={stage.battery}
      resources={resources}
      avatarId={state.setup.earthProfile?.avatarId}
      onFinish={(result) => {
        radio.clear();
        setStage({ kind: 'REPORT', result });
      }}
    />;
  }
  return <ExplorationReport
    result={stage.result}
    destination={state.destination}
    clock={clock}
    onContinue={() => onDone(stage.result)}
  />;
}
