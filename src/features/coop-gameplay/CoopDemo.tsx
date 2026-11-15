import { useState } from 'react';
import type { MissionResult } from '../../game';
import { CoopSpaceGame } from './CoopSpaceGame';
import { COOP_DEMO_GROUPS, COOP_DEMO_SETUP } from './fixtures';

interface CoopDemoProps { readonly size?: 3 | 4 | 5 }

export function CoopDemo({ size = 5 }: CoopDemoProps) {
  const [lastResult, setLastResult] = useState<MissionResult | null>(null);
  const group = size === 3 ? COOP_DEMO_GROUPS.THREE : size === 4 ? COOP_DEMO_GROUPS.FOUR : COOP_DEMO_GROUPS.FIVE;
  if (lastResult) return <main className="coop-demo-finished pixel-panel">
    <h1>Demostración entregada</h1>
    <p>Puntuación colectiva: {lastResult.score.total}/100</p>
    <button className="pixel-button" onClick={() => setLastResult(null)}>VOLVER A PROBAR</button>
  </main>;
  return <CoopSpaceGame setup={COOP_DEMO_SETUP} group={group} onFinish={setLastResult} />;
}
