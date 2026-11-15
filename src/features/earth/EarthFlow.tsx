import { useState } from 'react';
import type { EarthFlowProps, ToolId, Destination, Backpack } from '../../game/contracts';
import { DEFAULT_CITY, type CityData } from '../../data/nasa/cities';
import { DEFAULT_AVATAR, SUGGESTED_CALLSIGNS, type AvatarOption } from '../../data/avatars';
import { buildVerifiedNasaDataset } from '../nasa/adapters';
import type { MissionType, EarthMissionDefinition } from '../../data/missions';

import { WelcomeScreen } from './screens/WelcomeScreen';
import { CitySelectionScreen } from './screens/CitySelectionScreen';
import { DestinationScreen } from './screens/DestinationScreen';
import { AvatarScreen } from './screens/AvatarScreen';
import { NarrativeBriefingScreen } from './screens/NarrativeBriefingScreen';
import { PreparationMapScreen } from './screens/PreparationMapScreen';
import { SolarDetectiveGame } from './minigames/SolarDetectiveGame';
import { SolarWatchGame } from './minigames/SolarWatchGame';
import { DarkMonthsGame } from './minigames/DarkMonthsGame';
import { AltitudeAcclimatizationGame } from './minigames/AltitudeAcclimatizationGame';
import { EclssTrainingGame } from './minigames/EclssTrainingGame';
import { VeggieLabGame } from './minigames/VeggieLabGame';
import { ArcticGreenhouseGame } from './minigames/ArcticGreenhouseGame';
import { DepartureScreen } from './screens/DepartureScreen';
import { ArrivalScreen } from './screens/ArrivalScreen';
import { LearnScreen } from './screens/LearnScreen';
import { StationModeModal } from './screens/StationModeModal';

export type EarthScreenState =
  | 'WELCOME'
  | 'CITY'
  | 'DESTINATION'
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
  | 'LIFTOFF'
  | 'ARRIVAL'
  | 'LEARN';

export function EarthFlow({ onReady }: EarthFlowProps) {
  const [screen, setScreen] = useState<EarthScreenState>('WELCOME');
  const [previousScreen, setPreviousScreen] = useState<EarthScreenState>('WELCOME');
  const [isStationModalOpen, setIsStationModalOpen] = useState<boolean>(false);

  // Estado global de preparación V3.0
  const [city, setCity] = useState<CityData>(DEFAULT_CITY); // AREQUIPA o TROMSO
  const [destination, setDestination] = useState<Destination>('MOON'); // Elegido antes de entrenar
  const [avatar, setAvatar] = useState<AvatarOption>(DEFAULT_AVATAR);
  const [fictionalName, setFictionalName] = useState<string>(SUGGESTED_CALLSIGNS[0]);
  const [completedMissions, setCompletedMissions] = useState<MissionType[]>([]);
  const [backpack, setBackpack] = useState<Backpack>(['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT']);

  function navigateTo(nextScreen: EarthScreenState) {
    setPreviousScreen(screen);
    setScreen(nextScreen);
  }

  // Completa una misión tras satisfacer sus condiciones interactivas (RF-69)
  // Regla estricta: máximo 3 misiones elegidas
  function handleCompleteMission(missionId: MissionType) {
    if (completedMissions.length >= 3) {
      navigateTo('MAP');
      return;
    }
    if (!completedMissions.includes(missionId)) {
      setCompletedMissions((prev) => {
        if (prev.length >= 3) return prev;
        return [...prev, missionId];
      });
    }
    navigateTo('MAP');
  }

  // Al completar exactamente 3 misiones, se asignan EXACTAMENTE las 3 herramientas ganadas
  // NO se regalan ni rellenan herramientas arbitrarias del catálogo (RF-09, RF-10)
  function handleProceedToLaunch(derivedTools: readonly ToolId[]) {
    if (derivedTools.length !== 3) return;

    const earnedBackpack: Backpack = [derivedTools[0], derivedTools[1], derivedTools[2]];
    setBackpack(earnedBackpack);
    navigateTo('LIFTOFF');
  }

  function handleLaunchMission() {
    if (completedMissions.length !== 3) return;
    if (backpack.length !== 3) return;

    const verifiedNasaDataset = buildVerifiedNasaDataset(city.id);

    // Mapear compatibilidad de contratos con Software 1 sin inventar entrenamientos
    const trainingContracts = completedMissions.filter(
      (m): m is 'SOLAR_DETECTIVE' | 'SOLAR_WATCH' => m === 'SOLAR_DETECTIVE' || m === 'SOLAR_WATCH'
    );

    onReady({
      setup: {
        cityId: city.id,
        avatarId: avatar.id,
        fictionalName,
        destination,
        backpack,
        completedTraining: trainingContracts,
      },
      nasaData: verifiedNasaDataset,
    });
  }

  // RENDER SEGÚN EL FLUJO OBLIGATORIO V3.0
  switch (screen) {
    // 1. Bienvenida
    case 'WELCOME':
      return (
        <>
          <WelcomeScreen
            onPlay={() => navigateTo('CITY')}
            onOpenStation={() => setIsStationModalOpen(true)}
            onOpenLearn={() => navigateTo('LEARN')}
          />
          <StationModeModal
            isOpen={isStationModalOpen}
            onClose={() => setIsStationModalOpen(false)}
            onLaunchDemoSolo={() => {
              setIsStationModalOpen(false);
              navigateTo('CITY');
            }}
          />
        </>
      );

    // 2. Selección de Ciudad (Arequipa o Tromsø)
    case 'CITY':
      return (
        <CitySelectionScreen
          initialCityId={city.id}
          onSelectCity={(selectedCity) => {
            if (selectedCity.id !== city.id) {
              setCity(selectedCity);
              setCompletedMissions([]); // Reiniciar misiones si cambia de ciudad
            }
            navigateTo('DESTINATION');
          }}
          onBack={() => navigateTo('WELCOME')}
        />
      );

    // 3. Selección de Destino (Luna o Marte ANTES de preparar)
    case 'DESTINATION':
      return (
        <DestinationScreen
          cityName={city.name}
          initialDestination={destination}
          onSelectDestination={(dest) => {
            setDestination(dest);
            navigateTo('AVATAR');
          }}
          onBack={() => navigateTo('CITY')}
        />
      );

    // 4. Avatar y Perfil
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
          onBack={() => navigateTo('DESTINATION')}
        />
      );

    // 5. Briefing Narrativo Ágil
    case 'BRIEFING':
      return (
        <NarrativeBriefingScreen
          cityName={city.name}
          destination={destination}
          astronautName={fictionalName}
          onProceedToMap={() => navigateTo('MAP')}
          onBack={() => navigateTo('AVATAR')}
        />
      );

    // 6. Mapa 2D de 5 Misiones (Elegir exactamente 3)
    case 'MAP':
      return (
        <>
          <PreparationMapScreen
            cityId={city.id}
            cityName={city.name}
            destination={destination}
            astronautName={fictionalName}
            completedMissions={completedMissions}
            onOpenMission={(mission: EarthMissionDefinition) => {
              // Cada misión abre una actividad interactiva real con decisión y costo (RF-69)
              // Ninguna misión se acredita directamente por presionar Ejecutar
              if (mission.id === 'SOLAR_DETECTIVE') navigateTo('TRAINING_SOLAR');
              else if (mission.id === 'SOLAR_WATCH') navigateTo('TRAINING_DONKI');
              else if (mission.id === 'DARK_MONTHS_RESERVE') navigateTo('TRAINING_DARK_MONTHS');
              else if (mission.id === 'ALTITUDE_ACCLIMATIZATION') navigateTo('TRAINING_ALTITUDE');
              else if (mission.id === 'ECLSS_TRAINING') navigateTo('TRAINING_ECLSS');
              else if (mission.id === 'VEGGIE_LAB') navigateTo('TRAINING_VEGGIE');
              else if (mission.id === 'ARCTIC_GREENHOUSE') navigateTo('TRAINING_ARCTIC');
            }}
            onProceedToLaunch={handleProceedToLaunch}
            onBack={() => navigateTo('BRIEFING')}
          />
          <StationModeModal
            isOpen={isStationModalOpen}
            onClose={() => setIsStationModalOpen(false)}
            onLaunchDemoSolo={() => setIsStationModalOpen(false)}
          />
        </>
      );

    // 7. Detective del Sol (Arequipa - NASA POWER)
    case 'TRAINING_SOLAR':
      return (
        <SolarDetectiveGame
          onComplete={() => handleCompleteMission('SOLAR_DETECTIVE')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 8. Vigilante del Sol / Mirador de Tormentas (Común - NASA DONKI)
    case 'TRAINING_DONKI':
      return (
        <SolarWatchGame
          onComplete={() => handleCompleteMission('SOLAR_WATCH')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 9. Reserva para los Meses Oscuros (Tromsø - NASA POWER)
    case 'TRAINING_DARK_MONTHS':
      return (
        <DarkMonthsGame
          onComplete={() => handleCompleteMission('DARK_MONTHS_RESERVE')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 10. Aclimatación de Altura Andina (Arequipa - NASA ECLSS & Medicina de Altura)
    case 'TRAINING_ALTITUDE':
      return (
        <AltitudeAcclimatizationGame
          onComplete={() => handleCompleteMission('ALTITUDE_ACCLIMATIZATION')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 11. Módulo de Soporte Vital Regenerativo (Común - NASA ECLSS)
    case 'TRAINING_ECLSS':
      return (
        <EclssTrainingGame
          onComplete={() => handleCompleteMission('ECLSS_TRAINING')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 12. Laboratorio de Cultivos Veggie (Común - NASA Veggie & APH)
    case 'TRAINING_VEGGIE':
      return (
        <VeggieLabGame
          onComplete={() => handleCompleteMission('VEGGIE_LAB')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 13. Invernadero Ártico Geotérmico (Tromsø - Bio-refugio polar)
    case 'TRAINING_ARCTIC':
      return (
        <ArcticGreenhouseGame
          onComplete={() => handleCompleteMission('ARCTIC_GREENHOUSE')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 14. Despegue Animado 2D
    case 'LIFTOFF':
      return (
        <DepartureScreen
          astronautName={fictionalName}
          cityName={city.name}
          backpack={backpack}
          onProceedToArrival={() => navigateTo('ARRIVAL')}
        />
      );

    // 15. Llegada y Alunizaje / Llegada a Destino
    case 'ARRIVAL':
      return (
        <ArrivalScreen
          astronautName={fictionalName}
          cityName={city.name}
          backpack={backpack}
          nasaData={buildVerifiedNasaDataset(city.id)}
          onEnterBase={handleLaunchMission}
        />
      );

    // Pantalla Aprende
    case 'LEARN':
      return (
        <LearnScreen
          onBack={() => navigateTo(previousScreen || 'WELCOME')}
        />
      );
  }
}
