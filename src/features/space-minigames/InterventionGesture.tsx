import { useEffect, useRef, useState } from 'react';
import { INTERVENTIONS } from '../../game';
import type { ActionChoice, InterventionAction } from '../../game';
import { interventionAssets } from '../../assets/interventionAssets';
import { useI18n } from '../../i18n';

interface InterventionGestureProps {
  readonly action: Exclude<InterventionAction, 'REPAIR_PANELS' | 'PATCH_OXYGEN_LEAK'>;
  readonly onReadyChange: (ready: boolean) => void;
  readonly onChoiceChange: (choice: ActionChoice | undefined) => void;
}

export function InterventionGesture({ action, onReadyChange, onChoiceChange }: InterventionGestureProps) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interventionId = INTERVENTIONS.find((item) => item.action === action)!.id;
  const assets = interventionAssets[interventionId];
  const asset = (role: string) => assets.find((item) => item.role === role)?.path;

  useEffect(() => () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }, []);

  function complete() {
    if (ready) return;
    setReady(true);
    setProgress(100);
    onReadyChange(true);
  }

  function beginHold() {
    if (ready || holdTimer.current) return;
    setProgress(45);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      complete();
    }, 650);
  }

  function cancelHold() {
    if (!holdTimer.current) return;
    clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setProgress(0);
  }

  function choose(choice: ActionChoice) {
    onChoiceChange(choice);
    setReady(true);
    onReadyChange(true);
  }

  if (action === 'CLEAN_PANELS') {
    return <div className="mini-game mini-game--stacked mini-game--visual">
      <img className="mini-game__scene" src={progress >= 95 ? asset('clean') : asset('dusty')} alt="" />
      <label htmlFor="clean-panels">{t('interventions.gestures.cleanPanels', { progress })}</label>
      <input
        id="clean-panels"
        className="swipe-control"
        type="range"
        min={0}
        max={100}
        value={progress}
        onChange={(event) => {
          const next = Number(event.target.value);
          setProgress(next);
          if (next >= 95) complete();
        }}
      />
      <button type="button" className="text-button" disabled={ready} onClick={complete}>
        {t('interventions.gestures.cleanPanelsAlt')}
      </button>
    </div>;
  }

  if (action === 'RECYCLE_OXYGEN' || action === 'RUN_RESEARCH') {
    return <div className="mini-game mini-game--stacked mini-game--visual">
      <img className="mini-game__scene" src={action === 'RECYCLE_OXYGEN' ? asset('tank') : asset('terminal')} alt="" />
      <button
        type="button"
        className={`hold-control ${ready ? 'hold-control--ready' : ''}`}
        onPointerDown={beginHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
      >{ready ? t('interventions.gestures.holdReady') : t('interventions.gestures.holdProgress', { progress })}</button>
      <button type="button" className="text-button" disabled={ready} onClick={complete}>
        {t('interventions.gestures.holdAlt')}
      </button>
    </div>;
  }

  if (action === 'REINFORCE_SHELTER') {
    return <div className="mini-game mini-game--visual mini-game--shelter">
      <img className="mini-game__scene" src={ready ? asset('protected') : asset('openHatch')} alt="" />
      <div
        className={`regolith-block ${ready ? 'regolith-block--placed' : ''}`}
        draggable={!ready}
        onDragStart={(event) => event.dataTransfer.setData('text/plain', 'regolith')}
      ><img src={asset('regolith')} alt="" /><span>{t('interventions.gestures.regolithLabel')}</span></div>
      <div
        className={`shelter-slot ${ready ? 'shelter-slot--ready' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.getData('text/plain') === 'regolith') complete();
        }}
      >{t(ready ? 'interventions.gestures.regolithReady' : 'interventions.gestures.regolithSlot')}</div>
      <button type="button" className="text-button" disabled={ready} onClick={complete}>
        {t('interventions.gestures.regolithAlt')}
      </button>
    </div>;
  }

  if (action === 'MANAGE_GREENHOUSE') {
    return <div className="mini-game mini-game--stacked mini-game--visual">
      <div className="mini-game__greenhouse-scene" aria-hidden="true">
        <img src={asset('plantedTray')} alt="" />
        <img src={asset('lightsOn')} alt="" />
      </div>
      <span>{t('interventions.gestures.cropsHeading')}</span>
      <div className="choice-grid">
        <button type="button" className="choice-control" onClick={() => choose('MAINTAIN_CROPS')}>
          {t('interventions.gestures.maintainCrops')}
        </button>
        <button type="button" className="choice-control" onClick={() => choose('SUSPEND_CROPS')}>
          {t('interventions.gestures.suspendCrops')}
        </button>
      </div>
    </div>;
  }

  return <div className="mini-game mini-game--stacked mini-game--visual">
    <div className="mini-game__communication-scene" aria-hidden="true">
      <img src={asset('antenna')} alt="" />
      <img src={asset('pendingResponse')} alt="" />
    </div>
    <span>{t('interventions.gestures.consultHeading')}</span>
    <div className="choice-grid">
      <button type="button" className="choice-control" onClick={() => choose('ENERGY_GUIDANCE')}>{t('interventions.gestures.consultEnergy')}</button>
      <button type="button" className="choice-control" onClick={() => choose('RADIATION_GUIDANCE')}>{t('interventions.gestures.consultRadiation')}</button>
      <button type="button" className="choice-control" onClick={() => choose('LIFE_SUPPORT_GUIDANCE')}>{t('interventions.gestures.consultLifeSupport')}</button>
    </div>
  </div>;
}
