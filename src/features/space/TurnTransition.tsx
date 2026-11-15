interface TurnTransitionProps {
  readonly label: string;
  readonly onContinue: () => void;
}

export function TurnTransition({ label, onContinue }: TurnTransitionProps) {
  return <main className="turn-transition" role="dialog" aria-modal="true" aria-label="Cambio de turno">
    <span>TRANSMISIÓN DE CONTROL</span>
    <strong>{label}</strong>
    <div className="turn-transition__line" aria-hidden="true" />
    <button className="pixel-button pixel-button--primary" autoFocus onClick={onContinue}>
      CONTINUAR
    </button>
  </main>;
}
