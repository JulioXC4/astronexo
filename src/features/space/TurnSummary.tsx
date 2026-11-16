import { ArrowDown, ArrowRight, ArrowUp, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import type { AlertKind, MissionState, ResourceDelta } from '../../game';
import { useI18n } from '../../i18n';
import { readableChanges } from '../mission-control/resourceLabels';

interface TurnSummaryProps {
  /** Estado ya avanzado: de aquí salen los valores en los que quedó cada barra. */
  readonly state: MissionState;
  readonly completedTurn: number;
  /** Reloj del turno que acaba de terminar. */
  readonly clock: string;
  /** Cambio neto de cada barra durante el turno. */
  readonly delta: ResourceDelta | undefined;
  /** Qué hizo el niño, ya traducido. null si decidió no intervenir. */
  readonly actionLabel: string | null;
  /** Alertas que quedaron sin atender y aplicaron su consecuencia. */
  readonly ignoredAlerts: readonly AlertKind[];
  /** Texto del botón de salida («Siguiente turno» o «Ver informe»). */
  readonly continueLabel: string;
  readonly onContinue: () => void;
}

const CURRENT: Readonly<Record<string, keyof MissionState>> = {
  energy: 'energy',
  oxygen: 'oxygen',
  shield: 'shield',
  foodSupply: 'foodSupply',
  scienceProgress: 'scienceProgress',
};

/**
 * «Qué pasó»: el resumen del turno antes de pasar al siguiente.
 *
 * Antes, al cerrar el turno solo aparecía una pantalla con el nombre del día y
 * un botón: el niño nunca veía la consecuencia de lo que había decidido. Aquí
 * se ve, con números grandes, qué hizo, qué dejó pasar y cómo quedó cada barra.
 */
export function TurnSummary({
  state, completedTurn, clock, delta, actionLabel, ignoredAlerts, continueLabel, onContinue,
}: TurnSummaryProps) {
  const { t } = useI18n();
  // Solo las barras que el niño vigila; la radiación se ve en la guardia.
  const changes = readableChanges(delta).filter((change) => change.key in CURRENT);

  return <main className="turn-summary" aria-labelledby="turn-summary-title">
    <div className="turn-summary__box">
      <span className="pixel-kicker">{t('turnSummary.kicker', { turn: completedTurn })}</span>
      <h1 id="turn-summary-title">{t('turnSummary.title', { clock })}</h1>

      <div className="turn-summary__facts">
        <p className="turn-summary__fact turn-summary__fact--did">
          <CheckCircle weight="fill" aria-hidden="true" />
          <span>
            <strong>{t('turnSummary.whatYouDid')}</strong>
            {actionLabel ?? t('turnSummary.nothing')}
          </span>
        </p>
        {ignoredAlerts.length > 0 && <p className="turn-summary__fact turn-summary__fact--left">
          <WarningCircle weight="fill" aria-hidden="true" />
          <span>
            <strong>{t('turnSummary.whatYouLeft')}</strong>
            {ignoredAlerts.map((kind) => t(`alerts.${kind}.title`)).join(' · ')}
          </span>
        </p>}
      </div>

      <h2>{t('turnSummary.barsTitle')}</h2>
      {changes.length === 0
        ? <p className="turn-summary__steady">{t('turnSummary.noChange')}</p>
        : <ul className="turn-summary__bars">
          {changes.map((change) => {
            const up = change.value > 0;
            return <li key={change.key} className={up ? 'is-up' : 'is-down'}>
              <span className="turn-summary__name">{t(change.labelKey)}</span>
              <strong className="turn-summary__delta">
                {up ? <ArrowUp weight="bold" aria-hidden="true" /> : <ArrowDown weight="bold" aria-hidden="true" />}
                {Math.abs(change.value)}
              </strong>
              <span className="turn-summary__now">
                {t('turnSummary.nowAt', { value: state[CURRENT[change.key]] as number })}
              </span>
            </li>;
          })}
        </ul>}

      <button type="button" className="turn-summary__next" autoFocus onClick={onContinue}>
        <span>{continueLabel}</span>
        <ArrowRight weight="bold" aria-hidden="true" />
      </button>
    </div>
  </main>;
}
