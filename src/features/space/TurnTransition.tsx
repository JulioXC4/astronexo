import { useI18n } from '../../i18n';

interface TurnTransitionProps {
  readonly label: string;
  readonly onContinue: () => void;
}

export function TurnTransition({ label, onContinue }: TurnTransitionProps) {
  const { t } = useI18n();
  return <main className="turn-transition" role="dialog" aria-modal="true" aria-label={t('spaceGame.transitionAria')}>
    <span>{t('spaceGame.transitionKicker')}</span>
    <strong>{label}</strong>
    <div className="turn-transition__line" aria-hidden="true" />
    <button className="pixel-button pixel-button--primary" autoFocus onClick={onContinue}>
      {t('common.continue')}
    </button>
  </main>;
}
