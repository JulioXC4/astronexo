import { useState } from 'react';
import type { EarthFlowProps, ToolId, TrainingId, Destination, Backpack } from '../../game/contracts';
import { isValidBackpack } from '../../game/contracts';
import { DEFAULT_CITY, type CityData } from '../../data/nasa/cities';
import { DEFAULT_AVATAR, SUGGESTED_CALLSIGNS, type AvatarOption } from '../../data/avatars';
import { buildVerifiedNasaDataset } from '../nasa/adapters';

import { WelcomeScreen } from './screens/WelcomeScreen';
import { CitySelectionScreen } from './screens/CitySelectionScreen';
import { AvatarScreen } from './screens/AvatarScreen';
import { NarrativeBriefingScreen } from './screens/NarrativeBriefingScreen';
import { PreparationMapScreen } from './screens/PreparationMapScreen';
import { SolarDetectiveGame } from './minigames/SolarDetectiveGame';
import { SolarWatchGame } from './minigames/SolarWatchGame';
import { BackpackScreen } from './screens/BackpackScreen';
import { DestinationScreen } from './screens/DestinationScreen';
import { DepartureScreen } from './screens/DepartureScreen';
import { ArrivalScreen } from './screens/ArrivalScreen';
import { LearnScreen } from './screens/LearnScreen';
import { StationModeModal } from './screens/StationModeModal';

export type EarthScreenState =
  | 'WELCOME'
  | 'CITY'
  | 'AVATAR'
  | 'BRIEFING'
  | 'MAP'
  | 'TRAINING_SOLAR'
  | 'TRAINING_DONKI'
  | 'BACKPACK'
  | 'DESTINATION'
  | 'LIFTOFF'
  | 'ARRIVAL'
  | 'LEARN';

export function EarthFlow({ onReady }: EarthFlowProps) {
  const [screen, setScreen] = useState<EarthScreenState>('WELCOME');
  const [previousScreen, setPreviousScreen] = useState<EarthScreenState>('WELCOME');
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);

  // Estado global de preparación terrestre
  const [city, setCity] = useState<CityData>(DEFAULT_CITY);
  const [avatar, setAvatar] = useState<AvatarOption>(DEFAULT_AVATAR);
  const [fictionalName, setFictionalName] = useState<string>(SUGGESTED_CALLSIGNS[0]);
  const [completedTrainings, setCompletedTrainings] = useState<TrainingId[]>([]);
  const [selectedTools, setSelectedTools] = useState<ToolId[]>([
    'FOLDING_PANELS',
    'LIFE_SUPPORT',
    'SHELTER_KIT',
  ]);
  const [destination, setDestination] = useState<Destination>('MOON');

  function navigateTo(nextScreen: EarthScreenState) {
    setPreviousScreen(screen);
    setScreen(nextScreen);
  }

  function handleCompleteTraining(trainingId: TrainingId) {
    if (!completedTrainings.includes(trainingId)) {
      setCompletedTrainings((prev) => [...prev, trainingId]);
    }
    navigateTo('MAP');
  }

  function handleLaunchMission() {
    if (!isValidBackpack(selectedTools)) return;

    const validatedBackpack: Backpack = [
      selectedTools[0],
      selectedTools[1],
      selectedTools[2],
    ];

    const verifiedNasaDataset = buildVerifiedNasaDataset();

    onReady({
      setup: {
        cityId: city.id,
        avatarId: avatar.id,
        fictionalName,
        destination,
        backpack: validatedBackpack,
        completedTraining: completedTrainings,
      },
      nasaData: verifiedNasaDataset,
    });
  }

  // Render según la pantalla activa
  switch (screen) {
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

    case 'CITY':
      return (
        <CitySelectionScreen
          initialCityId={city.id}
          onSelectCity={(selectedCity) => {
            setCity(selectedCity);
            navigateTo('AVATAR');
          }}
          onBack={() => navigateTo('WELCOME')}
        />
      );

    case 'AVATAR':
      return (
        <AvatarScreen
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
          astronautName={fictionalName}
          onProceedToMap={() => navigateTo('MAP')}
          onBack={() => navigateTo('AVATAR')}
        />
      );

    case 'MAP':
      return (
        <>
          <PreparationMapScreen
            cityName={city.name}
            astronautName={fictionalName}
            completedTrainings={completedTrainings}
            onOpenTraining={(id) => {
              if (id === 'SOLAR_DETECTIVE') navigateTo('TRAINING_SOLAR');
              if (id === 'SOLAR_WATCH') navigateTo('TRAINING_DONKI');
            }}
            onOpenBackpack={() => navigateTo('BACKPACK')}
            onBack={() => navigateTo('BRIEFING')}
          />
          <StationModeModal
            isOpen={isStationModalOpen}
            onClose={() => setIsStationModalOpen(false)}
            onLaunchDemoSolo={() => setIsStationModalOpen(false)}
          />
        </>
      );

    case 'TRAINING_SOLAR':
      return (
        <SolarDetectiveGame
          cityName={city.name}
          onComplete={() => handleCompleteTraining('SOLAR_DETECTIVE')}
          onBack={() => navigateTo('MAP')}
        />
      );

    case 'TRAINING_DONKI':
      return (
        <SolarWatchGame
          onComplete={() => handleCompleteTraining('SOLAR_WATCH')}
          onBack={() => navigateTo('MAP')}
        />
      );

    case 'BACKPACK':
      return (
        <BackpackScreen
          selectedTools={selectedTools}
          onUpdateTools={(tools) => setSelectedTools([...tools])}
          onConfirmBackpack={(backpack) => {
            setSelectedTools([...backpack]);
            navigateTo('DESTINATION');
          }}
          onBack={() => navigateTo('MAP')}
        />
      );

    case 'DESTINATION':
      return (
        <DestinationScreen
          initialDestination={destination}
          onSelectDestination={(dest) => {
            setDestination(dest);
            navigateTo('LIFTOFF');
          }}
          onBack={() => navigateTo('BACKPACK')}
        />
      );

    case 'LIFTOFF':
      return (
        <DepartureScreen
          astronautName={fictionalName}
          cityName={city.name}
          backpack={selectedTools as unknown as Backpack}
          onProceedToArrival={() => navigateTo('ARRIVAL')}
        />
      );

    case 'ARRIVAL':
      return (
        <ArrivalScreen
          astronautName={fictionalName}
          cityName={city.name}
          backpack={selectedTools as unknown as Backpack}
          nasaData={buildVerifiedNasaDataset()}
          onEnterBase={handleLaunchMission}
        />
      );

    case 'LEARN':
      return (
        <LearnScreen
          onBack={() => navigateTo(previousScreen || 'WELCOME')}
        />
      );
  }
}
