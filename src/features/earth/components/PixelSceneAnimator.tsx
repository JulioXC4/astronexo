import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './pixel-scene-animator.css';

export interface PixelSceneFrame {
  readonly src: string;
  readonly durationMs: number;
  readonly clipPath?: string;
  readonly maskImage?: string;
  readonly transition?: 'cut' | 'blend';
}

interface PixelSceneAnimatorProps {
  readonly frames: readonly PixelSceneFrame[];
  readonly poster: string;
  readonly className?: string;
  readonly alt?: string;
  readonly paused?: boolean;
  readonly priority?: boolean;
  readonly objectPosition?: string;
  readonly transitionMs?: number;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

/**
 * Lightweight full-frame scene player for slow pixel-art ambience.
 * Frames are preloaded once; only the image source changes during playback.
 */
export function PixelSceneAnimator({
  frames,
  poster,
  className = '',
  alt = '',
  paused = false,
  priority = false,
  objectPosition = 'center center',
  transitionMs = 120,
}: PixelSceneAnimatorProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(() =>
    typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );

  useEffect(() => {
    const sources = [...new Set([poster, ...frames.map(({ src }) => src)])];
    const preloaders = sources.map((src) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      return image;
    });
    return () => preloaders.forEach((image) => { image.src = ''; });
  }, [frames, poster]);

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0.01,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || paused || !isVisible || !documentVisible || frames.length < 2) return;
    const currentFrame = frames[frameIndex] ?? frames[0];
    const timer = window.setTimeout(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, Math.max(120, currentFrame.durationMs));
    return () => window.clearTimeout(timer);
  }, [documentVisible, frameIndex, frames, isVisible, paused, reducedMotion]);

  useEffect(() => {
    if (frameIndex >= frames.length) setFrameIndex(0);
  }, [frameIndex, frames.length]);

  const baseSource = frames[0]?.src ?? poster;
  const currentFrame = frames[frameIndex] ?? frames[0];
  const hasOverlay = Boolean(
    currentFrame && currentFrame.src !== baseSource && (currentFrame.clipPath || currentFrame.maskImage),
  );

  return (
    <div
      ref={containerRef}
      className={`pixel-scene ${className}`.trim()}
      style={{ '--pixel-scene-transition': `${transitionMs}ms` } as CSSProperties}
      aria-hidden={alt ? undefined : 'true'}
    >
      <img
        className="pixel-scene__poster"
        src={poster}
        alt={alt}
        draggable={false}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        style={{ objectPosition }}
      />
      {!reducedMotion && (
        <img
          className="pixel-scene__base"
          src={baseSource}
          alt=""
          draggable={false}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          style={{ objectPosition }}
        />
      )}
      {!reducedMotion && hasOverlay && currentFrame && (
        <img
          key={`${frameIndex}-${currentFrame.src}`}
          className={`pixel-scene__overlay pixel-scene__overlay--${currentFrame.transition ?? 'cut'}`}
          src={currentFrame.src}
          alt=""
          draggable={false}
          decoding="async"
          loading="eager"
          style={{
            objectPosition,
            clipPath: currentFrame.clipPath,
            maskImage: currentFrame.maskImage,
            WebkitMaskImage: currentFrame.maskImage,
            animationDuration: `${currentFrame.durationMs}ms`,
          }}
        />
      )}
    </div>
  );
}
