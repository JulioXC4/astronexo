import './live-meter.css';

interface LiveMeterProps {
  readonly label: string;
  /** El valor ya formateado («21,1 %»). */
  readonly valueText: string;
  /** Posición del valor, de 0 a 1. */
  readonly ratio: number;
  /** Franja buena pintada en el medidor, de 0 a 1 (la «zona verde» de un instrumento real). */
  readonly band?: readonly [number, number];
  /** Marca fija, como el límite de energía de la base. */
  readonly limit?: { readonly ratio: number; readonly label: string };
  readonly tone?: 'ok' | 'warn' | 'bad' | 'neutral';
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Medidor de un instrumento: muestra qué valor tiene algo y, si lo hay, dónde
 * está su zona buena. El color nunca informa solo: lleva el valor escrito.
 */
export function LiveMeter({ label, valueText, ratio, band, limit, tone = 'neutral' }: LiveMeterProps) {
  return <div className={`live-meter live-meter--${tone}`}>
    <div className="live-meter__head"><span>{label}</span><strong>{valueText}</strong></div>
    <div
      className="live-meter__track"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamp01(ratio) * 100)}
      aria-valuetext={valueText}
    >
      {band && <i
        className="live-meter__band"
        style={{ left: `${clamp01(band[0]) * 100}%`, width: `${(clamp01(band[1]) - clamp01(band[0])) * 100}%` }}
      />}
      <span className="live-meter__fill" style={{ width: `${clamp01(ratio) * 100}%` }} />
      {limit && <b className="live-meter__limit" style={{ left: `${clamp01(limit.ratio) * 100}%` }} title={limit.label} />}
    </div>
    {limit && <small className="live-meter__limit-label">{limit.label}</small>}
  </div>;
}
