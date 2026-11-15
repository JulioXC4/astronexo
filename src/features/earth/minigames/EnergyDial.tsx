import { useI18n } from '../../../i18n';

interface EnergyDialProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly color: string;
  readonly onChange: (value: number) => void;
}

export function EnergyDial({ label, value, min, max, color, onChange }: EnergyDialProps) {
  const { t } = useI18n();
  return (
    <div className="energy-dial" role="group" aria-label={label}>
      <div className="energy-dial__heading"><strong>{label}</strong><span>{value}%</span></div>
      <progress max="100" value={value} aria-label={label} style={{ accentColor: color }} />
      <div className="energy-dial__controls">
        <button type="button" disabled={value <= min} aria-label={t('gameplayV2.lower', { label })} onClick={() => onChange(Math.max(min, value - 5))}>−</button>
        <button type="button" disabled={value >= max} aria-label={t('gameplayV2.raise', { label })} onClick={() => onChange(Math.min(max, value + 5))}>+</button>
      </div>
    </div>
  );
}
