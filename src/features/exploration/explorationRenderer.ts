import type { Destination } from '../../game';
import { PIECE_OFFSETS, PLACES, WORLD } from './explorationData';
import { placeInReach, type Expedition } from './explorationEngine';
import type { Terrain } from './terrain';
import { BACKGROUND_CROPS, isReady, type SpriteSet } from './explorationAssets';

/**
 * Dibujo de la salida. Está separado de las reglas a propósito (pedido de JD):
 * usa los sprites PNG de `public/assets/exploration/` cuando ya cargaron y, si
 * alguno falta, cae a las figuras simples de siempre. Solo cambia la
 * representación: posiciones, colisiones y reglas salen de `explorationData.ts`,
 * `terrain.ts` y `explorationEngine.ts`.
 */
interface Palette {
  readonly ground: string;
  readonly dots: string;
  readonly craterFill: string;
  readonly craterRim: string;
  readonly rock: string;
  readonly rockLight: string;
  readonly soft: string;
  readonly border: string;
}

const PALETTES: Readonly<Record<Destination, Palette>> = {
  MOON: {
    ground: '#454650', dots: '#52535d', craterFill: '#2b2b32', craterRim: '#6a6b76',
    rock: '#74747e', rockLight: '#9a9aa6', soft: 'rgba(130, 100, 70, .38)', border: '#23232a',
  },
  MARS: {
    ground: '#7a4a35', dots: '#8b573f', craterFill: '#4a2a1d', craterRim: '#b3704e',
    rock: '#8e5a42', rockLight: '#b9805e', soft: 'rgba(214, 150, 90, .34)', border: '#3a2018',
  },
};

export interface DrawLabels {
  readonly base: string;
  /** Texto del rótulo de lo que está al alcance: «Espacio: recoger …». */
  readonly hint: (placeIndex: number, type: 's' | 'm' | 'r' | 'e') => string;
}

export interface Camera {
  readonly x: number;
  readonly y: number;
}

export function cameraFor(e: Pick<Expedition, 'px' | 'py'>, width: number, height: number): Camera {
  return {
    x: Math.max(0, Math.min(WORLD.width - width, e.px - width / 2)),
    y: Math.max(0, Math.min(WORLD.height - height, e.py - height / 2)),
  };
}

/** ¿La base se ve en pantalla? Si no, se dibuja la flecha del borde. */
export function isBaseVisible(camera: Camera, width: number, height: number): boolean {
  const bx = WORLD.base.x - camera.x;
  const by = WORLD.base.y - camera.y;
  return bx > -60 && bx < width + 60 && by > -45 && by < height + 45;
}

/** Cómo se ve al jugador (solo estética; no interviene en el movimiento). */
export interface PlayerView {
  readonly facing: 'left' | 'right';
  readonly dir: 'up' | 'down' | 'side';
  readonly moving: boolean;
}

export const IDLE_VIEW: PlayerView = { facing: 'right', dir: 'down', moving: false };

/** Dibuja un sprite centrado en (x, y) con su lado mayor igual a `size`, sin deformarlo. */
function sprite(
  g: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number,
  opts: { flip?: boolean; alpha?: number; angle?: number; anchorY?: number } = {},
) {
  const scale = size / Math.max(img.naturalWidth, img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const anchor = opts.anchorY ?? 0.5;
  g.save();
  g.translate(x, y);
  if (opts.angle) g.rotate(opts.angle);
  if (opts.flip) g.scale(-1, 1);
  if (opts.alpha !== undefined) g.globalAlpha = opts.alpha;
  g.drawImage(img, -w / 2, -h * anchor, w, h);
  g.restore();
}

/** Detalles sueltos del suelo, elegidos de la decoración existente (determinista). */
interface Detail {
  readonly x: number;
  readonly y: number;
  readonly kind: 'pebbles' | 'particles' | 'tracks';
  readonly size: number;
  readonly angle: number;
}

const DETAILS = new WeakMap<Terrain, readonly Detail[]>();
const DETAIL_KINDS: readonly Detail['kind'][] = ['pebbles', 'particles', 'tracks', 'particles', 'pebbles'];

function detailsFor(terrain: Terrain): readonly Detail[] {
  let list = DETAILS.get(terrain);
  if (list) return list;
  const out: Detail[] = [];
  terrain.decoration.forEach(([x, y, r], i) => {
    if (i % 34 !== 0) return;
    if (Math.hypot(x - WORLD.base.x, y - WORLD.base.y) < 220) return;
    if (PLACES.some((p) => Math.hypot(x - p.x, y - p.y) < 90)) return;
    if (terrain.solid.some(([cx, cy, cr]) => Math.hypot(x - cx, y - cy) < cr + 36)) return;
    const kind = DETAIL_KINDS[out.length % DETAIL_KINDS.length];
    out.push({ x, y, kind, size: kind === 'tracks' ? 46 : 28 + r * 4, angle: (i % 7) * 0.9 - 2.5 });
  });
  list = out;
  DETAILS.set(terrain, list);
  return list;
}

function circle(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
}

function shadow(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, alpha = 0.3) {
  g.fillStyle = `rgba(6, 8, 20, ${alpha})`;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function drawRover(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  parked: boolean,
  sprites: SpriteSet | null,
  flip: boolean,
) {
  const img = sprites?.rover;
  if (isReady(img)) {
    // Las ruedas apoyan en (x, y + 16); el sprite mira a la izquierda de fábrica.
    shadow(g, x, y + 14, 36, 9);
    sprite(g, img, x, y + 16, 88, { flip, alpha: parked ? 0.82 : 1, anchorY: 1 });
    return;
  }
  g.fillStyle = parked ? '#777b84' : '#e8b04a';
  g.fillRect(x - 20, y - 11, 40, 22);
  g.fillStyle = '#1d1f26';
  g.fillRect(x - 18, y - 15, 10, 6);
  g.fillRect(x + 8, y - 15, 10, 6);
  g.fillRect(x - 18, y + 9, 10, 6);
  g.fillRect(x + 8, y + 9, 10, 6);
  g.fillStyle = '#9ad';
  g.fillRect(x + 4, y - 7, 10, 14);
}

/** Rótulo centrado en (x, y) sobre una pastilla oscura para que se lea sobre cualquier fondo. */
function label(g: CanvasRenderingContext2D, text: string, x: number, y: number) {
  g.font = 'bold 14px sans-serif';
  const w = g.measureText(text).width;
  g.fillStyle = 'rgba(0,0,0,.7)';
  g.fillRect(x - w / 2 - 6, y - 14, w + 12, 20);
  g.fillStyle = '#fff';
  g.fillText(text, x - w / 2, y);
}

function drawBase(g: CanvasRenderingContext2D, text: string, sprites: SpriteSet | null) {
  const { x, y } = WORLD.base;
  const img = sprites?.base;
  if (isReady(img)) {
    shadow(g, x + 4, y + 40, 78, 14, 0.28);
    sprite(g, img, x + 4, y + 46, 172, { anchorY: 1 });
    label(g, text, x + 4, y + 66);
    return;
  }
  g.fillStyle = '#2f5f8f';
  g.fillRect(x - 60, y - 45, 110, 90);
  g.fillStyle = '#4a86c0';
  g.fillRect(x - 60, y - 45, 110, 14);
  g.fillStyle = '#cfe4ff';
  circle(g, x - 5, y - 6, 24);
  g.fill();
  g.fillStyle = '#2f5f8f';
  circle(g, x - 5, y - 6, 16);
  g.fill();
  g.fillStyle = '#fff';
  g.font = 'bold 14px sans-serif';
  g.fillText(text, x - 22, y + 36);
}

function drawPlace(
  g: CanvasRenderingContext2D,
  place: (typeof PLACES)[number],
  remaining: number,
  time: number,
  sprites: SpriteSet | null,
) {
  const { x, y, type } = place;
  const done = remaining <= 0;
  const m = sprites?.markers;

  if (type === 's') {
    if (done) {
      g.fillStyle = '#2d8a4d';
      circle(g, x, y, 8);
      g.fill();
      return;
    }
    const img = m?.sample;
    if (isReady(img)) shadow(g, x, y + 10, 34, 12, 0.34);
    for (let k = 0; k < Math.min(remaining, 5); k++) {
      const [ox, oy] = PIECE_OFFSETS[k];
      if (isReady(img)) {
        sprite(g, img, x + ox, y + oy + 10, 30, { anchorY: 1 });
        continue;
      }
      g.fillStyle = '#e8b04a';
      g.beginPath();
      g.moveTo(x + ox, y + oy - 8);
      g.lineTo(x + ox + 7, y + oy);
      g.lineTo(x + ox, y + oy + 8);
      g.lineTo(x + ox - 7, y + oy);
      g.closePath();
      g.fill();
    }
  } else if (type === 'm') {
    const img = m?.viewpoint;
    if (isReady(img)) {
      if (!done) shadow(g, x, y + 16, 22, 8, 0.34);
      sprite(g, img, x, y + 18, 50, { anchorY: 1, alpha: done ? 0.4 : 1 });
      if (done) {
        g.fillStyle = '#2d8a4d';
        circle(g, x, y + 2, 8);
        g.fill();
      }
      return;
    }
    g.fillStyle = done ? '#2d8a4d' : '#5aa0e0';
    circle(g, x, y, 11);
    g.fill();
    g.fillStyle = '#fff';
    circle(g, x, y, 4);
    g.fill();
  } else if (type === 'r') {
    const img = m?.trace;
    if (isReady(img)) {
      if (!done) shadow(g, x, y + 16, 22, 8, 0.34);
      sprite(g, img, x, y + 18, 50, { anchorY: 1, alpha: done ? 0.4 : 1 });
      if (done) {
        g.fillStyle = '#2d8a4d';
        g.fillRect(x - 7, y - 5, 14, 14);
      }
      return;
    }
    g.fillStyle = done ? '#2d8a4d' : '#d9702f';
    g.fillRect(x - 10, y - 10, 20, 20);
  } else {
    const pulse = 0.5 + 0.5 * Math.sin(time / 300);
    if (!done) {
      g.fillStyle = `rgba(255, 215, 90, ${0.15 + 0.2 * pulse})`;
      circle(g, x, y, 34 + 6 * pulse);
      g.fill();
    }
    const img = m?.curiosity;
    if (isReady(img)) {
      sprite(g, img, x, y, 54, { alpha: done ? 0.4 : 1 });
      if (done) {
        g.fillStyle = '#2d8a4d';
        circle(g, x, y, 8);
        g.fill();
      }
    } else {
      drawRover(g, x, y, true, null, false);
    }
    if (!done) {
      g.fillStyle = '#ffd75a';
      g.font = '20px sans-serif';
      g.fillText('★', x - 8, y - 32);
    }
  }
}

/** El fondo es decorativo: se recorta en la proporción del mundo y se mueve con la cámara. */
function drawBackground(
  g: CanvasRenderingContext2D,
  img: HTMLImageElement,
  camera: Camera,
  width: number,
  height: number,
  destination: Destination,
) {
  const crop = BACKGROUND_CROPS[destination];
  const kx = (img.naturalWidth * crop.w) / WORLD.width;
  const ky = (img.naturalHeight * crop.h) / WORLD.height;
  const dw = Math.min(width, WORLD.width - camera.x);
  const dh = Math.min(height, WORLD.height - camera.y);
  if (dw <= 0 || dh <= 0) return;
  g.drawImage(
    img,
    img.naturalWidth * crop.x + camera.x * kx,
    img.naturalHeight * crop.y + camera.y * ky,
    dw * kx,
    dh * ky,
    0,
    0,
    dw,
    dh,
  );
  // Velo suave: el fondo trae detalles pintados y así resaltan más los objetos tocables.
  g.fillStyle = destination === 'MARS' ? 'rgba(24, 8, 6, .24)' : 'rgba(8, 10, 24, .14)';
  g.fillRect(0, 0, dw, dh);
}

/** Dibuja un cuadro y devuelve la cámara usada. */
export function drawExpedition(
  g: CanvasRenderingContext2D,
  width: number,
  height: number,
  e: Expedition,
  terrain: Terrain,
  destination: Destination,
  time: number,
  labels: DrawLabels,
  /** El astronauta que el niño eligió. Respaldo si no cargaron las poses nuevas. */
  player: HTMLImageElement | null = null,
  /** Sprites PNG de la salida. Sin ellos (o mientras cargan) se dibujan las figuras simples. */
  sprites: SpriteSet | null = null,
  view: PlayerView = IDLE_VIEW,
): Camera {
  const palette = PALETTES[destination];
  const camera = cameraFor(e, width, height);
  const t = sprites?.terrain;

  g.imageSmoothingEnabled = false;
  g.fillStyle = palette.ground;
  g.fillRect(0, 0, width, height);
  const bg = sprites?.background;
  const hasBackground = isReady(bg);
  if (hasBackground) drawBackground(g, bg, camera, width, height, destination);
  g.save();
  g.translate(-camera.x, -camera.y);
  g.imageSmoothingEnabled = false;

  const inView = (x: number, y: number, margin: number) =>
    x > camera.x - margin && x < camera.x + width + margin && y > camera.y - margin && y < camera.y + height + margin;

  for (const [x, y, r] of terrain.soft) {
    if (isReady(t?.soft)) {
      if (inView(x, y, r * 1.4)) sprite(g, t.soft, x, y, r * 2.3, { alpha: 0.9 });
      continue;
    }
    g.fillStyle = palette.soft;
    circle(g, x, y, r);
    g.fill();
  }

  if (hasBackground && t) {
    for (const d of detailsFor(terrain)) {
      const img = t[d.kind];
      if (isReady(img) && inView(d.x, d.y, 40)) {
        sprite(g, img, d.x, d.y, d.size, { angle: d.angle, alpha: d.kind === 'tracks' ? 0.5 : 0.85 });
      }
    }
  } else {
    g.fillStyle = palette.dots;
    for (const [x, y, r] of terrain.decoration) {
      if (x < camera.x - 5 || x > camera.x + width + 5 || y < camera.y - 5 || y > camera.y + height + 5) continue;
      circle(g, x, y, r);
      g.fill();
    }
  }

  g.strokeStyle = palette.border;
  g.lineWidth = 6;
  g.strokeRect(0, 0, WORLD.width, WORLD.height);

  for (const [x, y, r] of terrain.craters) {
    const img = r >= 46 ? t?.craterLarge : t?.craterSmall;
    if (isReady(img)) {
      if (inView(x, y, r + 20)) sprite(g, img, x, y, r * 2.08);
      continue;
    }
    g.fillStyle = palette.craterFill;
    circle(g, x, y, r);
    g.fill();
    g.strokeStyle = palette.craterRim;
    g.lineWidth = 4;
    g.stroke();
  }
  for (const [x, y, r] of terrain.rocks) {
    const img = r < 17 ? t?.rockSmall : t?.rockMedium;
    if (isReady(img)) {
      if (inView(x, y, r + 20)) {
        shadow(g, x, y + r * 0.7, r * 1.1, r * 0.4, 0.25);
        sprite(g, img, x, y, r * 2.5);
      }
      continue;
    }
    g.fillStyle = palette.rock;
    circle(g, x, y, r);
    g.fill();
    g.fillStyle = palette.rockLight;
    circle(g, x - r * 0.3, y - r * 0.3, r * 0.45);
    g.fill();
  }

  drawBase(g, labels.base, sprites);

  if (e.trail.length > 1) {
    g.strokeStyle = 'rgba(255,255,255,.28)';
    g.lineWidth = 2;
    g.beginPath();
    e.trail.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
    // Huellas o rodadas cada cierto tramo, orientadas en el sentido de la marcha.
    if (isReady(t?.tracks)) {
      for (let i = 0; i + 1 < e.trail.length; i += 7) {
        const [x, y] = e.trail[i];
        if (!inView(x, y, 30)) continue;
        const [nx, ny] = e.trail[i + 1];
        sprite(g, t.tracks, x, y, 24, { angle: Math.atan2(ny - y, nx - x) + Math.PI / 2, alpha: 0.5 });
      }
    }
  }

  for (const place of PLACES) drawPlace(g, place, e.remaining[place.index], time, sprites);

  // Aro y rótulo SOLO cuando hay algo al alcance; lejos no se resalta nada.
  const reach = placeInReach(e);
  if (reach) {
    const pulse = 0.5 + 0.5 * Math.sin(time / 200);
    g.strokeStyle = '#fff';
    g.lineWidth = 3;
    circle(g, reach.x, reach.y, 26 + 4 * pulse);
    g.stroke();
    const text = labels.hint(reach.index, reach.type);
    g.font = 'bold 14px sans-serif';
    const w = g.measureText(text).width;
    g.fillStyle = 'rgba(0,0,0,.78)';
    g.fillRect(reach.x - w / 2 - 8, reach.y - 62, w + 16, 24);
    g.fillStyle = '#fff';
    g.fillText(text, reach.x - w / 2, reach.y - 45);
  }

  if (e.parked) drawRover(g, e.parked.x, e.parked.y, true, sprites, false);
  const walker = sprites?.astronaut;
  let pose: HTMLImageElement | null | undefined = null;
  if (walker) {
    if (view.moving && view.dir === 'up') pose = walker.back;
    else if (view.moving && view.dir === 'side') pose = Math.floor(time / 170) % 2 === 0 ? walker.walk1 : walker.walk2;
    else pose = walker.front;
  }
  if (e.mode === 'ROVER') {
    drawRover(g, e.px, e.py, false, sprites, view.facing === 'right');
  } else if (isReady(pose)) {
    // Los pies quedan en (px, py): la posición lógica no depende del tamaño del sprite.
    const bob = view.moving ? Math.abs(Math.sin(time / 110)) * 3 : 0;
    shadow(g, e.px, e.py + 6, 16, 5, 0.32);
    sprite(g, pose, e.px, e.py + 8 - bob, 66, { anchorY: 1, flip: view.dir === 'side' && view.facing === 'left' });
  } else if (player && player.complete && player.naturalWidth > 0) {
    // El sprite es cuadrado con el personaje al centro: se dibuja de modo que los pies queden en (px, py).
    const size = 78;
    g.imageSmoothingEnabled = false;
    g.drawImage(player, e.px - size / 2, e.py - size * 0.72, size, size);
  } else {
    g.fillStyle = '#fff';
    circle(g, e.px, e.py, 9);
    g.fill();
    g.fillStyle = '#e8b04a';
    g.fillRect(e.px - 7, e.py + 7, 14, 12);
  }

  // Baliza mientras se espera el rescate.
  if (e.status === 'STUCK') {
    const pulse = 0.5 + 0.5 * Math.sin(time / 160);
    g.fillStyle = `rgba(255, 90, 70, ${0.18 + 0.22 * pulse})`;
    circle(g, e.px + 34, e.py - 30, 30 + 5 * pulse);
    g.fill();
    const beacon = sprites?.markers.beacon;
    if (isReady(beacon)) sprite(g, beacon, e.px + 34, e.py - 6, 56, { anchorY: 1 });
  }
  g.restore();

  // Flecha pegada al borde cuando la base sale de pantalla.
  if (!isBaseVisible(camera, width, height)) {
    const bx = WORLD.base.x - camera.x;
    const by = WORLD.base.y - camera.y;
    const angle = Math.atan2(by - height / 2, bx - width / 2);
    const x = Math.max(40, Math.min(width - 40, width / 2 + Math.cos(angle) * width));
    const y = Math.max(70, Math.min(height - 110, height / 2 + Math.sin(angle) * height));
    const arrow = sprites?.markers.returnArrow;
    if (isReady(arrow)) {
      // El sprite apunta a la derecha con la base al final: se espeja si la base queda a la izquierda.
      const side = Math.cos(angle) >= 0 ? 1 : -1;
      const w = 72;
      const h = (w * arrow.naturalHeight) / arrow.naturalWidth;
      g.save();
      g.translate(x, y);
      g.scale(side, 1);
      g.rotate(Math.atan2(Math.sin(angle), Math.abs(Math.cos(angle))));
      g.drawImage(arrow, -w / 2, -h / 2, w, h);
      g.restore();
      label(g, labels.base, x, y - h / 2 - 6);
    } else {
      g.save();
      g.translate(x, y);
      g.rotate(angle);
      g.fillStyle = '#3a8ad0';
      g.beginPath();
      g.moveTo(16, 0);
      g.lineTo(-10, -11);
      g.lineTo(-10, 11);
      g.closePath();
      g.fill();
      g.restore();
      g.fillStyle = '#fff';
      g.font = 'bold 13px sans-serif';
      g.fillText(labels.base, x - 16, y - 18);
    }
  }
  return camera;
}
