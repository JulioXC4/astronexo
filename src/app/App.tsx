import { useEffect, useState } from 'react';
import { GameRouter } from './GameRouter';
import type { SessionPhase } from './GameRouter';
import type { EarthReadyPayload } from '../game/contracts';
import type { LocalCoopConfig } from '../features/coop-gameplay/coop.types';
import { I18nProvider } from '../i18n';
import { RadioProvider } from '../features/radio';
import { initAudio } from '../features/audio';
// Capa de calma: va la última para tener la última palabra sobre animaciones, brillo y bordes.
import '../styles/calm.css';

export function App() {
  const [phase, setPhase] = useState<SessionPhase>({ kind: 'EARTH' });
  const [lastPayload, setLastPayload] = useState<EarthReadyPayload | undefined>(undefined);
  const [lastCoopGroup, setLastCoopGroup] = useState<LocalCoopConfig | undefined>(undefined);

  // Un único sistema de audio para todo el juego (música, ambientes y efectos).
  useEffect(() => { initAudio(); }, []);

  return (
    <I18nProvider>
      <RadioProvider>
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
      </RadioProvider>
    </I18nProvider>
  );
}