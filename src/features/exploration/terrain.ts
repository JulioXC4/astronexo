import { PLACES, WORLD } from './explorationData';

/** Círculo del mundo: [x, y, radio]. */
export type Disc = readonly [number, number, number];

export interface Terrain {
  readonly craters: readonly Disc[];
  readonly rocks: readonly Disc[];
  readonly soft: readonly Disc[];
  /** Puntitos de decoración del suelo. No se tocan. */
  readonly decoration: readonly Disc[];
  /** Lo que bloquea el paso: cráteres y rocas. */
  readonly solid: readonly Disc[];
}

/** Generador de azar de JD: a = (a·16807) mod 2147483647. Determinista. */
export function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a * 16807) % 2147483647;
    return a / 2147483647;
  };
}

const { width: W, height: H, base } = WORLD;
const BX = base.x;
const BY = base.y;
const near = (x: number, y: number, ox: number, oy: number) => Math.hypot(x - ox, y - oy);

function craters(): Disc[] {
  const rn = seededRandom(7);
  const out: Disc[] = [];
  let tries = 0;
  while (out.length < 26 && tries++ < 900) {
    const x = 100 + rn() * (W - 200);
    const y = 60 + rn() * (H - 120);
    const r = 28 + rn() * 36;
    if (near(x, y, BX, BY) < 240) continue;
    if (PLACES.some((p) => near(x, y, p.x, p.y) < r + 80)) continue;
    if (out.some((q) => near(x, y, q[0], q[1]) < r + q[2] + 30)) continue;
    out.push([x, y, r]);
  }
  return out;
}

function rocks(craterList: readonly Disc[]): Disc[] {
  const rn = seededRandom(23);
  const out: Disc[] = [];
  let tries = 0;
  while (out.length < 34 && tries++ < 900) {
    const x = 80 + rn() * (W - 160);
    const y = 50 + rn() * (H - 100);
    const r = 12 + rn() * 10;
    if (near(x, y, BX, BY) < 200) continue;
    if (PLACES.some((p) => near(x, y, p.x, p.y) < r + 70)) continue;
    if (craterList.some((q) => near(x, y, q[0], q[1]) < r + q[2] + 24)) continue;
    if (out.some((q) => near(x, y, q[0], q[1]) < r + q[2] + 30)) continue;
    out.push([x, y, r]);
  }
  return out;
}

function softPatches(craterList: readonly Disc[]): Disc[] {
  const rn = seededRandom(41);
  const out: Disc[] = [];
  let tries = 0;
  while (out.length < 9 && tries++ < 900) {
    const x = 150 + rn() * (W - 300);
    const y = 100 + rn() * (H - 200);
    const r = 70 + rn() * 50;
    if (near(x, y, BX, BY) < 300) continue;
    if (craterList.some((q) => near(x, y, q[0], q[1]) < r + q[2])) continue;
    if (out.some((q) => near(x, y, q[0], q[1]) < r + q[2])) continue;
    out.push([x, y, r]);
  }
  return out;
}

function decoration(): Disc[] {
  const rn = seededRandom(11);
  return Array.from({ length: 900 }, () => [rn() * W, rn() * H, 1 + rn() * 2.5] as const);
}

function buildTerrain(): Terrain {
  const craterList = craters();
  const rockList = rocks(craterList);
  return {
    craters: craterList,
    rocks: rockList,
    soft: softPatches(craterList),
    decoration: decoration(),
    solid: [...craterList, ...rockList],
  };
}

/** El mismo mapa siempre: la base queda libre y todos los lugares son alcanzables. */
export const TERRAIN: Terrain = buildTerrain();

export function isOnSoftTerrain(terrain: Terrain, x: number, y: number): boolean {
  return terrain.soft.some((patch) => near(x, y, patch[0], patch[1]) < patch[2]);
}

export function isBlocked(terrain: Terrain, x: number, y: number): boolean {
  return terrain.solid.some((disc) => near(x, y, disc[0], disc[1]) < disc[2] + WORLD.collisionMargin);
}
