import { useState } from 'react';
import { useI18n } from '../../i18n';
import { interventionAssets } from '../../assets/interventionAssets';

interface PanelRepairGameProps {
  readonly onReadyChange: (ready: boolean) => void;
}

export function PanelRepairGame({ onReadyChange }: PanelRepairGameProps) {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);

  function complete() {
    if (ready) return;
    setReady(true);
    onReadyChange(true);
  }

  const damaged = interventionAssets.G1.find((asset) => asset.role === 'damaged')!;
  const part = interventionAssets.G1.find((asset) => asset.role === 'repairPart')!;
  const repaired = interventionAssets.G1.find((asset) => asset.role === 'repaired')!;

  return <div className="mini-game mini-game--visual" aria-label={t('interventions.gestures.panelGameAria')}>
    <img className="mini-game__scene" src={ready ? repaired.path : damaged.path} alt="" />
    <div
      className={`panel-cell ${ready ? 'panel-cell--placed' : ''}`}
      draggable={!ready}
      onDragStart={(event) => event.dataTransfer.setData('text/plain', 'panel-cell')}
    ><img src={part.path} alt="" /><span>{t('interventions.gestures.panelCell')}</span></div>
    <div
      className={`panel-slot ${ready ? 'panel-slot--ready' : ''}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (event.dataTransfer.getData('text/plain') === 'panel-cell') complete();
      }}
    >{t(ready ? 'interventions.gestures.panelConnected' : 'interventions.gestures.panelSlot')}</div>
    <button type="button" className="text-button" disabled={ready} onClick={complete}>
      {t('interventions.gestures.panelAlt')}
    </button>
  </div>;
}
