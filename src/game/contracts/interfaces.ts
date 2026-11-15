import type { GameSetup as LegacyGameSetup, MissionResult as LegacyMissionResult, NasaDataset } from './types';
import type { GameSetup } from '../types';

export interface EarthReadyPayload {
  readonly setup: GameSetup;
  readonly nasaData: NasaDataset;
}

export interface EarthFlowProps {
  readonly onReady: (payload: EarthReadyPayload) => void;
}

export interface SpaceGameProps {
  readonly setup: LegacyGameSetup;
  readonly nasaData: NasaDataset;
  readonly onFinish: (result: LegacyMissionResult) => void;
}
