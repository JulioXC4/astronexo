import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import './gauge-dial.css';

export interface DialZone {
  readonly from: number;
  readonly to: number;
  readonly tone: 'ok' | 'warn' | 'bad';
}

interface GaugeDialProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly onChange: (value: number) => void;
  /** Franjas de color pintadas en el arco (la verde es la zona buena). */
  readonly zones?: readonly DialZone[];
  /** El valor ya formateado («76 kPa»). */
  readonly display: string;
  readonly lowLabel?: string;
  readonly highLabel?: string;
  readonly disabled?: boolean;
}

/** El arco empieza abajo a la izquierda y da 270° hacia la derecha. */
const START = 135;
const SWEEP = 270;
const CENTER = 100;
const RADIUS = 76;

function polar(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function arc(from: number, to: number, radius: number) {
  const a = polar(from, radius);
  const b = polar(to, radius);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/** Lleva un valor al ángulo de la aguja. */
export function valueToAngle(value: number, min: number, max: number): number {
  const ratio = max === min ? 0 : (value - min) / (max - min);
  return START + Math.max(0, Math.min(1, ratio)) * SWEEP;
}

/** Y al revés: de un punto del círculo al valor. La zona muerta de abajo se pega al extremo más cercano. */
export function pointToValue(dx: number, dy: number, min: number, max: number, step: number): number {
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const normalized = (deg + 360) % 360;
  let along = (normalized - START + 360) % 360;
  if (along > SWEEP) along = along < SWEEP + (360 - SWEEP) / 2 ? SWEEP : 0;
  const raw = min + (along / SWEEP) * (max - min);
  const snapped = Math.round(raw / step) * step;
  return Math.max(min, Math.min(max, snapped));
}

/**
 * Perilla que se gira arrastrando (mouse o dedo). También se maneja con las
 * flechas del teclado, así que sirve como control accesible.
 */
export function GaugeDial({
  label, value, min, max, step = 1, onChange, zones = [], display, lowLabel, highLabel, disabled = false,
}: GaugeDialProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  const update = (event: PointerEvent<SVGSVGElement>) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    onChange(pointToValue(
      event.clientX - (box.left + box.width / 2),
      event.clientY - (box.top + box.height / 2),
      min, max, step,
    ));
  };

  const onKey = (event: KeyboardEvent<SVGSVGElement>) => {
    if (disabled) return;
    const big = step * 5;
    const delta: Record<string, number> = {
      ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big,
    };
    if (event.key === 'Home') { event.preventDefault(); onChange(min); return; }
    if (event.key === 'End') { event.preventDefault(); onChange(max); return; }
    if (event.key in delta) {
      event.preventDefault();
      onChange(Math.max(min, Math.min(max, value + delta[event.key])));
    }
  };

  const needle = polar(valueToAngle(value, min, max), RADIUS - 14);
  const toAngle = (v: number) => valueToAngle(v, min, max);

  return <div className={`gauge-dial ${disabled ? 'is-disabled' : ''}`}>
    <svg
      ref={svgRef}
      viewBox="0 0 200 200"
      className="gauge-dial__svg"
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={display}
      aria-disabled={disabled}
      onKeyDown={onKey}
      onPointerDown={(event) => {
        if (disabled) return;
        dragging.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event);
      }}
      onPointerMove={(event) => { if (dragging.current) update(event); }}
      onPointerUp={(event) => {
        dragging.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      <circle cx={CENTER} cy={CENTER} r={92} className="gauge-dial__face" />
      <path d={arc(START, START + SWEEP, RADIUS)} className="gauge-dial__track" />
      {zones.map((zone) => (
        <path
          key={`${zone.from}-${zone.to}`}
          d={arc(toAngle(zone.from), toAngle(zone.to), RADIUS)}
          className={`gauge-dial__zone gauge-dial__zone--${zone.tone}`}
        />
      ))}
      {/* Marcas cada 10 % del recorrido */}
      {Array.from({ length: 11 }, (_, i) => {
        const angle = START + (i / 10) * SWEEP;
        const a = polar(angle, RADIUS + 8);
        const b = polar(angle, RADIUS + 14);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="gauge-dial__tick" />;
      })}
      <line x1={CENTER} y1={CENTER} x2={needle.x} y2={needle.y} className="gauge-dial__needle" />
      <circle cx={CENTER} cy={CENTER} r={11} className="gauge-dial__hub" />
    </svg>
    <div className="gauge-dial__readout">
      <strong>{display}</strong>
      <span>{label}</span>
    </div>
    {(lowLabel || highLabel) && <div className="gauge-dial__ends" aria-hidden="true">
      <small>{lowLabel}</small><small>{highLabel}</small>
    </div>}
  </div>;
}
