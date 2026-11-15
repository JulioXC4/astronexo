import { describe, expect, it } from 'vitest';
import {
  createMission,
  advanceTurn,
  applyAction,
  getMissionResult,
  isValidPreBuildGameSetup,
  isValidGameSetup,
} from '../../src/game';
import type { GameSetup, GameAction } from '../../src/game';
import {
  createLocalCoopConfig,
  rolesForPlayerCount,
  validateLocalCoopConfig,
  rotateActivePlayer,
  stageGroupDecision,
  confirmGroupDecision,
  showsFoodAsPrimary,
} from '../../src/features/coop-gameplay';
import { MISSION_TOOL, CITY_M5_TOOL } from '../../src/game/config/tools';

describe('P1 · Modo Estación Cooperativo Local', () => {
  it('configura grupos de 3, 4 y 5 participantes con roles educativos canónicos', () => {
    const group3 = createLocalCoopConfig('Trío Cósmico', ['Nova', 'Rayo', 'Luna']);
    expect(group3.players).toHaveLength(3);
    expect(rolesForPlayerCount(3)).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION']);
    expect(group3.players.map((p) => p.roles[0])).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION']);
    expect(validateLocalCoopConfig(group3)).toHaveLength(0);

    const group4 = createLocalCoopConfig('Cuadrante Solar', ['Nova', 'Rayo', 'Luna', 'Astro']);
    expect(group4.players).toHaveLength(4);
    expect(rolesForPlayerCount(4)).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER']);
    expect(group4.players.map((p) => p.roles[0])).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER']);
    expect(validateLocalCoopConfig(group4)).toHaveLength(0);

    const group5 = createLocalCoopConfig('Constelación Andina', ['Nova', 'Rayo', 'Luna', 'Astro', 'Brote']);
    expect(group5.players).toHaveLength(5);
    expect(rolesForPlayerCount(5)).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER', 'CROPS']);
    expect(group5.players.map((p) => p.roles[0])).toEqual(['ENERGY', 'OXYGEN', 'PROTECTION', 'COMMANDER', 'CROPS']);
    expect(validateLocalCoopConfig(group5)).toHaveLength(0);
  });

  it('rechaza configuraciones inválidas (tamaño fuera de 3-5, alias vacíos o duplicados)', () => {
    const tooFew = createLocalCoopConfig('Pocos', ['Nova', 'Rayo']);
    expect(validateLocalCoopConfig(tooFew)).toContain('El grupo debe tener entre 3 y 5 participantes.');

    const tooMany = createLocalCoopConfig('Muchos', ['1', '2', '3', '4', '5', '6']);
    expect(validateLocalCoopConfig(tooMany)).toContain('El grupo debe tener entre 3 y 5 participantes.');

    const emptyTeam = createLocalCoopConfig('   ', ['Nova', 'Rayo', 'Luna']);
    expect(validateLocalCoopConfig(emptyTeam)).toContain('El equipo necesita un nombre ficticio.');

    const duplicated = {
      ...createLocalCoopConfig('Equipo', ['Nova', 'Rayo', 'Luna']),
      players: [
        { id: 'LOCAL-1', alias: 'Nova', roles: ['ENERGY' as const] },
        { id: 'LOCAL-1', alias: 'Rayo', roles: ['OXYGEN' as const] }, // duplicated id
        { id: 'LOCAL-3', alias: 'Luna', roles: ['PROTECTION' as const] },
      ],
    };
    expect(validateLocalCoopConfig(duplicated)).toContain('Los identificadores ficticios deben ser únicos y no vacíos.');
  });

  it('establece GameSetup cooperativo con paquete terrestre canónico (M1, M4, M5)', () => {
    // Configuración para Luna desde Arequipa
    const setupArequipaMoon: GameSetup = {
      mode: 'LOCAL_COOP',
      city: 'AREQUIPA',
      destination: 'MOON',
      completedEarthMissions: ['M1', 'M4', 'M5'],
      selectedTools: [MISSION_TOOL.M1, MISSION_TOOL.M4, CITY_M5_TOOL.AREQUIPA],
      selectedModules: [],
      scenarioId: 'STATION_COOP_NASA2026',
      difficulty: 'CALM',
    };
    expect(isValidPreBuildGameSetup(setupArequipaMoon)).toBe(true);
    expect(isValidGameSetup(setupArequipaMoon)).toBe(false); // Requiere construir 3 módulos en BaseBuilder

    // Configuración para Marte desde Tromsø
    const setupTromsoMars: GameSetup = {
      mode: 'LOCAL_COOP',
      city: 'TROMSO',
      destination: 'MARS',
      completedEarthMissions: ['M1', 'M4', 'M5'],
      selectedTools: [MISSION_TOOL.M1, MISSION_TOOL.M4, CITY_M5_TOOL.TROMSO],
      selectedModules: [],
      scenarioId: 'STATION_COOP_TROMSO_MARS',
      difficulty: 'CALM',
    };
    expect(isValidPreBuildGameSetup(setupTromsoMars)).toBe(true);
    expect(setupTromsoMars.selectedTools).toEqual(['SPARE_PARTS_KIT', 'EXTRA_BATTERY', 'THERMAL_INSULATION']);
  });

  it('permite construir 3 módulos espaciales y arranca la guardia cooperativa', () => {
    const setup: GameSetup = {
      mode: 'LOCAL_COOP',
      city: 'AREQUIPA',
      destination: 'MOON',
      completedEarthMissions: ['M1', 'M4', 'M5'],
      selectedTools: ['SPARE_PARTS_KIT', 'EXTRA_BATTERY', 'WATER_RECYCLER'],
      selectedModules: ['SOLAR_STORAGE', 'GREENHOUSE', 'SCIENCE_LAB'], // Construidos por el equipo
      scenarioId: 'STATION_COOP_LOCAL',
      difficulty: 'CALM',
    };
    expect(isValidGameSetup(setup)).toBe(true);

    const mission = createMission(setup);
    expect(mission.turn).toBe(1);
    expect(mission.outcome).toBe('IN_PROGRESS');
    expect(mission.selectedModules).toEqual(['SOLAR_STORAGE', 'GREENHOUSE', 'SCIENCE_LAB']);
  });

  it('gestiona decisiones grupales con confirmación colectiva sin temporizador', () => {
    const group = createLocalCoopConfig('Equipo Orión', ['Nova', 'Rayo', 'Luna', 'Astro']);
    const setup: GameSetup = {
      mode: 'LOCAL_COOP',
      city: 'AREQUIPA',
      destination: 'MOON',
      completedEarthMissions: ['M1', 'M4', 'M5'],
      selectedTools: ['SPARE_PARTS_KIT', 'EXTRA_BATTERY', 'WATER_RECYCLER'],
      selectedModules: ['SOLAR_STORAGE', 'GREENHOUSE', 'SCIENCE_LAB'],
      scenarioId: 'STATION_COOP_LOCAL',
      difficulty: 'CALM',
    };

    let mission = createMission(setup);
    const initialEnergy = mission.energy;

    // Acción solicitada: Hacer ciencia
    const pending = stageGroupDecision(mission, group, { type: 'RUN_RESEARCH' });
    expect(pending).not.toBeNull();
    expect(pending?.requestedByPlayerId).toBe('LOCAL-1'); // Solicitada por el jugador activo (Turno 1)
    expect(mission.energy).toBe(initialEnergy); // No consume recursos antes del acuerdo

    // Confirmación colectiva
    mission = confirmGroupDecision(mission, pending!);
    expect(mission.actionTakenThisTurn).toBe(true);
    expect(mission.energy).toBeLessThan(initialEnergy);
    expect(mission.decisions).toHaveLength(1);
  });

  it('rota al participante activo exactamente en cada avance de turno', () => {
    let group = createLocalCoopConfig('Cuadrante Solar', ['Cadete 1', 'Cadete 2', 'Cadete 3', 'Cadete 4']);
    expect(group.activePlayerIndex).toBe(0);

    group = rotateActivePlayer(group);
    expect(group.activePlayerIndex).toBe(1);

    group = rotateActivePlayer(group);
    expect(group.activePlayerIndex).toBe(2);

    group = rotateActivePlayer(group);
    expect(group.activePlayerIndex).toBe(3);

    group = rotateActivePlayer(group);
    expect(group.activePlayerIndex).toBe(0); // Vuelve al inicio cíclicamente
  });

  it('completa 5 turnos cooperativos y produce informe final con puntuación colectiva', () => {
    let group = createLocalCoopConfig('Base Alfa', ['Nova', 'Rayo', 'Luna', 'Astro']);
    const setup: GameSetup = {
      mode: 'LOCAL_COOP',
      city: 'AREQUIPA',
      destination: 'MOON',
      completedEarthMissions: ['M1', 'M4', 'M5'],
      selectedTools: ['SPARE_PARTS_KIT', 'EXTRA_BATTERY', 'WATER_RECYCLER'],
      selectedModules: ['SOLAR_STORAGE', 'GREENHOUSE', 'SCIENCE_LAB'],
      scenarioId: 'STATION_COOP_FULL_MATCH',
      difficulty: 'CALM',
    };

    let state = createMission(setup);
    while (state.outcome === 'IN_PROGRESS') {
      const action: GameAction = state.scienceProgress < 40
        ? { type: 'RUN_RESEARCH' }
        : { type: 'SKIP_INTERVENTION' };

      const pending = stageGroupDecision(state, group, action);
      const confirmed = pending ? confirmGroupDecision(state, pending) : state;
      const next = advanceTurn(confirmed);

      if (next.completedTurns > state.completedTurns) {
        group = rotateActivePlayer(group);
      }
      state = next;
    }

    expect(state.completedTurns).toBe(5);
    const result = getMissionResult(state);
    expect(result).not.toBeNull();
    expect(result?.score.total).toBeGreaterThan(0);
    expect(result?.score.total).toBeLessThanOrEqual(100);
    expect(group.activePlayerIndex).toBe(5 % 4); // 1 (rotó 5 veces para 4 jugadores)
  });

  it('muestra Comida como barra principal únicamente con 5 jugadores', () => {
    const group3 = createLocalCoopConfig('Tres', ['A', 'B', 'C']);
    const group4 = createLocalCoopConfig('Cuatro', ['A', 'B', 'C', 'D']);
    const group5 = createLocalCoopConfig('Cinco', ['A', 'B', 'C', 'D', 'E']);

    expect(showsFoodAsPrimary(group3)).toBe(false);
    expect(showsFoodAsPrimary(group4)).toBe(false);
    expect(showsFoodAsPrimary(group5)).toBe(true);
  });
});