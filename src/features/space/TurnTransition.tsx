import { useEffect, useRef } from 'react';
import { useI18n } from '../../i18n';
import { playSound } from '../audio';

interface TurnTransitionProps {
  readonly label: string;
  readonly onContinue: () => void;
}

/** Lo que dura el cartel del nuevo día antes de seguir solo. */
export const TURN_TRANSITION_MS = 2200;

/**
 * Cartel breve «Día lunar 4» entre turnos. Sigue solo: antes pedía otro clic justo después del
 * resumen del turno (dos pantallas y dos clics para pasar de turno). El botón queda para quien
 * quiera seguir antes.
 */
export function TurnTransition({ label, onContinue }: TurnTransitionProps) {
  const { t } = useI18n();
  const done = useRef(false);
  const continueOnce = useRef(onContinue);
  continueOnce.current = () => {
    if (done.current) return;
    done.current = true;
    onContinue();
  };
  // Cambio de día / de pantalla: un solo «whoosh» al entrar.
  useEffect(() => { playSound('screenWhoosh'); }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => continueOnce.current(), TURN_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return <main className="turn-transition" aria-live="polite" aria-label={t('spaceGame.transitionAria')}>
    <span>{t('spaceGame.transitionKicker')}</span>
    <strong>{label}</strong>
    <div className="turn-transition__line" aria-hidden="true" />
    <button className="pixel-button turn-transition__skip" autoFocus onClick={() => continueOnce.current()}>
      {t('common.continue')}
    </button>
  </main>;
}
