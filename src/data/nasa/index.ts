import type { NasaDataset } from '../../game/contracts';
import { buildVerifiedNasaDataset } from '../../features/nasa/adapters';

export * from './cities';
export * from './powerData';
export * from './donkiData';

export const pendingNasaDataset: NasaDataset = {
  validation: 'PENDING',
  observations: [],
  note: 'No hay registros NASA validados en este dataset.',
};

export const verifiedNasaDataset: NasaDataset = buildVerifiedNasaDataset();
