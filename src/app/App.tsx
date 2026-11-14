import { useState } from 'react';
import { GameRouter } from './GameRouter';
import type { SessionPhase } from './GameRouter';
import type { EarthReadyPayload } from '../game/contracts';

export function App() {
  const [phase, setPhase] = useState<SessionPhase>({ kind: 'EARTH' });
  const [lastPayload, setLastPayload] = useState<EarthReadyPayload | undefined>(undefined);

  return (
    <GameRouter
      phase={phase}
      onReady={(payload) => {
        setLastPayload(payload);
        setPhase({ kind: 'SPACE', payload });
      }}
      onFinish={(result) => setPhase({ kind: 'RESULT', result, payload: lastPayload })}
      onRestart={() => setPhase({ kind: 'EARTH' })}
    />
  );
}
