import { useState } from 'react';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';
import { PANEL_CIRCUIT_START, isPanelCircuitComplete, type CircuitTileState } from './puzzleRules';
import { qualityFromMistakes } from '../../game';
import { playSound } from '../audio';

interface PanelRepairGameProps { readonly onReadyChange: (ready: boolean, quality?: number) => void; }

const ROLE_BY_SHAPE = { STRAIGHT: 'circuitStraight', CORNER: 'circuitCorner', JUNCTION: 'circuitJunction' } as const;

export function PanelRepairGame({ onReadyChange }: PanelRepairGameProps) {
  const { t } = useI18n();
  const [tiles, setTiles] = useState<readonly CircuitTileState[]>(PANEL_CIRCUIT_START);
  const [spares, setSpares] = useState(2);
  const [hint, setHint] = useState('');
  const ready = isPanelCircuitComplete(tiles);
  const asset = (role: string) => interventionAssets.G1.find((item) => item.role === role)!.path;

  function operate(index: number) {
    if (ready) return;
    const tile = tiles[index];
    if (tile.damaged) {
      if (spares === 0) { setHint(t('interventions.puzzles.g1.noSpares')); return; }
      const next = tiles.map((item, position) => position === index ? { ...item, damaged: false } : item);
      setTiles(next);
      setSpares((value) => value - 1);
      setHint(t('interventions.puzzles.g1.repaired'));
      playSound('guardCellRepaired');
      // Gastar los dos repuestos deja el circuito peor acabado que resolverlo con uno.
      if (isPanelCircuitComplete(next)) onReadyChange(true, qualityFromMistakes(3 - spares));
      return;
    }
    const next = tiles.map((item, position) => position === index ? { ...item, rotation: (item.rotation + 1) % 4 } : item);
    setTiles(next);
    setHint(t('interventions.puzzles.g1.rotated'));
    if (isPanelCircuitComplete(next)) onReadyChange(true, qualityFromMistakes(2 - spares));
  }

  function reset() {
    setTiles(PANEL_CIRCUIT_START); setSpares(2); setHint(''); onReadyChange(false);
  }

  return <div className={`puzzle puzzle--circuit ${ready ? 'puzzle--success' : ''}`} aria-label={t('interventions.puzzles.g1.aria')}>
    <div className="puzzle__status"><strong>{t('interventions.puzzles.g1.title')}</strong><span>{t('interventions.puzzles.g1.spares', { count: spares })}</span></div>
    <div className="circuit-board">
      <div className="circuit-source"><img src={asset('damaged')} alt="" /><span>{t('interventions.puzzles.g1.source')}</span></div>
      <div className="circuit-grid">
        {tiles.map((tile, index) => <button type="button" key={index} className={`circuit-tile ${tile.damaged ? 'circuit-tile--damaged' : ''}`} aria-label={t(tile.damaged ? 'interventions.puzzles.g1.repairTile' : 'interventions.puzzles.g1.rotateTile', { number: index + 1 })} onClick={() => operate(index)}>
          <img src={asset(ROLE_BY_SHAPE[tile.shape])} alt="" style={{ transform: `rotate(${tile.rotation * 90}deg)` }} />
          {tile.damaged && <span aria-hidden="true">!</span>}
        </button>)}
      </div>
      <div className="circuit-target"><img src={asset('batteryBank')} alt="" /><span>{t('interventions.puzzles.g1.target')}</span></div>
      <div className={`circuit-current ${ready ? 'circuit-current--live' : ''}`} aria-hidden="true" />
    </div>
    <p className="puzzle__hint" aria-live="polite">{ready ? t('interventions.puzzles.g1.success') : hint || t('interventions.puzzles.g1.hint')}</p>
    {!ready && spares === 0 && <button type="button" className="puzzle-reset" onClick={reset}>{t('interventions.puzzles.retry')}</button>}
  </div>;
}
