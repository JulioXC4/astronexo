import { arequipaScene, tromsoScene } from './pixelScenes';

let started = false;

/**
 * Pide de fondo las escenas de las ciudades (~1,5 MB). Se llama al pulsar «Jugar ahora»: el
 * video de reclutamiento y la introducción dan tiempo de sobra antes de la pantalla de ciudad.
 * Antes se pedían en la portada, antes de que el niño tocara nada, y la hacían más lenta.
 */
export function preloadCityScenes() {
  if (started || typeof Image === 'undefined') return;
  started = true;
  for (const src of [arequipaScene.poster, arequipaScene.frames[0].src, tromsoScene.poster, tromsoScene.frames[0].src]) {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  }
}
