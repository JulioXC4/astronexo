import { useState, type CSSProperties, type ReactNode } from 'react';
import { getVisualAsset, type VisualAsset } from './catalog';
import './visual-kit.css';

type AssetRef = string | VisualAsset;
function resolve(ref: AssetRef): VisualAsset {
  return typeof ref === 'string' ? getVisualAsset(ref) ?? { id: ref, label: ref, category: 'ui', path: null, sourcePage: null, pixelArt: false, fallbackColor: '#46617a' } : ref;
}

export function GameSprite({ asset, className = '', style, decorative = false }: { asset: AssetRef; className?: string; style?: CSSProperties; decorative?: boolean }) {
  const item = resolve(asset);
  const [failedPath, setFailedPath] = useState<string | null>(null);
  return <span className={`vk-sprite ${item.pixelArt ? 'vk-sprite--pixel' : ''} ${className}`} style={{ backgroundColor: item.fallbackColor, ...style }}>
    {item.path && failedPath !== item.path ? <img src={item.path} alt={decorative ? '' : item.label} onError={() => setFailedPath(item.path)} />
      : <span className="vk-sprite__fallback" aria-hidden={decorative}>{item.label}<small>Arte pendiente</small></span>}
  </span>;
}

export function AnimatedSprite({ asset, active = true, ...props }: Parameters<typeof GameSprite>[0] & { active?: boolean }) {
  return <GameSprite asset={asset} {...props} className={`vk-animated ${active ? 'vk-animated--active' : ''} ${props.className ?? ''}`} />;
}

export function GameScene({ asset, children, className = '' }: { asset: AssetRef; children?: ReactNode; className?: string }) {
  return <section className={`vk-scene ${className}`}><GameSprite asset={asset} decorative className="vk-scene__art" /><div className="vk-scene__content">{children}</div></section>;
}

export function InteractiveHotspot({ label, selected = false, disabled = false, onClick }: { label: string; selected?: boolean; disabled?: boolean; onClick?: () => void }) {
  return <button type="button" className={`vk-hotspot ${selected ? 'vk-hotspot--selected' : ''}`} disabled={disabled} aria-pressed={selected} onClick={onClick}><span aria-hidden="true" className="vk-hotspot__dot" />{label}</button>;
}

export function PixelButton({ children, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  return <button {...props} className={`vk-button vk-button--${variant} ${props.className ?? ''}`}>{children}</button>;
}

export function CharacterDialogue({ portrait, name, children }: { portrait: AssetRef; name: string; children: ReactNode }) {
  return <div className="vk-dialogue"><GameSprite asset={portrait} decorative className="vk-dialogue__portrait" /><div><strong>{name}</strong><p>{children}</p></div></div>;
}

export function PixelInventory({ items }: { items: readonly { id: string; label: string; asset?: AssetRef }[] }) {
  return <div className="vk-inventory" role="list" aria-label="Inventario">{items.map((item) => <div className="vk-inventory__slot" role="listitem" key={item.id}>{item.asset && <GameSprite asset={item.asset} decorative />}<span>{item.label}</span></div>)}</div>;
}

export function ResourceIndicator({ label, value, color = '#66c6ba' }: { label: string; value: number; color?: string }) {
  const bounded = Math.min(100, Math.max(0, value));
  return <div className="vk-resource"><div><strong>{label}</strong><span>{bounded}%</span></div><div className="vk-resource__track" role="progressbar" aria-label={label} aria-valuenow={bounded} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${bounded}%`, backgroundColor: color }} /></div></div>;
}

export function GameTooltip({ children, detail }: { children: ReactNode; detail: string }) {
  return <span className="vk-tooltip" title={detail} aria-label={detail}>{children}<span className="vk-tooltip__detail" role="tooltip">{detail}</span></span>;
}

export function SceneTransition({ children, active = true }: { children: ReactNode; active?: boolean }) {
  return <div className={`vk-transition ${active ? 'vk-transition--active' : ''}`}>{children}</div>;
}
