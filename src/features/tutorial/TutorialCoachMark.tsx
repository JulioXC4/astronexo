import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { X } from '@phosphor-icons/react';
import { useI18n } from '../../i18n';
import { markTutorialSteps } from './tutorialStorage';
import './tutorial.css';

export type TutorialCharacter = 'ALBA' | 'CHISPA';
export type TutorialPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface TutorialStep {
  readonly id: string;
  readonly character: TutorialCharacter;
  readonly text: string;
  readonly targetSelector?: string;
  readonly placement?: TutorialPlacement;
  readonly frame?: 'dialog' | 'alert';
  readonly actionLabel?: string;
}

interface TutorialCoachMarkProps {
  readonly open: boolean;
  readonly steps: readonly TutorialStep[];
  readonly onComplete: () => void;
  readonly onSkip: () => void;
}

interface TargetBox {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

const DIALOG_WIDTH = 390;
const DIALOG_HEIGHT = 220;
const GAP = 22;
const EDGE = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function getDialogPosition(target: TargetBox | null, placement: TutorialPlacement): CSSProperties {
  if (typeof window === 'undefined') {
    return { left: '50%', top: '50%', width: DIALOG_WIDTH, transform: 'translate(-50%, -50%)' };
  }
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(DIALOG_WIDTH, viewportWidth - EDGE * 2);

  if (!target || placement === 'center') {
    return {
      left: clamp((viewportWidth - width) / 2, EDGE, viewportWidth - width - EDGE),
      top: clamp((viewportHeight - DIALOG_HEIGHT) / 2, EDGE, viewportHeight - DIALOG_HEIGHT - EDGE),
      width,
    };
  }

  const centerX = target.left + target.width / 2;
  const centerY = target.top + target.height / 2;
  let left = centerX - width / 2;
  let top = target.top - DIALOG_HEIGHT - GAP;

  if (placement === 'bottom') top = target.top + target.height + GAP;
  if (placement === 'left') {
    left = target.left - width - GAP;
    top = centerY - DIALOG_HEIGHT / 2;
  }
  if (placement === 'right') {
    left = target.left + target.width + GAP;
    top = centerY - DIALOG_HEIGHT / 2;
  }

  if (placement === 'top' && top < EDGE) top = target.top + target.height + GAP;
  if (placement === 'bottom' && top + DIALOG_HEIGHT > viewportHeight - EDGE) top = target.top - DIALOG_HEIGHT - GAP;
  if (placement === 'left' && left < EDGE) left = target.left + target.width + GAP;
  if (placement === 'right' && left + width > viewportWidth - EDGE) left = target.left - width - GAP;

  return {
    left: clamp(left, EDGE, viewportWidth - width - EDGE),
    top: clamp(top, EDGE, viewportHeight - DIALOG_HEIGHT - EDGE),
    width,
  };
}

export function TutorialCoachMark({ open, steps, onComplete, onSkip }: TutorialCoachMarkProps) {
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [target, setTarget] = useState<TargetBox | null>(null);
  const primaryButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const step = steps[stepIndex];
  const stepIds = useMemo(() => steps.map(({ id }) => id), [steps]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setStepIndex(0);
    requestAnimationFrame(() => primaryButton.current?.focus());
    return () => previousFocus.current?.focus();
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step) return;
    let observed: Element | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const update = () => {
      observed = step.targetSelector ? document.querySelector(step.targetSelector) : null;
      if (!observed) {
        setTarget(null);
        return;
      }
      const rect = observed.getBoundingClientRect();
      setTarget({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    };

    update();
    if (observed && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(observed);
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, step]);

  if (!open || !step) return null;

  const isLast = stepIndex === steps.length - 1;
  const placement = step.placement ?? (target ? 'bottom' : 'center');
  const dialogStyle = getDialogPosition(target, placement);

  function finish(skipped: boolean) {
    markTutorialSteps(stepIds);
    if (skipped) onSkip();
    else onComplete();
  }

  function next() {
    if (isLast) {
      finish(false);
      return;
    }
    markTutorialSteps([step.id]);
    setStepIndex((current) => current + 1);
    requestAnimationFrame(() => primaryButton.current?.focus());
  }

  return <div className="tutorial-coach" onKeyDown={(event) => {
    if (event.key === 'Escape') finish(true);
  }}>
    {target && <div
      className="tutorial-coach__target"
      aria-hidden="true"
      style={{
        top: Math.max(EDGE, target.top - 8),
        left: Math.max(EDGE, target.left - 8),
        width: target.width + 16,
        height: target.height + 16,
      }}
    />}
    <section
      className={`tutorial-coach__dialog tutorial-coach__dialog--${step.frame ?? 'dialog'}`}
      role="dialog"
      aria-modal="false"
      aria-label={t('tutorial.guideLabel')}
      style={dialogStyle}
    >
      <button className="tutorial-coach__close" type="button" aria-label={t('common.close')} onClick={() => finish(true)}>
        <X weight="bold" aria-hidden="true" />
      </button>
      <img
        className="tutorial-coach__portrait"
        src={step.character === 'ALBA' ? '/assets/pixel-art/cadet-alba.png' : '/assets/characters/chispa.png'}
        alt={t(`tutorial.characters.${step.character.toLowerCase()}`)}
      />
      <div className="tutorial-coach__copy">
        <strong>{t(`tutorial.characters.${step.character.toLowerCase()}`)}</strong>
        <p>{step.text}</p>
        <span>{t('common.stepOf', { current: stepIndex + 1, total: steps.length })}</span>
      </div>
      <footer className="tutorial-coach__actions">
        <button type="button" className="tutorial-coach__skip" onClick={() => finish(true)}>{t('tutorial.skip')}</button>
        <button ref={primaryButton} type="button" className="tutorial-coach__next" onClick={next}>
          <span>{step.actionLabel ?? t(isLast ? 'tutorial.understood' : 'tutorial.next')}</span>
          <img src="/assets/space/ui/arrow-next.png" alt="" aria-hidden="true" />
        </button>
      </footer>
    </section>
  </div>;
}

interface TutorialHelpButtonProps {
  readonly onClick: () => void;
  readonly className?: string;
}

export function TutorialHelpButton({ onClick, className = '' }: TutorialHelpButtonProps) {
  const { t } = useI18n();
  return <button type="button" className={`tutorial-help-button ${className}`} onClick={onClick}>
    <span aria-hidden="true">?</span>
    {t('tutorial.help')}
  </button>;
}

