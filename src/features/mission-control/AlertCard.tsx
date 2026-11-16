import { ArrowDown, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import type { MissionAlert } from '../../game';
import { projectAlertConsequence } from '../../game';
import { useI18n } from '../../i18n';
import { readableChanges } from './resourceLabels';

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
  const worst = ifIgnored[0];

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
        {/* Aunque la tarjeta esté cerrada, el peligro se ve de un vistazo. */}
        {worst && <span className="alert-card__peek">
          <ArrowDown weight="bold" aria-hidden="true" />
          {Math.abs(worst.value)} {t(worst.labelKey)}
        </span>}
      </div>
    </header>

    {selected && <div className="alert-card__details">
      <p>{t(`${alertKey}.description`)}</p>

      {/* Las dos caras de la decisión, con el mismo peso visual. */}
      <div className="alert-card__outcome alert-card__outcome--good">
        <strong><CheckCircle weight="fill" aria-hidden="true" />{t('alerts.ifHandled')}</strong>
        <span>{t(`${alertKey}.consequence`)}</span>
      </div>

      {ifIgnored.length > 0 && <div className="alert-card__outcome alert-card__outcome--bad">
        <strong><WarningCircle weight="fill" aria-hidden="true" />{t('alerts.ifIgnored')}</strong>
        <ul>{ifIgnored.map((change) => <li key={change.key}>
          <span>{t(change.labelKey)}</span>
          <b><ArrowDown weight="bold" aria-hidden="true" />{Math.abs(change.value)}</b>
        </li>)}</ul>
      </div>}
    </div>}
  </button>;
}
