import { QUALITY_TIERS, type QualityTier } from '../game';
import { useI18n } from '../i18n';

/**
 * «Cómo quedó»: palabra + tres marcas, nunca solo color. Lo usan los
 * minijuegos de la guardia y los entrenamientos de la Tierra, para que el niño
 * lea siempre el mismo lenguaje de calidad.
 */
export function WorkQuality({ tier }: { readonly tier: QualityTier }) {
  const { t } = useI18n();
  const filled = QUALITY_TIERS.indexOf(tier);
  return <div className={`work-quality work-quality--${tier}`} role="status">
    <strong>{t('interventions.workQuality')}</strong>
    <span className="work-quality__marks" aria-hidden="true">
      {QUALITY_TIERS.map((candidate, index) => <i key={candidate} className={index <= filled ? 'is-on' : ''} />)}
    </span>
    <em>{t(`interventions.quality.${tier}`)}</em>
  </div>;
}
