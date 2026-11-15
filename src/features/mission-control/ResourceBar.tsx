interface ResourceBarProps {
  readonly label: string;
  readonly value: number;
  readonly tone: 'energy' | 'oxygen' | 'shield' | 'food';
}

export function ResourceBar({ label, value, tone }: ResourceBarProps) {
  return <div className="resource-bar">
    <div className="resource-bar__label">
      <span>{label}</span>
      <strong>{value}/100</strong>
    </div>
    <div
      className={`resource-bar__track resource-bar__track--${tone}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  </div>;
}
