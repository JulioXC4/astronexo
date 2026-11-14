import { useState } from 'react';
import type { EarthFlowProps, ToolId, Destination, Backpack } from '../../game/contracts';
import { isValidBackpack } from '../../game/contracts';
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

  function handleCompleteMission(missionId: MissionType) {
    if (!completedMissions.includes(missionId)) {
      setCompletedMissions((prev) => {
        const next = [...prev, missionId];
        return next.slice(0, 3); // Máximo 3 de 5
      });
    }
    navigateTo('MAP');
  }

  // Al completar exactamente 3 misiones, se derivan las herramientas y se avanza al despegue
  function handleProceedToLaunch(derivedTools: readonly ToolId[]) {
    // Normalizar a 3 herramientas únicas del catálogo para cumplir isValidBackpack
    const catalog: ToolId[] = ['FOLDING_PANELS', 'LIFE_SUPPORT', 'SHELTER_KIT', 'CROP_KIT'];
    const unique = Array.from(new Set(derivedTools));
    for (const tool of catalog) {
      if (unique.length >= 3) break;
      if (!unique.includes(tool)) unique.push(tool);
    }

    const finalBackpack: Backpack = [unique[0], unique[1], unique[2]];
    setBackpack(finalBackpack);
    navigateTo('LIFTOFF');
  }

  function handleLaunchMission() {
    if (!isValidBackpack(backpack)) return;

    const verifiedNasaDataset = buildVerifiedNasaDataset(city.id);

    // Mapear los IDs de entrenamiento a completedTraining para el contrato
    const trainingContracts = completedMissions.map((m) => {
      if (m === 'SOLAR_WATCH') return 'SOLAR_WATCH';
      return 'SOLAR_DETECTIVE';
    });

    onReady({
      setup: {
        cityId: city.id,
        avatarId: avatar.id,
        fictionalName,
        destination,
        backpack,
        completedTraining: Array.from(new Set(trainingContracts)),
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
            setCity(selectedCity);
            setCompletedMissions([]); // Reiniciar misiones si cambia de ciudad
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
              if (mission.id === 'SOLAR_DETECTIVE') navigateTo('TRAINING_SOLAR');
              else if (mission.id === 'SOLAR_WATCH') navigateTo('TRAINING_DONKI');
              else if (mission.id === 'DARK_MONTHS_RESERVE') navigateTo('TRAINING_DARK_MONTHS');
              else {
                // Misiones de acreditación directa (ECLSS, Altitud, Cultivos)
                handleCompleteMission(mission.id);
              }
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

    // 7. Detective del Sol (Arequipa)
    case 'TRAINING_SOLAR':
      return (
        <SolarDetectiveGame
          onComplete={() => handleCompleteMission('SOLAR_DETECTIVE')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 8. Vigilante del Sol / Mirador de Tormentas (DONKI)
    case 'TRAINING_DONKI':
      return (
        <SolarWatchGame
          onComplete={() => handleCompleteMission('SOLAR_WATCH')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 9. Reserva para los Meses Oscuros (Tromsø)
    case 'TRAINING_DARK_MONTHS':
      return (
        <DarkMonthsGame
          onComplete={() => handleCompleteMission('DARK_MONTHS_RESERVE')}
          onBack={() => navigateTo('MAP')}
        />
      );

    // 10. Despegue Animado 2D
    case 'LIFTOFF':
      return (
        <DepartureScreen
          astronautName={fictionalName}
          cityName={city.name}
          backpack={backpack}
          onProceedToArrival={() => navigateTo('ARRIVAL')}
        />
      );

    // 11. Llegada y Alunizaje / Llegada a Destino
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
