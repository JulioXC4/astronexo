import type { MissionAlert } from '../../game';
import { useI18n } from '../../i18n';

interface AlertCardProps {
  readonly alert: MissionAlert;
  readonly selected?: boolean;
  readonly onSelect?: (alertId: string) => void;
}

export function AlertCard({ alert, selected = false, onSelect }: AlertCardProps) {
  const { t } = useI18n();
  const alertKey = `alerts.${alert.kind}`;
  return <button
    type="button"
    className={`alert-card ${selected ? 'alert-card--selected' : ''}`}
    aria-pressed={selected}
    onClick={() => onSelect?.(alert.id)}
  >
    <header>
      <span className="alert-card__beacon" aria-hidden="true">!</span>
      <div>
        <h3>{t(`${alertKey}.title`)}</h3>
        <span>{t('alerts.level', { level: alert.severity })}</span>
      </div>
    </header>
    {selected && <div className="alert-card__details">
      <p>{t(`${alertKey}.description`)}</p>
      <p className="alert-card__consequence">{t(`${alertKey}.consequence`)}</p>
    </div>}
  </button>;
}
