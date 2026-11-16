import { ArrowDown, ArrowUp, Check, Hammer, Lightning, Clock, PauseCircle, HandPointing } from '@phosphor-icons/react';
import type { ModuleId } from '../../game';
import { useI18n } from '../../i18n';
import { getModuleEffects } from './moduleEffects';
import type { EffectResource } from './moduleEffects';
import './build-flow.css';

/** Los cuatro pasos de un módulo: elegirlo, construirlo, verlo terminado y verlo funcionando. */
export type BuildStep = 'choose' | 'build' | 'done' | 'working';
const STEPS: readonly BuildStep[] = ['choose', 'build', 'done', 'working'];

export function BuildFlowSteps({ current }: { readonly current: BuildStep }) {
  const { t } = useI18n();
  const index = STEPS.indexOf(current);
  return <ol className="build-steps" aria-label={t('buildFlow.stepsAria')}>
    {STEPS.map((step, position) => <li
      key={step}
      className={`build-steps__item${position < index ? ' build-steps__item--past' : ''}${position === index ? ' build-steps__item--current' : ''}`}
      aria-current={position === index ? 'step' : undefined}
    >
      <span className="build-steps__dot" aria-hidden="true">{position < index ? <Check weight="bold" /> : position + 1}</span>
      <span>{t(`buildFlow.steps.${step}`)}</span>
    </li>)}
  </ol>;
}

export type ModuleState = 'selected' | 'pending' | 'building' | 'finished' | 'working' | 'paused';

const STATE_ICON = {
  selected: HandPointing,
  pending: Clock,
  building: Hammer,
  finished: Check,
  working: Lightning,
  paused: PauseCircle,
} as const;

/** Etiqueta del estado de un módulo: icono + palabra (el color nunca va solo) y una animación sencilla. */
export function ModuleStatusBadge({ state, label }: { readonly state: ModuleState; readonly label?: string }) {
  const { t } = useI18n();
  const Icon = STATE_ICON[state];
  return <span className={`module-state module-state--${state}`}>
    <Icon weight="fill" aria-hidden="true" />
    <span>{label ?? t(`buildFlow.status.${state}`)}</span>
  </span>;
}

const RESOURCE_LABEL: Readonly<Record<EffectResource, string>> = {
  energy: 'common.energy',
  oxygen: 'common.oxygen',
  food: 'common.food',
  radiation: 'common.radiation',
  science: 'common.science',
};

/** Chips «sube / baja»: qué ayuda y qué gasta un módulo, con flecha, signo y color. */
export function ModuleEffectChips({ moduleId, compact = false }: { readonly moduleId: ModuleId; readonly compact?: boolean }) {
  const { t } = useI18n();
  const effects = getModuleEffects(moduleId);
  if (effects.length === 0) return null;
  return <ul className={`effect-chips${compact ? ' effect-chips--compact' : ''}`} aria-label={t('buildFlow.effectsAria')}>
    {effects.map((effect) => {
      const up = effect.amount > 0;
      const Arrow = up ? ArrowUp : ArrowDown;
      const value = `${up ? '+' : '−'}${Math.abs(effect.amount)}${effect.percent ? '%' : ''}`;
      return <li key={`${effect.resource}-${effect.when}-${effect.amount}`} className={`effect-chip effect-chip--${effect.good ? 'good' : 'cost'}`}>
        <Arrow weight="bold" aria-hidden="true" />
        <strong>{t(RESOURCE_LABEL[effect.resource])} {value}</strong>
        <small>{t(`buildFlow.when.${effect.when}`)}</small>
      </li>;
    })}
  </ul>;
}
