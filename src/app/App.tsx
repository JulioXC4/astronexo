import { useState } from 'react';
import { GameRouter } from './GameRouter';
import type { SessionPhase } from './GameRouter';
import type { EarthReadyPayload } from '../game/contracts';
import type { LocalCoopConfig } from '../features/coop-gameplay/coop.types';
import { I18nProvider } from '../i18n';

export function App() {
  const [phase, setPhase] = useState<SessionPhase>({ kind: 'EARTH' });
  const [lastPayload, setLastPayload] = useState<EarthReadyPayload | undefined>(undefined);
  const [lastCoopGroup, setLastCoopGroup] = useState<LocalCoopConfig | undefined>(undefined);

  return (
    <I18nProvider>
      <GameRouter
        phase={phase}
        onReady={(payload) => {
          setLastPayload(payload);
          setLastCoopGroup(undefined);
          setPhase({ kind: 'SPACE', payload });
        }}
        onStartCoop={(setup, group) => {
          setLastPayload(undefined);
          setLastCoopGroup(group);
          setPhase({ kind: 'COOP_SPACE', setup, group });
        }}
        onFinish={(result, coopGroup) =>
          setPhase({
            kind: 'RESULT',
            result,
            payload: lastPayload,
            coopGroup: coopGroup ?? lastCoopGroup,
          })
        }
        onRestart={() => setPhase({ kind: 'EARTH' })}
      />
    </I18nProvider>
  );
}