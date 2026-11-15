import { useState } from 'react';
import { EarthFlow } from '../features/earth';
import { SoloSpaceGame } from '../features/space';
import { EarthReturnScreen } from '../features/earth/screens/EarthReturnScreen';
import { NextAdventureScreen } from '../features/earth/screens/NextAdventureScreen';
import { LearnScreen } from '../features/earth/screens/LearnScreen';
import { StationModeModal } from '../features/earth/screens/StationModeModal';
import type { EarthReadyPayload } from '../game/contracts';
import type { MissionResult } from '../game';

export type SessionPhase =
  | { readonly kind: 'EARTH' }
  | { readonly kind: 'SPACE'; readonly payload: EarthReadyPayload }
  | { readonly kind: 'RESULT'; readonly result: MissionResult; readonly payload?: EarthReadyPayload };

interface GameRouterProps {
  readonly phase: SessionPhase;
  readonly onReady: (payload: EarthReadyPayload) => void;
  readonly onFinish: (result: MissionResult) => void;
  readonly onRestart: () => void;
}

type ResultViewStep = 'RETURN' | 'NEXT_ADVENTURE' | 'LEARN';

export function GameRouter({ phase, onReady, onFinish, onRestart }: GameRouterProps) {
  const [resultStep, setResultStep] = useState<ResultViewStep>('RETURN');
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  switch (phase.kind) {
    case 'EARTH':
      return <EarthFlow onReady={onReady} />;

    case 'SPACE':
      return <SoloSpaceGame setup={phase.payload.setup} onFinish={onFinish} />;

    case 'RESULT': {
      const astronautName = phase.payload?.setup.earthProfile?.fictionalName ?? 'Comandante Junior';

      if (resultStep === 'LEARN') {
        return (
          <LearnScreen
            onBack={() => setResultStep('NEXT_ADVENTURE')}
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
              setResultStep('RETURN');
              onRestart();
            }}
            onOpenLearn={() => setResultStep('LEARN')}
            onOpenStation={() => setIsStationModalOpen(true)}
            onGoHome={() => {
              setResultStep('RETURN');
              onRestart();
            }}
          />
          <StationModeModal
            isOpen={isStationModalOpen}
            onClose={() => setIsStationModalOpen(false)}
            onLaunchDemoSolo={() => {
              setIsStationModalOpen(false);
              setResultStep('RETURN');
              onRestart();
            }}
          />
        </>
      );
    }
  }
}
