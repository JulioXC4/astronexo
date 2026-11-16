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

export function ResourceBar({ label, value, tone, target }: ResourceBarProps) {
  const { t } = useI18n();
  const icon = tone === 'science' ? undefined : hudAssets[tone].path;
  const max = target ?? 100;
  const percent = Math.min(100, Math.round((value / max) * 100));
  // Una meta se mide por lo logrado; un recurso, por lo que queda.
  const level = target ? (value >= target ? 'ok' : 'goal') : resourceLevel(value);
  const showsAlarm = level === 'low' || level === 'critical';

  return <div className={`resource-bar resource-bar--${level}`}>
    <div className="resource-bar__label">
      <span>{icon && <img className="resource-bar__icon" src={icon} alt="" aria-hidden="true" />}{label}</span>
      <strong>{value}/{max}</strong>
    </div>
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
