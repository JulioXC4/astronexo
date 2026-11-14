import { useState } from 'react';
import { GameRouter } from './GameRouter';
import type { SessionPhase } from './GameRouter';

export function App() {
  const [phase, setPhase] = useState<SessionPhase>({ kind: 'EARTH' });
  return <GameRouter
    phase={phase}
    onReady={(payload) => setPhase({ kind: 'SPACE', payload })}
    onFinish={(result) => setPhase({ kind: 'RESULT', result })}
    onRestart={() => setPhase({ kind: 'EARTH' })}
  />;
}
