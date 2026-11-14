import { useState } from 'react';

interface OxygenPatchGameProps {
  readonly onReadyChange: (ready: boolean) => void;
}

export function OxygenPatchGame({ onReadyChange }: OxygenPatchGameProps) {
  const [sealed, setSealed] = useState<readonly number[]>([]);

  function seal(index: number) {
    if (sealed.includes(index)) return;
    const next = [...sealed, index];
    setSealed(next);
    if (next.length === 3) onReadyChange(true);
  }

  function sealAll() {
    setSealed([0, 1, 2]);
    onReadyChange(true);
  }

  return <div className="mini-game" aria-label="Minijuego para parchar fuga de oxígeno">
    <div className="leak-points">
      {[0, 1, 2].map((index) => <button
        type="button"
        key={index}
        aria-label={`Sellar punto de fuga ${index + 1}`}
        className={sealed.includes(index) ? 'leak-point leak-point--sealed' : 'leak-point'}
        onClick={() => seal(index)}
      >{sealed.includes(index) ? '✓' : '!'}</button>)}
    </div>
    <button type="button" className="text-button" disabled={sealed.length === 3} onClick={sealAll}>
      Alternativa accesible: sellar los tres puntos
    </button>
  </div>;
}
