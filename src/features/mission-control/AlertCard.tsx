import type { MissionAlert } from '../../game';
import { useI18n } from '../../i18n';

interface AlertCardProps {
  readonly alert: MissionAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const { t } = useI18n();
  const eventCopy = `events.${alert.kind}`;
  return <article className="alert-card">
    <header>
      <span className="alert-card__beacon" aria-hidden="true">!</span>
      <div>
        <span className="pixel-kicker">{t('missionControl.alertLevel', { level: alert.severity })}</span>
        <h3>{t(`${eventCopy}.title`)}</h3>
      </div>
    </header>
    <p>{t(`${eventCopy}.description`)}</p>
    <p className="alert-card__consequence">{t(`${eventCopy}.consequence`)}</p>
  </article>;
}
