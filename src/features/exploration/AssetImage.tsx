import { useState, type ReactNode } from 'react';

interface AssetImageProps {
  readonly src: string | null | undefined;
  readonly className?: string;
  /** Texto alternativo; vacío (decorativa) por defecto porque el texto ya está al lado. */
  readonly alt?: string;
  /** Lo que se muestra si el PNG no existe o falla al cargar (el placeholder de antes). */
  readonly fallback?: ReactNode;
}

/** `<img>` de sprite pixel art con respaldo: nunca deja una imagen rota a la vista. */
export function AssetImage({ src, className, alt = '', fallback = null }: AssetImageProps) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <>{fallback}</>;
  return <img
    src={src}
    alt={alt}
    className={className}
    draggable={false}
    loading="lazy"
    decoding="async"
    onError={() => setFailed(src)}
  />;
}
