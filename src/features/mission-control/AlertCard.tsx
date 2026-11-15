import type { MissionAlert } from '../../game';

interface AlertCardProps {
  readonly alert: MissionAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return <article className="alert-card">
    <header>
      <span className="alert-card__beacon" aria-hidden="true">!</span>
      <div>
        <span className="pixel-kicker">ALERTA · NIVEL {alert.severity}</span>
        <h3>{alert.title}</h3>
      </div>
    </header>
    <p>{alert.description}</p>
    <p className="alert-card__consequence">{alert.consequencePreview}</p>
  </article>;
}
