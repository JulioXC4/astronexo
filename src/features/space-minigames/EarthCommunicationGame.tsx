import { useMemo, useState } from 'react';
import type { ActionChoice, MissionState } from '../../game';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { COMMUNICATION_PROBLEMS, isCommunicationMessageRelevant, type GuidanceChoice } from './puzzleRules';
import { qualityFromMistakes } from '../../game';

interface EarthCommunicationGameProps { readonly state: MissionState; readonly onReadyChange: (ready: boolean, quality?: number) => void; readonly onChoiceChange: (choice: ActionChoice | undefined) => void; }

export function EarthCommunicationGame({ state, onReadyChange, onChoiceChange }: EarthCommunicationGameProps) {
  const { t } = useI18n();
  const [problem, setProblem] = useState<GuidanceChoice | null>(null);
  const [facts, setFacts] = useState<readonly string[]>([]);
  const [hint, setHint] = useState('');
  const [sent, setSent] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const choices = useMemo<readonly GuidanceChoice[]>(() => state.energy <= state.oxygen ? ['ENERGY_GUIDANCE', 'RADIATION_GUIDANCE'] : ['LIFE_SUPPORT_GUIDANCE', 'RADIATION_GUIDANCE'], [state.energy, state.oxygen]);
  const availableFacts = problem ? [...COMMUNICATION_PROBLEMS[problem].relevantFacts, ...COMMUNICATION_PROBLEMS[problem].distractors] : [];
  const asset = (role: string) => interventionAssets.G8.find((item) => item.role === role)!.path;
  function chooseProblem(choice: GuidanceChoice) { setProblem(choice); setFacts([]); setHint(''); setSent(false); onReadyChange(false); onChoiceChange(undefined); }
  function toggleFact(fact: string) { if (sent) return; setFacts((current) => current.includes(fact) ? current.filter((item) => item !== fact) : current.length < 2 ? [...current, fact] : current); }
  function transmit() {
    if (!problem || facts.length !== 2) return;
    if (!isCommunicationMessageRelevant(problem, facts)) { setHint(t('interventions.puzzles.g8.wrongFacts')); setMistakes((value) => value + 1); return; }
    setSent(true); setHint(t(state.destination === 'MOON' ? 'interventions.puzzles.g8.moonSuccess' : 'interventions.puzzles.g8.marsSuccess')); onChoiceChange(problem); onReadyChange(true, qualityFromMistakes(mistakes));
  }
  return <div className={`puzzle puzzle--communication ${sent ? 'puzzle--success is-transmitting' : ''}`}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g8.title')}</strong><span>{t('interventions.puzzles.g8.oneConsult')}</span></div>
    <div className="communication-scene"><img src={asset('antenna')} alt="" /><div className="signal-wave" aria-hidden="true" /><img src={asset('pendingResponse')} alt="" /></div>
    <div className="problem-grid">{choices.map((choice) => <button type="button" key={choice} className={problem === choice ? 'is-selected' : ''} disabled={sent} onClick={() => chooseProblem(choice)}>{t(`interventions.puzzles.g8.problems.${choice}`)}</button>)}</div>
    {problem && <div className="message-builder"><strong>{t('interventions.puzzles.g8.chooseFacts')}</strong><div>{availableFacts.map((fact) => <button type="button" key={fact} className={facts.includes(fact) ? 'is-selected' : ''} aria-pressed={facts.includes(fact)} disabled={sent} onClick={() => toggleFact(fact)}>{t(`interventions.puzzles.g8.facts.${fact}`, { energy: state.energy, oxygen: state.oxygen, shield: state.shield, food: state.foodSupply, solar: state.solarEfficiency, radiation: state.radiationExposure })}</button>)}</div><button type="button" className="transmit-button" disabled={facts.length !== 2 || sent} onClick={transmit}>{t('interventions.puzzles.g8.transmit')}</button></div>}
    <p className="puzzle__hint" aria-live="polite">{hint || t('interventions.puzzles.g8.hint')}</p>
  </div>;
}
