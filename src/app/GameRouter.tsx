import { useState } from 'react';
import { EarthFlow } from '../features/earth';
import { SoloSpaceGame } from '../features/space';
import { CoopSpaceGame } from '../features/coop-gameplay/CoopSpaceGame';
import type { LocalCoopConfig } from '../features/coop-gameplay/coop.types';
import { EarthReturnScreen } from '../features/earth/screens/EarthReturnScreen';
import { NextAdventureScreen } from '../features/earth/screens/NextAdventureScreen';
import { LearnScreen } from '../features/earth/screens/LearnScreen';
import { StationModeModal } from '../features/earth/screens/StationModeModal';
import type { EarthReadyPayload } from '../game/contracts';
import type { GameSetup, MissionResult } from '../game';
import { CinematicTransition, returnVideoFor, useAudioScene } from '../features/audio';

export type SessionPhase =
  | { readonly kind: 'EARTH' }
  | { readonly kind: 'SPACE'; readonly payload: EarthReadyPayload }
  | { readonly kind: 'COOP_SPACE'; readonly setup: GameSetup; readonly group: LocalCoopConfig }
  | { readonly kind: 'RESULT'; readonly result: MissionResult; readonly payload?: EarthReadyPayload; readonly coopGroup?: LocalCoopConfig };

interface GameRouterProps {
  readonly phase: SessionPhase;
  readonly onReady: (payload: EarthReadyPayload) => void;
  readonly onStartCoop?: (setup: GameSetup, group: LocalCoopConfig) => void;
  readonly onFinish: (result: MissionResult, coopGroup?: LocalCoopConfig) => void;
  readonly onRestart: () => void;
}

/** RETURN_VIDEO: cinemática de regreso, justo después del informe y antes de la pantalla de Tierra. */
type ResultViewStep = 'RETURN_VIDEO' | 'RETURN' | 'NEXT_ADVENTURE' | 'LEARN';

export function GameRouter({ phase, onReady, onStartCoop, onFinish, onRestart }: GameRouterProps) {
  const [resultStep, setResultStep] = useState<ResultViewStep>('RETURN_VIDEO');

  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  // Resultado y regreso: misma música festiva que ya sonó en el informe (no se reinicia).
  useAudioScene(phase.kind === 'RESULT' ? { music: 'result' } : null);

  switch (phase.kind) {
    case 'EARTH':
      return <EarthFlow onReady={onReady} onStartCoop={onStartCoop} />;

    case 'SPACE':
      return <SoloSpaceGame setup={phase.payload.setup} onFinish={(res) => onFinish(res)} />;

    case 'COOP_SPACE':
      return (
        <CoopSpaceGame
          setup={phase.setup}
          group={phase.group}
          onFinish={(res) => onFinish(res, phase.group)}
        />
      );

    case 'RESULT': {
      const astronautName = phase.coopGroup
        ? `${phase.coopGroup.teamAlias} (${phase.coopGroup.players.map((p) => p.alias).join(', ')})`
        : phase.payload?.setup.earthProfile?.fictionalName ?? 'Comandante Junior';

      if (resultStep === 'LEARN') {
        return (
          <LearnScreen
            onBack={() => setResultStep('NEXT_ADVENTURE')}
          />
        );
      }

      if (resultStep === 'RETURN_VIDEO') {
        return (
          <CinematicTransition
            video={returnVideoFor(phase.result.finalState.setup.city)}
            onDone={() => setResultStep('RETURN')}
          />
        );
      }

      if (resultStep === 'RETURN') {
        return (
          <EarthReturnScreen
            result={phase.result}
            astronautName={astronautName}
            onProceedToNextAdventure={() => setResultStep('NEXT_ADVENTURE')}
          />
        );
      }

      return (
        <>
          <NextAdventureScreen
            result={phase.result}
            onReplay={() => {
              setResultStep('RETURN_VIDEO');
              onRestart();
            }}
            onOpenLearn={() => setResultStep('LEARN')}
            onOpenStation={() => setIsStationModalOpen(true)}
            onGoHome={() => {
              setResultStep('RETURN_VIDEO');
              onRestart();
            }}
          />
          <StationModeModal
            isOpen={isStationModalOpen}
            onClose={() => setIsStationModalOpen(false)}
            onLaunchDemoSolo={() => {
              setIsStationModalOpen(false);
              setResultStep('RETURN_VIDEO');
              onRestart();
            }}
            onStartCoop={(setup, group) => {
              setIsStationModalOpen(false);
              setResultStep('RETURN_VIDEO');
              onStartCoop?.(setup, group);
            }}
          />
        </>
      );
    }
  }
}