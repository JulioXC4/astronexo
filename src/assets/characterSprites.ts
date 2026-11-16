/**
 * Sprites oficiales de los personajes: los MISMOS que se ven en la selección de astronauta.
 * Toda pantalla que muestre a un personaje (radio, ayudas, diálogos, introducción, informe…)
 * debe tomarlos de aquí. En `public/assets/characters/` quedan diseños anteriores de Alba,
 * Aurora y Nico (traje verde, bata blanca) que ya no deben aparecer en el juego.
 */
export type CharacterId = 'ALBA' | 'LEO' | 'AURORA' | 'NICO' | 'CHISPA';

export const CHARACTER_SPRITES: Readonly<Record<CharacterId, string>> = {
  ALBA: '/assets/pixel-art/cadet-alba.webp',
  LEO: '/assets/pixel-art/commander-leo.webp',
  AURORA: '/assets/pixel-art/officer-aurora.webp',
  NICO: '/assets/pixel-art/engineer-nico.webp',
  CHISPA: '/assets/characters/chispa.webp',
};

/** Diseños anteriores: no se usan. La prueba `character-sprites.test.ts` lo vigila. */
export const RETIRED_CHARACTER_SPRITES = [
  '/assets/characters/alba.webp',
  '/assets/characters/aurora.webp',
  '/assets/characters/nico.webp',
] as const;
