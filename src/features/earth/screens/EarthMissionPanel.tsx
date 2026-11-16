import { useEffect, useRef, useState } from 'react';
import { Atom, CaretDown, CaretUp, CheckCircle, GameController, LockKey, Play, Scales, X } from '@phosphor-icons/react';
import type { EarthMissionDefinition } from '../../../data/missions';
import type { TrainingOutcome } from '../../../game';
import { useI18n } from '../../../i18n';
import { ToolSprite } from '../../../visual-kit/ToolSprite';
import { trainingResourceLabel } from '../trainingOutcome';

export type MissionPanelState = 'available' | 'completed' | 'locked';

interface EarthMissionPanelProps {
  readonly mission: EarthMissionDefinition;
  readonly state: MissionPanelState;
  readonly outcome?: TrainingOutcome;
  readonly onStart: () => void;
  readonly onClose: () => void;
}

/** Ficha contextual de la instalación seleccionada. Flota sobre el mapa; en tabletas es una hoja inferior. */
export function EarthMissionPanel({ mission, state, outcome, onStart, onClose }: EarthMissionPanelProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const key = (field: string) => `map.facilities.${mission.id}.${field}`;

  // Al cambiar de instalación vuelve a la vista compacta y lleva el foco a la ficha.
  useEffect(() => {
    setExpanded(false);
    panelRef.current?.querySelector<HTMLElement>('[data-panel-focus]')?.focus({ preventScroll: true });
  }, [mission.id]);

  const statusLabel = state === 'completed' ? t('common.completed') : state === 'locked' ? t('common.locked') : t('common.available');

  return <aside
    ref={panelRef}
    className={`emap-panel emap-panel--${state}`}
    role="complementary"
    aria-labelledby="emap-panel-title"
    data-tutorial="mission-panel"
    data-radio-block="true"
  >
    <header className="emap-panel__head">
      <span className={`emap-chip emap-chip--${state}`}>{statusLabel}</span>
      <span className="emap-chip emap-chip--source" data-tutorial="mission-source">{t(key('science'))}</span>
      <button type="button" className="emap-panel__close" onClick={onClose} aria-label={t('common.close')} data-panel-focus>
        <X weight="bold" aria-hidden="true" />
      </button>
    </header>

    <h2 id="emap-panel-title" className="emap-panel__title">{t(key('facilityName'))}</h2>
    <p className="emap-panel__minigame"><GameController weight="fill" aria-hidden="true" /> {t(key('name'))}</p>

    <p className="emap-panel__objective">{t(key('objective'))}</p>

    <dl className="emap-panel__facts">
      <div data-tutorial="mission-tool" className="emap-fact emap-fact--tool">
        <dt>{t('map.toolReward')}</dt>
        <dd><span className="emap-fact__sprite"><ToolSprite id={mission.targetTool} /></span>{t(`tools.${mission.targetTool}.label`)}</dd>
      </div>
      <div className="emap-fact">
        <dt><Scales weight="bold" aria-hidden="true" /> {t('map.cost')}</dt>
        <dd>{t(key('cost'))}</dd>
      </div>
    </dl>

    {expanded && <div className="emap-panel__more">
      <p><strong><Atom weight="bold" aria-hidden="true" /> {t('map.scienceData')}:</strong> {t(key('science'))}</p>
      <p><strong>{t('map.spaceEffect')}</strong> {t(key('effect'))}</p>
      {outcome && <p className="emap-panel__prep"><strong>{t('map.yourPrep')}</strong>{' '}
        {t('map.prepExplanation', { decision: outcome.decision, cost: outcome.cost, resource: trainingResourceLabel(outcome.resource) })}</p>}
    </div>}

    <button type="button" className="emap-panel__toggle" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
      {expanded ? <CaretUp weight="bold" aria-hidden="true" /> : <CaretDown weight="bold" aria-hidden="true" />}
      {expanded ? t('map.lessDetails') : t('map.moreDetails')}
    </button>

    <footer className="emap-panel__action">
      {state === 'available' && <button type="button" className="pixel-btn pixel-btn--primary emap-panel__start" onClick={onStart}>
        <Play weight="fill" aria-hidden="true" /><span>{t('map.startTraining')}</span>
      </button>}
      {state === 'completed' && <p className="emap-panel__done"><CheckCircle weight="fill" aria-hidden="true" /> {t('map.kitSecured')}</p>}
      {state === 'locked' && <p className="emap-panel__locked"><LockKey weight="bold" aria-hidden="true" /> {t('map.cargoFullBadge')}</p>}
    </footer>
  </aside>;
}
