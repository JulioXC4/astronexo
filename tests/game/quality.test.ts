import { describe, expect, it } from 'vitest';
import { applyAction, createMission, qualityTier, scaleEffectByQuality } from '../../src/game';
import type { GameSetup } from '../../src/game';

// Copia local: importar mission.test volvería a ejecutar sus pruebas.
const baseSetup: GameSetup = {
  mode: 'SOLO',
  city: 'AREQUIPA',
  destination: 'MOON',
  completedEarthMissions: ['M1', 'M2', 'M3'],
  selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY'],
  selectedModules: ['SOLAR_STORAGE', 'STORM_SHELTER', 'SCIENCE_LAB'],
  scenarioId: 'H2_REPRODUCIBLE',
  difficulty: 'CALM',
};

/**
 * Antes de la Fase 1, resolver un minijuego solo des-grisaba el botón CONFIRMAR:
 * limpiar al 100 % y limpiar al 85 % daban exactamente el mismo resultado.
 * Estas pruebas fijan la regla nueva: el desempeño escala el efecto.
 */
describe('calidad del minijuego', () => {
  it('clasifica el desempeño en tres niveles y nunca castiga si no hay dato', () => {
    expect(qualityTier(1)).toBe('excellent');
    expect(qualityTier(0.8)).toBe('good');
    expect(qualityTier(0.45)).toBe('basic');
    // Sin dato se asume trabajo correcto: una intervención antigua no empeora.
    expect(qualityTier(undefined)).toBe('good');
  });

  it('escala el efecto hacia arriba o hacia abajo según cómo quedó', () => {
    const effect = { shield: 20, scienceProgress: 10 };
    expect(scaleEffectByQuality(effect, 1)).toEqual({ shield: 26, scienceProgress: 13 });
    expect(scaleEffectByQuality(effect, 0.8)).toEqual(effect);
    expect(scaleEffectByQuality(effect, 0.45)).toEqual({ shield: 14, scienceProgress: 7 });
  });

  it('un efecto pequeño nunca desaparece al escalarse hacia abajo', () => {
    expect(scaleEffectByQuality({ energy: 1 }, 0.45)).toEqual({ energy: 1 });
  });

  it('la misma intervención rinde más cuando el trabajo quedó mejor', () => {
    const start = createMission(baseSetup);
    const shelter = { type: 'REINFORCE_SHELTER', choiceId: 'REGOLITH_SHIELDING' } as const;

    const sloppy = applyAction(start, { ...shelter, quality: 0.45 });
    const perfect = applyAction(start, { ...shelter, quality: 1 });

    expect(perfect.shield).toBeGreaterThan(sloppy.shield);
  });

  it('el costo de la intervención no cambia con la calidad: solo el beneficio', () => {
    const start = createMission(baseSetup);
    const research = { type: 'RUN_RESEARCH' } as const;

    const sloppy = applyAction(start, { ...research, quality: 0.45 });
    const perfect = applyAction(start, { ...research, quality: 1 });

    expect(perfect.scienceProgress).toBeGreaterThan(sloppy.scienceProgress);
    expect(perfect.energy).toBe(sloppy.energy);
  });
});
