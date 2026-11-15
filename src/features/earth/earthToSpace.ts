import { getMissionsForCity, type MissionType } from '../../data/missions';
import { isValidPreBuildGameSetup } from '../../game';
import type { City, Destination, EarthMissionId, GameSetup, ToolId } from '../../game';

/** M1–M5 son las posiciones de las instalaciones, no IDs intercambiables entre ciudades. */
const MAP_SLOTS: readonly EarthMissionId[] = ['M1', 'M2', 'M3', 'M4', 'M5'];

export interface EarthLaunchSelection {
  readonly city: City;
  readonly destination: Destination;
  readonly avatarId: string;
  readonly fictionalName: string;
  readonly completedMissions: readonly MissionType[];
  readonly earnedTools: readonly ToolId[];
}

export function buildEarthV3Setup(selection: EarthLaunchSelection): GameSetup {
  const missions = getMissionsForCity(selection.city);
  if (selection.completedMissions.length !== 3 || new Set(selection.completedMissions).size !== 3) {
    throw new Error('Se requieren tres entrenamientos terrestres distintos.');
  }
  const trainings = selection.completedMissions.map((id) => {
    const slot = missions.findIndex((mission) => mission.id === id);
    if (slot < 0) throw new Error(`Entrenamiento no disponible en ${selection.city}: ${id}`);
    return { mission: missions[slot], slot: MAP_SLOTS[slot] };
  });
  const expectedTools = trainings.map(({ mission }) => mission.targetTool);
  const counts = (tools: readonly ToolId[]) => tools.reduce<Record<string, number>>((result, tool) => {
    result[tool] = (result[tool] ?? 0) + 1;
    return result;
  }, {});
  const expectedCounts = counts(expectedTools);
  const earnedCounts = counts(selection.earnedTools);
  if (selection.earnedTools.length !== 3
    || Object.keys(expectedCounts).length !== Object.keys(earnedCounts).length
    || Object.entries(expectedCounts).some(([tool, count]) => earnedCounts[tool] !== count)) {
    throw new Error('Las herramientas no corresponden a las misiones completadas.');
  }
  const setup: GameSetup = {
    mode: 'SOLO',
    city: selection.city,
    destination: selection.destination,
    completedEarthMissions: trainings.map(({ slot }) => slot),
    selectedTools: [expectedTools[0], expectedTools[1], expectedTools[2]],
    selectedModules: [],
    scenarioId: `EARTH_V3_${selection.city}_${selection.destination}_${trainings.map(({ slot }) => slot).join('_')}`,
    difficulty: 'ACTIVE',
    earthProfile: {
      avatarId: selection.avatarId,
      fictionalName: selection.fictionalName,
      trainings: trainings.map(({ mission }) => ({
        id: mission.id,
        name: mission.name,
        costDescription: mission.costDescription,
        effectOnSpaceMission: mission.effectOnSpaceMission,
      })),
    },
  };
  if (!isValidPreBuildGameSetup(setup)) throw new Error('La preparación terrestre no cumple el contrato espacial.');
  return setup;
}
