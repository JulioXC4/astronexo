import type { MissionAlert } from '../../game';
import { projectAlertConsequence } from '../../game';
import { useI18n } from '../../i18n';
import { formatChange, readableChanges } from './resourceLabels';

interface AlertCardProps {
  readonly alert: MissionAlert;
  readonly selected?: boolean;
  readonly onSelect?: (alertId: string) => void;
}

export function AlertCard({ alert, selected = false, onSelect }: AlertCardProps) {
  const { t } = useI18n();
  const alertKey = `alerts.${alert.kind}`;
  // Lo que cuesta ignorarla, con número. Antes solo había una frase cualitativa.
  const ifIgnored = readableChanges(projectAlertConsequence(alert));

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
      {/* Las dos caras de la decisión, con el mismo peso visual. */}
      <div className="alert-card__outcome alert-card__outcome--good">
        <strong>{t('alerts.ifHandled')}</strong>
        <span>{t(`${alertKey}.consequence`)}</span>
      </div>
      {ifIgnored.length > 0 && <div className="alert-card__outcome alert-card__outcome--bad">
        <strong>{t('alerts.ifIgnored')}</strong>
        <ul>{ifIgnored.map((change) => <li key={change.key}>
          <span>{t(change.labelKey)}</span>
          <strong>{formatChange(change.value)}</strong>
        </li>)}</ul>
      </div>}
    </div>}
  </button>;
}
