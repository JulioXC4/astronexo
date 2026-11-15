import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  createMission,
  isValidGameSetup,
  isValidPreBuildGameSetup,
} from '../../src/game';
import type { GameSetup } from '../../src/game';
import { SoloSpaceGame, TurnTransition } from '../../src/features/space';
import { CoopSpaceGame, COOP_DEMO_GROUPS, COOP_DEMO_SETUP } from '../../src/features/coop-gameplay';

const SOLO_SETUP: GameSetup = { ...COOP_DEMO_SETUP, mode: 'SOLO' };

describe('entradas públicas H5', () => {
  it('acepta GameSetup previo a P10 pero mantiene createMission estricto', () => {
    const preBuild = { ...SOLO_SETUP, selectedModules: [] };
    expect(isValidPreBuildGameSetup(preBuild)).toBe(true);
    expect(isValidGameSetup(preBuild)).toBe(false);
    expect(() => createMission(preBuild)).toThrow(/GameSetup inválido/);
  });

  it('SoloSpaceGame abre P10 cuando faltan módulos y P11 cuando ya existen', () => {
    const preBuildHtml = renderToStaticMarkup(createElement(SoloSpaceGame, {
      setup: { ...SOLO_SETUP, selectedModules: [] },
      onFinish: () => undefined,
    }));
    const readyHtml = renderToStaticMarkup(createElement(SoloSpaceGame, {
      setup: SOLO_SETUP,
      onFinish: () => undefined,
    }));
    expect(preBuildHtml).toContain('P10 · CONSTRUCTION HANGAR');
    expect(readyHtml).toContain('MISSION CONTROL');
    expect(readyHtml).toContain('Guard on');
  });

  it('rechaza modo o herramientas inválidas sin completar datos silenciosamente', () => {
    const invalid = {
      ...SOLO_SETUP,
      mode: 'LOCAL_COOP',
      selectedTools: ['SPARE_PARTS_KIT', 'EARLY_WARNING', 'GROW_TRAY'],
    } as GameSetup;
    const html = renderToStaticMarkup(createElement(SoloSpaceGame, {
      setup: invalid,
      onFinish: () => undefined,
    }));
    expect(html).toContain('INVALID SOLO CONFIGURATION');
    expect(html).not.toContain('MISSION CONTROL');
  });

  it('exporta entradas SOLO y LOCAL_COOP con el mismo contrato de resultado', () => {
    const solo = renderToStaticMarkup(createElement(SoloSpaceGame, {
      setup: SOLO_SETUP,
      onFinish: () => undefined,
    }));
    const coop = renderToStaticMarkup(createElement(CoopSpaceGame, {
      setup: COOP_DEMO_SETUP,
      group: COOP_DEMO_GROUPS.THREE,
      onFinish: () => undefined,
    }));
    expect(solo).toContain('MISSION CONTROL');
    expect(coop).toContain('E6 · TURNO COOPERATIVO');
  });

  it('la transición oscura anuncia el reloj y es operable con teclado', () => {
    const html = renderToStaticMarkup(createElement(TurnTransition, {
      label: '15:00 LMST',
      onContinue: () => undefined,
    }));
    expect(html).toContain('turn-transition');
    expect(html).toContain('15:00 LMST');
    expect(html).toContain('autofocus=""');
  });
});
