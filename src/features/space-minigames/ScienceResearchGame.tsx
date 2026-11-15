import { useState } from 'react';
import type { Destination } from '../../game';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { isScienceClassificationValid, isScienceObservationValid, scienceSamples, type ScienceClassId, type ScienceInstrumentId, type ScienceSampleId } from './puzzleRules';

interface ScienceResearchGameProps { readonly destination: Destination; readonly onReadyChange: (ready: boolean) => void; }
const SAMPLE_ROLE: Readonly<Record<ScienceSampleId, string>> = { BASALT: 'sampleBasalt', ANORTHOSITE: 'sampleAnorthosite', MARS_SEDIMENTARY: 'sampleMarsSedimentary', REGOLITH: 'sampleRegolith' };
const INSTRUMENT_ROLE: Readonly<Record<ScienceInstrumentId, string>> = { ANALYZER: 'instrumentAnalyzer', MAGNIFIER: 'instrumentMagnifier', GRAIN_IMAGER: 'instrumentGrainImager' };
const INSTRUMENTS: readonly ScienceInstrumentId[] = ['ANALYZER', 'MAGNIFIER', 'GRAIN_IMAGER'];
const CLASSES: readonly ScienceClassId[] = ['VOLCANIC_ROCK', 'HIGHLAND_ROCK', 'LAYERED_MATERIAL', 'LOOSE_MATERIAL'];

export function ScienceResearchGame({ destination, onReadyChange }: ScienceResearchGameProps) {
  const { t } = useI18n();
  const samples = scienceSamples(destination);
  const [selectedSample, setSelectedSample] = useState<ScienceSampleId | null>(null);
  const [completedSamples, setCompletedSamples] = useState<readonly ScienceSampleId[]>([]);
  const [observed, setObserved] = useState(false);
  const [instrument, setInstrument] = useState<ScienceInstrumentId | null>(null);
  const [hint, setHint] = useState('');
  const complete = completedSamples.length === 2;
  const round = samples.find((item) => item.sample === selectedSample) ?? null;
  const asset = (role: string) => interventionAssets.G6.find((item) => item.role === role)!.path;
  function chooseSample(sample: ScienceSampleId) {
    if (completedSamples.includes(sample) || complete) return;
    setSelectedSample(sample); setObserved(false); setInstrument(null); setHint(t('interventions.puzzles.g6.chooseInstrument'));
  }
  function observe(next: ScienceInstrumentId) {
    if (!round) return;
    setInstrument(next);
    const valid = isScienceObservationValid(round, next); setObserved(valid);
    setHint(t(valid ? `interventions.puzzles.g6.clues.${round.sample}` : 'interventions.puzzles.g6.instrumentHint'));
  }
  function classify(classification: ScienceClassId) {
    if (!round || !observed) return;
    if (!isScienceClassificationValid(round, classification)) { setHint(t('interventions.puzzles.g6.classificationHint')); return; }
    const next = [...completedSamples, round.sample]; setCompletedSamples(next);
    if (next.length === 2) { setHint(t('interventions.puzzles.g6.success')); onReadyChange(true); }
    else { setSelectedSample(null); setObserved(false); setInstrument(null); setHint(t('interventions.puzzles.g6.nextRound')); }
  }
  return <div className={`puzzle puzzle--science ${complete ? 'puzzle--success' : ''}`}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g6.title')}</strong><span>{t('interventions.puzzles.g6.round', { current: Math.min(completedSamples.length + 1, 2), total: 2 })}</span></div>
    <div className="sample-rack" aria-label={t('interventions.puzzles.g6.samplesAvailable')}>{samples.map((item) => <button type="button" key={item.sample} className={selectedSample === item.sample ? 'science-sample is-selected' : completedSamples.includes(item.sample) ? 'science-sample is-complete' : 'science-sample'} disabled={completedSamples.includes(item.sample) || complete} onClick={() => chooseSample(item.sample)}><img src={asset(SAMPLE_ROLE[item.sample])} alt="" /><strong>{t(`interventions.puzzles.g6.samples.${item.sample}`)}</strong><small>{completedSamples.includes(item.sample) ? t('interventions.puzzles.g6.classified') : t('interventions.puzzles.g6.select')}</small></button>)}</div>
    {round && <div className="science-workbench"><article className="science-sample science-sample--active"><img src={asset(SAMPLE_ROLE[round.sample])} alt="" /><strong>{t(`interventions.puzzles.g6.samples.${round.sample}`)}</strong><small>{t('interventions.puzzles.g6.unknown')}</small></article><div className="instrument-rack" aria-label={t('interventions.puzzles.g6.instruments')}>{INSTRUMENTS.map((item) => <button type="button" key={item} className={instrument === item ? 'instrument is-selected' : 'instrument'} disabled={complete} onClick={() => observe(item)}><img src={asset(INSTRUMENT_ROLE[item])} alt="" /><span>{t(`interventions.puzzles.g6.instrument.${item}`)}</span></button>)}</div></div>}
    {observed && !complete && <div className="classification-grid">{CLASSES.map((item) => <button type="button" key={item} onClick={() => classify(item)}>{t(`interventions.puzzles.g6.classes.${item}`)}</button>)}</div>}
    <p className="puzzle__hint" aria-live="polite">{hint || t('interventions.puzzles.g6.hint')}</p>
    <p className="puzzle__lesson">{t('interventions.puzzles.g6.lesson')}</p>
  </div>;
}
