import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  AMBIENT_FILES, MUSIC_FILES, SFX_FILES, VIDEO_FILES, VIDEO_POSTERS,
  arrivalVideoFor, audioUrl, departureVideoFor, returnVideoFor, travelVideoFor, videoUrl,
} from '../../src/features/audio/mediaCatalog';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '../../public');
const onDisk = (url: string) => existsSync(join(publicDir, url));

describe('catálogo multimedia', () => {
  it('toda música, ambiente y efecto del catálogo existe en public/assets/audio', () => {
    const missing = [
      ...Object.values(MUSIC_FILES),
      ...Object.values(AMBIENT_FILES),
      ...Object.values(SFX_FILES).flat(),
    ].filter((relative) => !onDisk(audioUrl(relative)));
    expect(missing).toEqual([]);
  });

  it('todo video y su póster existen; solo la cortinilla de alarma es WebM (lleva alfa)', () => {
    for (const id of Object.keys(VIDEO_FILES) as (keyof typeof VIDEO_FILES)[]) {
      expect(onDisk(videoUrl(id)), id).toBe(true);
      const poster = VIDEO_POSTERS[id];
      if (poster) expect(onDisk(poster), `${id} póster`).toBe(true);
      expect(VIDEO_FILES[id].endsWith('.webm'), id).toBe(id === 'alarmWipe');
    }
  });

  it('cada ciudad y destino elige su propio video de la secuencia', () => {
    expect(departureVideoFor('AREQUIPA')).toBe('departureArequipa');
    expect(departureVideoFor('TROMSO')).toBe('departureTromso');
    expect(returnVideoFor('AREQUIPA')).toBe('returnArequipa');
    expect(returnVideoFor('TROMSO')).toBe('returnTromso');
    expect(travelVideoFor('MOON')).toBe('travelMoon');
    expect(travelVideoFor('MARS')).toBe('travelMars');
    expect(arrivalVideoFor('MOON')).toBe('arrivalMoon');
    expect(arrivalVideoFor('MARS')).toBe('arrivalMars');
  });

  it('no se usa el despegue genérico ni las pistas con numeración antigua fuera del catálogo', () => {
    expect(Object.values(VIDEO_FILES).some((file) => file.includes('cohete-animado'))).toBe(false);
  });
});
