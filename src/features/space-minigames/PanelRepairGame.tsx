import { useState } from 'react';
import { useI18n } from '../../i18n';

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

  return <div className="mini-game" aria-label={t('interventions.gestures.panelGameAria')}>
    <div
      className={`panel-cell ${ready ? 'panel-cell--placed' : ''}`}
      draggable={!ready}
      onDragStart={(event) => event.dataTransfer.setData('text/plain', 'panel-cell')}
    >{t('interventions.gestures.panelCell')}</div>
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
