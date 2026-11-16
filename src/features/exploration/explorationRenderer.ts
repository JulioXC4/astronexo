import type { Destination } from '../../game';
import { PIECE_OFFSETS, PLACES, WORLD } from './explorationData';
import { placeInReach, type Expedition } from './explorationEngine';
import type { Terrain } from './terrain';

/**
 * Dibujo de la salida. Está separado de las reglas a propósito (pedido de JD):
 * hoy usa figuras simples; cuando Diseño entregue el arte, se sustituye aquí sin
 * tocar `explorationEngine.ts`. Ver `04_arte-necesario.md`.
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

function circle(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
}

function drawRover(g: CanvasRenderingContext2D, x: number, y: number, parked: boolean) {
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

function drawBase(g: CanvasRenderingContext2D, label: string) {
  const { x, y } = WORLD.base;
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
  g.fillText(label, x - 22, y + 36);
}

function drawPlace(
  g: CanvasRenderingContext2D,
  place: (typeof PLACES)[number],
  remaining: number,
  time: number,
) {
  const { x, y, type } = place;
  const done = remaining <= 0;

  if (type === 's') {
    if (done) {
      g.fillStyle = '#2d8a4d';
      circle(g, x, y, 8);
      g.fill();
      return;
    }
    for (let k = 0; k < Math.min(remaining, 5); k++) {
      const [ox, oy] = PIECE_OFFSETS[k];
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
    g.fillStyle = done ? '#2d8a4d' : '#5aa0e0';
    circle(g, x, y, 11);
    g.fill();
    g.fillStyle = '#fff';
    circle(g, x, y, 4);
    g.fill();
  } else if (type === 'r') {
    g.fillStyle = done ? '#2d8a4d' : '#d9702f';
    g.fillRect(x - 10, y - 10, 20, 20);
  } else {
    const pulse = 0.5 + 0.5 * Math.sin(time / 300);
    if (!done) {
      g.fillStyle = `rgba(255, 215, 90, ${0.15 + 0.2 * pulse})`;
      circle(g, x, y, 34 + 6 * pulse);
      g.fill();
    }
    drawRover(g, x, y, true);
    if (!done) {
      g.fillStyle = '#ffd75a';
      g.font = '20px sans-serif';
      g.fillText('★', x - 8, y - 24);
    }
  }
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
  /** El astronauta que el niño eligió. Si no cargó, se dibuja un círculo. */
  player: HTMLImageElement | null = null,
): Camera {
  const palette = PALETTES[destination];
  const camera = cameraFor(e, width, height);

  g.fillStyle = palette.ground;
  g.fillRect(0, 0, width, height);
  g.save();
  g.translate(-camera.x, -camera.y);

  for (const [x, y, r] of terrain.soft) {
    g.fillStyle = palette.soft;
    circle(g, x, y, r);
    g.fill();
  }

  g.fillStyle = palette.dots;
  for (const [x, y, r] of terrain.decoration) {
    if (x < camera.x - 5 || x > camera.x + width + 5 || y < camera.y - 5 || y > camera.y + height + 5) continue;
    circle(g, x, y, r);
    g.fill();
  }

  g.strokeStyle = palette.border;
  g.lineWidth = 6;
  g.strokeRect(0, 0, WORLD.width, WORLD.height);

  for (const [x, y, r] of terrain.craters) {
    g.fillStyle = palette.craterFill;
    circle(g, x, y, r);
    g.fill();
    g.strokeStyle = palette.craterRim;
    g.lineWidth = 4;
    g.stroke();
  }
  for (const [x, y, r] of terrain.rocks) {
    g.fillStyle = palette.rock;
    circle(g, x, y, r);
    g.fill();
    g.fillStyle = palette.rockLight;
    circle(g, x - r * 0.3, y - r * 0.3, r * 0.45);
    g.fill();
  }

  drawBase(g, labels.base);

  if (e.trail.length > 1) {
    g.strokeStyle = 'rgba(255,255,255,.28)';
    g.lineWidth = 2;
    g.beginPath();
    e.trail.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  }

  for (const place of PLACES) drawPlace(g, place, e.remaining[place.index], time);

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

  if (e.parked) drawRover(g, e.parked.x, e.parked.y, true);
  if (e.mode === 'ROVER') {
    drawRover(g, e.px, e.py, false);
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
  g.restore();

  // Flecha azul pegada al borde cuando la base sale de pantalla.
  if (!isBaseVisible(camera, width, height)) {
    const bx = WORLD.base.x - camera.x;
    const by = WORLD.base.y - camera.y;
    const angle = Math.atan2(by - height / 2, bx - width / 2);
    const x = Math.max(40, Math.min(width - 40, width / 2 + Math.cos(angle) * width));
    const y = Math.max(70, Math.min(height - 110, height / 2 + Math.sin(angle) * height));
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
  return camera;
}
