import '../base-builder/build-flow.css';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp } from '@phosphor-icons/react';
import { hudAssets } from '../../assets/manifest';
import { resourceLevel } from '../../game';
import { useI18n } from '../../i18n';

interface ResourceBarProps {
  readonly label: string;
  readonly value: number;
  readonly tone: 'energy' | 'oxygen' | 'shield' | 'food' | 'science';
  /** Meta a alcanzar. Si se indica, la barra se mide contra ella y no contra 100. */
  readonly target?: number;
}

/** Tiempo que se queda a la vista el aviso «+N / −N» tras el último cambio de la barra. */
const DELTA_VISIBLE_MS = 2600;

export function ResourceBar({ label, value, tone, target }: ResourceBarProps) {
  const { t } = useI18n();
  // Cuando la barra sube o baja se ve cuánto: un aviso verde (+N) o rojo (−N) que se desvanece.
  const previous = useRef(value);
  const [change, setChange] = useState(0);
  useEffect(() => {
    const diff = value - previous.current;
    previous.current = value;
    if (diff === 0) return undefined;
    setChange((current) => current + diff);
    const timer = window.setTimeout(() => setChange(0), DELTA_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [value]);
  const icon = tone === 'science' ? undefined : hudAssets[tone].path;
  const max = target ?? 100;
  const percent = Math.min(100, Math.round((value / max) * 100));
  // Una meta se mide por lo logrado; un recurso, por lo que queda.
  const level = target ? (value >= target ? 'ok' : 'goal') : resourceLevel(value);
  const showsAlarm = level === 'low' || level === 'critical';

  const changeText = `${change > 0 ? '+' : '−'}${Math.abs(change)}`;
  return <div className={`resource-bar resource-bar--${level}`}>
    <div className="resource-bar__label">
      <span>{icon && <img className="resource-bar__icon" src={icon} alt="" aria-hidden="true" />}{label}</span>
      <strong>{value}/{max}</strong>
    </div>
    {change !== 0 && <span
      key={`${change > 0 ? 'up' : 'down'}`}
      className={`resource-bar__delta resource-bar__delta--${change > 0 ? 'up' : 'down'}`}
      role="status"
      aria-label={t(change > 0 ? 'buildFlow.delta.up' : 'buildFlow.delta.down', { value: Math.abs(change) })}
    >
      {change > 0 ? <ArrowUp weight="bold" aria-hidden="true" /> : <ArrowDown weight="bold" aria-hidden="true" />}
      <strong aria-hidden="true">{changeText}</strong>
    </span>}
    <div
      className={`resource-bar__track resource-bar__track--${tone} resource-bar__track--${level}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <span style={{ width: `${percent}%` }} />
    </div>
    {/* El color nunca va solo: siempre lo acompaña una palabra. */}
    {showsAlarm && <small className="resource-bar__flag">
      {t(level === 'critical' ? 'missionControl.levelCritical' : 'missionControl.levelLow')}
    </small>}
  </div>;
}
