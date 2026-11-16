import { useEffect, useState } from 'react';
import type { EarthFlowProps, ToolId, Destination, Backpack } from '../../game/contracts';
import { DEFAULT_CITY, type CityData } from '../../data/nasa/cities';
import { DEFAULT_AVATAR, type AvatarOption } from '../../data/avatars';
import { buildVerifiedNasaDataset } from '../nasa/adapters';
import { getMissionsForCity, type MissionType, type EarthMissionDefinition } from '../../data/missions';
import { buildEarthV3Setup } from './earthToSpace';
import type { GameSetup, ModuleId, TrainingOutcome } from '../../game';
import type { LocalCoopConfig } from '../coop-gameplay/coop.types';
import { useI18n } from '../../i18n';
import { CinematicTransition, departureVideoFor, useAudioScene, warmVideo, type AudioScene } from '../audio';
import { MissionIntro, RecruitCaption, preloadIntroScene } from '../intro';

import { WelcomeScreen } from './screens/WelcomeScreen';
import { CitySelectionScreen } from './screens/CitySelectionScreen';
import { DestinationScreen } from './screens/DestinationScreen';
import { AvatarScreen } from './screens/AvatarScreen';
import { NarrativeBriefingScreen } from './screens/NarrativeBriefingScreen';
import { PreparationMapScreen } from './screens/PreparationMapScreen';
import { BaseBuilderView } from '../base-builder';
import { StationPrepScreen, ConstructionProgressScreen } from './screens/FlowNarrativeScreens';
import { SystemsMonitorScreen } from './screens/SystemsMonitorScreen';
import { SolarDetectiveGame } from './minigames/SolarDetectiveGame';
import { SolarWatchGame } from './minigames/SolarWatchGame';
import { DarkMonthsGame } from './minigames/DarkMonthsGame';
import { AltitudeAcclimatizationGame } from './minigames/AltitudeAcclimatizationGame';
import { EclssTrainingGame } from './minigames/EclssTrainingGame';
import { VeggieLabGame } from './minigames/VeggieLabGame';
import { ArcticGreenhouseGame } from './minigames/ArcticGreenhouseGame';
import { CloudsSunsGame } from './minigames/CloudsSunsGame';
import { DepartureScreen } from './screens/DepartureScreen';
import { ArrivalScreen } from './screens/ArrivalScreen';
import { LearnScreen } from './screens/LearnScreen';
import { StationModeModal } from './screens/StationModeModal';

/**
 * Orden narrativo final (Prototipo JD):
 * Inicio → video de reclutamiento → introducción (4 escenas) → destino → constructor 3/5 →
 * estación en preparación → ciudad → avatar → briefing →
 * 3/5 entrenamientos (con avance de obra) → despegue → llegada → monitoreo → guardia.
 */
export type EarthScreenState =
  | 'WELCOME'
  | 'INTRO'
  | 'DESTINATION'
  | 'BUILDER'
  | 'STATION_PREP'
  | 'CITY'
  | 'AVATAR'
  | 'BRIEFING'
  | 'MAP'
  | 'TRAINING_SOLAR'
  | 'TRAINING_DONKI'
  | 'TRAINING_DARK_MONTHS'
  | 'TRAINING_ALTITUDE'
  | 'TRAINING_ECLSS'
  | 'TRAINING_VEGGIE'
  | 'TRAINING_ARCTIC'
  | 'TRAINING_CLOUDS'
  | 'CONSTRUCTION'
  | 'LIFTOFF'
  | 'ARRIVAL'
  | 'MONITOR'
  | 'LEARN';

const TRAINING_SCREENS: Readonly<Record<MissionType, EarthScreenState>> = {
  SOLAR_DETECTIVE: 'TRAINING_SOLAR',
  SOLAR_WATCH: 'TRAINING_DONKI',
  DARK_MONTHS_RESERVE: 'TRAINING_DARK_MONTHS',
  ALTITUDE_ACCLIMATIZATION: 'TRAINING_ALTITUDE',
  ECLSS_TRAINING: 'TRAINING_ECLSS',
  VEGGIE_LAB: 'TRAINING_VEGGIE',
  ARCTIC_GREENHOUSE: 'TRAINING_ARCTIC',
  CLOUDS_SUNS: 'TRAINING_CLOUDS',
};

/** Música y ambiente de cada pantalla. Los entrenamientos no usan la música de tensión: no hay presión real de tiempo. */
function audioSceneFor(screen: EarthScreenState, destination: Destination, cityId: CityData['id']): AudioScene {
  switch (screen) {
    // La introducción continúa la música de bienvenida sin cortarla.
    case 'WELCOME':
    case 'INTRO': return { music: 'welcome' };
    case 'DESTINATION':
    case 'CITY':
    case 'AVATAR': return { music: 'selection' };
    case 'BUILDER':
    case 'STATION_PREP': return { music: 'builder' };
    case 'BRIEFING':
    case 'LEARN': return { music: 'briefing' };
    // El avance de obra entre entrenamientos es un paso breve del mapa: conserva su música.
    case 'CONSTRUCTION':
    case 'MAP':
      return cityId === 'TROMSO'
        ? { music: 'mapTromso', ambient: 'polarNight' }
        : { music: 'mapArequipa' };
    case 'TRAINING_DARK_MONTHS':
    case 'TRAINING_ARCTIC': return { music: 'training', ambient: 'polarNight' };
    case 'TRAINING_SOLAR':
    case 'TRAINING_DONKI':
    case 'TRAINING_ALTITUDE':
    case 'TRAINING_ECLSS':
    case 'TRAINING_VEGGIE':
    case 'TRAINING_CLOUDS': return { music: 'training' };
    case 'LIFTOFF': return { music: 'travel', ambient: 'cabin' };
    case 'ARRIVAL': return { music: 'travel' };
    case 'MONITOR': return { music: destination === 'MARS' ? 'baseMars' : 'baseMoon', ambient: 'cabin' };
  }
}

interface EarthFlowFullProps extends EarthFlowProps {
  /** Grupo cooperativo local que ya aceptó el recorrido completo (opcional). */
  readonly coopGroup?: LocalCoopConfig;
}

export function EarthFlow({ onReady, onStartCoop, coopGroup: initialCoopGroup }: EarthFlowFullProps) {
  const { t } = useI18n();
  const [screen, setScreen] = useState<EarthScreenState>('WELCOME');
  const [previousScreen, setPreviousScreen] = useState<EarthScreenState>('WELCOME');
  const [isStationModalOpen, setIsStationModalOpen] = useState<boolean>(false);
  const [coopGroup, setCoopGroup] = useState<LocalCoopConfig | undefined>(initialCoopGroup);

  // Estado de preparación: se conserva completo hasta iniciar la guardia.
  const [destination, setDestination] = useState<Destination>('MOON');
  const [selectedModules, setSelectedModules] = useState<readonly ModuleId[]>([]);
  const [city, setCity] = useState<CityData>(DEFAULT_CITY); // AREQUIPA o TROMSO
  const [avatar, setAvatar] = useState<AvatarOption>(DEFAULT_AVATAR);
  const [fictionalName, setFictionalName] = useState<string>('');
  const [completedMissions, setCompletedMissions] = useState<MissionType[]>([]);
  const [trainingOutcomes, setTrainingOutcomes] = useState<TrainingOutcome[]>([]);
  const [backpack, setBackpack] = useState<Backpack | null>(null);
  // Solo para la confirmación visual del mapa al volver de un entrenamiento recién completado.
  const [justCompletedMission, setJustCompletedMission] = useState<MissionType | null>(null);

  // Video de reclutamiento opcional tras «Jugar»: se monta solo mientras suena.
  const [recruitPlaying, setRecruitPlaying] = useState<boolean>(false);

  useAudioScene(audioSceneFor(screen, destination, city.id));

  // El usuario se acerca al despegue (2 de 3 entrenamientos): se avisa al navegador del video de salida.
  useEffect(() => {
    if (completedMissions.length >= 2) warmVideo(departureVideoFor(city.id));
  }, [completedMissions.length, city.id]);

  /** «Jugar ahora»: video de reclutamiento y, mientras dura, se piden de fondo las imágenes de la primera escena. */
  function startRecruitment() {
    if (recruitPlaying) return;
    preloadIntroScene(0);
    setRecruitPlaying(true);
  }

  function navigateTo(nextScreen: EarthScreenState) {
    // Mantiene la celebración al pasar por el avance de obra y la limpia
    // cuando el jugador abandona realmente el mapa para otra actividad.
    if (nextScreen !== 'MAP' && nextScreen !== 'CONSTRUCTION') setJustCompletedMission(null);
    setPreviousScreen(screen);
    setScreen(nextScreen);
  }

  // Una misión se acredita solo tras una decisión real con costo; máximo 3.
  function handleCompleteMission(outcome: TrainingOutcome) {
    const missionId = outcome.missionId as MissionType;
    if (completedMissions.length >= 3 || completedMissions.includes(missionId)) {
      navigateTo('MAP');
      return;
    }
    setJustCompletedMission(missionId);
    setTrainingOutcomes((prev) => (prev.some((item) => item.missionId === missionId) ? prev : [...prev, outcome]));
    setCompletedMissions((prev) => (prev.length >= 3 || prev.includes(missionId) ? prev : [...prev, missionId]));
    // Tras el 1.º y el 2.º entrenamiento se vuelve directo al mapa: un aviso breve allí cuenta que
    // el equipo empezó a construir el módulo. La pantalla de «Avance de obra» queda solo para el
    // final, con los tres módulos. Antes salía después de CADA entrenamiento (una pantalla más que
    // leer y cerrar entre jugada y jugada).
    navigateTo(completedMissions.length + 1 >= 3 ? 'CONSTRUCTION' : 'MAP');
  }

  // Exactamente las 3 herramientas ganadas; no se rellenan ni se regalan.
  function handleProceedToLaunch(derivedTools: readonly ToolId[]) {
    if (derivedTools.length !== 3 || trainingOutcomes.length !== 3) return;
    setBackpack([derivedTools[0], derivedTools[1], derivedTools[2]]);
    navigateTo('LIFTOFF');
  }

  function toolsFromCompleted(): readonly ToolId[] {
    const missions = getMissionsForCity(city.id);
    return completedMissions.flatMap((id) => {
      const found = missions.find((mission) => mission.id === id);
      return found ? [found.targetTool] : [];
    });
  }

  /** Construye el GameSetup completo; devuelve null si la preparación aún no es válida. */
  function buildSetup(): GameSetup | null {
    if (!backpack || completedMissions.length !== 3 || trainingOutcomes.length !== 3 || selectedModules.length !== 3) return null;
    try {
      return buildEarthV3Setup({
        mode: coopGroup ? 'LOCAL_COOP' : 'SOLO',
        city: city.id, destination, avatarId: avatar.id, fictionalName,
        completedMissions, earnedTools: backpack, selectedModules, trainingOutcomes,
      });
    } catch {
      return null;
    }
  }

  function handleLaunchMission() {
    const setup = buildSetup();
    if (!setup) {
      navigateTo('MAP');
      return;
    }
    if (coopGroup && onStartCoop) {
      onStartCoop(setup, coopGroup);
      return;
    }
    onReady({ setup, nasaData: buildVerifiedNasaDataset(city.id) });
  }

  function resetPreparationForCity(selectedCity: CityData) {
    if (selectedCity.id !== city.id) {
      setCity(selectedCity);
      setCompletedMissions([]); // otra ciudad ofrece otros entrenamientos
      setTrainingOutcomes([]);
      setBackpack(null);
    }
  }

  switch (screen) {
    // 1. Inicio: Despegue o Estación
    case 'WELCOME':
      return (
        <>
          <WelcomeScreen
            onPlay={startRecruitment}
            onOpenStation={() => setIsStationModalOpen(true)}
            onOpenLearn={() => navigateTo('LEARN')}
          />
          {recruitPlaying && <CinematicTransition
            video="recruit"
            caption={<RecruitCaption />}
            onDone={() => { setRecruitPlaying(false); navigateTo('INTRO'); }}
          />}
          <StationModeModal
            isOpen={isStationModalOpen}
            onClose={() => setIsStationModalOpen(false)}
            onLaunchDemoSolo={() => {
              setIsStationModalOpen(false);
              navigateTo('DESTINATION');
            }}
            onStartCoop={onStartCoop}
            onStartCoopFullRoute={(group) => {
              // Recorrido completo de Estación: mismo arranque que «Jugar ahora», con el grupo ya guardado.
              setCoopGroup(group);
              startRecruitment();
            }}
          />
        </>
      );

    // 1b. Introducción ilustrada: solo narrativa, no toca el estado de la misión
    case 'INTRO':
      return <MissionIntro onFinish={() => navigateTo('DESTINATION')} />;

    // 2. Luna o Marte
    case 'DESTINATION':
      return (
        <DestinationScreen
          initialDestination={destination}
          onSelectDestination={(dest) => {
            setDestination(dest);
            navigateTo('BUILDER');
          }}
          onBack={() => navigateTo('WELCOME')}
        />
      );

    // 3. Construir estación: 3 de 5 módulos (P10), antes de elegir ciudad
    case 'BUILDER':
      return (
        <BaseBuilderView
          destination={destination}
          confirmLabel={t('baseBuilder.confirmStation')}
          initialModules={selectedModules}
          onBack={() => navigateTo('DESTINATION')}
          onStart={(modules) => {
            setSelectedModules(modules);
            navigateTo('STATION_PREP');
          }}
        />
      );

    // 4. La estación se está preparando
    case 'STATION_PREP':
      return <StationPrepScreen destination={destination} selectedModules={selectedModules} onContinue={() => navigateTo('CITY')} />;

    // 5. Arequipa o Tromsø
    case 'CITY':
      return (
        <CitySelectionScreen
          initialCityId={city.id}
          onSelectCity={(selectedCity) => {
            resetPreparationForCity(selectedCity);
            navigateTo('AVATAR');
          }}
          onBack={() => navigateTo('BUILDER')}
        />
      );

    // Avatar breve, sin interrumpir el flujo
    case 'AVATAR':
      return (
        <AvatarScreen
          cityName={city.name}
          destination={destination}
          initialAvatarId={avatar.id}
          initialFictionalName={fictionalName}
          onConfirmProfile={(selectedAvatar, name) => {
            setAvatar(selectedAvatar);
            setFictionalName(name);
            navigateTo('BRIEFING');
          }}
          onBack={() => navigateTo('CITY')}
        />
      );

    case 'BRIEFING':
      return (
        <NarrativeBriefingScreen
          cityName={city.name}
          destination={destination}
          astronautName={fictionalName}
          avatarId={avatar.id}
          onProceedToMap={() => navigateTo('MAP')}
          onBack={() => navigateTo('AVATAR')}
        />
      );

    // 6. Mapa de 5 entrenamientos (elegir exactamente 3)
    case 'MAP':
      return (
        <>
          <PreparationMapScreen
            cityId={city.id}
            cityName={city.name}
            destination={destination}
            astronautName={fictionalName}
            completedMissions={completedMissions}
            trainingOutcomes={trainingOutcomes}
            justCompletedId={justCompletedMission}
            buildingModule={selectedModules[Math.max(0, completedMissions.length - 1)]}
            onOpenMission={(mission: EarthMissionDefinition) => navigateTo(TRAINING_SCREENS[mission.id])}
            onProceedToLaunch={handleProceedToLaunch}
            onBack={() => navigateTo('BRIEFING')}
          />
          <StationModeModal
            isOpen={isStationModalOpen}
            onClose={() => setIsStationModalOpen(false)}
            onLaunchDemoSolo={() => setIsStationModalOpen(false)}
            onStartCoop={onStartCoop}
          />
        </>
      );

    case 'TRAINING_SOLAR':
      return <SolarDetectiveGame onComplete={handleCompleteMission} onBack={() => navigateTo('MAP')} />;
    case 'TRAINING_DONKI':
      return <SolarWatchGame onComplete={handleCompleteMission} onBack={() => navigateTo('MAP')} />;
    case 'TRAINING_DARK_MONTHS':
      return <DarkMonthsGame onComplete={handleCompleteMission} onBack={() => navigateTo('MAP')} />;
    case 'TRAINING_ALTITUDE':
      return <AltitudeAcclimatizationGame onComplete={handleCompleteMission} onBack={() => navigateTo('MAP')} />;
    case 'TRAINING_ECLSS':
      return <EclssTrainingGame onComplete={handleCompleteMission} onBack={() => navigateTo('MAP')} />;
    case 'TRAINING_VEGGIE':
      return <VeggieLabGame onComplete={handleCompleteMission} onBack={() => navigateTo('MAP')} />;
    case 'TRAINING_ARCTIC':
      return <ArcticGreenhouseGame onComplete={handleCompleteMission} onBack={() => navigateTo('MAP')} />;
    case 'TRAINING_CLOUDS':
      return <CloudsSunsGame cityId={city.id} onComplete={handleCompleteMission} onBack={() => navigateTo('MAP')} />;

    // 7. Avance de obra tras cada entrenamiento (breve y saltable)
    case 'CONSTRUCTION':
      return (
        <ConstructionProgressScreen
          destination={destination}
          selectedModules={selectedModules}
          done={completedMissions.length}
          onContinue={() => {
            if (completedMissions.length >= 3) handleProceedToLaunch(toolsFromCompleted());
            else navigateTo('MAP');
          }}
        />
      );

    // 8. Despegue y viaje
    case 'LIFTOFF':
      if (!backpack) return null;
      return (
        <DepartureScreen
          destination={destination}
          astronautName={fictionalName}
          cityName={city.name}
          cityId={city.id}
          backpack={backpack}
          onProceedToArrival={() => navigateTo('ARRIVAL')}
        />
      );

    // 9a. Llegada
    case 'ARRIVAL':
      if (!backpack) return null;
      return (
        <ArrivalScreen
          destination={destination}
          astronautName={fictionalName}
          cityName={city.name}
          backpack={backpack}
          nasaData={buildVerifiedNasaDataset(city.id)}
          onEnterBase={() => navigateTo('MONITOR')}
        />
      );

    // 9b. Monitoreo inicial de módulos, recursos y herramientas
    case 'MONITOR': {
      const setup = buildSetup();
      if (!setup) return null;
      return <SystemsMonitorScreen setup={setup} onStart={handleLaunchMission} />;
    }

    case 'LEARN':
      return <LearnScreen onBack={() => navigateTo(previousScreen || 'WELCOME')} />;
  }
}
