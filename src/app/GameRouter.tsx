import { EarthFlow } from '../features/earth';
import { SpaceGame } from '../features/space';
import type { EarthReadyPayload, MissionResult } from '../game/contracts';

export type SessionPhase =
  | { readonly kind: 'EARTH' }
  | { readonly kind: 'SPACE'; readonly payload: EarthReadyPayload }
  | { readonly kind: 'RESULT'; readonly result: MissionResult };

interface GameRouterProps {
  readonly phase: SessionPhase;
  readonly onReady: (payload: EarthReadyPayload) => void;
  readonly onFinish: (result: MissionResult) => void;
  readonly onRestart: () => void;
}

export function GameRouter({ phase, onReady, onFinish, onRestart }: GameRouterProps) {
  switch (phase.kind) {
    case 'EARTH': return <EarthFlow onReady={onReady} />;
    case 'SPACE': return <SpaceGame {...phase.payload} onFinish={onFinish} />;
    case 'RESULT': return <main className="panel">
      <p className="eyebrow">Prueba de integración · App</p>
      <h1>Resultado recibido</h1>
      <p>{phase.result.explanation}</p>
      <p>Estado: {phase.result.outcome} · Misión jugada: {phase.result.outcome === 'NOT_PLAYED' ? 'no' : 'sí'}</p>
      <button onClick={onRestart}>Volver a Tierra</button>
    </main>;
  }
}
