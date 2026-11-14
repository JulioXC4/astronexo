import type { GameSetup, MissionResult, NasaDataset } from './types';

export interface EarthReadyPayload {
  readonly setup: GameSetup;
  readonly nasaData: NasaDataset;
}

export interface EarthFlowProps {
  readonly onReady: (payload: EarthReadyPayload) => void;
}

export interface SpaceGameProps extends EarthReadyPayload {
  readonly onFinish: (result: MissionResult) => void;
}
