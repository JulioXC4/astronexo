import type { MissionAlert } from '../../game';
import { useI18n } from '../../i18n';

interface AlertCardProps {
  readonly alert: MissionAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const { t } = useI18n();
  const alertKey = `alerts.${alert.kind}`;
  return <article className="alert-card">
    <header>
      <span className="alert-card__beacon" aria-hidden="true">!</span>
      <div>
        <span className="pixel-kicker">{t('alerts.level', { level: alert.severity })}</span>
        <h3>{t(`${alertKey}.title`)}</h3>
      </div>
    </header>
    <p>{t(`${alertKey}.description`)}</p>
    <p className="alert-card__consequence">{t(`${alertKey}.consequence`)}</p>
  </article>;
}
