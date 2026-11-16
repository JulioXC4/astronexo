import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CHARACTER_SPRITES, RETIRED_CHARACTER_SPRITES } from '../../src/assets/characterSprites';
import { RADIO_PORTRAITS } from '../../src/features/radio/radioTiming';

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'gallery' ? [] : sourceFiles(full);
    return /\.(tsx?|css)$/.test(entry.name) ? [full] : [];
  });
}

describe('Personajes: siempre los de la selección de astronauta', () => {
  it('ningún archivo del juego usa los diseños anteriores de Alba, Aurora o Nico', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(path.resolve('src'))) {
      if (file.endsWith('characterSprites.ts')) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const retired of RETIRED_CHARACTER_SPRITES) {
        const name = retired.split('/').pop()!;
        if (text.includes(retired) || new RegExp(`characters/\\$\\{[^}]+\\}/?${name}|[\`'"/]${name}`).test(text.replace(/chispa\.webp/g, ''))) {
          offenders.push(`${path.relative(process.cwd(), file)} → ${name}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('la radio y las ayudas muestran los mismos sprites que la selección', () => {
    for (const speaker of ['ALBA', 'AURORA', 'NICO', 'CHISPA'] as const) {
      expect(RADIO_PORTRAITS[speaker]).toBe(CHARACTER_SPRITES[speaker]);
    }
  });

  it('los sprites oficiales existen en public/', () => {
    for (const src of Object.values(CHARACTER_SPRITES)) {
      expect(fs.existsSync(path.resolve('public', src.replace(/^\//, ''))), src).toBe(true);
    }
  });
});
