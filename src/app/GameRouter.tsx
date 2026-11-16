import { useState } from 'react';
import { EarthFlow } from '../features/earth';
import { SoloSpaceGame } from '../features/space';
import { CoopSpaceGame } from '../features/coop-gameplay/CoopSpaceGame';
import type { LocalCoopConfig } from '../features/coop-gameplay/coop.types';
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

/**
 * RETURN_VIDEO: cinemática de regreso, justo después del informe. De ahí se va directo a la
 * «Próxima aventura», que ya trae el balance de la misión. (Antes había además una pantalla
 * «Regreso a la Tierra» que repetía el veredicto: una ventana más que leer y cerrar.)
 */
type ResultViewStep = 'RETURN_VIDEO' | 'NEXT_ADVENTURE' | 'LEARN';

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
            onDone={() => setResultStep('NEXT_ADVENTURE')}
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